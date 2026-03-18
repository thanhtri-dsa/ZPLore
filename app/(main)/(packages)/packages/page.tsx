"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Package as PackageIcon, SlidersHorizontal, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { PackageCard } from "@/components/packages/package-card";
import { PackageCardSkeleton } from "@/components/packages/packageSkeleton";
import { PackageSidebar } from "@/components/packages/location-sidebar";
import { Package } from "@/types/packages";
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";

const CACHE_KEY = "packages_data";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ecoOnly, setEcoOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);

        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setPackages(data);
            setLoading(false);
            return;
          }
        }

        const response = await fetch("/api/packages");
        if (!response.ok) {
          throw new Error("No packages found, retry refreshing the page");
        }
        const data = await response.json();

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );

        setPackages(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const maxDbPrice = useMemo(() => Math.max(0, ...packages.map((p) => Number(p.price) || 0)), [packages])
  const priceCap = maxPrice > 0 ? maxPrice : maxDbPrice

  const filteredPackages = useMemo(() => {
    const base = selectedCategory
      ? packages.filter((pkg) => {
          const locationMatch = pkg.location.toLowerCase().includes(selectedCategory.toLowerCase());
          const typeMatch = pkg.type && pkg.type.toLowerCase().includes(selectedCategory.toLowerCase());
          return locationMatch || typeMatch;
        })
      : packages

    const q = searchQuery.trim().toLowerCase()
    const loc = locationQuery.trim().toLowerCase()

    const filtered = base.filter((pkg) => {
      const priceOk = (Number(pkg.price) || 0) <= priceCap
      const locOk = loc ? pkg.location.toLowerCase().includes(loc) : true
      const qOk = q ? `${pkg.name} ${pkg.location} ${pkg.description} ${pkg.type ?? ""}`.toLowerCase().includes(q) : true
      const ecoOk = ecoOnly
        ? (pkg.type ?? "").toLowerCase().includes("eco") || (pkg.description ?? "").toLowerCase().includes("eco") || (pkg.description ?? "").toLowerCase().includes("xanh")
        : true
      return priceOk && locOk && qOk && ecoOk
    })

    if (sort === "price_asc") return filtered.slice().sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    if (sort === "price_desc") return filtered.slice().sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    return filtered
  }, [ecoOnly, locationQuery, packages, priceCap, searchQuery, selectedCategory, sort])

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedPackages = filteredPackages.slice(startIndex, startIndex + itemsPerPage);

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-primary/5">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-red-600">
            Lỗi tải dữ liệu
          </h2>
          <p className="text-gray-600 text-lg">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-gray-900 text-white px-8 py-3 text-lg rounded-2xl"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Section */}
      <div className="relative z-10 overflow-hidden bg-primary h-[32vh] md:h-[40vh] flex items-center justify-center">
        <Image
          src="/images/hero_packages.jpg"
          alt="Eco-Tour Packages"
          fill
          className="z-0 object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/25 to-[#f8fafc]" />
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-secondary text-primary font-black text-[10px] uppercase tracking-widest mb-4 shadow-xl">
              Khám phá hành trình xanh
            </span>
            <h1 className="text-4xl md:text-7xl font-serif font-black text-white drop-shadow-2xl">
              Gói Tour <span className="text-secondary italic">VIP</span>
            </h1>
            <p className="mt-4 text-white/80 max-w-2xl mx-auto text-sm md:text-base">
              Chọn tour đẹp – rõ giá – lịch trình chi tiết – đặt nhanh trong 1 phút.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-20 relative z-20 pb-20">
        {/* Top filter bar (mobile-first) */}
        <div className="mb-6 md:mb-8 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white shadow-sm p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm gói tour (vd: Hội An, Sapa, eco...)"
                className="w-full h-12 rounded-2xl pl-12 pr-4 bg-white/70 border border-white/80 shadow-sm outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 h-12 rounded-2xl bg-secondary/15 border border-secondary/20 text-primary font-black text-[11px] uppercase tracking-[0.18em] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ecoOnly}
                  onChange={(e) => {
                    setEcoOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                />
                🌱 Eco
              </label>

              <Sheet>
                <SheetTrigger asChild>
                  <Button className="h-12 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-[0.18em] text-[11px]">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Bộ lọc
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="p-0 h-[85vh] rounded-t-[2.5rem] bg-white/80 backdrop-blur-2xl">
                  <div className="p-6 border-b border-white/60">
                    <div className="text-lg font-black text-primary">Bộ lọc</div>
                    <div className="text-sm text-muted-foreground">Lọc theo địa điểm, giá và sắp xếp.</div>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-2">Địa điểm</div>
                      <input
                        value={locationQuery}
                        onChange={(e) => {
                          setLocationQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="VD: Đà Nẵng, Ninh Bình..."
                        className="w-full h-12 rounded-2xl px-4 bg-white border border-gray-100 shadow-sm outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary/70">Giá tối đa</div>
                        <div className="text-xs font-black text-primary">{priceCap.toLocaleString()} VNĐ</div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={maxDbPrice}
                        value={priceCap}
                        onChange={(e) => {
                          setMaxPrice(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="w-full mt-3"
                      />
                    </div>

                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-2">Sắp xếp</div>
                      <select
                        value={sort}
                        onChange={(e) => {
                          setSort(e.target.value as typeof sort);
                          setCurrentPage(1);
                        }}
                        className="w-full h-12 rounded-2xl px-4 bg-white border border-gray-100 shadow-sm outline-none font-black text-primary text-xs"
                      >
                        <option value="newest">Mới nhất</option>
                        <option value="price_asc">Giá thấp đến cao</option>
                        <option value="price_desc">Giá cao đến thấp</option>
                      </select>
                    </div>

                    <Button
                      onClick={() => {
                        setLocationQuery("");
                        setMaxPrice(0);
                        setSort("newest");
                        setEcoOnly(false);
                        setCurrentPage(1);
                      }}
                      variant="outline"
                      className="w-full h-12 rounded-2xl font-black uppercase tracking-[0.18em] text-[11px]"
                    >
                      Reset lọc
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/dream-journey" className="hidden md:inline-flex">
                <Button className="h-12 rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-black uppercase tracking-[0.18em] text-[11px]">
                  Tạo hành trình
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-xs text-muted-foreground italic">
              {loading ? "Đang tải..." : `Tìm thấy ${filteredPackages.length} gói tour phù hợp`}
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as typeof sort);
                  setCurrentPage(1);
                }}
                className="text-[10px] font-black text-primary bg-white border border-gray-100 rounded-full px-4 py-2 focus:outline-none shadow-sm"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá thấp đến cao</option>
                <option value="price_desc">Giá cao đến thấp</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Package Sidebar */}
          <div className="w-full lg:w-64">
            <PackageSidebar
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          </div>

          {/* Package Cards */}
          <div className="flex-1">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
                  {selectedCategory || "Tất cả gói tour"}
                </div>
                <div className="text-2xl md:text-3xl font-serif font-black text-primary">
                  Chọn tour phù hợp
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <PackageCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <>
                {displayedPackages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {displayedPackages.map((pkg) => (
                      <PackageCard key={pkg.id} package={pkg} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <PackageIcon size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Không tìm thấy gói tour nào
                    </h3>
                    <p className="text-gray-500 italic px-4">
                      {selectedCategory
                        ? `Hiện tại chưa có gói tour nào thuộc danh mục "${selectedCategory}".`
                        : "Vui lòng quay lại sau để cập nhật các hành trình mới nhất."}
                    </p>
                    <Button 
                      onClick={() => handleCategorySelect(null)}
                      variant="outline" 
                      className="mt-8 rounded-full border-primary/20 text-primary"
                    >
                      Xem tất cả gói tour
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-16">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="w-12 h-12 rounded-2xl border-white bg-white shadow-sm hover:bg-primary hover:text-white transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-primary">
                    {currentPage}
                  </span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    / {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 rounded-2xl border-white bg-white shadow-sm hover:bg-primary hover:text-white transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

