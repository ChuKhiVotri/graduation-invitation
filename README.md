# Graduation Invitation + RSVP Dashboard

Bản này đã sửa lỗi deploy từ Windows:

- Không kèm `node_modules/`.
- Có `.gitignore` để không push `node_modules`, SQLite database, `.env`.
- Render/Linux sẽ tự chạy `npm install`, tránh lỗi `invalid ELF header`.
- Có form xác nhận tham gia, dashboard và SQLite database.

## Chạy local trên Windows

```bat
npm install
npm start
```

Mở:

```text
http://localhost:3000
http://localhost:3000/dashboard
```

Mật khẩu dashboard mặc định:

```text
admin123
```

## Deploy Render

Push project sạch này lên GitHub, sau đó vào Render tạo Web Service.

Cấu hình:

```text
Build Command: npm install
Start Command: npm start
```

Environment Variables:

```text
NODE_ENV=production
DASHBOARD_PASSWORD=matkhaucuaban
```

Sau deploy, link sẽ có dạng:

```text
https://ten-service.onrender.com
https://ten-service.onrender.com/dashboard
```

## Lưu ý database

Bản này dùng SQLite. Trên Render Free, dữ liệu có thể mất khi redeploy/restart vì filesystem không bền. Dùng để test public link thì ổn. Nếu dùng thật lâu dài, nên chuyển sang PostgreSQL hoặc dùng Render Persistent Disk.
