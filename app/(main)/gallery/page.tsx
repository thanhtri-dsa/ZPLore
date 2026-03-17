'use client'
import React from 'react';
import Image from 'next/image';

const images = [
  {
    src: '/images/elephant.jpg',
    alt: 'Next.js Conference Logo with Golden Gate Bridge',
    featured: true
  },
  {
    src: '/images/forest.jpg',
    alt: 'Conference attendee in Next.js t-shirt'
  },
  {
    src: '/images/forest.jpg',
    alt: 'Conference auditorium view'
  },
  {
    src: '/images/forest.jpg',
    alt: 'Conference speakers on stage'
  },
  {
    src: '/images/forest.jpg',
    alt: 'Conference attendees having fun'
  },
  {
    src: '/images/forest.jpg',
    alt: 'Group photo of conference attendees'
  },
  {
    src: '/images/forest.jpg',
    alt: 'Team members networking'
  },
  {
    src: '/images/forest.jpg',
    alt: 'Conference attendees group photo'
  },
  {
    src: '/images/forest.jpg',
    alt: 'Conference networking session'
  },
  {
    src: '/images/forest.jpg',
    alt: 'Team members at conference booth'
  },
  {
    src: '/images/forest.jpg',
    alt: 'Evening conference event'
  },
  {
    src: '/images/forest.jpg',
    alt: 'Conference social gathering'
  },
  {
    src: '/images/forest.jpg',
    alt: 'Conference social gathering'
  }
];

const GalleryPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6efe5]">
      {/* Hero Section */}
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
              Explore   Gallery
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

      {/* Gallery Section */}
      <section className="w-full py-12 md:py-16">
        <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
      <div className="inline-flex items-center justify-center mb-4 md:mb-6">
        <span className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-wide text-green-800 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
        Have a taste of our gallery
        </span>
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
         Nature <span className="text-green-600">Meets</span>{" "}
         Adventure
      </h2>
    </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <div className="aspect-[4/3] relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default GalleryPage;