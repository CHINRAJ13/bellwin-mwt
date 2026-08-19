const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    const filePath = path.join(controllersDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Make sure we have ApiError imported
    if (!content.includes("require('../utils/ApiError')")) {
        content = "const ApiError = require('../utils/ApiError');\n" + content;
    }

    // Add next parameter to controller functions if missing
    content = content.replace(/(const \w+\s*=\s*async\s*\(\s*req,\s*res)\s*\)/g, '$1, next)');
    content = content.replace(/(exports\.\w+\s*=\s*async\s*\(\s*req,\s*res)\s*\)/g, '$1, next)');

    // Replace basic catch (error) blocks error returns with next(error)
    content = content.replace(/catch\s*\((.*?)\)\s*\{\s*console\.error\([^)]+\);\s*res\.status\([^)]+\)\.json\([^)]+\);\s*\}/g, 'catch ($1) { next($1); }');
    
    // Replace res.status(500).json({ message: ... }) inside catches
    content = content.replace(/res\.status\(500\)\.json\(\{\s*(?:success:\s*false,)?\s*(?:message|error):\s*([^}]+)\s*\}\);/g, 'next(new ApiError(500, $1));');
    content = content.replace(/res\.status\(400\)\.json\(\{\s*(?:success:\s*false,)?\s*(?:message|error):\s*([^}]+)\s*\}\);/g, 'next(new ApiError(400, $1));');
    content = content.replace(/res\.status\(401\)\.json\(\{\s*(?:success:\s*false,)?\s*(?:message|error):\s*([^}]+)\s*\}\);/g, 'next(new ApiError(401, $1));');
    content = content.replace(/res\.status\(404\)\.json\(\{\s*(?:success:\s*false,)?\s*(?:message|error):\s*([^}]+)\s*\}\);/g, 'next(new ApiError(404, $1));');
    
    // Some are like: res.status(status).json({ success: false, message }) -> next(new ApiError(status, message))
    content = content.replace(/res\.status\((status|error\.status)\)\.json\(\{\s*(?:success:\s*false,)?\s*message\s*\}\);/g, 'next(new ApiError($1 || 500, message));');

    // Return res.status(400).json(...) -> return next(new ApiError(400, ...))
    content = content.replace(/return\s+res\.status\((40\d)\)\.json\(\{\s*(?:success:\s*false,)?\s*message:\s*([^}]+)\s*\}\);/g, 'return next(new ApiError($1, $2));');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${file}`);
});
