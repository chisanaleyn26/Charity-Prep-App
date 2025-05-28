export default function HeroSimple() {
  return (
    <section className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 py-32 px-4 overflow-hidden">
      {/* Background geometric shapes */}
      <div className="absolute inset-0 z-0">
        {/* Top-right decorations */}
        <div className="absolute top-0 right-0 w-80 h-64">
          <div className="absolute top-16 right-20 w-32 h-32 border-2 border-gray-300 rotate-45 opacity-60"></div>
          <div className="absolute top-8 right-8 w-48 h-3 bg-gray-300 rotate-45 opacity-70"></div>
          <div className="absolute top-32 right-12 w-24 h-24 bg-gray-200 rotate-12 opacity-50"></div>
          <div className="absolute top-12 right-40 w-12 h-12 bg-green-400 opacity-50 rotate-45"></div>
          <div className="absolute top-48 right-32 w-28 h-2 bg-gray-300 rotate-[30deg] opacity-60"></div>
          <div className="absolute top-6 right-60 w-16 h-16 border border-gray-200 rotate-[60deg] opacity-40"></div>
        </div>
        
        {/* Bottom-left decorations */}
        <div className="absolute bottom-0 left-0 w-56 h-40">
          <div className="absolute bottom-12 left-16 w-20 h-20 border-2 border-gray-300 rotate-12 opacity-40"></div>
          <div className="absolute bottom-24 left-8 w-16 h-3 bg-gray-200 opacity-50"></div>
          <div className="absolute bottom-6 left-6 w-10 h-10 bg-green-400 opacity-30"></div>
          <div className="absolute bottom-16 left-32 w-12 h-12 border border-gray-200 rotate-45 opacity-35"></div>
        </div>
        
        {/* Top-left decorations */}
        <div className="absolute top-0 left-0 w-32 h-32">
          <div className="absolute top-12 left-12 w-12 h-12 border border-gray-200 rotate-45 opacity-30"></div>
          <div className="absolute top-6 left-20 w-4 h-4 bg-gray-300 opacity-40"></div>
          <div className="absolute top-20 left-6 w-8 h-2 bg-gray-200 opacity-35"></div>
        </div>
        
        {/* Mid-right edge */}
        <div className="absolute top-1/2 right-0 w-24 h-48 -translate-y-1/2">
          <div className="absolute top-12 right-6 w-18 h-2 bg-gray-200 rotate-90 opacity-40"></div>
          <div className="absolute top-24 right-3 w-6 h-6 bg-green-400 opacity-25 rotate-45"></div>
          <div className="absolute top-36 right-8 w-4 h-16 bg-gray-200 opacity-30"></div>
        </div>
        
        {/* Mid-left area */}
        <div className="absolute top-1/3 left-0 w-32 h-32">
          <div className="absolute top-8 left-4 w-20 h-20 border border-gray-200 rotate-[25deg] opacity-25"></div>
          <div className="absolute top-16 left-16 w-8 h-8 bg-green-400 opacity-20 rotate-45"></div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-6xl lg:text-7xl font-light text-black leading-tight mb-8">
          Annual Return
          <br />
          <span className="font-medium">Stress?</span>
          <br />
          <span className="text-green-500 font-medium">Sorted.</span>
        </h1>
        
        <p className="text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto font-light mb-12">
          AI-powered compliance for UK charities.
          <br />
          Built for the 2024 regulations.
        </p>
        
        <div className="space-y-6">
          <a 
            href="/login" 
            className="inline-block bg-green-500 text-white px-12 py-4 rounded-full font-medium hover:bg-green-600 transition-colors duration-200 shadow-lg"
          >
            Try CharityPrep
          </a>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 font-light">
            <span>5-minute setup</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>30-day trial</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>No credit card</span>
          </div>
        </div>
      </div>
    </section>
  )
}