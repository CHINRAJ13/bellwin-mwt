const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const uri = 'mongodb+srv://techview828_db_user:TlGkuJAiAzp2Eo77@cluster0.ttxlb53.mongodb.net/belwin_erp?retryWrites=true&w=majority';

mongoose.connect(uri)
    .then(async () => {
        const username = 'admin';
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = await User.findOneAndUpdate(
            { username },
            { password: hashedPassword, role: 'admin' },
            { upsert: true, returnDocument: 'after' }
        );
        console.log('Admin user updated on remote DB:', user);
        process.exit();
    })
    .catch(console.error);
