const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // --- Content reset: web sections ---
  // Delete in an order that avoids FK constraint issues.
  await prisma.homeFeaturedBlog.deleteMany()
  await prisma.homeReview.deleteMany()
  await prisma.communityPost.deleteMany()
  await prisma.ecoReward.deleteMany()

  // Clear existing data
  await prisma.included.deleteMany()
  await prisma.packageBooking.deleteMany()
  await prisma.package.deleteMany()
  await prisma.destination.deleteMany()
  await prisma.blog.deleteMany()

  // Create Sample Packages
  const packages = [
    {
      name: 'Bình Thuận ',
      location: 'Maasai Mara, Kenya',
      imageData: '/images/binhthuan.jpg',
      duration: '3 Days',
      groupSize: '6 People',
      price: 45000,
      description: 'Experience the world-famous Maasai Mara with our 3-day guided safari. See the Big Five and the incredible wildebeest migration.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Professional Guide' },
          { item: 'Park Entry Fees' },
          { item: '4x4 Safari Vehicle' },
          { item: 'Full Board Accommodation' }
        ]
      }
    },
    {
      name: 'Diani Beach Relaxation',
      location: 'Diani, Kenya',
      imageData: '/images/diani.jpg',
      duration: '5 Days',
      groupSize: '2-4 People',
      price: 35000,
      description: 'Relax at the award-winning Diani Beach. Crystal clear waters and white sandy beaches await you.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Beachfront Resort' },
          { item: 'Airport Transfers' },
          { item: 'Daily Breakfast' },
          { item: 'Water Sports Activities' }
        ]
      }
    },
    {
      name: 'Amboseli Elephant View',
      location: 'Amboseli, Kenya',
      imageData: '/images/amboseli.jpg',
      duration: '2 Days',
      groupSize: '6 People',
      price: 28000,
      description: 'Get the best views of Mt. Kilimanjaro and see the famous big-tusked elephants of Amboseli.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Game Drives' },
          { item: 'Luxury Tent Stay' },
          { item: 'Experienced Driver' }
        ]
      }
    },
    {
      name: 'Tour Sài Gòn: Quận 12 - Bến Thành',
      location: 'TP. Hồ Chí Minh, Việt Nam',
      imageData: '/images/one.jpg',
      duration: '1 Ngày',
      groupSize: '2-10 Người',
      price: 500000,
      description: 'Hành trình khám phá từ Quận 12 đến Chợ Bến Thành. Trải nghiệm nhịp sống sôi động, tham quan các địa danh nổi tiếng và thưởng thức ẩm thực đường phố đặc sắc.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Xe đưa đón tận nơi' },
          { item: 'Hướng dẫn viên nhiệt tình' },
          { item: 'Vé tham quan các điểm' },
          { item: 'Bữa trưa đặc sản Sài Gòn' }
        ]
      }
    },
    {
      name: 'Hà Nội - Ninh Bình: Tràng An & Hang Múa',
      location: 'Hà Nội - Ninh Bình, Việt Nam',
      imageData: '/images/two.jpg',
      duration: '2 Ngày 1 Đêm',
      groupSize: '4-12 Người',
      price: 2250000,
      description: 'Hành trình xanh rời phố cổ Hà Nội đến vùng non nước Ninh Bình. Du thuyền Tràng An, check-in Hang Múa và thưởng thức ẩm thực địa phương.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Xe du lịch đời mới' },
          { item: '01 đêm khách sạn' },
          { item: 'Vé Tràng An & Hang Múa' },
          { item: '02 bữa chính + 01 bữa sáng' }
        ]
      }
    },
    {
      name: 'Vịnh Hạ Long Du Thuyền: Ngủ đêm trên vịnh',
      location: 'Hạ Long, Quảng Ninh, Việt Nam',
      imageData: '/images/four.jpg',
      duration: '2 Ngày 1 Đêm',
      groupSize: '2-8 Người',
      price: 3990000,
      description: 'Trải nghiệm du thuyền trên Vịnh Hạ Long: chèo kayak, thăm hang động, hoàng hôn trên boong tàu và một đêm nghỉ dưỡng giữa kỳ quan thiên nhiên.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Du thuyền 4-5 sao' },
          { item: 'Vé tham quan vịnh' },
          { item: 'Kayak/Thuyền nan' },
          { item: 'Full board trên tàu' }
        ]
      }
    },
    {
      name: 'Sa Pa - Fansipan: Săn mây & bản làng',
      location: 'Sa Pa, Lào Cai, Việt Nam',
      imageData: '/images/three.jpg',
      duration: '3 Ngày 2 Đêm',
      groupSize: '4-14 Người',
      price: 3490000,
      description: 'Tận hưởng khí trời vùng cao, tham quan bản làng, chinh phục Fansipan và săn mây bình minh.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Xe giường nằm/limousine' },
          { item: '02 đêm khách sạn' },
          { item: 'Vé cáp treo Fansipan' },
          { item: 'Hướng dẫn viên địa phương' }
        ]
      }
    },
    {
      name: 'Huế - Hội An - Đà Nẵng: Di sản & biển xanh',
      location: 'Huế - Đà Nẵng - Hội An, Việt Nam',
      imageData: '/images/five.jpg',
      duration: '4 Ngày 3 Đêm',
      groupSize: '6-16 Người',
      price: 4990000,
      description: 'Hành trình kết hợp di sản cố đô, phố cổ Hội An và biển Đà Nẵng. Trải nghiệm ẩm thực miền Trung và các điểm check-in nổi bật.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: '03 đêm khách sạn' },
          { item: 'Vé tham quan di sản' },
          { item: 'Xe đưa đón theo lịch trình' },
          { item: 'Bảo hiểm du lịch' }
        ]
      }
    },
    {
      name: 'Phú Quốc: Nghỉ dưỡng & lặn ngắm san hô',
      location: 'Phú Quốc, Kiên Giang, Việt Nam',
      imageData: '/images/marine.jpg',
      duration: '3 Ngày 2 Đêm',
      groupSize: '2-10 Người',
      price: 4590000,
      description: 'Hành trình nghỉ dưỡng biển đảo: tour cano 4 đảo, lặn ngắm san hô, hoàng hôn Dinh Cậu và ẩm thực hải sản.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Cano tour 4 đảo' },
          { item: 'Dụng cụ lặn/snorkeling' },
          { item: '02 đêm khách sạn/resort' },
          { item: 'Xe đón tiễn sân bay' }
        ]
      }
    },
    {
      name: 'Đà Lạt: Săn mây & rừng thông',
      location: 'Đà Lạt, Lâm Đồng, Việt Nam',
      imageData: '/images/nine.jpg',
      duration: '2 Ngày 1 Đêm',
      groupSize: '4-12 Người',
      price: 2590000,
      description: 'Chill cùng Đà Lạt: săn mây, cắm trại nhẹ nhàng, rừng thông, cà phê view thung lũng và những góc phố lãng mạn.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: '01 đêm khách sạn' },
          { item: 'Vé tham quan theo lịch trình' },
          { item: 'Hướng dẫn viên' },
          { item: '01 bữa BBQ nhẹ' }
        ]
      }
    },
    {
      name: 'Miền Tây: Cần Thơ - Chợ nổi - Vườn trái cây',
      location: 'Cần Thơ, Việt Nam',
      imageData: '/images/eight.jpg',
      duration: '2 Ngày 1 Đêm',
      groupSize: '6-18 Người',
      price: 1990000,
      description: 'Khám phá miền sông nước: chợ nổi Cái Răng, vườn trái cây, trải nghiệm đò chèo và ẩm thực miệt vườn.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Thuyền chợ nổi' },
          { item: '01 đêm khách sạn Cần Thơ' },
          { item: 'Vé vườn trái cây' },
          { item: '02 bữa chính + 01 bữa sáng' }
        ]
      }
    },
    {
      name: 'Hà Giang Loop: Cao nguyên đá Đồng Văn',
      location: 'Hà Giang, Việt Nam',
      imageData: '/images/eleven.jpg',
      duration: '4 Ngày 3 Đêm',
      groupSize: '4-12 Người',
      price: 5490000,
      description: 'Cung đường huyền thoại Hà Giang: Mã Pì Lèng, sông Nho Quế, phố cổ Đồng Văn và mùa hoa trên cao nguyên đá.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Xe/xe máy theo lịch trình' },
          { item: '03 đêm homestay' },
          { item: 'Bữa ăn địa phương' },
          { item: 'Hướng dẫn viên bản địa' }
        ]
      }
    },
    {
      name: 'Tây Ninh: Núi Bà Đen trong ngày',
      location: 'Tây Ninh, Việt Nam',
      imageData: '/images/seven.jpg',
      duration: '1 Ngày',
      groupSize: '6-20 Người',
      price: 890000,
      description: 'Chuyến đi nhẹ nhàng trong ngày: cáp treo Núi Bà Đen, chùa, không khí mát lành và các điểm check-in trên đỉnh.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Xe đưa đón khứ hồi' },
          { item: 'Vé cáp treo' },
          { item: 'Hướng dẫn viên' },
          { item: 'Nước uống' }
        ]
      }
    },
    {
      name: 'Singapore: City xanh & Gardens by the Bay',
      location: 'Singapore',
      imageData: '/images/singapore.jpg',
      duration: '3 Ngày 2 Đêm',
      groupSize: '2-10 Người',
      price: 7900000,
      description: 'Khám phá Singapore theo phong cách eco: Gardens by the Bay, Marina Bay, Chinatown, và các khu phố xanh sạch hiện đại.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: '02 đêm khách sạn' },
          { item: 'Vé Gardens by the Bay' },
          { item: 'City tour theo lịch trình' },
          { item: 'Hỗ trợ thủ tục nhập cảnh' }
        ]
      }
    },
    {
      name: 'Sri Lanka: Tea Country & Safari xanh',
      location: 'Sri Lanka',
      imageData: '/images/sirilanka.jpg',
      duration: '5 Ngày',
      groupSize: '4-12 Người',
      price: 12900000,
      description: 'Hành trình qua vùng đồi chè, trải nghiệm tàu hỏa scenic, tham quan làng bản địa và safari theo hướng du lịch bền vững.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Khách sạn tiêu chuẩn 3-4*' },
          { item: 'Vé tàu scenic' },
          { item: 'Tour địa phương' },
          { item: 'Hướng dẫn viên' }
        ]
      }
    },
    {
      name: 'Dubai Eco Desert: Sa mạc & văn hóa',
      location: 'Dubai, UAE',
      imageData: '/images/uae.jpg',
      duration: '4 Ngày',
      groupSize: '2-10 Người',
      price: 13900000,
      description: 'Dubai theo phong cách khác: trải nghiệm sa mạc có trách nhiệm, city tour và các điểm văn hóa đặc trưng Trung Đông.',
      authorId: 'admin_1',
      authorName: 'Forestline Admin',
      included: {
        create: [
          { item: 'Khách sạn trung tâm' },
          { item: 'Desert tour' },
          { item: 'City tour' },
          { item: 'Xe đưa đón theo lịch trình' }
        ]
      }
    }
  ]

  // Seed sample "itinerary legs" so that Timeline + Checkpoint UI can be tested immediately.
  // Note: we intentionally allow from/to to be derived from stopTitle to keep this seed simple.
  const buildSampleItinerary = (pkg, legsCount = 3) => {
    const safeLocation = String(pkg.location ?? '')
    const safeName = String(pkg.name ?? '')
    return Array.from({ length: legsCount }, (_, idx) => {
      const legNumber = idx + 1
      return {
        order: idx,
        mode: idx === 0 ? 'CAR' : 'WALK',
        day: 1,
        offsetMinutes: idx * 60, // 00:00, 01:00, 02:00 ...
        stopTitle: `Chặng ${legNumber}`,
        stopDesc: `Check-in chặng ${legNumber}`,
        stopImage: null,
        mapsQuery: `${safeLocation} chặng ${legNumber}`.trim(),
        fromName: `${safeName} - Chặng ${legNumber} (đi)`,
        toName: `${safeName} - Chặng ${legNumber} (đến)`,
        distanceKm: 2 + idx * 1.5,
        fromLat: null,
        fromLng: null,
        toLat: null,
        toLng: null,
        note: null
      }
    })
  }

  for (const pkg of packages) {
    await prisma.package.create({
      data: {
        ...pkg,
        itinerary: {
          create: buildSampleItinerary(pkg, 3)
        }
      }
    })
  }

  // Create Sample Destinations
  const destinations = [
    {
      name: 'Làng Chài Bình Thuận ',
      country: 'Việt Nam',
      city: 'Bình Thuận',
      amount: 15000,
      tags: 'Beach,History,Food',
      imageData: '/images/binhthuan.jpg',
      description: 'Discover the rich history of Fort Jesus and the beautiful beaches of the North Coast.',
      daysNights: 3,
      tourType: 'NIGHTS',
      latitude: -4.043477,
      longitude: 39.668206
    },
    {
      name: 'Bến Thành - Sài Gòn Đêm',
      country: 'Việt Nam',
      city: 'TP. Hồ Chí Minh',
      amount: 500000,
      tags: 'City,Culture,Food',
      imageData: '/images/benthanhsaigon.jpg',
      description: 'Hành trình từ Quận 12 đến Chợ Bến Thành, khám phá vẻ đẹp sôi động của Sài Gòn về đêm.',
      daysNights: 1,
      tourType: 'DAYS',
      latitude: 10.771918,
      longitude: 106.698262
    },
    {
      name: 'Vịnh Hạ Long',
      country: 'Vietnam',
      city: 'Quảng Ninh',
      amount: 3500000,
      tags: 'Nature,Boat,Heritage',
      imageData: '/images/halong.jpg',
      description: 'Kỳ quan thiên nhiên thế giới với hàng nghìn đảo đá vôi, hang động và hành trình du thuyền tuyệt đẹp.',
      daysNights: 2,
      tourType: 'NIGHTS',
      latitude: 20.9101,
      longitude: 107.1839
    },
    {
      name: 'Phố cổ Hội An',
      country: 'Vietnam',
      city: 'Quảng Nam',
      amount: 1200000,
      tags: 'Heritage,Culture,Food',
      imageData: '/images/hoian.jpg',
      description: 'Phố cổ lung linh đèn lồng, di sản UNESCO và ẩm thực miền Trung đặc sắc.',
      daysNights: 1,
      tourType: 'DAYS',
      latitude: 15.8801,
      longitude: 108.3380
    },
    {
      name: 'Đà Nẵng - Bà Nà Hills',
      country: 'Vietnam',
      city: 'Đà Nẵng',
      amount: 1990000,
      tags: 'City,View,Family',
      imageData: '/images/danang.jpg',
      description: 'Khám phá thành phố biển hiện đại và trải nghiệm Bà Nà Hills với khí hậu 4 mùa trong ngày.',
      daysNights: 2,
      tourType: 'NIGHTS',
      latitude: 16.0544,
      longitude: 108.2022
    },
    {
      name: 'Ninh Bình - Tràng An',
      country: 'Vietnam',
      city: 'Ninh Bình',
      amount: 1500000,
      tags: 'Nature,Boat,Culture',
      imageData: '/images/two.jpg',
      description: 'Khám phá non nước hữu tình, du thuyền Tràng An và cảnh quan đồng quê yên bình.',
      daysNights: 1,
      tourType: 'DAYS',
      latitude: 20.2500,
      longitude: 105.9740
    },
    {
      name: 'Sa Pa - Bản làng & ruộng bậc thang',
      country: 'Vietnam',
      city: 'Lào Cai',
      amount: 2990000,
      tags: 'Mountain,Nature,Culture',
      imageData: '/images/three.jpg',
      description: 'Săn mây, trekking bản làng và trải nghiệm văn hóa vùng cao Tây Bắc.',
      daysNights: 3,
      tourType: 'NIGHTS',
      latitude: 22.3364,
      longitude: 103.8438
    },
    {
      name: 'Huế - Cố đô',
      country: 'Vietnam',
      city: 'Huế',
      amount: 1590000,
      tags: 'Heritage,Culture,History',
      imageData: '/images/five.jpg',
      description: 'Tham quan Đại Nội, lăng tẩm và trải nghiệm nhịp sống trầm mặc của cố đô.',
      daysNights: 2,
      tourType: 'NIGHTS',
      latitude: 16.4637,
      longitude: 107.5909
    },
    {
      name: 'Đà Lạt - Cao nguyên mộng mơ',
      country: 'Vietnam',
      city: 'Lâm Đồng',
      amount: 2590000,
      tags: 'Nature,Chill,Coffee',
      imageData: '/images/nine.jpg',
      description: 'Rừng thông, săn mây, cà phê view thung lũng và khí hậu mát lành quanh năm.',
      daysNights: 2,
      tourType: 'NIGHTS',
      latitude: 11.9404,
      longitude: 108.4583
    },
    {
      name: 'Phú Quốc - Biển đảo',
      country: 'Vietnam',
      city: 'Kiên Giang',
      amount: 4590000,
      tags: 'Beach,Island,Snorkeling',
      imageData: '/images/marine.jpg',
      description: 'Lặn ngắm san hô, tour đảo, hoàng hôn và hải sản tươi ngon.',
      daysNights: 3,
      tourType: 'NIGHTS',
      latitude: 10.2899,
      longitude: 103.9840
    },
    {
      name: 'Cần Thơ - Chợ nổi Cái Răng',
      country: 'Vietnam',
      city: 'Cần Thơ',
      amount: 1990000,
      tags: 'River,Food,Culture',
      imageData: '/images/eight.jpg',
      description: 'Trải nghiệm chợ nổi sớm mai, miệt vườn trái cây và văn hóa sông nước.',
      daysNights: 2,
      tourType: 'NIGHTS',
      latitude: 10.0452,
      longitude: 105.7469
    },
    {
      name: 'Hà Giang - Mã Pì Lèng',
      country: 'Vietnam',
      city: 'Hà Giang',
      amount: 5490000,
      tags: 'Mountain,Adventure,View',
      imageData: '/images/eleven.jpg',
      description: 'Cung đường đèo ngoạn mục, sông Nho Quế và cao nguyên đá Đồng Văn.',
      daysNights: 4,
      tourType: 'NIGHTS',
      latitude: 22.8233,
      longitude: 104.9836
    },
    {
      name: 'Tây Ninh - Núi Bà Đen',
      country: 'Vietnam',
      city: 'Tây Ninh',
      amount: 890000,
      tags: 'View,Culture,Daytrip',
      imageData: '/images/seven.jpg',
      description: 'Cáp treo lên Núi Bà Đen, không khí mát lành và các điểm tâm linh.',
      daysNights: 1,
      tourType: 'DAYS',
      latitude: 11.3600,
      longitude: 106.1600
    },
    {
      name: 'Singapore - Gardens by the Bay',
      country: 'Singapore',
      city: 'Singapore',
      amount: 7900000,
      tags: 'City,Garden,Modern',
      imageData: '/images/singapore.jpg',
      description: 'Thành phố xanh với Gardens by the Bay, Marina Bay và các khu phố văn hóa đặc sắc.',
      daysNights: 3,
      tourType: 'NIGHTS',
      latitude: 1.3521,
      longitude: 103.8198
    },
    {
      name: 'Sri Lanka - Tea Country',
      country: 'Sri Lanka',
      city: 'Nuwara Eliya',
      amount: 12900000,
      tags: 'Nature,Tea,Culture',
      imageData: '/images/sirilanka.jpg',
      description: 'Vùng đồi chè xanh mướt, tàu hỏa scenic và trải nghiệm văn hóa bản địa.',
      daysNights: 5,
      tourType: 'NIGHTS',
      latitude: 6.9497,
      longitude: 80.7891
    }
  ]

  for (const dest of destinations) {
    await prisma.destination.create({ data: dest })
  }

  // Create Sample Blogs (and capture created IDs for HomeFeaturedBlog)
  const blogs = [
    {
      title: 'Top 5 Safari Tips for First-Timers',
      content:
        'Going on your first safari can be overwhelming. Here are our top tips to make your experience unforgettable...',
      authorId: 'admin_1',
      authorName: 'Forestline Team',
      tags: 'Safari,Tips,Travel',
      imageData: '/images/lion.jpeg',
    },
    {
      title: 'Why Sustainable Tourism Matters',
      content:
        'Eco-tourism is more than just a buzzword. It is about protecting the environment and supporting local communities...',
      authorId: 'admin_1',
      authorName: 'Forestline Team',
      tags: 'Eco-Tourism,Environment',
      imageData: '/images/conserve.svg',
    },
  ]

  const createdBlogs = []
  for (const blog of blogs) {
    const created = await prisma.blog.create({ data: blog })
    createdBlogs.push(created)
  }

  // Create Sample Home Reviews
  await prisma.homeReview.createMany({
    data: [
      {
        name: 'An Nhiên',
        location: 'Sài Gòn',
        rating: 5,
        content: 'Tour nhẹ nhàng, lên itinerary rõ ràng, cả nhóm đi vui mà vẫn giữ nhịp xanh.',
        isActive: true,
        order: 1,
      },
      {
        name: 'Minh Khang',
        location: 'Đà Nẵng',
        rating: 5,
        content: 'Đúng kiểu trải nghiệm bền vững: check-in có ý nghĩa, CO2 ước tính hợp lý, tổ chức chuyên nghiệp.',
        isActive: true,
        order: 2,
      },
      {
        name: 'Thu Hương',
        location: 'Hà Nội',
        rating: 5,
        content: 'Đi nhóm rất hợp. App dẫn lộ trình tốt, checkpoint dễ check và có thưởng cho nỗ lực.',
        isActive: true,
        order: 3,
      },
    ],
  })

  // Create Sample Featured Blogs on Home
  const featured = createdBlogs.slice(0, 2)
  for (let i = 0; i < featured.length; i++) {
    await prisma.homeFeaturedBlog.create({
      data: {
        blogId: featured[i].id,
        order: i,
        isActive: true,
      },
    })
  }

  // Create Sample Community Posts (public GET endpoint)
  await prisma.communityPost.createMany({
    data: [
      {
        userId: null,
        authorName: 'Forestline Admin',
        title: 'Checkpoint xanh: cả nhóm cùng làm một điều nhỏ',
        content:
          'Điểm danh dễ hơn mình nghĩ. Chỉ cần đúng vị trí, đúng thời điểm là cảm giác “làm được gì đó” hiện ngay trên màn hình.',
        imageData: '/images/recycle.svg',
        tags: 'eco,checkpoint,group',
        location: 'Sài Gòn',
        likesCount: 12,
        savesCount: 5,
      },
      {
        userId: null,
        authorName: 'Forestline Admin',
        title: 'Kayaking cuối tuần: vui – mát – và nhẹ nhàng',
        content:
          'Chèo cùng nhóm, nhịp chậm vừa đủ để nghe thiên nhiên. Tổng quan CO2 ước tính cũng cho mình thấy thay đổi nhỏ thật sự có tác động.',
        imageData: '/images/conserve.svg',
        tags: 'water,kayaking,eco',
        location: 'Bình Thuận',
        likesCount: 24,
        savesCount: 9,
      },
      {
        userId: null,
        authorName: 'Forestline Admin',
        title: 'Tree planting: trồng cây xong là muốn đi thêm chuyến nữa',
        content:
          'Cả nhóm trồng cây, chụp ảnh lại và ghi cảm nghĩ. Tối về điểm thưởng hiện lên như một lời “cảm ơn” động lực để quay lại.',
        imageData: '/images/community.svg',
        tags: 'tree,planting,green',
        location: 'Đà Lạt',
        likesCount: 18,
        savesCount: 7,
      },
    ],
  })

  // Create Sample Eco Rewards
  await prisma.ecoReward.createMany({
    data: [
      {
        title: 'Eco Badge (Bronze)',
        description: 'Đạt mốc điểm thưởng cơ bản và nhận badge Bronze cho hành trình xanh đầu tiên.',
        pointsRequired: 120,
        stock: 100,
        imageData: '/images/conserve.svg',
        isActive: true,
      },
      {
        title: 'Group Perk: Giảm 5%',
        description: 'Dùng điểm thưởng để nhận ưu đãi giảm 5% cho chuyến đi nhóm tiếp theo.',
        pointsRequired: 300,
        stock: 50,
        imageData: '/images/recycle.svg',
        isActive: true,
      },
      {
        title: 'Eco Experience Upgrade',
        description: 'Nâng cấp trải nghiệm thêm hoạt động xanh trong itinerary (tùy lịch).',
        pointsRequired: 600,
        stock: 20,
        imageData: '/images/community.svg',
        isActive: true,
      },
    ],
  })

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
