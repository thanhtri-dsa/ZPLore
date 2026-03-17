'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Package, Camera, ChevronLeft, ChevronRight } from 'lucide-react'

interface DestinationProps {
    id: string
    name: string
    packages: number
    images: string[]
    description: string
}

interface WildlifeImageProps {
    id: string
    imageUrl: string
    alt: string
}

const destinations: DestinationProps[] = [
    {
        id: '1',
        name: "Maasai Mara",
        packages: 3,
        images: ["/images/wildbeast.jpg", "/images/leopard.jpg", "/images/masaaiMara.jpg","/images/amboseli.jpg","/images/buffalo.jpg","/images/rhino.jpg"],
        description: "WildeBeest and The Big 5"
    },
    { id: '2', name: "Bwindi Impenetrable Forest", packages: 2, images: ["/images/gorilla.jpg"], description: "Gorilla Trekking " },
    { id: '3', name: "Lake Nakuru", packages: 2, images: ["/images/birds.jpeg"], description: "Birding Tours" },
    { id: '4', name: "Malindi", packages: 1, images: ["/images/marine.jpg"], description: "Marine Life Conservations" },
    { id: '5', name: "Mt Kilimanjaro", packages: 2, images: ["/images/kilimanjaro.jpg"], description: "Mountain Adventures" },
]

const wildlifeImages: WildlifeImageProps[] = [
    { id: '1', imageUrl: "/images/zebra.jpg", alt: "Zebra" },
    { id: '2', imageUrl: "/images/lion.jpeg", alt: "Lion" },
    { id: '3', imageUrl: "/images/elephant.jpg", alt: "Elephant" },
    { id: '4', imageUrl: "/images/giraffe.jpeg", alt: "Giraffe" },
]

const DestinationCard: React.FC<DestinationProps> = ({ name, packages, images, description }) => {
    const [currentImage, setCurrentImage] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length)
        }, 5000)

        return () => clearInterval(timer)
    }, [images.length])

    const nextImage = () => {
        setCurrentImage((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <Card className="overflow-hidden group h-full transition-transform duration-300 hover:scale-105 hover:shadow-lg bg-green-50">
            <CardContent className="p-0 relative h-full">
                <div className="relative h-64 md:h-72 lg:h-80 w-full">
                    {images.map((image, index) => (
                        <Image
                            key={index}
                            src={image}
                            alt={`${name} - Image ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            priority={index === 0}
                            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
                                index === currentImage ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                    ))}
                    {images.length > 1 && (
                        <>
                            <button 
                                onClick={prevImage} 
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/50 rounded-full p-1 hover:bg-white/80 transition-colors duration-200 z-10"
                            >
                                <ChevronLeft className="w-6 h-6 text-green-800" />
                            </button>
                            <button 
                                onClick={nextImage} 
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/50 rounded-full p-1 hover:bg-white/80 transition-colors duration-200 z-10"
                            >
                                <ChevronRight className="w-6 h-6 text-green-800" />
                            </button>
                        </>
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-semibold text-xl mb-2">{name}</h3>
                    <p className="text-green-200 text-sm mb-2">{description}</p>
                    <div className="flex items-center text-white">
                        <Package className="w-4 h-4 mr-2" />
                        <span>({packages}) Eco Packages</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function DestinationGrid() {
    return (
        <div className="py-8 sm:py-12 md:py-16 lg:py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
                    <span className="inline-block py-1 px-3 mb-2 sm:mb-3 text-xs font-semibold text-green-900 bg-green-100 rounded-full">
                        Featured Adventures
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
                        Our Top
                        <span className="font-serif italic text-green-600 block">Destinations</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {destinations.map((dest, index) => (
                        <div key={dest.id} className={index === 0 ? "md:col-span-2" : ""}>
                            <Link href={`/packages`}>
                                <DestinationCard {...dest} />
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="max-w-3xl mx-auto text-center mt-6 mb-8 sm:mb-10 md:mb-12 lg:mb-16">
                    <span className="inline-block py-1 px-3 mb-2  sm:mb-3 text-xs font-semibold text-green-900 bg-green-100 rounded-full">
                        Featured Wildlife
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
                    Encounter Kenya&apos;s Majestic           
                        <span className="font-serif italic text-green-600 block mt-2"> Wildlife Safari</span>
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {wildlifeImages.map((image) => (
                        <Card key={image.id} className="overflow-hidden group transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                            <CardContent className="p-0 relative aspect-square">
                                <Image
                                    src={image.imageUrl}
                                    alt={image.alt}
                                    layout="fill"
                                    objectFit="cover"
                                    className="transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <Camera className="w-12 h-12 text-white" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}