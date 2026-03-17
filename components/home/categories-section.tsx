import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export function CategoriesSection() {
  const categories = [
    { name: "Hành trình", image: "/images/destinations_image.svg", link: "/destinations" },
    { name: "Gói du lịch", image: "/images/packages_image.svg", link: "/packages" },
    { name: "Gia đình", image: "/images/family.svg", link: "/packages" },
    { name: "Chỗ ở", image: "/images/hotel_image.svg", link: "/destinations" },
  ]

  return (
    <section className="py-16 vn-pattern">
      <div className="container mx-auto px-4">
        <div className="inline-flex items-center rounded-full bg-secondary/20 px-4 py-1 text-sm text-primary font-bold">
          Tự do khám phá
        </div>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="vn-title text-2xl font-bold mt-4 mb-2">Khám phá các danh mục</h2>
          <Link href="/packages" className="text-primary text-md hover:underline font-bold">
            Xem tất cả
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link href={category.link} key={index}>
              <Card className="group cursor-pointer overflow-hidden">
                <CardContent className="relative p-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={300}
                    height={200}
                    className="h-[200px] w-full object-fit transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 p-6">
                    <div className="flex h-full items-center justify-center">
                      <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

