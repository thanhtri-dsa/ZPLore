'use client'

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from 'framer-motion'
import { ShoppingBag, Star } from 'lucide-react'

const products = [
  {
    id: 1,
    name: "Ống hút Tre Tự Nhiên",
    price: "45.000",
    image: "https://tse2.mm.bing.net/th/id/OIP.DJvn_ZX7d8TRAupQHLWCLgHaE7?pid=Api&h=220&P=0",
    rating: 5,
    tag: "Eco-Friendly"
  },
  {
    id: 2,
    name: "Nón Lá Truyền Thống",
    price: "120.000",
    image: "https://tse2.mm.bing.net/th/id/OIP.q9iGzV91NkyFsxsYCiRIFAHaE6?pid=Api&h=220&P=0",
    rating: 5,
    tag: "Handmade"
  },
  {
    id: 3,
    name: "Túi Dây Đan ",
    price: "250.000",
    image: "https://handmadeak.com/wp-content/uploads/2020/03/qua-tang-tui-luc-binh.jpg",
    rating: 4,
    tag: "Sustainable"
  },
  {
    id: 4,
    name: "Bộ Trà Gốm Bát Tràng",
    price: "850.000",
    image: "https://battrangplaza.com/wp-content/uploads/2023/04/am-chen-bat-trang-men-hoa-bien-goc-cay.jpg",
    rating: 5,
    tag: "Premium"
  }
]

export function EcoProductsSection() {
  return (
    <section className="py-24 vn-pattern bg-primary/5 relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs text-primary font-bold uppercase tracking-widest mb-4">
              <ShoppingBag size={14} />
              Hệ sinh thái Eco-Luxury
            </div>
            <h2 className="vn-title text-4xl md:text-5xl font-bold">Tuyệt tác <span className="text-primary italic font-serif">thủ công</span></h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-md text-muted-foreground text-lg italic leading-relaxed"
          >
            &quot;Sự giao thoa hoàn hảo giữa tinh hoa truyền thống Việt Nam và phong cách sống bền vững hiện đại.&quot;
          </motion.p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="vn-card-vip group border-none bg-white shadow-xl hover:shadow-2xl overflow-hidden h-full flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="relative overflow-hidden aspect-[4/5]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <span className="glass-morphism-dark text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                        {product.tag}
                      </span>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                       <Button className="bg-white text-primary hover:bg-secondary hover:text-primary font-bold rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                         Xem chi tiết
                       </Button>
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1 bg-white relative">
                    {/* Decorative Pattern in Card */}
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-[0.03] vn-pattern-gold pointer-events-none" />
                    
                    <div className="flex items-center gap-1">
                      {[...Array(product.rating)].map((_, i) => (
                        <Star key={i} size={12} className="fill-secondary text-secondary" />
                      ))}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem] leading-snug">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Giá sở hữu</span>
                        <span className="text-primary font-bold text-xl">{product.price} <span className="text-xs font-normal">VNĐ</span></span>
                      </div>
                      <Button size="icon" className="rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all w-12 h-12">
                        <ShoppingBag size={20} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
           <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white px-10 h-14 font-bold transition-all">
             Xem tất cả sản phẩm Eco
           </Button>
        </div>
      </div>
    </section>
  )
}
