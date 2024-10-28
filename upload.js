const express = require('express');
const session = require('express-session')
const multer = require('multer');
const xlsx = require('./handle_excel');
const path = require('path');
const knex = require('knex')({
    client: 'sqlite3', // or 'better-sqlite3'
    connection: {
        filename: './mydb.sqlite',
    },
});
const app = express();
const port = 3001;
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000000 } }))
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', (req, res) => {
    let result = knex('users').where({
        username: req.body.user,
        passwd: req.body.passwd,
    }).select('id');
    if (result.length < 1) {
        res.status(500).end()
    } else {
        req.session.user=result['id']
        res.send({ message: `OK` });
    }
});

app.get('/excel', (req, res) => { res.sendFile(path.join(__dirname, '/views/upload.html')); });

app.post('/upload', upload.single('excelFile'), (req, res) => {
    const subjects = req.body.subjects;
    if (!subjects) {
        return res.status(500).end()
    }
    const filePath = req.file.path;
    const workbook = xlsx.Handle(filePath);
    if (workbook == -1) {
        res.status(500).end()
    } else {
        res.send({ message: `${subjects}文件上传成功！` });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器正在运行在 http://localhost:${port}`);
});