'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image'
import { Facebook, Instagram, Twitter, Linkedin, Send, ChevronUp, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

const emailSchema = z.string().email({ message: "Invalid email address" });

const TawkToWidget = () => {
  useEffect(() => {
    const w = window as Window & { Tawk_API?: unknown; Tawk_LoadStart?: Date }
    w.Tawk_API = w.Tawk_API || {}
    w.Tawk_LoadStart = new Date()

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/672deb174304e3196adf4649/1ic5lsm4o';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    const style = document.createElement('style');
    style.textContent = `
      /* Vị trí widget chat: nổi hẳn lên trên khung bottom nav */
      #tawk-to-widget,
      #tawkchat-minified-container,
      .tawk-min-container {
        bottom: calc(env(safe-area-inset-bottom, 0px) + 150px) !important; /* cao hơn hẳn nav */
        right: 20px !important;
        margin: 0 !important;
        z-index: 120 !important; /* nổi trên nav nhưng không che phím hệ điều hành */
      }

      #tawk-to-widget {
        height: 52px !important;
        width: 52px !important;
      }

      @media (max-width: 640px) {
        #tawk-to-widget,
        #tawkchat-minified-container,
        .tawk-min-container {
          bottom: calc(env(safe-area-inset-bottom, 0px) + 160px) !important;
          right: 24px !important;
        }

        #tawk-to-widget {
          height: 44px !important;
          width: 44px !important;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(script);

    return () => {
      const tawkScript = document.querySelector(`script[src="${script.src}"]`);
      if (tawkScript && tawkScript.parentNode) {
        tawkScript.parentNode.removeChild(tawkScript);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return null;
};

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Get scroll position and page height
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      
      // Show button when user has scrolled 75% of the page
      const scrollThreshold = totalHeight - viewportHeight * 1.25;
      setIsVisible(scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      className={`fixed bottom-4 left-4 z-[60] bg-primary hover:bg-primary/90 
        text-white rounded-full cursor-pointer transition-all duration-300 ease-in-out
        w-12 h-12 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg
        hover:shadow-xl transform hover:-translate-y-1 border-2 border-secondary/50
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
      `}
    >
      <ChevronUp className="w-6 h-6 sm:w-6 sm:h-6" />
    </button>
  );
};

const LangNgheTravelFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeStatus('loading');

    try {
      emailSchema.parse(email);
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribeStatus('success');
        setEmail('');
        setTimeout(() => setSubscribeStatus('idle'), 3000);
      } else {
        throw new Error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setSubscribeStatus('error');
      if (error instanceof z.ZodError) {
        setErrorMessage(error.errors[0].message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred');
      }
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    }
  };

  return (
    <>
      {/* TawkTo live chat widget */}
      <TawkToWidget />

      <div className="relative z-10 overflow-hidden text-white">
        <div
          className="relative z-20 h-16 sm:h-24 md:h-32 w-full -scale-y-[1] bg-contain bg-repeat-x"
          style={{ backgroundImage: "url('/images/banner_style.png')" }}
        />
      </div>

      <section className="py-12 md:py-20 bg-primary vn-pattern relative">
        <div className="container px-4 mx-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 pb-12 md:pb-20">
              {/* Newsletter Section */}
              <div className="w-full">
                <div className="max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                  <div className="mb-6 md:mb-8">
                    <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
                      <div className="p-2 bg-secondary/10 rounded-xl border border-secondary/20">
                        <div className="relative w-7 h-7">
                          <Image
                            src="/images/lang-nghe-travel-logo.svg.png"
                            alt="Làng Nghề Travel"
                            fill
                            sizes="28px"
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-secondary font-serif">
                        Làng Nghề Travel
                      </h2>
                    </div>
                    <p className="text-xs md:text-sm text-white/90 uppercase tracking-widest mt-1">Tour làng nghề & văn hóa Việt</p>
                  </div>
                  <h3 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    <span>Sẵn sàng cho </span>
                    <br className="hidden md:block" />
                    <span className="font-serif italic text-secondary">hành trình mới</span>
                    <span>?</span>
                  </h3>
                  <p className="text-sm md:text-base text-white/70 mb-8 leading-relaxed">
                    Đăng ký nhận tin để cập nhật lịch tour làng nghề, workshop trải nghiệm,
                    ưu đãi đặc biệt và các câu chuyện văn hóa địa phương.
                  </p>
                  
                  {/* Newsletter Form */}
                  <form onSubmit={handleSubscribe} className="relative mb-6 max-w-sm mx-auto lg:mx-0">
                    <div className="relative group">
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-5 py-4 bg-white/5 border text-white text-sm md:text-base rounded-2xl
                          transition-all duration-300 ease-in-out placeholder:text-white/30
                          focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50
                          ${subscribeStatus === 'error' ? 'border-red-400' : 'border-white/10'}
                          ${subscribeStatus === 'success' ? 'border-green-400' : ''}
                        `}
                        placeholder="Địa chỉ email của bạn"
                        disabled={subscribeStatus === 'loading'}
                      />
                      <Button 
                        type="submit"
                        className={`absolute right-1.5 top-1.5 bg-secondary text-primary hover:bg-white hover:text-primary font-black
                          transition-all duration-300 ease-in-out flex items-center gap-2 px-6 h-[calc(100%-12px)] rounded-xl
                          ${subscribeStatus === 'success' ? 'bg-green-500 text-white' : ''}
                        `}
                        disabled={subscribeStatus === 'loading'}
                      >
                        <span className="hidden sm:inline">
                          {subscribeStatus === 'loading' ? '...' : 'Đăng ký'}
                        </span>
                        <Send size={16} className="shrink-0" />
                      </Button>
                    </div>
                    
                    {/* Status Messages */}
                    <AnimatePresence>
                      {subscribeStatus === 'success' && (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-green-400 text-xs mt-3 font-bold"
                        >
                          Cảm ơn bạn đã đăng ký! 🌿
                        </motion.p>
                      )}
                      {subscribeStatus === 'error' && (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-400 text-xs mt-3 font-bold"
                        >
                          {errorMessage}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </form>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="w-full text-gray-200">
                <div className="max-w-md mx-auto lg:mr-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-[10px] text-secondary font-black uppercase tracking-widest mb-6 border border-white/10">
                    <Star size={10} className="fill-secondary" />
                    Hỏi đáp du lịch
                  </div>
                  <h4 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8">
                    Giải đáp thắc mắc về <br/>tour làng nghề
                  </h4>
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="item-1" className="border-white/10 bg-white/5 px-6 rounded-2xl overflow-hidden">
                      <AccordionTrigger className="text-sm md:text-base font-bold hover:no-underline hover:text-secondary py-5">
                        Tour làng nghề là gì?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm md:text-base text-white/60 leading-relaxed pb-6">
                        Tour làng nghề là hành trình khám phá các làng nghề truyền thống, gặp gỡ nghệ nhân, tìm hiểu quy trình thủ công và trải nghiệm làm sản phẩm gắn với văn hóa địa phương.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-white/10 bg-white/5 px-6 rounded-2xl overflow-hidden">
                      <AccordionTrigger className="text-sm md:text-base font-bold hover:no-underline hover:text-secondary py-5">
                        Có thể trải nghiệm những gì?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm md:text-base text-white/60 leading-relaxed pb-6">
                        Tùy điểm đến, bạn có thể tham gia workshop (gốm, mây tre đan, dệt), thưởng thức ẩm thực địa phương, tham quan xưởng, chụp ảnh làng nghề và mua sản phẩm chính gốc.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-white/10 bg-white/5 px-6 rounded-2xl overflow-hidden">
                      <AccordionTrigger className="text-sm md:text-base font-bold hover:no-underline hover:text-secondary py-5">
                        Đi tour có phù hợp gia đình không?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm md:text-base text-white/60 leading-relaxed pb-6">
                        Phù hợp. Nhiều tour thiết kế cho gia đình và nhóm bạn, có hoạt động nhẹ nhàng cho trẻ em, thời gian linh hoạt và hướng dẫn viên hỗ trợ suốt hành trình.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="pt-10 border-t border-white/10">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Social Links */}
                <div className="flex items-center gap-4">
                  {[
                    { Icon: Facebook, href: "#" },
                    { Icon: Instagram, href: "#" },
                    { Icon: Twitter, href: "#" },
                    { Icon: Linkedin, href: "#" }
                  ].map(({ Icon, href }, index) => (
                    <a 
                      key={index}
                      className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-secondary text-white hover:text-primary rounded-xl transition-all duration-300"
                      href={href}
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>

                {/* Navigation Links */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[11px] font-black uppercase tracking-widest">
                  <a className="text-white/50 hover:text-secondary transition-colors" href="/careers">
                    Tuyển dụng
                  </a>
                  <a className="text-white/50 hover:text-secondary transition-colors" href="/terms-and-condition">
                    Điều khoản & Điều kiện
                  </a>
                  <a className="text-white/50 hover:text-secondary transition-colors" href="/contact">
                    Hỗ trợ 24/7
                  </a>
                </div>

                {/* Copyright */}
                <div className="text-center lg:text-right">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">© {currentYear} Làng Nghề Travel</p>
                  <p className="text-[10px] text-white/20 mt-1 italic">Hành trình về nguồn cội</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ScrollToTopButton />
    </>
  );
};

export default LangNgheTravelFooter;
