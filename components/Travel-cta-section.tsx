import React from 'react';

const TravelCTASection: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 mt-20 ">
      <div className="w-full bg-gradient-to-r from-white  to-green-100  rounded-lg relative overflow-hidden">
        {/* Decorative arrow for larger screens */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 120 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-white/50"
          >
            <path 
              d="M10 60C10 60 40 20 110 20" 
              stroke="currentColor" 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            <path 
              d="M90 10L110 20L100 40" 
              stroke="currentColor" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M110 20L105 15M110 20L115 25M110 20L105 25M110 20L115 15" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="container px-4 mx-auto">
          <div className="relative py-16 md:py-24 xs:px-8 z-10">
            <div className="flex flex-col items-center text-center">
              <div className="py-1.5 px-4 bg-green-500 rounded-full uppercase text-xs text-white font-bold tracking-widest mb-6">
                Limited Time Offer!
              </div>
              
              <h2 className="text-gray-800 font-serif text-4xl md:text-5xl font-semibold mb-6">
                Ready for Your Next Adventure?
              </h2>
              
              <p className="text-gray-600 text-lg mb-8 max-w-2xl">
                Book now and get 15% off on all safari packages. Unforgettable experiences await you in the heart of nature.
              </p>
              
              <a 
                className="px-8 py-4 bg-green-600 rounded-full text-lg font-bold text-white hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                href="/packages"
              >
                Book Your Safari Now
              </a>
            </div>
          </div>
        </div>

     
      </div>
    </section>
  );
};

export default TravelCTASection;