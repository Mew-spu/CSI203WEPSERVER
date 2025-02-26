const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');


const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('uploads')); 


const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cd) => {
        cd(null, file.originalname);
    }
})
const upload = multer({ storage: storage})

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const users = [
        { username: "superadmin", password: "1234" },
        { username: "admin", password: "1234" }
    ];

    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true, message: "Login Success!" });
    } else {
        res.json({ success: false, message: "Username or Password incorrect" });
    }
});



//upload.single("file") เป็นmiddleware ของ multer ใช้สำหรับอัปโหลดไฟล์ใน express.js
app.post("/upload", upload.single("file"),(req,res) => {
    res.json({ success: true, filename: req.file.originalname})
})

//download ไฟล์  โดยให้ filename เป็น path สำหรับโหลด
//เช่น Get http://localhost:3000/download/sample.pdf
// :filename จะโดนแทนด้วย sample/pdf
//ถ้าจะใช้ก็เรียกใน req.params,filename
app.get("/download/:filename", (req,res) => {

    //สมมิตUser เข้าถึง /download/image.png
    //req.params.filename  ตัวนี้ก็จะมีคาเป็น image.png
    const filename = req.params.filename

    //ตรงนี้คือการสร้าง file path ให้เห็นภาพคือ ถ้าสมมิตไฟล์อยู่ที่ /home/usr/project
    // มันก็จะเป็น /home/user/project/uploads/Image.png
    const filePath = path.join(__dirname, "uploads", filename)

    if(!fs.existsSync(filePath)){
        return res.status(404).json({ error: "File not Found"})
    }
    //ให้ express ส่งไฟล์ให้ client ดาวโหลด
    res.download(filePath)
})

// โชว์ไฟล์
//fs.readdir ใช้อ่านไฟล์กับโฟล์เดอร์ที่อยู่่ใน(folder)
app.get("/files", (req, res) => {
    const uploadDir = path.join(__dirname, "uploads");  // ใช้ path.join เพื่อให้แน่ใจว่าเส้นทางถูกต้อง
    fs.readdir(uploadDir, (err, files) => {
        if (err) return res.status(500).json({ error: "Can't read directory" });
        res.json(files);
    });
});




app.delete("/delete/:filename", (req,res) => {
    //สมมิตUser เข้าถึง /download/image.png
    //req.params.filename  ตัวนี้ก็จะมีคาเป็น image.png
    const filename = req.params.filename

    //ตรงนี้คือการสร้าง file path ให้เห็นภาพคือ ถ้าสมมิตไฟล์อยู่ที่ /home/usr/project
    // มันก็จะเป็น /home/user/project/uploads/Image.png
    const filePath = path.join(__dirname, "uploads", filename)
    
    if(!fs.existsSync(filePath)){
        return res.status(404).json({ error: "File not Found"})
    }
    //ใช้ลบไฟล์ใน filePath ถ้าจากตัวอย่างก็ถือ /home/user/project/uploads/Image.png <==========
    fs.unlink(filePath, (err) => {
        if(err) return res.status(500).json({ error: "File not found or can't be deleted"})
        res.json({ success: true, message: "File deleted Successfully"})
    })
})



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});