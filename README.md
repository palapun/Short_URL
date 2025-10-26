# URL Shortener

## Live Demo (Production)
- **Frontend**: https://sparkling-rabanadas-b2b845.netlify.app
- **Login Page**: https://sparkling-rabanadas-b2b845.netlify.app/login.html
- **Backend API**: https://short-url-zxhk.onrender.com

### วิธีติดตั้งและรัน

## ติดตั้ง Backend
```bash
cd backend
npm install
npm start
```
**เพิ่มเติม:** ใน GitHub ไม่ได้อัพโหลด `node_modules/`

Backend จะรันที่ http://localhost:8080

### รัน Frontend
เปิด terminal 
```bash
cd frontend
python3 -m http.server 3000
```
หรือใช้ Live Server ใน VS Code
Frontend จะรันที่ http://localhost:3000


**Account สำหรับทดสอบ:**
- Username:punoo
- Password:123456

หรือสมัครสมาชิกใหม่ได้เลย

**ฟีเจอร์ที่ใช้งานได้:**
- สร้างลิงก์สั้นจาก URL
- สมัครสมาชิก และ ล็อคอิน
- กำหนดวันหมดอายุลิงก์
- ดาวน์โหลด QR Code
- ดูสถิติการคลิกลิงก์
- ดูประวัติลิงก์ทั้งหมดที่สร้าง
- แก้ไขรหัสผ่าน

## โครงสร้างโปรเจกต์
- `backend/` - API Server (Node.js + Express + MongoDB)
- `frontend/` - หน้าเว็บไซต์ (HTML + CSS + JavaScript)
- `backend/controllers/` - จัดการ API requests

## Hosting Information
- **Frontend Hosting**: Netlify (Free Tier)
- **Backend Hosting**: Render.com (Free Tier)
- **Database**: MongoDB Atlas (Free Tier)
