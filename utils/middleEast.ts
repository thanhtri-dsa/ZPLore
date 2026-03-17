// utils/middleeast.ts

export interface Destination {
    id: number;
    name: string;
    location: string;
    price: number;
    duration: string;
    imageUrl: string;
    group: string;
  }
  
  const destinations: Destination[] = [
    {
      id: 1,
      name: "Dubai City Tour",
      location: "United Arab Emirates",
      price: 3000,
      duration: "5 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1554233126-ccdfd0fdace3?w=800&auto=format&fit=crop",
      group: "Luxury Tour",
    },
    {
      id: 2,
      name: "Petra Adventure",
      location: "Jordan",
      price: 3500,
      duration: "7 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1575452683698-dfdb491dc6c1?w=800&auto=format&fit=crop",
      group: "Guided Tour",
    },
    {
      id: 3,
      name: "Giza Pyramids Tour",
      location: "Egypt",
      price: 2500,
      duration: "6 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1591101331539-746a3788d987?w=800&auto=format&fit=crop",
      group: "Cultural Tour",
    },
    {
      id: 4,
      name: "Dead Sea Retreat",
      location: "Jordan",
      price: 3200,
      duration: "4 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1580656848366-cf941dc88ab2?w=800&auto=format&fit=crop",
      group: "Wellness Tour",
    },
    {
      id: 5,
      name: "Muscat Exploration",
      location: "Oman",
      price: 2800,
      duration: "5 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1587303150991-1715ed509ddd?w=800&auto=format&fit=crop",
      group: "City Tour",
    },
    {
      id: 6,
      name: "Jerusalem Pilgrimage",
      location: "Israel",
      price: 4200,
      duration: "10 Days Trip",
      imageUrl: "https://images.unsplash.com/photo-1547564040-0319d4d7c1dc?w=800&auto=format&fit=crop",
      group: "Spiritual Journey",
    },
  ];
  
  export default destinations;
  