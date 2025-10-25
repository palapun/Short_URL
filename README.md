# URL Shortener

## วิธีติดตั้งและรัน

### ติดตั้ง Backend
```bash
cd backend
npm install
npm start
```
**หมายเหตุ:** ใน GitHub ไม่ได้อัพโหลด `node_modules/`

Backend จะรันที่ http://localhost:8080

### รัน Frontend
เปิด terminal 
```bash
cd frontend
python3 -m http.server 3000
```
หรือใช้ Live Server ใน VS Code
Frontend จะรันที่ http://localhost:3000

## การใช้งาน
เปิดเบราว์เซอร์ไปที่ http://localhost:3000


**Account สำหรับทดสอบ:**
- Username: test01
- Password: t123456
หรือสมัครสมาชิกใหม่ได้เลย

**ฟีเจอร์ที่ใช้งานได้:**
- สร้างลิงก์สั้นจาก URL
- ตั้งชื่อลิงก์เองได้
- กำหนดวันหมดอายุลิงก์
- ดาวน์โหลด QR Code
- ดูสถิติการคลิกลิงก์
- ดูประวัติลิงก์ทั้งหมดที่สร้าง
- แก้ไขรหัสผ่าน

สารบัญ
- `backend/` - API Server (Node.js + Express + MongoDB)
- `frontend/` - หน้าเว็บไซต์ (HTML + CSS + JavaScript)
- `backend/controllers/` - จัดการ API requests
- `backend/models/` - โครงสร้างข้อมูล
- `backend/routes/` - เส้นทาง API
