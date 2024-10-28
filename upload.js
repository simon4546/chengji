const express = require('express');
const session = require('express-session')
const multer = require('multer');
const xlsx = require('./handle_english');
const path = require('path');
const knex = require('./db').db;
const app = express();
app.use(express.json());
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
        username: req.body.studentId,
        passwd: req.body.password,
    }).select('id');
    if (result.length < 1) {
        res.status(500).end()
    } else {
        req.session.user = result['id']
        res.send({ message: `OK` });
    }
});
app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login')
    }
    res.sendFile(path.join(__dirname, '/views/index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/login.html'));
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
        for (let index = 0; index < workbook.length; index++) {
            const element = workbook[index];
            knex('users').insert({ name: element.name, no: element.no }).onConflict().ignore().then(function(id){
                console.log(id)
            });
            element.subject=subjects
            element.items=JSON.stringify(element.items);
            element.values=JSON.stringify(element.values);
            knex('scores').insert(element).then(function(id){
                console.log(id)
            });
        }
        res.send({ message: `${subjects}文件上传成功！` });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器正在运行在 http://localhost:${port}`);
});