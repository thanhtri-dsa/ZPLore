import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import MobileBottomNav from '@/components/MobileBottomNav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="pb-[calc(env(safe-area-inset-bottom)+70px)] lg:pb-0">
        {children}
      </main>
      <MobileBottomNav /> 
      <Footer />
    </>
  )
}
