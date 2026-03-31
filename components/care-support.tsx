"use client"

export default function CareSupport() {
  const highlights = [
    {
      title: "Easy Appointment Booking",
      img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5",
      desc: "Book appointments with verified doctors in just a few clicks."
    },
    {
      title: "Verified Specialists",
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
      desc: "Consult certified cardiologists, dermatologists, and more."
    },
    {
      title: "Real-Time Queue Tracking",
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
      desc: "Know your place in line with live queue updates."
    },
    {
      title: "Secure Online Payments",
      img: "https://images.unsplash.com/photo-1605902711622-cfb43c4437d1",
      desc: "Safe and encrypted payment system for bookings."
    },
    {
      title: "Video Consultations",
      img: "https://images.unsplash.com/photo-1584515933487-779824d29309",
      desc: "Connect with doctors remotely through secure video calls."
    },
    {
      title: "24/7 Patient Support",
      img: "https://images.unsplash.com/photo-1580281657527-47a9d0eaf4e0",
      desc: "Our support team is available anytime for assistance."
    }
  ]

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <img
                src={`${item.img}?auto=format&fit=crop&w=600&q=80`}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      
      </div>
    </section>
  )
}