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
            loadFiles();  // เรียกโหลดไฟล์หลังจาก login สำเร็จ
        } else {
            loginMessage.innerText = "Username or Password incorrect";  // แสดงข้อความเมื่อ login ล้มเหลว
            loginMessage.style.color = "red";  // เปลี่ยนสีข้อความให้ชัดเจน
        }
    })
    .catch(err => {
        console.error("Login error:", err);
        const loginMessage = document.getElementById("login-message");
        loginMessage.innerText = "An error occurred, please try again later.";  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
        loginMessage.style.color = "red";  // สีข้อความเมื่อเกิดข้อผิดพลาด
    });
}


function previewFile() {
                                                    //เริ่มต้นใน array ตำแหน่งี่0 คือตำแหน่งแรก
    const file = document.getElementById("file-input").files[0]
    if(file){
        //FileReader(); ใช้อ่านไฟล์ในเครื่องของ User 
        const reader = new FileReader()
        reader.onload = function(e){           //source
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
    fetch(`${serverUrl}/files`)
    .then(res => res.json())
    .then(files => {
        const fileList = document.getElementById("file-list")
        fileList.innerHTML = ""
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
    if (confirm(`Are you sure you want to delete ${filename}?`)){
        fetch(`${serverUrl}/delete/${filename}` , { method: "DELETE"})
            .then(() => loadFiles())
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("loggedIn")
    if(isLoggedIn === "true"){
        document.getElementById("login-form").style.display = "none"
        document.getElementById("file-manager").style.display = "block"
        loadFiles();
    }
})

