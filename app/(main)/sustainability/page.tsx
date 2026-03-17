"use client";
import React from "react";
import Image from "next/image";
import { TreePine, Users, RecycleIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const SustainabilityPage = () => {
  const initiatives = [
    {
      icon: <TreePine className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: "Conservation Projects",
      description:
        "Supporting local wildlife conservation and reforestation initiatives across Kenya's diverse ecosystems.",
      image: "/images/conserve.svg",
    },
    {
      icon: <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: "Community Empowerment",
      description:
        "Partnering with local communities to create sustainable tourism opportunities and preserve cultural heritage.",
      image: "/images/community.svg",
    },
    {
      icon: <RecycleIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: "Waste Reduction",
      description:
        "Implementing comprehensive recycling programs and minimizing single-use plastics across all our tours.",
      image: "/images/recycle.svg",
    },
  ];

  const destinations = [
    {
      name: "Maasai Mara Reserve",
      image: "/images/wildbeast.jpg",
      description: "Experience wildlife conservation in action",
    },
    {
      name: "Lamu Cultural Heritage",
      image: "/images/lamu.jpg",
      description: "Explore Kenya's rich coastal heritage",
    },
    {
      name: "Mount Kenya Forest",
      image: "/images/forest.jpg",
      description: "Discover highland conservation efforts",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#f6efe5] to-white min-h-screen">
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
              Sustainability
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

      {/* Framer Animation for Dotted Line */}
      {/* Key Initiatives with Images */}
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center mb-4 md:mb-6">
            <span className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-wide text-green-800 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
              Our Commitment to Sustainability
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            Our <span className="text-green-600"> Sustainable </span>{" "}
            Initiatives
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {initiatives.map((initiative, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur overflow-hidden"
            >
              <div className="relative h-36 sm:h-40 lg:h-48">
                <Image
                  src={initiative.image}
                  alt={initiative.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4 sm:p-5 lg:p-6">
                <div className="text-green-700 mb-3 lg:mb-4">
                  {initiative.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 lg:mb-3">
                  {initiative.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {initiative.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Eco-Tourism Destinations */}
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <span className="text-sm font-semibold uppercase tracking-wide text-green-800 bg-green-100 px-3 py-1 rounded-full">
              Sustainable Destinations and Tours
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Discover <span className="text-green-600"> Sustainable </span> Tours
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {destinations.map((destination, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg h-64 sm:h-72 lg:h-80"
            >
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                className="object-cover transform transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4 text-center">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-white">
                  {destination.name}
                </h3>
                <p className="text-sm sm:text-base text-white/90">
                  {destination.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Stats */}
      <div className="relative py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0">
          <Image
            src="/images/forest.jpg"
            alt="Impact Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-green-900/90" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-center text-white">
            <div className="backdrop-blur-sm bg-white/10 p-6 sm:p-7 lg:p-8 rounded-lg">
              <h4 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                1000+
              </h4>
              <p className="text-base sm:text-lg">Trees Planted Annually</p>
            </div>
            <div className="backdrop-blur-sm bg-white/10 p-6 sm:p-7 lg:p-8 rounded-lg">
              <h4 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                50+
              </h4>
              <p className="text-base sm:text-lg">Community Partners</p>
            </div>
            <div className="backdrop-blur-sm bg-white/10 p-6 sm:p-7 lg:p-8 rounded-lg">
              <h4 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                90%
              </h4>
              <p className="text-base sm:text-lg">Waste Reduction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
          Make Your Travel Matter
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Join us in promoting sustainable tourism while exploring Kenya&apos;s
          most beautiful destinations.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
          <Link href="/destinations">
            <button className="w-full sm:w-auto bg-green-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-semibold hover:bg-green-800 transition-colors">
              Explore Eco-Tours
            </button>
          </Link>
          <Link href="/about">
            <button className="w-full sm:w-auto border-2 border-green-700 text-green-700 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-semibold hover:bg-green-700 hover:text-white transition-colors">
              Learn More
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityPage;
