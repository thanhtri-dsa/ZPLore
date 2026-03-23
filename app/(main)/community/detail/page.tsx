import { redirect } from 'next/navigation'

// Alias route để tránh 404 khi người dùng mở /community/detail.
// Trang community hiện tại đang triển khai kiểu "feed + expand comments" trong /community.
export default function CommunityDetailAliasPage() {
  redirect('/community')
}

