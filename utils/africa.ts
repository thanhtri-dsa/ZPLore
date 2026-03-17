// utils/africa.ts

export interface Destination {
    id: number;
    name: string;
    location: string;
    price: number;
    duration: string;
    imageUrl: string;
    group: string;
  }
  
  export const destinations: Destination[] = [
    {
      id: 1,
      name: "Masai Mara Safari",
      location: "Kenya",
      price: 3420,
      duration: "7 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800&auto=format&fit=crop",
      group: "Small Group"
    },
    {
      id: 2,
      name: "Serengeti Adventure",
      location: "Tanzania",
      price: 4200,
      duration: "10 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&auto=format&fit=crop",
      group: "Private Tour"
    },
    {
      id: 3,
      name: "Victoria Falls",
      location: "Zimbabwe",
      price: 2800,
      duration: "5 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop",
      group: "Guided Tour"
    },
    {
      id: 4,
      name: "Sahara Desert Trek",
      location: "Morocco",
      price: 2500,
      duration: "6 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1548786811-dd6e453ccca7?w=800&auto=format&fit=crop",
      group: "Adventure Group"
    },
    {
      id: 5,
      name: "Cape Town Explorer",
      location: "South Africa",
      price: 3100,
      duration: "8 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800&auto=format&fit=crop",
      group: "Family Tour"
    },
    {
      id: 6,
      name: "Zanzibar Beach",
      location: "Tanzania",
      price: 2900,
      duration: "7 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&auto=format&fit=crop",
      group: "Luxury Package"
    },
    {
      id: 7,
      name: "Nile River Cruise",
      location: "Egypt",
      price: 3800,
      duration: "8 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&auto=format&fit=crop",
      group: "Luxury Cruise"
    },
    {
      id: 8,
      name: "Gorilla Trekking",
      location: "Uganda",
      price: 4500,
      duration: "6 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=800&auto=format&fit=crop",
      group: "Small Group"
    },
    {
      id: 9,
      name: "Atlas Mountains Hike",
      location: "Morocco",
      price: 2200,
      duration: "5 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?w=800&auto=format&fit=crop",
      group: "Adventure Group"
    },
    {
      id: 10,
      name: "Okavango Delta Safari",
      location: "Botswana",
      price: 5200,
      duration: "9 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop",
      group: "Luxury Safari"
    },
    {
      id: 11,
      name: "Marrakech City Tour",
      location: "Morocco",
      price: 1800,
      duration: "4 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1597212720158-e21f7e5c52fa?w=800&auto=format&fit=crop",
      group: "Cultural Tour"
    },
    {
      id: 12,
      name: "Seychelles Island Hopping",
      location: "Seychelles",
      price: 4800,
      duration: "10 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&auto=format&fit=crop",
      group: "Luxury Package"
    }
  ];
  