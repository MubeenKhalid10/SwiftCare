import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Search, Home, Stethoscope, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          {/* Illustration */}
          <div className="relative mb-8 inline-flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-icon-bg flex items-center justify-center">
              <span className="text-7xl font-black text-primary/20 select-none">404</span>
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <Search className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-foreground mb-3">Page Not Found</h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-11 gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/doctors">
              <Button variant="outline" className="rounded-xl px-6 h-11 gap-2 border-border hover:border-primary/40 hover:bg-muted">
                <Stethoscope className="w-4 h-4" />
                Find a Doctor
              </Button>
            </Link>
          </div>

          {/* Quick links */}
          <div className="border-t border-border/50 pt-8">
            <p className="text-sm text-muted-foreground mb-4 font-medium">Popular pages</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { label: 'Doctors', href: '/doctors' },
                { label: 'Hospitals', href: '/hospitals' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact-us' },
                { label: 'FAQ', href: '/faq' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}
