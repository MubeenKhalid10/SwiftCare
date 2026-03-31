"use client"

import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">

          {/* Company */}
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Treatments */}
          <div>
            <h3 className="font-bold mb-4">Treatments</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/doctors?specialty=Cardiology" className="hover:text-white transition">
                  Cardiology
                </Link>
              </li>
              <li>
                <Link href="/doctors?specialty=Neurology" className="hover:text-white transition">
                  Neurology
                </Link>
              </li>
              <li>
                <Link href="/doctors?specialty=Pediatrics" className="hover:text-white transition">
                  Pediatrics
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="font-bold mb-4">Specialties</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/doctors?specialty=Orthopedics" className="hover:text-white transition">
                  Orthopedics
                </Link>
              </li>
              <li>
                <Link href="/doctors?specialty=Psychiatry" className="hover:text-white transition">
                  Psychiatry
                </Link>
              </li>
              <li>
                <Link href="/doctors?specialty=Endocrinology" className="hover:text-white transition">
                  Endocrinology
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help-center" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; 2026 SwiftCare. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-white transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer