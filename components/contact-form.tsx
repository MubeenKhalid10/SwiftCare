'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { sendContactMessage } from '@/lib/api'
import { MessageSquare } from 'lucide-react'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    try {
      setIsSubmitting(true)
      await sendContactMessage({
        name: formData.name,
        contactNumber: formData.contactNumber,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      })
      setStatus({ type: 'success', message: 'Message sent successfully.' })
      setFormData({
        name: '',
        email: '',
        contactNumber: '',
        subject: '',
        message: '',
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send message.'
      setStatus({ type: 'error', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border border-border/60 rounded-2xl p-8 bg-card shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-icon-bg flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Send us a Message</h2>
          <p className="text-muted-foreground text-sm">We will reply to your email as soon as possible.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Your Name *</label>
            <Input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Email Address *</label>
            <Input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Phone Number *</label>
            <Input
              type="tel"
              name="contactNumber"
              placeholder="+92 311 3333252"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Subject *</label>
            <Input
              type="text"
              name="subject"
              placeholder="Project Inquiry"
              value={formData.subject}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Message *</label>
          <textarea
            name="message"
            placeholder="Tell us about your inquiry..."
            rows={6}
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-input/50 text-foreground placeholder:text-muted-foreground resize-none transition-all"
          />
        </div>

        {status && (
          <div
            className={`text-sm px-4 py-3 rounded-lg border ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}
          >
            {status.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary-600 text-primary-foreground font-semibold h-11 px-8 rounded-full shadow-md shadow-primary/20"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  )
}
