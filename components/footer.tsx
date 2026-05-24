"use client"

import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t-2 border-primary/20 bg-gradient-to-b from-icon-bg to-primary-50 dark:bg-slate-950 py-16 text-foreground dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-foreground dark:text-white/90">Company</h3>
            <ul className="space-y-3 text-sm text-foreground/70 dark:text-white/60">
              <li>
                <Link href="/about" className="transition hover:text-foreground dark:hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition hover:text-foreground dark:hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="transition hover:text-foreground dark:hover:text-white">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Treatments */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-foreground dark:text-white/90">Treatments</h3>
            <ul className="space-y-3 text-sm text-foreground/70 dark:text-white/60">
              <li>
                <Link href="/doctors?specialty=Cardiology" className="transition hover:text-foreground dark:hover:text-white">
                  Cardiology
                </Link>
              </li>
              <li>
                <Link href="/doctors?specialty=Neurology" className="transition hover:text-foreground dark:hover:text-white">
                  Neurology
                </Link>
              </li>
              <li>
                <Link href="/doctors?specialty=Pediatrics" className="transition hover:text-foreground dark:hover:text-white">
                  Pediatrics
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-foreground dark:text-white/90">Specialties</h3>
            <ul className="space-y-3 text-sm text-foreground/70 dark:text-white/60">
              <li>
                <Link href="/doctors?specialty=Orthopedics" className="transition hover:text-foreground dark:hover:text-white">
                  Orthopedics
                </Link>
              </li>
              <li>
                <Link href="/doctors?specialty=Psychiatry" className="transition hover:text-foreground dark:hover:text-white">
                  Psychiatry
                </Link>
              </li>
              <li>
                <Link href="/doctors?specialty=Endocrinology" className="transition hover:text-foreground dark:hover:text-white">
                  Endocrinology
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-foreground dark:text-white/90">Support</h3>
            <ul className="space-y-3 text-sm text-foreground/70 dark:text-white/60">
              <li>
                <Link href="/contact" className="transition hover:text-foreground dark:hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition hover:text-foreground dark:hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help-center" className="transition hover:text-foreground dark:hover:text-white">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-foreground dark:text-white/90">Follow Us</h3>
            <div className="flex gap-3">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-icon-bg text-primary transition hover:-translate-y-0.5 hover:bg-primary/15 hover:text-primary-600 dark:border-primary/20 dark:bg-primary/10 dark:text-primary-400 dark:hover:bg-primary/20">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-icon-bg text-primary transition hover:-translate-y-0.5 hover:bg-primary/15 hover:text-primary-600 dark:border-primary/20 dark:bg-primary/10 dark:text-primary-400 dark:hover:bg-primary/20">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-icon-bg text-primary transition hover:-translate-y-0.5 hover:bg-primary/15 hover:text-primary-600 dark:border-primary/20 dark:bg-primary/10 dark:text-primary-400 dark:hover:bg-primary/20">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-icon-bg text-primary transition hover:-translate-y-0.5 hover:bg-primary/15 hover:text-primary-600 dark:border-primary/20 dark:bg-primary/10 dark:text-primary-400 dark:hover:bg-primary/20">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-foreground/50 dark:text-white/50 md:flex-row">
          <p>&copy; 2026 SwiftCare. All rights reserved.</p>
          <div className="mt-4 flex gap-6 md:mt-0">
            <Link href="/privacy-policy" className="transition hover:text-foreground dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="transition hover:text-foreground dark:hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer