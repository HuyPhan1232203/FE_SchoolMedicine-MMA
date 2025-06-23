# 🏥 HƯỚNG DẪN SETUP ADMIN ACCOUNTS

## 📋 BƯỚC 1: TẠO ADMIN TRONG FIREBASE CONSOLE

### 1.1 Mở Firebase Console
```
🌐 Truy cập: https://console.firebase.google.com
📁 Chọn project của bạn
🔐 Vào: Authentication → Users
```

### 1.2 Tạo Admin Users
Nhấn **"Add user"** và tạo 3 admin accounts:

```
👤 ADMIN 1:
   Email: admin@school.edu.vn
   Password: SchoolAdmin2025!
   (Chưa có email verified option)

👤 ADMIN 2:
   Email: director@school.edu.vn  
   Password: Director2025!
   (Chưa có email verified option)

👤 ADMIN 3:
   Email: manager@school.edu.vn
   Password: Manager2025!
   (Chưa có email verified option)
```

### 1.3 Set Email Verified (Sau khi tạo)
```
1. Click vào từng admin user trong danh sách
2. Nhấn nút "Edit user" (biểu tượng bút chì ✏️)
3. Trong phần Email: ✅ Tick "Email verified"  
4. Save changes
5. Lặp lại cho tất cả admin users
```

### 1.4 Copy User UIDs  
Sau khi set email verified, copy **User UID** của từng user:
```
📝 Ghi lại:
   admin@school.edu.vn → UID: Abc123Def456...
   director@school.edu.vn → UID: Xyz789Uvw012...
   manager@school.edu.vn → UID: Pqr345Stu678...
```

## 🚀 OPTION 2: DÙNG SCRIPT TỰ ĐỘNG (NHANH HỠN)

### Option 2.1: Sử dụng createAdminComplete.js
```bash
# 1. Copy Firebase config vào scripts/createAdminComplete.js
# 2. Chạy script
node scripts/createAdminComplete.js

# 3. Sau đó vào Firebase Console set email verified manual
```

**Ưu điểm**: Tạo cả Auth + Firestore một lần, chỉ cần set email verified manual.  
**Nhược điểm**: Vẫn cần step email verification manual.

---

## 📋 BƯỚC 2: CẬP NHẬT SCRIPT

### 2.1 Copy Firebase Config
```bash
# Mở file
cat constants/firebaseConfig.ts

# Copy toàn bộ config object vào scripts/createAdminProfiles.js
```

### 2.2 Thay thế UIDs
Mở `scripts/createAdminProfiles.js` và thay:
```javascript
uid: "REPLACE_WITH_REAL_UID_1", // → uid: "Abc123Def456...",
uid: "REPLACE_WITH_REAL_UID_2", // → uid: "Xyz789Uvw012...", 
uid: "REPLACE_WITH_REAL_UID_3", // → uid: "Pqr345Stu678...",
```

## 📋 BƯỚC 3: CHẠY SCRIPT

### 3.1 Install dependencies (nếu chưa có)
```bash
npm install firebase
```

### 3.2 Chạy script
```bash
node scripts/createAdminProfiles.js
```

### 3.3 Kết quả mong đợi
```
🏥 Creating Admin Firestore Profiles...

👤 Creating profile: admin@school.edu.vn
✅ Profile created for admin@school.edu.vn

👤 Creating profile: director@school.edu.vn
✅ Profile created for director@school.edu.vn

👤 Creating profile: manager@school.edu.vn
✅ Profile created for manager@school.edu.vn

🎉 All admin profiles created!
```

## 📋 BƯỚC 4: KIỂM TRA

### 4.1 Kiểm tra Firestore
```
🔥 Firebase Console → Firestore Database → users
✅ Phải thấy 3 documents với UIDs của admin
✅ Mỗi document có: role: "administrator", status: "approved"
```

### 4.2 Test đăng nhập
```
📱 Mở app → Login
📧 Email: admin@school.edu.vn
🔒 Password: SchoolAdmin2025!
✅ Phải đăng nhập được và vào app
```

## 🔑 ADMIN LOGIN CREDENTIALS

```
👤 ADMIN 1:
   Email: admin@school.edu.vn
   Password: SchoolAdmin2025!
   Role: Full Administrator (*)

👤 ADMIN 2:  
   Email: director@school.edu.vn
   Password: Director2025!
   Role: Director (manage_users, view_reports, system_admin)

👤 ADMIN 3:
   Email: manager@school.edu.vn  
   Password: Manager2025!
   Role: Manager (manage_users, view_reports)
```

## ⚠️ QUAN TRỌNG

1. **Đổi password** sau lần đăng nhập đầu tiên
2. **Không share** credentials qua text/email
3. **Enable 2FA** nếu có thể
4. **Backup** UIDs và credentials an toàn

## 🐛 TROUBLESHOOTING

### Lỗi: "Firebase config not found"
```bash
# Kiểm tra file config
ls -la constants/firebaseConfig.ts
# Copy đúng config vào script
```

### Lỗi: "UID not found"  
```
🔍 Kiểm tra lại UID trong Firebase Console
📝 Copy chính xác UID (không có space)
```

### Lỗi: "Permission denied"
```
🔐 Kiểm tra Firestore Rules
🔧 Đảm bảo có quyền write vào collection 'users'
```

---

🎉 **Hoàn thành!** Admin accounts đã sẵn sàng để đăng nhập và quản lý hệ thống! 