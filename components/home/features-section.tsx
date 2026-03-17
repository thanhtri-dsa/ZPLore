import { Clock, Building2, FileText, Search } from 'lucide-react'
import Image from 'next/image'
import Link from "next/link"
import { motion } from 'framer-motion'

export function FeaturesSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-white">
      {/* Decorative Gold Pattern Overlay */}
      <div className="absolute inset-0 vn-pattern-gold opacity-[0.02] pointer-events-none" />
      
      {/* Decorative Lotus */}
      <div className="absolute top-10 -left-20 opacity-[0.05] pointer-events-none rotate-45 scale-150">
        <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor" className="text-primary">
          <path d="M50 0C50 0 55 20 75 20C95 20 100 0 100 0C100 0 80 5 80 25C80 45 100 50 100 50C100 50 80 55 80 75C80 95 100 100 100 100C100 100 80 95 60 95C40 95 20 100 20 100C20 100 40 95 40 75C40 55 20 50 20 50C20 50 40 45 40 25C40 5 20 0 20 0C20 0 45 20 50 0Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid gap-24 lg:grid-cols-2 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-secondary/10 px-6 py-2 text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-8 shadow-sm border border-secondary/20">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Dịch vụ thượng lưu
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-black leading-tight mb-8 text-primary">
                Định nghĩa lại <br/>
                <span className="text-secondary italic">sự sang trọng</span> bền vững
              </h2>
              <p className="text-muted-foreground text-xl leading-relaxed italic border-l-4 border-secondary pl-8">
                &quot;Mỗi hành trình tại ZPLore không chỉ là một kỳ nghỉ, mà là một sự kết nối sâu sắc với di sản và thiên nhiên và kết nối khách hàng với mô hình tour mới nhất .&quot;
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {[
                { icon: Clock, title: "Hỗ trợ 24/7", desc: "Chuyên gia phục vụ riêng biệt" },
                { icon: Building2, title: "Địa điểm phong phú ", desc: "Tinh hoa kiến trúc Việt" },
                { icon: FileText, title: "Lịch trình độc lập ", desc: "Thiết kế riêng cho bạn" },
                { icon: Search, title: "Khám phá bí mật", desc: "Những điểm đến ẩn giấu" },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 p-6 rounded-3xl bg-gray-50 hover:bg-secondary/10 transition-all duration-500 group border border-transparent hover:border-secondary/20">
                  <div className="flex-shrink-0 rounded-2xl bg-white p-4 shadow-xl shadow-gray-200/50 group-hover:scale-110 transition-transform">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-primary text-lg mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground font-medium italic">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-6 pt-6">
              <Link href="/destinations">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-primary text-white hover:bg-gray-900 px-10 h-14 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all"
                >
                  Đặt hành trình ngay
                </motion.button>
              </Link>
              {/* <Link href="/about">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border-2 border-primary/20 text-primary hover:bg-primary hover:text-white px-10 h-14 text-sm font-black uppercase tracking-widest transition-all"
                >
                  Về chúng tôi
                </motion.button>
              </Link> */}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-[12px] border-white">
              <Image
                src="/images/travel_detsinations.jpg"
                alt=" Travel Experience"
                width={600}
                height={700}
                className="object-cover w-full h-[650px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
            
            {/* Decorative Gold Box */}
            { <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/10 rounded-full -z-0 border-2 border-dashed border-secondary/30" 
            /> }
            
            {/* <div className="absolute top-12 right-12 z-20">
              <UserAvatars />
            </div> */}

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="absolute -bottom-6 -left-6 z-20 glass-morphism p-8 rounded-[2rem] max-w-[240px] shadow-2xl"
            >
              <p className="text-primary font-black text-4xl mb-2"> </p>
              <p className="text-xs text-primary/70 font-black uppercase tracking-widest leading-relaxed">
               Nhân sự trả lời nhanh nhất thắc mắc nhanh nhất  
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

