'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function WorldMap() {
  const geo = {
    minLon: -169.110266,
    maxLat: 83.600842,
    maxLon: 190.486279,
    minLat: -58.508473,
  };

  const geoToPercent = useCallback((lat: number, lon: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const mercY = (degLat: number) => Math.log(Math.tan(Math.PI / 4 + toRad(degLat) / 2));

    const left = ((lon - geo.minLon) / (geo.maxLon - geo.minLon)) * 100;
    const top =
      ((mercY(geo.maxLat) - mercY(lat)) / (mercY(geo.maxLat) - mercY(geo.minLat))) * 100;

    return { left, top };
  }, [geo.maxLat, geo.maxLon, geo.minLat, geo.minLon]);

  const vietnamDefault = useMemo(() => geoToPercent(10.8231, 106.6297), [geoToPercent]);
  const [vietnam, setVietnam] = useState<{ left: number; top: number }>(vietnamDefault);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('worldmap_tphcm_marker');
      if (!raw) return;
      const parsed = JSON.parse(raw) as { left?: number; top?: number };
      if (typeof parsed.left !== 'number' || typeof parsed.top !== 'number') return;
      if (!Number.isFinite(parsed.left) || !Number.isFinite(parsed.top)) return;
      setVietnam({ left: parsed.left, top: parsed.top });
    } catch {}
  }, []);

  const onPickVietnam = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.shiftKey) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const left = ((e.clientX - rect.left) / rect.width) * 100;
    const top = ((e.clientY - rect.top) / rect.height) * 100;
    if (!Number.isFinite(left) || !Number.isFinite(top)) return;
    const next = { left: Math.max(0, Math.min(100, left)), top: Math.max(0, Math.min(100, top)) };
    setVietnam(next);
    try {
      localStorage.setItem('worldmap_tphcm_marker', JSON.stringify(next));
    } catch {}
  }, []);

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 vn-pattern opacity-[0.03] pointer-events-none" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-6 py-2 text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-8 shadow-sm border border-secondary/20">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Mạng lưới toàn cầu
          </div>
          
          <h2 className="text-4xl md:text-6xl font-serif font-black text-primary mb-8 leading-tight">
            Kết nối những <br/>
            <span className="text-secondary italic">giá trị xanh</span> toàn cầu
          </h2>
          
          <p className="text-muted-foreground text-xl italic max-w-2xl mx-auto mb-20 leading-relaxed">
            &quot;Chúng tôi mở rộng tầm nhìn để mang những tiêu chuẩn nghỉ dưỡng bền vững hàng đầu thế giới về với Việt Nam.&quot;
          </p>
        </motion.div>
        
        <div className="relative group">
          <div className="mx-auto max-w-6xl relative" onClick={onPickVietnam}>
            {/* Decorative background circle */}
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-[120px] scale-90 pointer-events-none" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative w-full aspect-[1009/666] transition-transform duration-1000 group-hover:scale-[1.05]"
            >
              <Image
                src="/images/world.svg"
                alt="Bản đồ thế giới"
                fill
                priority
                className="object-contain opacity-60 filter grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                sizes="100vw"
              />
            </motion.div>
            
            {/* TPHCM highlight */}
            <MapMarker left={`${vietnam.left}%`} top={`${vietnam.top}%`} title="TP.HCM" isSpecial />
          </div>
        </div>
      </div>
    </section>
  );
}

function MapMarker({
  left,
  top,
  title,
  isSpecial = false
}: {
  left: string;
  top: string;
  title: string;
  isSpecial?: boolean;
}) {
  return (
    <div
      className="absolute group/marker z-20"
      style={{
        left,
        top
      }}
    >
      {/* Pulse ring */}
      <div className={`absolute -inset-4 rounded-full animate-ping opacity-20 ${isSpecial ? 'bg-secondary' : 'bg-primary'}`} />
      
      {/* Main dot */}
      <motion.div 
        whileHover={{ scale: 1.5 }}
        className={`relative w-5 h-5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-500 flex items-center justify-center ${isSpecial ? 'bg-secondary scale-125 border-4 border-white' : 'bg-primary border-2 border-white'}`}
      >
        {isSpecial && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
      </motion.div>
      
      {/* Label */}
      <div className={`absolute left-8 top-1/2 -translate-y-1/2 px-4 py-2 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/marker:opacity-100 transition-all duration-500 whitespace-nowrap translate-x-4 group-hover/marker:translate-x-0 ${isSpecial ? 'bg-primary text-white' : 'bg-white text-primary border border-gray-100'}`}>
        {title}
      </div>
    </div>
  );
}

export default WorldMap;
