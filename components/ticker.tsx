"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

const ParksTicker = () => {
  const parks = [
    { name: "Amboseli" },
    { name: "Masaai Mara" },
    { name: "Tsavo" },
    { name: "Lake Nakuru" },
    { name: "Nairobi Park" }
  ]

  // Calculate the width needed for smooth scrolling
  // We'll show the list 3 times to ensure smooth looping
  const parksList = [...parks, ...parks, ...parks]

  return (
    <div className="w-full py-8 bg-gradient-to-r from-green-50 to-emerald-50">
      <Card className="max-w-6xl mx-auto overflow-hidden">
        <div className="relative overflow-hidden py-8 bg-green-50">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{
              x: ["0%", "-33.33%"]
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
          >
            {parksList.map((park, index) => (
              <div
                key={index}
                className="inline-flex flex-col items-center px-12 group cursor-pointer"
              >
                <span className="text-2xl md:text-3xl lg:text-4xl font-serif text-emerald-800 transition-all duration-300 group-hover:text-emerald-600 group-hover:scale-110">
                  {park.name}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-green-100 to-transparent z-10" />
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-100 to-transparent z-10" />
        </div>
      </Card>
    </div>
  )
}

export default ParksTicker