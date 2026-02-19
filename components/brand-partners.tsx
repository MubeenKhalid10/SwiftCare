"use client"

export default function BrandPartners() {
  const brands = ["Medtronic", "Siemens", "Philips", "Stryker", "Zimmer", "Arthrex"]

  return (
    <section className="py-12 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8">
          {brands.map((brand, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-white/70 hover:text-white transition">
              <div className="w-6 h-6 bg-white/20 rounded"></div>
              <span className="text-sm font-medium">{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
