export interface Included {
    id: string;
    item: string;
  }
  
  export interface Destination {
    id: number;
    name: string;
    location: string;
    price: string;
    imageUrl: string;
    description: string;
    included: Included[];
    duration: string;
    bestTime: string;
    difficulty: string;
  }
  
  export const destinations: Destination[] = [
    {
      id: 1,
      name: "Masai Mara Safari",
      location: "Kenya",
      price: "5000 kes",
      imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
      description: "Embark on an unforgettable wildlife adventure in the heart of Kenya's Masai Mara. Witness the great migration, spot the Big Five, and immerse yourself in the rich Maasai culture. Our expert guides will ensure you have a safe and thrilling experience in one of Africa's most iconic safari destinations.",
      included: [
        { id: "1", item: "Professional safari guide" },
        { id: "2", item: "4x4 safari vehicle" },
        { id: "3", item: "All park entrance fees" },
        { id: "4", item: "Full board accommodation" },
        { id: "5", item: "Game drives" },
        { id: "6", item: "Cultural village visit" }
      ],
      duration: "5 days / 4 nights",
      bestTime: "July to October",
      difficulty: "Easy"
    },
    {
      id: 2,
      name: "Zanzibar Beaches",
      location: "Tanzania",
      price: "10,000 kes",
      imageUrl: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800",
      description: "Discover the pristine beaches and crystal-clear waters of Zanzibar. Relax on white sandy shores, explore historic Stone Town, and indulge in water sports activities. Experience the perfect blend of relaxation and adventure in this tropical paradise off the coast of Tanzania.",
      included: [
        { id: "1", item: "Beach resort accommodation" },
        { id: "2", item: "Airport transfers" },
        { id: "3", item: "Breakfast and dinner" },
        { id: "4", item: "Stone Town tour" },
        { id: "5", item: "Snorkeling equipment" },
        { id: "6", item: "Sunset dhow cruise" }
      ],
      duration: "7 days / 6 nights",
      bestTime: "June to October",
      difficulty: "Easy"
    },
    {
      id: 3,
      name: "Atlas Mountains",
      location: "Morocco",
      price: "2,999",
      imageUrl: "https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=800",
      description: "Embark on a thrilling expedition through Morocco's Atlas Mountains. Trek through stunning landscapes, visit traditional Berber villages, and challenge yourself with a climb to the summit of Mount Toubkal, North Africa's highest peak. Experience the raw beauty and rich culture of this mountainous region.",
      included: [
        { id: "1", item: "Professional mountain guide" },
        { id: "2", item: "Mule support for baggage" },
        { id: "3", item: "Mountain accommodation" },
        { id: "4", item: "All meals during trek" },
        { id: "5", item: "Camping equipment" },
        { id: "6", item: "First aid kit" }
      ],
      duration: "6 days / 5 nights",
      bestTime: "April to October",
      difficulty: "Challenging"
    },
    {
      id: 4,
      name: "Atlas Mountains",
      location: "Morocco",
      price: "2,999",
      imageUrl: "https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=800",
      description: "Embark on a thrilling expedition through Morocco's Atlas Mountains. Trek through stunning landscapes, visit traditional Berber villages, and challenge yourself with a climb to the summit of Mount Toubkal, North Africa's highest peak. Experience the raw beauty and rich culture of this mountainous region.",
      included: [
        { id: "1", item: "Professional mountain guide" },
        { id: "2", item: "Mule support for baggage" },
        { id: "3", item: "Mountain accommodation" },
        { id: "4", item: "All meals during trek" },
        { id: "5", item: "Camping equipment" },
        { id: "6", item: "First aid kit" }
      ],
      duration: "6 days / 5 nights",
      bestTime: "April to October",
      difficulty: "Challenging"
    },
    {
      id: 5,
      name: "Atlas Mountains",
      location: "Morocco",
      price: "2,999",
      imageUrl: "https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=800",
      description: "Embark on a thrilling expedition through Morocco's Atlas Mountains. Trek through stunning landscapes, visit traditional Berber villages, and challenge yourself with a climb to the summit of Mount Toubkal, North Africa's highest peak. Experience the raw beauty and rich culture of this mountainous region.",
      included: [
        { id: "1", item: "Professional mountain guide" },
        { id: "2", item: "Mule support for baggage" },
        { id: "3", item: "Mountain accommodation" },
        { id: "4", item: "All meals during trek" },
        { id: "5", item: "Camping equipment" },
        { id: "6", item: "First aid kit" }
      ],
      duration: "6 days / 5 nights",
      bestTime: "April to October",
      difficulty: "Challenging"
    },
    {
      id: 6,
      name: "Atlas Mountains",
      location: "Morocco",
      price: "2,999",
      imageUrl: "https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=800",
      description: "Embark on a thrilling expedition through Morocco's Atlas Mountains. Trek through stunning landscapes, visit traditional Berber villages, and challenge yourself with a climb to the summit of Mount Toubkal, North Africa's highest peak. Experience the raw beauty and rich culture of this mountainous region.",
      included: [
        { id: "1", item: "Professional mountain guide" },
        { id: "2", item: "Mule support for baggage" },
        { id: "3", item: "Mountain accommodation" },
        { id: "4", item: "All meals during trek" },
        { id: "5", item: "Camping equipment" },
        { id: "6", item: "First aid kit" }
      ],
      duration: "6 days / 5 nights",
      bestTime: "April to October",
      difficulty: "Challenging"
    }
    
 
  ];
  
  export interface FeaturedAdventure {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    tag: string;
  }
  
  export const featuredAdventures: FeaturedAdventure[] = [
    {
      id: 1,
      title: "Safari Adventure",
      description: "Experience the great migration",
      imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200",
      tag: "PREMIUM TRIP"
    },
    {
      id: 2,
      title: "Desert Expedition",
      description: "Explore Sahara wilderness",
      imageUrl: "https://www.thoughtco.com/thmb/l0Ei2qSYEp6vtU6a1o0FtphhV4s=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/SaharaDesert-58c1a5603df78c353c3d525d.jpg",
      tag: "PREMIUM TRIP"
    },
    {
      id: 3,
      title: "Mountain Climbing",
      description: "  Mt Kilimanjaro",
      imageUrl: "https://www.go2africa.com/wp-content/uploads/2022/05/shutterstock_60854839_kili.jpg",
      tag: "PREMIUM TRIP"
    }
  ];

  