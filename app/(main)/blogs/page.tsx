"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import BlogCard from "@/components/blogs-card";
import { BlogListSkeleton } from "@/components/skeletons";
import type { BlogPost } from "@/types/blogs";
import Image from "next/image";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleBlogs, setVisibleBlogs] = useState(3);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs");
        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#f6efe5] to-white min-h-screen">
      {/* Hero Section with Improved Styling */}
      <div className="relative z-10 overflow-hidden bg-black text-white">
        <div className="h-40">
          <Image
            src="/images/hero_packages.jpg"
            alt="image"
            width={1920}
            height={160}
            className="z-1 absolute left-0 top-0 h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg text-center px-4">
              Explore Blogs
            </h1>
          </div>
        </div>
        <div
          className="relative z-20 h-32 w-full -scale-y-[1] bg-contain bg-repeat-x"
          style={{
            backgroundImage: "url('/images/banner_style.png')",
            filter:
              "invert(92%) sepia(2%) saturate(1017%) hue-rotate(342deg) brightness(106%) contrast(93%)",
          }}
        />
      </div>
      {/* Blog List Section with Enhanced Design */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <div className="inline-flex items-center justify-center mb-4 md:mb-6">
              <span className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-wide text-green-800 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
                Sustainable Travel Insights
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Discover <span className="text-green-600">Responsible</span>{" "}
              Travel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Immerse yourself in stories of environmental stewardship,
              eco-conscious journeys, and transformative travel experiences
            </p>
          </div>

          <div className="space-y-10">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <BlogListSkeleton key={i} />)
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-10 text-center shadow-md">
                <p className="text-2xl text-red-600 font-semibold">
                  Oops! {error}
                </p>
                <p className="text-gray-600 mt-4">
                  We&apos;re having trouble loading the blogs. Please try again
                  later.
                </p>
              </div>
            ) : (
              <>
                {blogs.slice(0, visibleBlogs).map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
                {visibleBlogs < blogs.length && (
                  <div className="text-center mt-16">
                    <button
                      onClick={() => setVisibleBlogs((prev) => prev + 3)}
                      className="group inline-flex items-center px-8 py-4 rounded-full 
                        bg-green-600 text-white font-semibold 
                        hover:bg-green-700 transition-all duration-300 
                        shadow-lg hover:shadow-xl transform hover:-translate-y-1
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <ChevronDown className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                      Load More Stories
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
