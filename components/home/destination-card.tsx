import Image from "next/image"
import Link from 'next/link'
import { MapPin, ArrowRight, Star } from "lucide-react"

interface DestinationCardProps {
  image: string
  title: string
  price: number
  location: string
}

export function DestinationCard({ image, title, price, location }: DestinationCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] hover:-translate-y-3">
      <div className="relative h-[380px] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* VIP Badge */}
        <div className="absolute top-6 left-6 z-20">
          <div className="glass-morphism-gold text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] flex items-center gap-2">
            <Star size={12} className="fill-primary" />
            VIP Choice
          </div>
        </div>
        
        {/* Overlay Gradient - More subtle and high-end */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
        
        {/* Location Badge */}
        <div className="absolute bottom-32 left-6 z-20 flex items-center gap-2 text-white/90">
          <MapPin size={14} className="text-secondary" />
          <span className="text-xs font-bold tracking-wide">{location}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        <h3 className="text-2xl font-serif font-black text-white mb-4 group-hover:text-secondary transition-colors line-clamp-2 leading-tight">
          {title}
        </h3>
        
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div>
            <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mb-1">Giá từ</p>
            <p className="text-xl font-black text-secondary">
              {price.toLocaleString('vi-VN')} <span className="text-xs font-bold text-white/70">VNĐ</span>
            </p>
          </div>
          <Link href="/destinations">
            <button className="w-12 h-12 rounded-full bg-secondary text-primary flex items-center justify-center shadow-2xl shadow-secondary/20 transition-all hover:scale-110 active:scale-95 group/btn">
              <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

