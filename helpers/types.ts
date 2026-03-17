import { LucideIcon } from 'lucide-react'

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

export interface FeaturedAdventure {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  tag: string;
}

export interface PackageType {
  id: string;
  name: string;
  icon: LucideIcon;  // Changed from string to LucideIcon
}