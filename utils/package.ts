// File: utils/package.js

import { Car, Umbrella, Trees } from "lucide-react"

export const packageTypes = [
  { id: 'beach', name: 'Beach Packages', icon: Umbrella },
  { id: 'bush', name: 'Bush Packages', icon: Trees },
  { id: 'weekend', name: 'Weekend Getaways', icon: Car },
]

export const simpleDestinations = [
  // Beach Packages
  { 
    id: 1, 
    name: 'Mombasa',
    type: 'beach',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f'
  },
  { 
    id: 2, 
    name: 'Watamu',
    type: 'beach',
    image: 'https://images.unsplash.com/photo-1589449148584-825719c3c43b'
  },
  { 
    id: 3, 
    name: 'Diani',
    type: 'beach',
    image: 'https://images.unsplash.com/photo-1589449148584-825719c3c43b'
  },
  // Bush Packages
  { 
    id: 4, 
    name: 'Tsavo',
    type: 'bush',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e'
  },
  { 
    id: 5, 
    name: 'Amboseli',
    type: 'bush',
    image: 'https://images.unsplash.com/photo-1546421845-6471bdcf3edf'
  },
  { 
    id: 6, 
    name: 'Masai Mara',
    type: 'bush',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d'
  },
  // Weekend Getaway Packages
  { 
    id: 7, 
    name: 'Nairobi National Park',
    type: 'weekend',
    image: 'https://images.unsplash.com/photo-1567890667141-543859527344'
  },
  { 
    id: 8, 
    name: 'Lake Nakuru',
    type: 'weekend',
    image: 'https://images.unsplash.com/photo-1544020385-aa921029c310'
  },
  { 
    id: 9, 
    name: 'Lake Naivasha',
    type: 'weekend',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99'
  }
]