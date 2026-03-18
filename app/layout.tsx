import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner'
import AuthWrapper from '@/components/auth-wrapper'
import { Analytics } from "@vercel/analytics/react"
import Script from 'next/script'
import { OfflineWrapper } from "@/components/offlineWrapper"
import CookieConsentBanner from '@/components/CookieConsentBanner';
import IntroOverlay from '@/components/IntroOverlay';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam",
});

const playfairDisplay = Playfair_Display({
  subsets: ["vietnamese"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://langnghetravel.vn"),
  title: {
    default: 'Làng Nghề Travel',
    template: "%s | Làng Nghề Travel",
  },
  description: 'Làng Nghề Travel – hành trình về nguồn cội: khám phá làng nghề, gặp gỡ nghệ nhân, trải nghiệm thủ công và văn hóa địa phương.',
  keywords: [
    'Làng Nghề Travel',
    'tour làng nghề',
    'du lịch làng nghề',
    'tour văn hóa Việt Nam',
    'trải nghiệm thủ công',
    'workshop làng nghề',
    'du lịch cộng đồng',
    'làng nghề Việt Nam',
    'tour truyền thống',
    'hành trình về nguồn cội',
  ],
    verification: {
      google: 'google-site-verification: googlec1b1726e9f555276.html',
    },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'de-DE': '/de-DE'
    }
  },
  twitter: {
    card: 'summary_large_image',
    site: '@langnghetravel',
    creator: '@langnghetravel',
    images: {
      url: 'https://langnghetravel.vn/opengraph-image',
      alt: 'Làng Nghề Travel',
    },
    
  },
  //opengraph for sharing on social media
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://langnghetravel.vn',
    siteName: 'Làng Nghề Travel',
    title: 'Làng Nghề Travel',
    description: 'Hành trình về nguồn cội: tour làng nghề, workshop trải nghiệm, văn hóa địa phương.',
    images: [{
      url: 'https://langnghetravel.vn/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'Làng Nghề Travel',
    }],
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthWrapper>
      <html lang="vi" suppressHydrationWarning>
        <head>
         <Script id="schema-org-markup-website" type="application/ld+json">
          {`
            {
              "@context" : "https://schema.org",
              "@type" : "WebSite",
              "name" : "Làng Nghề Travel",
              "url" : "https://langnghetravel.vn"
            }`}
        </Script>
        </head>
      <body className={`${beVietnamPro.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        <IntroOverlay />
        <OfflineWrapper>
        {children}
        <Toaster />
        <Analytics />
        </OfflineWrapper>
        <CookieConsentBanner />
      </body>
      </html>
    </AuthWrapper>
  );
}



