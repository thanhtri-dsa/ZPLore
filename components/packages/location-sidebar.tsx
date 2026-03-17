import Image from "next/image"

// Enhanced package category type with keywords for filtering
interface PackageCategory {
  name: string
  image: string
  keywords: string[]
}

// Expanded package categories with comprehensive keywords
const packageCategories: PackageCategory[] = [
  { 
    name: "Tất cả",
    image: "/images/family.svg", 
    keywords: []
  },
  { 
    name: "Biển đảo", 
    image: "/images/msa.jpg", 
    keywords: ["beach", "ocean", "coast", "seaside", "shore", "sand", "sea", "waves", "lake", "riverside", "waterfront", "coastal", "biển", "đảo"]
  },
  { 
    name: "Núi rừng", 
    image: "/images/forest.jpg", 
    keywords: ["wildlife", "safari", "park", "animal", "nature reserve", "ecosystem", "habitat", "jungle", "wilderness", "game reserve", "national park", "forest", "woodland", "rainforest", "núi", "rừng"]
  },
  { 
    name: "Văn hóa", 
    image: "/images/masaai_women.jpg", 
    keywords: ["culture", "heritage", "tradition", "local", "village", "temple", "pagoda", "history", "văn hóa", "di sản"]
  },
  { 
    name: "Đô thị xanh", 
    image: "/images/singapore.jpg", 
    keywords: ["urban", "city", "eco-city", "smart city", "metropolis", "đô thị", "thành phố"]
  }
]

interface PackageSidebarProps {
  onCategorySelect: (category: string | null) => void
  selectedCategory: string | null
}

export function PackageSidebar({ 
  onCategorySelect, 
  selectedCategory
}: PackageSidebarProps) {
  return (
    <aside className="w-full lg:w-64 bg-transparent lg:bg-gray-50/50 lg:rounded-3xl lg:border lg:border-gray-100 lg:p-4">
      <div className="flex lg:flex-col gap-4 overflow-x-auto no-scrollbar lg:overflow-visible pb-4 lg:pb-0 px-4 lg:px-0">
        {packageCategories.map((category) => (
          <div
            key={category.name}
            className={`group relative flex-shrink-0 w-48 lg:w-full h-32 lg:h-40 cursor-pointer overflow-hidden rounded-2xl lg:rounded-3xl border-2 transition-all ${
              (selectedCategory === category.name || (category.name === "Tất cả" && selectedCategory === null))
                ? 'border-secondary shadow-lg scale-[0.98]'
                : 'border-transparent hover:border-secondary/50'
            }`}
            onClick={() => onCategorySelect(category.name === "Tất cả" ? null : category.name)}
          >
            <Image
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              width={300}
              height={200}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 w-full p-4">
              <h3 className="text-sm lg:text-lg font-black text-white uppercase tracking-wider">{category.name}</h3>
              <div className={`h-1 w-8 bg-secondary mt-1 rounded-full transition-all duration-500 ${
                (selectedCategory === category.name || (category.name === "Tất cả" && selectedCategory === null)) ? 'w-12' : 'opacity-0'
              }`} />
            </div>
            {(selectedCategory === category.name || (category.name === "Tất cả" && selectedCategory === null)) && (
              <div className="absolute top-3 right-3 bg-secondary text-primary p-1 rounded-full shadow-lg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

// Export the keywords for potential reuse in filtering
export const packageCategoryKeywords = packageCategories.flatMap(cat => cat.keywords);

