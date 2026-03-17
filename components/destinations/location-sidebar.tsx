'use client'

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface Country {
  name: string
  image: string
  slug: string
}

const countries: Country[] = [
  { name: "Việt Nam", image: "/images/hero_packages.jpg", slug: "viet-nam" },
  { name: "Thái Lan", image: "/images/hero_packages.jpg", slug: "thailand" },
  { name: "Singapore", image: "/images/singapore.jpg", slug: "singapore" },
  { name: "Indonesia", image: "/images/bali.jpg", slug: "indonesia" },
  { name: "Nhật Bản", image: "/images/japan.jpg", slug: "japan" },
  { name: "Hàn Quốc", image: "/images/korea.jpg", slug: "korea" },
]

export function CountrySidebar() {
  const pathname = usePathname()
  const currentCountry = pathname.split('/').pop()

  return (
    <aside className="w-full lg:w-64">
      <div className="flex lg:flex-col gap-4 overflow-x-auto no-scrollbar lg:overflow-visible pb-4 lg:pb-0 px-4 lg:px-0">
        {countries
          .filter(country => country.slug !== currentCountry)
          .map((country) => (
            <Link
              key={country.name}
              href={`/destinations/${country.slug}`}
              className="flex-shrink-0 w-48 lg:w-full group"
            >
              <div className="relative h-32 lg:h-40 cursor-pointer overflow-hidden rounded-2xl lg:rounded-3xl border-2 border-transparent hover:border-secondary transition-all shadow-sm hover:shadow-xl">
                <Image
                  src={country.image}
                  alt={country.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width={300}
                  height={200}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 w-full p-4">
                  <h3 className="text-sm lg:text-lg font-black text-white uppercase tracking-wider">{country.name}</h3>
                  <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-secondary uppercase">Khám phá</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-secondary transform transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </aside>
  )
}