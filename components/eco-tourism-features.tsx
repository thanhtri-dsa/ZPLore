import React from 'react';
import Image from 'next/image';

interface FeatureProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  bgColor: string;
}

const Feature: React.FC<FeatureProps> = ({ icon: Icon, title, description, bgColor }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur border border-white/60 shadow-sm hover:shadow-md transition-shadow">
    <div className={`flex-shrink-0 w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center`}>
      <Icon className="w-6 h-6 text-gray-700" aria-hidden="true" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const EcoTourismFeatures: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 bg-green-50 overflow-hidden">
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block py-1 px-3 mb-4 text-xs font-semibold text-green-900 bg-green-100 rounded-full">ECO-TOURISM FEATURES</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Discover sustainable <span className="font-serif italic text-green-600">adventures</span>
          </h2>
          <p className="text-xl text-gray-600">Experience nature while preserving it for future generations</p>
        </div>
        
        <div className="grid gap-10 lg:gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="space-y-4">
              <Feature
                icon={({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                )}
                title="Eco-Friendly Practices"
                description="Minimizing environmental impact through sustainable tourism"
                bgColor="bg-green-100"
              />
              <Feature
                icon={({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                )}
                title="Community Support"
                description="Empowering and benefiting local populations"
                bgColor="bg-blue-100"
              />
              <Feature
                icon={({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                )}
                title="Wildlife Conservation"
                description="Protecting and preserving endangered species"
                bgColor="bg-yellow-100"
              />
            </div>
          </div>
          
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/60">
              <Image
                src="/images/benthanhsaigon.jpg"
                alt="Eco-tourism"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 80vw, 420px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/30 via-transparent to-transparent" />
            </div>
          </div>
          
          <div className="lg:col-span-4 order-3">
            <div className="space-y-4">
              <Feature
                icon={({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                )}
                title="Environmental Education"
                description="Learning about ecosystems and conservation"
                bgColor="bg-red-100"
              />
              <Feature
                icon={({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                  </svg>
                )}
                title="Sustainable Accommodations"
                description="Eco-lodges and environmentally friendly hotels"
                bgColor="bg-purple-100"
              />
              <Feature
                icon={({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                )}
                title="Carbon Offset Programs"
                description="Neutralizing travel emissions for a greener future"
                bgColor="bg-orange-100"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EcoTourismFeatures;
