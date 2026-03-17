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
  metadataBase: new URL("https://www.forestlinetours.com"),
  title: {
    default: 'Forestline Tours',
    template: "%s | Forestline Tours",
  },
  description: 'The best tour agency  that connects tourist with magical destinations',
  keywords: ['African Safaris', 'Tours in Nairobi', 'Kenya Safaris', 'Best African Tour Company', 'Big Five Safaris', 'Nairobi Tours and Safaris', 'Top Safari Company in Africa', 'Wildlife Tours in Kenya', 'Luxury Safaris', 
    'Adventure Tours Africa', 'Forestline Tours, Kenya', 'Forestline Tours, Nairobi', 'Forestline Tours, Africa', 'Forestline Tours, Best Tour Company in Africa', 'Forestline Tours, Best Tour Company in Kenya', 'Forestline Tours, Best Tour Company in Nairobi,Forestline Packages, Diani Travel Packages, Mombasa Travel Packages, Nairobi Travel Packages, Kenya Travel Packages, Africa Travel Packages, Best Travel Packages in Africa, Best Travel Packages in Kenya, Best Travel Packages in Nairobi, Best Travel Packages in Diani, Best Travel Packages in Mombasa ,Japan Tour Travel',],
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
    site: '@forestlinetours', // Your Twitter handle
    creator: '@forestlinetours', // Your Twitter handle
    images: {
      url: 'https://www.forestlinetours.com/opengraph-image',
      alt: 'Forestline Tours',
    },
    
  },
  //opengraph for sharing on social media
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.forestlinetours.com',
    siteName: 'Forestline Tours',
    title: 'Forestline Tours',
    description: 'Tour agency that connects tourist with magical destinations',
    images: [{
      url: 'https://www.forestlinetours.com/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'Forestline Tours',
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
      <html lang="en" suppressHydrationWarning>
        <head>
         <Script id="schema-org-markup-website" type="application/ld+json">
          {`
            {
              "@context" : "https://schema.org",
              "@type" : "WebSite",
              "name" : "Forestline Tours",
              "url" : "https://www.forestlinetours.com"
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



