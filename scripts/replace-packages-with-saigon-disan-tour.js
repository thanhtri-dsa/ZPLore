/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Tour text you provided:
// "OUR: SÀI GÒN DI SẢN – HÀNH TRÌNH "DẤU CHÂN XANH""
async function main() {
  console.log('Replacing all existing tours (Package) with ONE Saigon tour...')

  // 1) Delete dependent rows first (avoid FK/unique issues)
  // PackageBooking -> Included / PackageItineraryLeg -> Package
  const delBookings = await prisma.packageBooking.deleteMany()
  console.log('Deleted PackageBooking rows:', delBookings.count)

  const delIncluded = await prisma.included.deleteMany()
  console.log('Deleted Included rows:', delIncluded.count)

  const delLegs = await prisma.packageItineraryLeg.deleteMany()
  console.log('Deleted PackageItineraryLeg rows:', delLegs.count)

  const delPackages = await prisma.package.deleteMany()
  console.log('Deleted Package rows:', delPackages.count)

  // 2) Create the single tour
  const packageData = {
    name: 'OUR: SÀI GÒN DI SẢN – HÀNH TRÌNH "DẤU CHÂN XANH"',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    imageData: '/images/conserve.svg', // placeholder (bạn có thể đổi sau)
    duration: '1 Ngày',
    groupSize: '2-10 Người', // bạn không gửi rõ, mình để mặc định
    price: 0, // bạn không gửi giá, mình để 0 để không chặn hiển thị
    authorId: 'dev-admin',
    authorName: 'Eco-Tour Dev',
    description:
      `Sài Gòn Di Sản – Hành trình "Dấu chân xanh".\n\n` +
      `Không chỉ là một chuyến tham quan, đây là hành trình giúp bạn kết nối với giá trị truyền thống và thực hành lối sống bền vững. ` +
      `Mỗi bước chân của bạn đều được đo lường và bù đắp bằng những giá trị xanh thực tế.\n\n` +
      `Net Zero Carbon\n` +
      `Thời lượng: 01 Ngày | Phương tiện: Xe buýt điện & Xe đạp | Mục tiêu: Net Zero Carbon`,
    included: {
      create: [
        { item: 'Bộ kit "Zero Waste" (bình nước thủy tinh, túi vải, bản đồ giấy tái chế)' },
        { item: 'Trải nghiệm đánh bóng thủ công tại Làng Đúc Đồng' },
        { item: 'Workshop làm lồng đèn từ tre & giấy kiếng vụn' },
        { item: 'Bữa trưa thực dưỡng (Local & Plant-based)' },
        { item: 'Tham quan hiệu thuốc y học cổ truyền + học gói thảo mộc' },
        { item: 'Thử thách "Sạch dĩa" để giảm rác hữu cơ' },
        { item: 'Công cụ tổng kết CO2 đã tiết kiệm + nhận chứng nhận "Du khách Xanh"' },
      ],
    },
    itinerary: {
      create: [
        // order 0..5 = 6 checkpoints
        {
          order: 0,
          day: 1,
          mode: 'BUS',
          offsetMinutes: 510, // 08:30
          stopTitle: 'Checkpoint 0: Trạm Tiếp Năng Lượng Xanh (VinBus Hàm Nghi)',
          stopDesc:
            'Địa điểm: Trạm VinBus Hàm Nghi, Quận 1. Hoạt động: nhận bộ kit "Zero Waste".',
          mapsQuery: 'Trạm VinBus Hàm Nghi, Quận 1',
          fromName: 'Điểm xuất phát',
          toName: 'Checkpoint 0 - VinBus Hàm Nghi',
          note: 'Chỉ số xanh: bắt đầu hành trình với phương tiện giao thông công cộng không phát thải.',
        },
        {
          order: 1,
          day: 1,
          mode: 'BUS',
          offsetMinutes: 570, // 09:30
          stopTitle: 'Checkpoint 1: Lửa Thiêng An Hội (Làng Đúc Đồng)',
          stopDesc:
            'Địa điểm: 78 Nguyễn Duy Cung, P. 12, Q. Gò Vấp. Trải nghiệm đánh bóng sản phẩm thủ công (không dùng điện).',
          mapsQuery: '78 Nguyễn Duy Cung, Gò Vấp',
          fromName: 'Checkpoint 0 - VinBus Hàm Nghi',
          toName: 'Checkpoint 1 - Làng Đúc Đồng',
          note: 'Net Zero Action: giảm thiểu điện năng tiêu thụ máy móc. CO2 tích lũy ~150g/người.',
        },
        {
          order: 2,
          day: 1,
          mode: 'BUS',
          offsetMinutes: 660, // 11:00
          stopTitle: 'Checkpoint 2: Sắc Màu Phú Bình (Xóm Lồng Đèn)',
          stopDesc:
            'Địa điểm: 423/12 Lạc Long Quân, P. 5, Q. 11. Workshop làm lồng đèn từ tre & giấy kiếng vụn.',
          mapsQuery: '423/12 Lạc Long Quân, Q. 11',
          fromName: 'Checkpoint 1 - Làng Đúc Đồng',
          toName: 'Checkpoint 2 - Xóm Lồng Đèn',
          note: 'Net Zero Action: vật liệu tái chế & tự nhiên; thay thế đồ nhựa pin chì. CO2 ~600g/người.',
        },
        {
          order: 3,
          day: 1,
          mode: 'BIKE',
          offsetMinutes: 735, // 12:15
          stopTitle: 'Checkpoint 3: Tiệc Chay "Bếp Xanh An Duyên"',
          stopDesc:
            'Địa điểm: 10 Nguyễn Tri Phương, P. 6, Quận 5. Trải nghiệm thực dưỡng + thử thách "Sạch dĩa".',
          mapsQuery: '10 Nguyễn Tri Phương, Quận 5',
          fromName: 'Checkpoint 2 - Xóm Lồng Đèn',
          toName: 'Checkpoint 3 - Bếp Xanh An Duyên',
          note: 'Net Zero Action: giảm dấu chân Carbon từ ngành chăn nuôi công nghiệp. CO2 ~1,200g/người.',
        },
        {
          order: 4,
          day: 1,
          mode: 'BIKE',
          offsetMinutes: 840, // 14:00
          stopTitle: 'Checkpoint 4: Hương Thảo Mộc Phố Cổ (Quận 5)',
          stopDesc:
            'Địa điểm: Tuyến phố Hải Thượng Lãn Ông, P. 10, Quận 5. Học gói thảo mộc bằng lá sen & giấy báo cũ + thưởng trà.',
          mapsQuery: 'Tuyến phố Hải Thượng Lãn Ông, Quận 5',
          fromName: 'Checkpoint 3 - Bếp Xanh An Duyên',
          toName: 'Checkpoint 4 - Hương Thảo Mộc Phố Cổ',
          note: 'Net Zero Action: loại bỏ 100% bao bì nilon & rác thải nhựa. CO2 ~100g/người.',
        },
        {
          order: 5,
          day: 1,
          mode: 'BUS',
          offsetMinutes: 930, // 15:30
          stopTitle: 'Checkpoint 5: Trạm Tổng Kết & Bù Đắp Carbon',
          stopDesc:
            'Địa điểm: Cà phê Ống (1A Sương Nguyệt Anh, P. Phạm Ngũ Lão, Q. 1). Tổng kết CO2 + nhận chứng nhận "Du khách Xanh".',
          mapsQuery: 'Cà phê Ống, 1A Sương Nguyệt Anh',
          fromName: 'Checkpoint 4 - Hương Thảo Mộc Phố Cổ',
          toName: 'Checkpoint 5 - Tổng Kết & Bù Đắp Carbon',
          note: 'CO2 bù đắp ~2,000g/người.',
        },
      ],
    },
  }

  const created = await prisma.package.create({
    data: packageData,
    include: { itinerary: { orderBy: { order: 'asc' } } },
  })

  console.log('Created package id:', created.id)
  console.log('Itinerary legs:', created.itinerary.map((l) => l.order).join(', '))
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

