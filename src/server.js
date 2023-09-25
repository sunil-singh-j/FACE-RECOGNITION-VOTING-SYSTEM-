const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'labeled_images/' });

let users = [];

app.use(express.static('public'));

app.post('/signup', upload.fields([{ name: 'photo1', maxCount: 1 }, { name: 'photo2', maxCount: 1 }]), (req, res) => {
    const userName = req.body.userName;
    const userFolder = path.join(__dirname, 'labeled_images', userName);

    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder);
    }

    fs.renameSync(req.files['photo1'][0].path, path.join(userFolder, '1.jpg'));
    fs.renameSync(req.files['photo2'][0].path, path.join(userFolder, '2.jpg'));

    users.push(userName);

    res.json({ message: 'Signup successful' });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
