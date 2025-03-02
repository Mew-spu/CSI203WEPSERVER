const serverUrl = 'http://localhost:5000';

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch(`${serverUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        const loginMessage = document.getElementById("login-message");
        
        if (data.success) {
            localStorage.setItem("loggedIn", "true")
            document.getElementById("login-form").style.display = "none";
            document.getElementById("file-manager").style.display = "block";
            alert("Login successful!");
            loadFiles();  //เรียกโหลดไฟล์หลังจาก login สำเร็จ
        } else {
            loginMessage.innerText = "Username or Password incorrect";  //แสดงข้อความเมื่อloginล้มเหลว
            loginMessage.style.color = "red";  
        }
    })
    .catch(err => {
        console.error("Login error:", err);
        const loginMessage = document.getElementById("login-message");
        loginMessage.innerText = "An error occurred, please try again later.";  
        loginMessage.style.color = "red";  
    });
}

function logout() {
    localStorage.removeItem("loggedIn");  // ลบสถานะการล็อกอินจาก localStorage
    document.getElementById("login-form").style.display = "block";  
    document.getElementById("file-manager").style.display = "none";  
    alert("You have logged out successfully!");
}

function previewFile() {
    const file = document.getElementById("file-input").files[0]
    if(file){
        const reader = new FileReader()
        reader.onload = function(e){
            document.getElementById("preview").src = e.target.result
            document.getElementById("preview").style.display = "block"
        }
        
        reader.readAsDataURL(file)
    }
}

function uploadFile(){
    const fileInput = document.getElementById("file-input").files[0];
    if (!fileInput) return alert("PLEASE Select File First")
    
    const formData = new FormData();
    formData.append("file", fileInput)

    fetch(`${serverUrl}/upload`, { method: "POST", body: formData})
        .then(res => res.json())
        .then(() => {
            alert("upload successful!")
            loadFiles();
        })
        .catch(err =>{
            console.error("Upload error", err)
            alert("Error Uploading file. please try again")
        })
}

function loadFiles(){
    fetch(`${serverUrl}/files`) //เรียก API /files เพื่อดึงรายการไฟล์จากเซิร์ฟเวอร์
    .then(res => res.json())    //แปลงข้อมูลที่ได้เป็น JSON
    .then(files => {
        const fileList = document.getElementById("file-list")
        fileList.innerHTML = "" //ล้างรายการไฟล์ก่อนโหลดใหม่
        files.forEach(file => {
            fileList.innerHTML += `
            <li class="file-item">
                <span class="file-name">${file}</span>
                <div class="file-actions">
                    <a href="${serverUrl}/download/${file}" download class="download-btn">Download</a>
                    <button class="delete-btn" onclick="deleteFile('${file}')">DELETE</button>
                </div>
            </li>
            `
        })
    })
}

function deleteFile(filename){
    console.log("File to delete:", filename);  // เพิ่มการตรวจสอบ
    if (confirm(`Are you sure you want to delete ${filename}?`)){
        fetch(`${serverUrl}/delete/${filename}` , { method: "DELETE"})
            .then(res => {
                if (res.ok) {
                    loadFiles();
                } else {
                    alert("Error deleting file.");
                }
            })
            .catch(err => {
                console.error("Delete error:", err);
                alert("An error occurred while trying to delete the file.");
            });
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("loggedIn")
    if(isLoggedIn === "true"){
        document.getElementById("login-form").style.display = "none"
        document.getElementById("file-manager").style.display = "block"
        loadFiles();
    } else {
        document.getElementById("login-form").style.display = "block"
        document.getElementById("file-manager").style.display = "none"
    }
});
