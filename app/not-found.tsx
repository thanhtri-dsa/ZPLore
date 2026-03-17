import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full space-y-8">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <Image
              src="/images/notfound.svg"
              alt="Lost in the Safari"
              width={500}
              height={500}
              className="w-full h-auto object-cover rounded-3xl"
              priority
            />
          </div>
          <div className="w-full lg:w-1/2 text-center lg:text-left lg:pl-8">
            <span className="inline-block py-2 px-3 mb-5 text-sm bg-emerald-100 text-emerald-900 font-semibold rounded-full">
              Page not found
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Lost in the wilderness?
            </h1>
            <p className="text-lg sm:text-xl font-semibold text-emerald-200 mb-8">
              Don&apos;t worry, our expert guides will lead you back to safety.
            </p>
            <Link 
              href="/"
              className="inline-block rounded-full px-8 py-3 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 hover:translate-y-[-2px]"
            >
              Return to Base Camp
            </Link>
          </div>
        </div>
      </div>
      <div 
        className="absolute inset-0 bg-repeat opacity-10 pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1h2v2H1V1zm4 0h2v2H5V1zm4 0h2v2H9V1zm4 0h2v2h-2V1zm4 0h2v2h-2V1zm0 4h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zM1 5h2v2H1V5zm0 4h2v2H1V9zm0 4h2v2H1v-2zm0 4h2v2H1v-2zM5 5h2v2H5V5zm0 4h2v2H5V9zm0 4h2v2H5v-2zm0 4h2v2H5v-2zM9 5h2v2H9V5zm0 4h2v2H9V9zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-12h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z' fill='currentColor'/%3E%3C/svg%3E")`,
          backgroundSize: '20px'
        }}
      />
    </div>
  )
}