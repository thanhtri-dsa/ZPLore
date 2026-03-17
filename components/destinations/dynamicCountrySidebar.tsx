import dynamic from 'next/dynamic'

const CountrySidebar = dynamic(() => import('./location-sidebar').then(mod => mod.CountrySidebar), {
  ssr: false
})

export function DynamicCountrySidebar() {
  return <CountrySidebar />
}

