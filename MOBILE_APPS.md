# App mobile Eco-Tour (Traveler + Admin)

Hai project Expo **tách folder** trong repo:

| Folder | Mục đích |
|--------|-----------|
| `mobile-traveler` | Khách: xem **điểm đến**, **đặt tour** (destination booking). |
| `mobile-admin` | Nội bộ: **đăng nhập admin**, xem / đổi trạng thái **destination bookings**. |

Backend dùng chung: Next.js trong repo này (`npm run dev` cổng mặc định **3000**).

## 1. Cấu hình API URL

- **Expo Go + điện thoại thật** (cùng WiFi với PC): **không cần `.env`** — app tự lấy IP máy dev từ Expo (`debuggerHost`) và gọi cổng **3000**.
- Nếu cần chỉ tay, copy `.env.example` → `.env` và set `EXPO_PUBLIC_API_URL`:
  - **Android emulator**: `http://10.0.2.2:3000`
  - **iOS simulator**: `http://localhost:3000`
  - **Điện thoại** (khi auto lỗi): `http://<IP-LAN-máy-chạy-Next>:3000`

## 2. Chạy Next (backend)

```bash
cd D:\Eco-Tour
npm run dev
```

## 3. Chạy app

```bash
cd mobile-traveler   # hoặc mobile-admin
npm install
npm start
```

Quét QR bằng Expo Go hoặc `npm run android` / `npm run ios`.

## 4. Admin mobile & cookie

Trình duyệt đọc được cookie `httpOnly`; React Native thì không.  
Route `POST /api/admin/login` được mở rộng: khi gửi header `X-Client: EcoTourMobileAdmin`, response JSON có thêm **`sessionToken`**.  
App admin lưu token trong **SecureStore** và gửi lại qua header **`Cookie: ecoTourAdmin=<token>`** cho các API cần cookie.

## 5. Bảo mật (lưu ý)

- `GET/PATCH /api/destinations/bookings` hiện **không kiểm tra** cookie admin — phù hợp demo nhanh; production nên bảo vệ (giống `/api/bookings` khi bật Clerk).
- `sessionToken` tương đương giá trị cookie admin — chỉ dùng qua **HTTPS** khi release.
