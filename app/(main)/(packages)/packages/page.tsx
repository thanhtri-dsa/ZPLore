"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Package as PackageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { PackageCard } from "@/components/packages/package-card";
import { PackageCardSkeleton } from "@/components/packages/packageSkeleton";
import { PackageSidebar } from "@/components/packages/location-sidebar";
import { Package } from "@/types/packages";
import Image from 'next/image';
import { motion } from 'framer-motion';

const CACHE_KEY = "packages_data";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  const filteredPackages = selectedCategory
    ? packages.filter((pkg) => {
        const locationMatch = pkg.location.toLowerCase().includes(selectedCategory.toLowerCase());
        const typeMatch = pkg.type && pkg.type.toLowerCase().includes(selectedCategory.toLowerCase());
        return locationMatch || typeMatch;
      })
    : packages;

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedPackages = filteredPackages.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
      <div className="relative z-10 overflow-hidden bg-primary h-[35vh] md:h-[45vh] flex items-center justify-center">
        <Image
          src="/images/hero_packages.jpg"
          alt="Eco-Tour Packages"
          fill
          className="z-0 object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-transparent to-[#f8fafc]" />
        
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
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-20 relative z-20 pb-20">
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
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-primary uppercase tracking-tight">
                  {selectedCategory || "Tất cả gói tour"}
                </h2>
                <p className="text-xs text-gray-500 font-medium italic">
                  Tìm thấy {filteredPackages.length} hành trình phù hợp
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sắp xếp:</span>
                <select className="text-[10px] font-black text-primary bg-white border border-gray-100 rounded-full px-4 py-2 focus:outline-none shadow-sm">
                  <option>Mới nhất</option>
                  <option>Giá thấp đến cao</option>
                  <option>Giá cao đến thấp</option>
                </select>
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

