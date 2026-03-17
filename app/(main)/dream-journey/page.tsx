'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Navigation, 
  Bus, 
  Zap, 
  Footprints, 
  ArrowRight, 
  Sparkles,
  Leaf,
  Crown,
  Camera,
  Coffee,
  Trees,
  History,
  Wind
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DreamJourneyFormPage() {
  const [interests, setInterests] = React.useState<string[]>([])
  const [pace, setPace] = React.useState('Thư giãn')

  const toggleInterest = (id: string) => {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <div className="min-h-screen bg-primary pt-32 pb-20 relative overflow-hidden">
      {/* ... previous background decorations ... */}
      <div className="absolute inset-0 vn-pattern opacity-10 pointer-events-none scale-150" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-black/40" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
            
            {/* Left Content: Branding */}
            <div className="lg:col-span-2 text-white lg:sticky lg:top-32">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center shadow-[0_20px_50px_rgba(255,184,0,0.3)] mb-8">
                  <Crown size={40} className="text-primary" />
                </div>
                <h1 className="text-5xl md:text-8xl font-serif font-black mb-6 leading-tight">
                  Hành trình <br/>
                  <span className="text-secondary italic">Ước mơ</span>
                </h1>
                                  <p className="text-white/60 text-lg md:text-2xl leading-relaxed italic mb-12 max-w-sm">
                    &quot;Vượt xa một chuyến đi, đây là bản hòa ca giữa con người và thiên nhiên.&quot;
                  </p>
                
                <div className="grid grid-cols-1 gap-8">
                  {[
                    { icon: Leaf, title: "Tác động xanh", desc: "Mỗi bước chân là một mầm xanh cho tương lai." },
                    { icon: Sparkles, title: "Độc bản bởi AI", desc: "Thiết kế riêng cho tâm hồn và nhịp sống của bạn." },
                    { icon: Wind, title: "Góc nhìn mở rộng", desc: "Khám phá những di sản chưa từng được công bố." }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-5 text-white/80 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-primary transition-all duration-500">
                        <item.icon size={22} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-widest text-secondary mb-1">{item.title}</h4>
                        <p className="text-sm text-white/50 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Content: The Advanced Form */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white p-8 md:p-16 rounded-[4rem] shadow-[0_50px_150px_rgba(0,0,0,0.4)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="mb-12">
                    <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.5em] mb-4 flex items-center gap-2">
                      <Sparkles size={14} className="animate-pulse" /> Global Eco-Intelligence
                    </h4>
                    <h3 className="text-3xl md:text-5xl font-serif font-black text-primary leading-tight">
                      Kiến tạo <span className="italic text-secondary">di sản riêng</span> của bạn
                    </h3>
                  </div>

                  <form 
                    className="space-y-10"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const start = formData.get('start');
                      const end = formData.get('end');
                      const transport = formData.get('transport');
                      const prompt = `Hành trình ước mơ TẠI VIỆT NAM từ ${start} đến ${end} bằng ${transport}. Sở thích: ${interests.join(', ')}. Nhịp độ: ${pace}. Hãy tạo một lộ trình chuyên sâu về Văn hóa, Ẩm thực và Di sản xanh TẠI VIỆT NAM. BẮT BUỘC: Nếu khởi hành từ miền Bắc, lộ trình phải đi qua ĐÀ NẴNG (16.0544, 108.2022) bằng TÀU HỎA để trải nghiệm đường sắt qua đèo Hải Vân. Lộ trình và địa danh PHẢI nằm trong lãnh thổ Việt Nam.`;
                      
                      window.location.href = `/ai-planner?start=${encodeURIComponent(start as string)}&end=${encodeURIComponent(end as string)}&transport=${encodeURIComponent(transport as string)}&interests=${encodeURIComponent(interests.join(','))}&pace=${encodeURIComponent(pace)}&fullPrompt=${encodeURIComponent(prompt)}`;
                    }}
                  >
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Điểm khởi hành</label>
                        <div className="relative group">
                          <MapPin size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors" />
                          <input name="start" required placeholder="Bạn đang ở đâu?" className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Điểm đến mong muốn</label>
                        <div className="relative group">
                          <Navigation size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors" />
                          <input name="end" required placeholder="Nơi bạn muốn đến?" className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* Interests Selection */}
                    <div className="space-y-5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Bạn quan tâm đến điều gì?</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { id: 'culture', label: 'Văn hóa', icon: History },
                          { id: 'food', label: 'Ẩm thực', icon: Coffee },
                          { id: 'nature', label: 'Thiên nhiên', icon: Trees },
                          { id: 'photo', label: 'Nhiếp ảnh', icon: Camera }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleInterest(item.id)}
                            className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${interests.includes(item.id) ? 'bg-primary text-white border-primary shadow-xl scale-105' : 'bg-gray-50 border-gray-50 text-gray-400 hover:border-gray-200'}`}
                          >
                            <item.icon size={24} />
                            <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pace Selection */}
                    <div className="space-y-5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Nhịp độ hành trình</label>
                      <div className="flex bg-gray-50 p-2 rounded-2xl gap-2">
                        {['Thư giãn', 'Vừa phải', 'Năng động'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPace(p)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pace === p ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transport */}
                    <div className="space-y-5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Phương tiện di chuyển xanh</label>
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { id: 'bus', label: 'Xe Bus', icon: Bus, color: 'text-blue-500', bg: 'bg-blue-50' },
                          { id: 'electric', label: 'Xe Điện', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                          { id: 'walk', label: 'Đi bộ', icon: Footprints, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                        ].map((type) => (
                          <label key={type.id} className="cursor-pointer group">
                            <input type="radio" name="transport" value={type.label} defaultChecked={type.id === 'electric'} className="sr-only peer" />
                            <div className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] border-2 border-gray-50 bg-gray-50/30 transition-all group-hover:bg-white group-hover:shadow-xl peer-checked:border-secondary peer-checked:bg-white peer-checked:shadow-xl`}>
                              <div className={`p-4 rounded-2xl ${type.bg} ${type.color}`}>
                                <type.icon size={24} />
                              </div>
                              <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 peer-checked:text-primary">{type.label}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-24 bg-primary text-white rounded-[2.5rem] font-black text-sm md:text-base uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(0,0,0,0.2)] hover:bg-black hover:scale-[1.02] transition-all flex items-center justify-center gap-4 mt-6 group">
                      Bắt đầu phác họa <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
