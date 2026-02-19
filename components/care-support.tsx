"use client"

export default function CareSupport() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-12">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
            Our Services
          </div>
        </div>

        <h2 className="text-4xl font-bold text-center mb-16">
          Highlighting the <span className="text-blue-600">Care & Support</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-gray-200 rounded-xl h-48 md:h-56 flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
