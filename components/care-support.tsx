"use client"

export default function CareSupport() {
  const highlights = [
    {
      title: "Easy Appointment Booking",
      img: "https://plus.unsplash.com/premium_photo-1682126234524-8d48fd83bab4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8RWFzeSUyMEFwcG9pbnRtZW50JTIwQm9va2luZ3xlbnwwfHwwfHx8MA%3D%3D",
      desc: "Book appointments with verified doctors in just a few clicks."
    },
    {
      title: "Verified Specialists",
      img: "https://plus.unsplash.com/premium_photo-1683842188982-e2920f594fda?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dmVyaWZpZWQlMjBzcGVjaWFsaXN0fGVufDB8fDB8fHww",
      desc: "Consult certified cardiologists, dermatologists, and more."
    },
    {
      title: "Real-Time Queue Tracking",
      img: "https://plus.unsplash.com/premium_photo-1709713745076-96a0c4ab8484?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fFJlYWwtVGltZSUyMFF1ZXVlJTIwVHJhY2tpbmd8ZW58MHx8MHx8fDA%3D",
      desc: "Know your place in line with live queue updates."
    },
    {
      title: "Secure Online Payments",
      img: "https://plus.unsplash.com/premium_photo-1674506653774-6f51d6ebe799?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fHNlY3VyZSUyMG9ubGluZSUyMHBheW1lbnR8ZW58MHx8MHx8fDA%3D",
      desc: "Safe and encrypted payment system for bookings."
    },
    {
      title: "Digital Prescriptions & Medical Records",
      img: "https://plus.unsplash.com/premium_photo-1698421947098-d68176a8f5b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8RGlnaXRhbCUyMFByZXNjcmlwdGlvbnMlMjAlMjYlMjBNZWRpY2FsJTIwUmVjb3Jkc3xlbnwwfHwwfHx8MA%3D%3D",
      desc: "Access prescriptions, reports, and medical history anytime in one secure place."
    },
    {
      title: "24/7 Patient Support",
      img: "https://images.unsplash.com/photo-1612537785055-e226dae15987?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fDI0JTJGNyUyMFBhdGllbnQlMjBTdXBwb3J0fGVufDB8fDB8fHww",
      desc: "Our support team is available anytime for assistance."
    }
  ]

  return (
    <section className="border-section-top border-section-bottom py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="section-intro">Our Services</div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Highlighting the <span className="text-gradient-primary">Care & Support</span>
        </h2>
        <p className="section-subheader mb-12">
          Everything you need for a seamless healthcare experience, all in one place.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="rounded-xl overflow-hidden border border-border/60 bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 group"
            >
              <div className="overflow-hidden">
                <img
                  src={`${item.img}?auto=format&fit=crop&w=600&q=80`}
                  alt={item.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold mb-2 text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
