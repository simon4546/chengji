const express = require('express');
const multer = require('multer');
const xlsx = require('./handle_excel');
const path = require('path');

const app = express();
const port = 3001;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 上传文件的保存目录
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 使用时间戳作为文件名
    },
});

const upload = multer({ storage });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/excel', (req, res) => { res.render('upload.html'); });

app.post('/upload', upload.single('excelFile'), (req, res) => {
    const filePath = req.file.path;
    const workbook = xlsx.Handle(filePath);
    res.send({ message: '文件上传成功！' });
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器正在运行在 http://localhost:${port}`);
});