'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, Leaf, Bot, User, Minus, MapPin, History, Coffee, Info, Headphones, Bike } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'model'
  text: string
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [currentTour, setCurrentTour] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Xin chào quý khách! Tôi là Trợ lý ZPLore AI, chuyên gia du lịch sinh thái toàn cầu. Tôi có thể giúp bạn thiết kế những "Hành trình ước mơ" độc bản, tính toán lượng phát thải CO2, gợi ý các hành trình xanh, hoặc vẽ lộ trình trực tiếp lên bản đồ cho bạn. Nếu cần hỗ trợ trực tiếp từ nhân viên, hãy nhấn vào biểu tượng tai nghe 🎧 phía trên nhé!' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [emissionsInfo, setEmissionsInfo] = useState<{ distance_km: number, co2_kg: number, transport: string } | null>(null)
  const [expertInsights, setExpertInsights] = useState<any[] | null>(null)
  const [showEcoDashboard, setShowEcoDashboard] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleTourInfo = (e: any) => {
      setCurrentTour(e.detail);
    };
    const handleAiAskRoute = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      setInput(`Chỉ đường cho tôi đến tour ${e.detail.tourName} từ vị trí của tôi.`);
    };

    const handleOpenAiChat = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail.prompt) {
        // We use a small timeout to ensure the UI is open before sending
        setTimeout(() => {
          triggerAiResponse(e.detail.prompt);
        }, 100);
      }
    };

    window.addEventListener('current-tour-info', handleTourInfo);
    window.addEventListener('ai-ask-route', handleAiAskRoute);
    window.addEventListener('open-ai-chat', handleOpenAiChat);

    return () => {
      window.removeEventListener('current-tour-info', handleTourInfo);
      window.removeEventListener('ai-ask-route', handleAiAskRoute);
      window.removeEventListener('open-ai-chat', handleOpenAiChat);
    };
  }, []);

  const handleOpenTawkTo = () => {
    if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
      document.body.classList.add('tawk-maximized');
      window.Tawk_API.maximize();
      setIsOpen(false);
    } else {
      toast.error("Hệ thống chat hỗ trợ đang bận, vui lòng thử lại sau.");
    }
  }

  const triggerAiResponse = async (prompt: string) => {
    if (isLoading) return;
    
    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setIsLoading(true);

    const VIETNAM_BOUNDS = {
      latMin: 8.5,
      latMax: 23.4,
      lngMin: 102.1,
      lngMax: 109.5
    };

    const isInsideVietnam = (lat: number, lng: number) => {
      // DISABLED GEO-RESTRICTIONS FOR GLOBAL REACH
      return true;
    };

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          userLocation,
          currentTour,
          history: messages.slice(1).map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }))
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let cleanText = data.text;
      
      // Robust JSON extraction
      const extractAndRunCommand = (text: string) => {
        // Try the tagged format first
        const taggedMatch = text.match(/---MAP_COMMAND---([\s\S]*?)---END_MAP_COMMAND---/);
        let jsonStr = '';
        
        if (taggedMatch) {
          jsonStr = taggedMatch[1].trim();
        } else {
          // Fallback: search for any JSON-like structure that looks like our command
          const jsonStart = text.indexOf('{');
          const jsonEnd = text.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            const potentialJson = text.substring(jsonStart, jsonEnd + 1);
            if (potentialJson.includes('"action"') && potentialJson.includes('"draw_route"')) {
              jsonStr = potentialJson;
            }
          }
        }

        if (jsonStr) {
          try {
            // Clean up possible markdown code blocks around the JSON
            if (jsonStr.startsWith('```')) {
              jsonStr = jsonStr.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '');
            }
            const command = JSON.parse(jsonStr);
            if (command.action === 'draw_route' && command.points) {
              // GEOFENCING: Validate points are in Vietnam
              let validPoints = command.points.filter((p: any) => isInsideVietnam(p.lat, p.lng));
              
              // HARD FIX: Force Da Nang for North-South trips if missing
              const startPoint = validPoints[0];
              const endPoint = validPoints[validPoints.length - 1];
              
              const isNorthToSouth = startPoint && endPoint && 
                                    startPoint.lat > 19 && endPoint.lat < 12;
              
              const hasDanang = validPoints.some((p: any) => 
                p.lat > 15.5 && p.lat < 16.5 && p.lng > 107.5 && p.lng < 108.5
              );

              if (isNorthToSouth && !hasDanang) {
                console.log("HARD FIX: Inserting mandatory Da Nang waypoint and SORTING for North-South trip.");
                const danangPoint = { lat: 16.0544, lng: 108.2022, label: "Đà Nẵng (Điểm chốt bắt buộc)" };
                validPoints.push(danangPoint);
                
                // Sort points by latitude descending (North to South) to ensure correct route order
                validPoints.sort((a: any, b: any) => b.lat - a.lat);
              }

              if (validPoints.length < command.points.length) {
                console.warn("AI attempted to draw points outside Vietnam. Filtering out...");
                toast.warning("AI đã cố gắng vẽ lộ trình ra ngoài biên giới. Hệ thống đã tự động lọc các điểm này.");
              }

              if (validPoints.length < 2) {
                toast.error("Lộ trình AI cung cấp không nằm trong lãnh thổ Việt Nam hợp lệ.");
                return false;
              }

              // Update command with valid points only
              command.points = validPoints;

              // Dispatch global event for the map
              const event = new CustomEvent('ai-map-command', { detail: command });
              window.dispatchEvent(event);
              
              if (command.emissions_info) {
                setEmissionsInfo(command.emissions_info);
                setShowEcoDashboard(true);
              }
              
              if (command.expert_insights) {
                setExpertInsights(command.expert_insights);
              }
              
              toast.success("Bản đồ đã được cập nhật theo gợi ý của AI!");
              
              // Remove the JSON block from the displayed text
              if (taggedMatch) {
                cleanText = text.replace(/---MAP_COMMAND---[\s\S]*?---END_MAP_COMMAND---/, '').trim();
              } else {
                cleanText = text.replace(jsonStr, '').trim();
              }
              return true;
            }
          } catch (e) {
            console.error("Failed to parse extracted JSON:", e);
          }
        }
        return false;
      };

      extractAndRunCommand(data.text);
      
      setMessages(prev => [...prev, { role: 'model', text: cleanText || "Hành trình của bạn đã sẵn sàng trên bản đồ." }]);
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('Có lỗi xảy ra khi kết nối với AI.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      toast.info("Đang yêu cầu quyền truy cập vị trí...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          
          // Dispatch event to update map immediately
          const event = new CustomEvent('user-location-updated', { detail: loc });
          window.dispatchEvent(event);
          
          toast.success("Đã xác định được vị trí của bạn!");
          
          // Auto-ask AI to draw route if a tour is selected
          if (currentTour) {
            setInput(`Tôi đang ở vị trí này (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}). Hãy vẽ đường đi từ đây đến tour ${currentTour.name} và tính lượng phát thải CO2 giúp tôi.`);
          }
        },
        (error) => {
          console.error("Location error:", error);
          let msg = "Không thể lấy vị trí của bạn.";
          if (error.code === 1) msg = "Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt.";
          else if (error.code === 2) msg = "Không thể xác định vị trí. Kiểm tra tín hiệu GPS/Internet.";
          else if (error.code === 3) msg = "Hết thời gian yêu cầu vị trí.";
          toast.error(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Trình duyệt của bạn không hỗ trợ định vị.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userMessage = input.trim()
    setInput('')
    await triggerAiResponse(userMessage)
  }

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.8 }}
            className="mb-4 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[600px] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-white/50 overflow-hidden flex flex-col"
          >
            {/* Header - Premium Design */}
            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 vn-pattern w-40 h-40 rotate-12 -mr-10 -mt-10" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-inner overflow-hidden">
                      <Bike size={24} className="text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-xl tracking-tight">ZPLore AI</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Sparkles size={10} className="text-secondary animate-pulse" />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary/80">Premium Concierge</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setIsMinimized(true)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
                    <Minus size={18} />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors text-white/60">
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Fixed Eco-Impact Dashboard - Toggleable */}
            <AnimatePresence>
              {emissionsInfo && showEcoDashboard && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-emerald-900 text-white px-6 py-4 relative overflow-hidden border-b border-emerald-800"
                >
                  <div className="absolute top-0 right-0 opacity-10 vn-pattern w-24 h-24 -mr-4 -mt-4 rotate-12" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <Bike size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-secondary">Eco-Impact</p>
                        <p className="text-[10px] font-bold text-white/80">{emissionsInfo.transport}</p>
                      </div>
                    </div>
                    <div className="flex gap-6 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                      <div className="text-center">
                        <p className="text-[7px] font-black uppercase text-emerald-300/60 mb-0.5">Khoảng cách</p>
                        <p className="text-sm font-black">{emissionsInfo.distance_km}<span className="text-[8px] ml-0.5 text-secondary">km</span></p>
                      </div>
                      <div className="text-center">
                        <p className="text-[7px] font-black uppercase text-emerald-300/60 mb-0.5">Phát thải</p>
                        <p className="text-sm font-black text-secondary">{emissionsInfo.co2_kg}<span className="text-[8px] ml-0.5 text-white">kg</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowEcoDashboard(false)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Body */}
            <div 
              className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-transparent to-gray-50/50 scroll-smooth custom-scrollbar" 
              style={{ maxHeight: '450px', minHeight: '350px' }}
              ref={scrollRef}
            >
              <div className="space-y-6 pr-2">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[88%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-sm ${
                        m.role === 'user' ? 'bg-secondary text-primary' : 'bg-white border border-gray-100 text-primary'
                      }`}>
                        {m.role === 'user' ? <User size={14} /> : <Bike size={14} />}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className={`p-4 rounded-[1.5rem] text-[13px] leading-relaxed shadow-sm transition-all ${
                          m.role === 'user' 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100/50'
                        }`}>
                          {m.text}
                        </div>
                        
                        {/* Emissions Info Card for Model Messages */}
                        {m.role === 'model' && i === messages.length - 1 && emissionsInfo && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-900 text-white p-5 rounded-[2rem] shadow-xl relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 opacity-10 vn-pattern w-32 h-32 -mr-8 -mt-8 rotate-12" />
                            <div className="relative z-10 flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                                    <Bike size={16} className="text-primary" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-secondary">Eco Impact</span>
                                </div>
                                <span className="bg-white/10 text-white px-2 py-1 rounded-full text-[8px] font-bold uppercase border border-white/10 flex items-center gap-1">
                                  <Zap size={10} className="text-secondary" /> {emissionsInfo.transport}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                <div className="text-center border-r border-white/10">
                                  <p className="text-[8px] font-black uppercase text-emerald-300/60 mb-1 tracking-widest">Quãng đường</p>
                                  <p className="text-xl font-black">{emissionsInfo.distance_km}<span className="text-[10px] ml-0.5 text-secondary">km</span></p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[8px] font-black uppercase text-emerald-300/60 mb-1 tracking-widest">Phát thải</p>
                                  <p className="text-xl font-black text-secondary">{emissionsInfo.co2_kg}<span className="text-[10px] ml-0.5 text-white">kg CO2</span></p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Expert Insights in Chat */}
                        {m.role === 'model' && i === messages.length - 1 && expertInsights && (
                          <div className="space-y-2 mt-2">
                            <div className="grid grid-cols-1 gap-2">
                              {expertInsights.map((insight, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 * idx }}
                                  className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex gap-4 items-start group hover:border-secondary/30 transition-all"
                                >
                                  <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl shrink-0 group-hover:bg-secondary group-hover:text-primary transition-colors">
                                    {idx === 0 ? <History size={16} /> : idx === 1 ? <Coffee size={16} /> : <Info size={16} />}
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1">{insight.title}</p>
                                    <p className="text-[12px] text-gray-600 font-medium leading-relaxed italic">{insight.content}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 text-primary flex items-center justify-center">
                        <Bike size={14} />
                      </div>
                      <div className="bg-white/50 backdrop-blur-md p-4 rounded-[1.5rem] rounded-tl-none border border-gray-100/50">
                        <div className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-white border-t border-gray-100/50">
              <div className="relative flex items-center gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Hỏi về khí thải, tour Mùa Vàng..."
                  className="rounded-2xl bg-gray-50 border-none shadow-inner h-12 pl-6 pr-14 text-sm focus-visible:ring-secondary/50"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon" 
                  className="absolute right-1.5 w-9 h-9 rounded-xl bg-primary hover:bg-gray-900 shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <Send size={16} className="text-white" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="flex gap-2">
                  <button 
                    onClick={requestLocation}
                    className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${userLocation ? 'text-secondary' : 'text-gray-400 hover:text-primary'}`}
                  >
                    <MapPin size={10} /> {userLocation ? 'Đã định vị' : 'Gửi vị trí'}
                  </button>
                  <button 
                    onClick={() => setInput('Hãy gợi ý một "Hành trình ước mơ" xanh tại Việt Nam và vẽ lộ trình giúp tôi.')}
                    className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-gray-400 hover:text-secondary transition-colors"
                  >
                    <Sparkles size={10} /> Hành trình ước mơ
                  </button>
                  <button 
                    onClick={handleOpenTawkTo}
                    className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-gray-400 hover:text-secondary transition-colors border-l border-gray-100 pl-2 ml-1"
                  >
                    <Headphones size={10} /> Chat với nhân viên
                  </button>
                  {emissionsInfo && (
                    <button 
                      onClick={() => setShowEcoDashboard(!showEcoDashboard)}
                      className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border-l border-gray-100 pl-2 ml-1 ${showEcoDashboard ? 'text-secondary' : 'text-gray-400 hover:text-secondary'}`}
                    >
                      <Bike size={10} /> Eco-Impact
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Bike size={10} className="text-secondary" /> ZPLore Intelligence
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button - Only show when closed */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="fixed bottom-[100px] right-6 w-16 h-16 bg-primary text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center z-[9999] group overflow-hidden"
         >>
          <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary to-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <MessageSquare size={28} className="group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-lg border-2 border-primary group-hover:animate-bounce">
              <Sparkles size={12} className="text-primary" />
            </div>
          </div>
        </motion.button>
      )}
    </div>
  )
}
