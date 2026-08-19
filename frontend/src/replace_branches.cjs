const fs = require('fs');

function replaceInFiles() {
  const dir = 'c:/Users/ADMIN/Desktop/Belwin-jwells-ERP-Project-main/Belwin-jwells-ERP-Project-main/frontend/src';
  
  function walk(currentDir) {
    fs.readdirSync(currentDir).forEach(file => {
      const fullPath = currentDir + '/' + file;
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        
        const regex1 = /<option value="Head Office">Head Office<\/option>\s*<option value="Branch 1">Branch 1<\/option>\s*<option value="Branch 2">Branch 2<\/option>/g;
        if (regex1.test(content)) {
          content = content.replace(regex1, '<option value="TRICHY">TRICHY</option>\n              <option value="PUDUKKOTTAI">PUDUKKOTTAI</option>\n              <option value="THANJAVUR">THANJAVUR</option>');
          modified = true;
        }

        const regex2 = /<input type="text" className=\{inp\} value=\{loanInfo\.branch \|\| ''\} onChange=\{\(e\) => handleLoanInfoChange\('branch', e\.target\.value\)\} placeholder="e\.g\. Main Branch" \/>/g;
        if (regex2.test(content)) {
          content = content.replace(regex2, '<select className={inp} value={loanInfo.branch || \'\'} onChange={(e) => handleLoanInfoChange(\'branch\', e.target.value)}>\n              <option value="">Select Branch</option>\n              <option value="TRICHY">TRICHY</option>\n              <option value="PUDUKKOTTAI">PUDUKKOTTAI</option>\n              <option value="THANJAVUR">THANJAVUR</option>\n            </select>');
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(fullPath, content);
          console.log('Updated: ' + fullPath);
        }
      }
    });
  }
  
  walk(dir);
}

replaceInFiles();
