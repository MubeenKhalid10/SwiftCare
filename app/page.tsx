import Header from "@/components/header"
import Hero from "@/components/hero"
import ServiceCategories from "@/components/service-categories"
import CareSupport from "@/components/care-support"
import FeaturedDoctors from "@/components/featured-doctors"
import Services from "@/components/services"
import TrustSection from "@/components/trust-section"
import Reviews from "@/components/reviews"
import FAQ from "@/components/faq"
import AppDownload from "@/components/app-download"
import FooterCTA from "@/components/footer-cta"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="relative isolate w-full overflow-x-hidden bg-background text-foreground">
      <Header />
      <Hero />
      <ServiceCategories />
      <CareSupport />
      <FeaturedDoctors />
      <Services />
      <TrustSection />
      <Reviews />
      <FAQ />
      <AppDownload />
      <FooterCTA />
      <Footer />
    </main>
  )
}
