"use client"

export default function BrandPartners() {
  const brands = ["Medtronic", "Siemens", "Philips", "Stryker", "Zimmer", "Arthrex"]

  return (
    <section className="py-12 bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <h3 className="text-white text-xl font-semibold text-center mb-6">
          Our Trusted Brand Partners
        </h3>

        {/* Marquee container */}
        <div className="w-full overflow-hidden">
          <div className="flex animate-marquee space-x-12">
            {brands.concat(brands).map((brand, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex-shrink-0"></div>
                <span className="text-sm font-medium">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tailwind Custom Keyframes */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </section>
  )
}