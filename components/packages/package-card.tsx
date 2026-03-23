import Image from 'next/image';
import { Package } from '@/types/packages';
import { ArrowRight, MapPin, CalendarDays, Tag } from 'lucide-react'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { safeImageSrc } from '@/lib/image';

interface PackageCardProps {
  package: Package;
}

function EcoLeafIcon({ className }: { className?: string }) {
  // Hand-drawn-ish SVG: rounded caps + slightly irregular curves.
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 3c-6.5.4-12.3 3.6-14.8 8.6C3.8 14.8 4.4 18.6 6.5 20.7c2.1 2.1 5.9 2.7 9.1 1.3 5-2.5 8.2-8.3 8.4-14.8Z" />
      <path d="M6.5 20.7c2-4.8 6.8-9.1 13.5-12.1" />
      <path d="M9 12c.2-2.4 1.6-4.7 3.8-6.1" />
    </svg>
  )
}

function RecycleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7.5 7.3 10 4.8h3l2.7 2.7-1.4 2.5H8.8L7.5 7.3Z" />
      <path d="M20.2 13.2 22 16l-2 3h-3l-1.6-2.7 1.6-2.7h3.2Z" />
      <path d="M3.8 13.2 2 16l2 3h3l1.6-2.7-1.6-2.7H3.8Z" />
      <path d="M9 10.2 6.5 12l2.7 2.7" />
      <path d="M15 10.2 17.5 12 14.8 14.7" />
    </svg>
  )
}

function parseGroupSize(groupSize: string) {
  const digits = groupSize?.match(/\d+/g)
  if (!digits || digits.length === 0) return groupSize
  // If range like "10-14", show "10 - 14"
  if (digits.length >= 2) return `${digits[0]} - ${digits[1]}`
  return digits[0]
}

function deriveActivityLabel(type: string | undefined, description: string | undefined) {
  const text = `${type ?? ""} ${description ?? ""}`.toLowerCase()
  if (/(kayak|kayaking|paddle|canoe)/.test(text)) return "Kayaking & khám phá nước xanh"
  if (/(tree|planting|reforest|trồng|cây|trồng cây)/.test(text)) return "Tree planting & làm sạch điểm đến"
  if (/(beach|ocean|coast|seaside|đảo|biển|bãi)/.test(text)) return "Eco beach walk & thảo luận bền vững"
  if (/(culture|heritage|village|địa phương|văn hóa|di sản)/.test(text)) return "Trải nghiệm làng nghề & cộng đồng"
  return "Sustainable experience với tác động tích cực"
}

export function PackageCard({ package: pkg }: PackageCardProps) {
  const fallbackImage = "/images/travel_detsinations.jpg"
  const src = safeImageSrc(pkg.imageData, fallbackImage)

  const typeText = (pkg.type ?? "").toLowerCase()
  const descText = (pkg.description ?? "").toLowerCase()
  const isEco = typeText.includes("eco") || descText.includes("eco") || descText.includes("xanh") || typeText.includes("xanh")
  const groupLabel = parseGroupSize(pkg.groupSize ?? "")
  const activityLabel = deriveActivityLabel(pkg.type, pkg.description)

  return (
    <div className="group h-full flex flex-col bg-white/70 backdrop-blur-sm shadow-[0_18px_60px_rgba(16,185,129,0.10)] rounded-[1.25rem] overflow-hidden transition-all duration-500 hover:shadow-[0_26px_90px_rgba(16,185,129,0.18)] hover:-translate-y-1 border border-emerald-100/70">
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-emerald-50/30">
        <Image
          src={src}
          alt={pkg.name}
          fill
          className="absolute inset-0 object-cover transition-transform duration-800 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 z-10 flex gap-2">
          {isEco ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/95 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/15">
              <EcoLeafIcon className="w-3.5 h-3.5" />
              ECO
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 text-emerald-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg border border-emerald-100/80">
              <RecycleIcon className="w-3.5 h-3.5" />
              Green
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <div className="inline-flex items-center rounded-full bg-white/85 text-emerald-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg border border-emerald-100/80">
            Group of {groupLabel || "?"}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-grow p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg md:text-xl font-black text-emerald-950 line-clamp-2 min-h-[2.6rem]">
            {pkg.name}
          </h2>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-sm capitalize flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            {pkg.location}
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-secondary" />
            {pkg.duration}
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]">
              <RecycleIcon className="w-3.5 h-3.5" />
              {activityLabel}
            </div>
            {pkg.type ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 text-emerald-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] border border-emerald-100/80">
                <Tag size={14} className="text-secondary" />
                {pkg.type}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-emerald-50">
          <p className="text-emerald-900 font-black text-lg">
            {pkg.price.toLocaleString("vi-VN")} VNĐ
          </p>
          <Link href={`/packages/${pkg.id}`} className="group">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest px-4 py-2 flex items-center rounded-xl shadow-lg">
              <span className="mr-2 whitespace-nowrap">Chi tiết</span>
              <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Recommended Wrapper Component for Grid Layout
export function PackageCardGrid({ packages }: { packages: Package[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 w-full">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} package={pkg} />
      ))}
    </div>
  );
}
