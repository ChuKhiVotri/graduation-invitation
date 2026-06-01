# Graduation Invitation + RSVP Dashboard

Project này có thêm phần **Xác nhận tham gia**, dashboard xem danh sách và SQLite database để lưu dữ liệu.

## Chạy local bằng Node.js

```bash
npm install
npm start
```

Mở trang thư mời:

```text
http://localhost:3000
```

Mở dashboard:

```text
http://localhost:3000/dashboard
```

Mật khẩu dashboard mặc định khi chạy local:

```text
admin123
```

Bạn có thể đổi mật khẩu bằng biến môi trường:

```bash
DASHBOARD_PASSWORD="mat-khau-cua-ban" npm start
```

Database SQLite được lưu tại:

```text
database/rsvp.sqlite
```

## Deploy bằng Docker Compose

Sửa mật khẩu dashboard trong `docker-compose.yml`:

```yaml
DASHBOARD_PASSWORD=doi-mat-khau-nay
```

Sau đó chạy:

```bash
docker compose up -d --build
```

Truy cập:

```text
http://IP_SERVER:3000
http://IP_SERVER:3000/dashboard
```

Dữ liệu RSVP được lưu trong Docker volume `graduation_db`, nên restart container không mất dữ liệu.

## API

Gửi xác nhận:

```http
POST /api/rsvp
Content-Type: application/json

{
  "name": "Tên khách",
  "guestSlug": "slug-neu-co",
  "inviteName": "Tên trên thư mời",
  "pageUrl": "Link trang"
}
```

Xem danh sách:

```http
GET /api/rsvps
x-dashboard-password: mat-khau-dashboard
```
