# NRO Game Management System

Hệ thống quản lý game Ngọc Rồng Online - Web Admin Panel

## Yêu cầu hệ thống

- Node.js 18+ hoặc Bun 1.0+
- MySQL/MariaDB database
- Git

## Cài đặt

### Sử dụng Bun (Khuyến nghị)

```bash
# Clone repository
git clone https://github.com/ahwuoc/web-manager_nro_teav2.git
cd web-manager_nro_teav2

# Cài đặt dependencies
bun install

# Tạo file .env
cp .env.example .env
# Hoặc tạo thủ công file .env với nội dung:
# DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# Pull schema từ database
bun prisma db pull

# Generate Prisma Client
bun prisma generate

# Chạy development server
bun run dev
```

### Sử dụng Node.js (npm)

```bash
# Clone repository
git clone https://github.com/ahwuoc/web-manager_nro_teav2.git
cd web-manager_nro_teav2

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env
# Hoặc tạo thủ công file .env với nội dung:
# DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# Pull schema từ database
npx prisma db pull

# Generate Prisma Client
npx prisma generate

# Chạy development server
npm run dev
```

## Cấu hình Database

Tạo file `.env` trong thư mục gốc với nội dung:

```env
DATABASE_URL="mysql://username:password@host:port/database_name?connection_limit=5&pool_timeout=10"
```

Ví dụ:
```env
DATABASE_URL="mysql://root:123456@localhost:3306/nro_v2?connection_limit=5&pool_timeout=10"
```

## Cài schema sự kiện câu cá

Chạy một lần trên database game trước khi mở trang quản trị câu cá:

```bash
mariadb -u <user> -p <database> < prisma/sql/20260807_fishing_event.sql
```

Sau đó có thể thêm không giới hạn mốc theo mùa tại `/fishing-event`. Trường `reward_items` dùng JSON dạng:

```json
[{"temp_id":1997,"quantity":1,"options":[{"id":30,"param":1}]}]
```

## Build Production

### Sử dụng Bun
```bash
bun run build
bun run start
```

### Sử dụng Node.js
```bash
npm run build
npm run start
```

## Tính năng

- 🛒 **Quản lý Tab Shop** - Quản lý các tab trong shop, items và cấu hình
- 💰 **Quản lý Mốc Nạp** - Quản lý thông tin và chi tiết các mốc nạp
- 🎁 **Quản lý Giftcode** - Quản lý mã quà tặng và phần thưởng
- 👥 **Quản lý Player** - Ban/unban tài khoản, cộng/trừ tiền
- ⏰ **Quản lý Mốc Online** - Phần thưởng theo thời gian online
- 💸 **Quản lý Mốc Tiêu Tiền** - Phần thưởng theo mốc tiêu tiền
- 📦 **Quản lý Gói Quà** - Quản lý các gói quà trong hệ thống
- 🏆 **Quản lý Weekly Top** - Bảng xếp hạng hàng tuần và phần thưởng
- 🎣 **Quản lý Sự kiện Câu cá** - Loài cá, cân nặng, điểm và mốc thưởng JSON theo mùa

## Cấu trúc thư mục

```
├── app/
│   ├── api/              # API Routes
│   ├── giftcode/         # Trang quản lý Giftcode
│   ├── moc-nap/          # Trang quản lý Mốc Nạp
│   ├── moc-online/       # Trang quản lý Mốc Online
│   ├── moc-tieutien/     # Trang quản lý Mốc Tiêu Tiền
│   ├── goi-qua/          # Trang quản lý Gói Quà
│   ├── player-management/# Trang quản lý Player
│   ├── tab-shop/         # Trang quản lý Tab Shop
│   ├── weekly-top/       # Trang quản lý Weekly Top
│   └── page.tsx          # Trang chủ
├── lib/
│   └── prisma.ts         # Prisma Client
├── prisma/
│   └── schema.prisma     # Database Schema
└── .env                  # Environment variables
```

## Tech Stack

- **Framework**: Next.js 16
- **Runtime**: Bun / Node.js
- **Database ORM**: Prisma 6
- **UI Library**: Ant Design
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Lưu ý

- Đảm bảo database MySQL/MariaDB đang chạy trước khi khởi động ứng dụng
- Sau khi thay đổi schema database, chạy `bun prisma db pull` và `bun prisma generate`
- Sử dụng `bun run build` để build production trước khi deploy

## License

MIT
