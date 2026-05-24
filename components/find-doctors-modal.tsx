'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Search, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getDoctors } from '@/lib/api'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { Doctor } from '@/lib/types'

interface FindDoctorsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FindDoctorsModal({ isOpen, onClose }: FindDoctorsModalProps) {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchDoctors()
    }
  }, [isOpen])

  useEffect(() => {
    const filtered = doctors.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDoctors(filtered)
  }, [searchTerm, doctors])

  const fetchDoctors = async () => {
    try {
      setIsLoading(true)
      const data = await getDoctors()
      setDoctors(data)
      setFilteredDoctors(data)
    } catch (err) {
      console.error('Error fetching doctors:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookAppointment = (doctorId: string) => {
    onClose()
    router.push(`/booking?doctorId=${doctorId}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Find & Book Doctors</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by doctor name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No doctors found. Try adjusting your search.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer"
                  onClick={() => handleBookAppointment(String(doctor.id))}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={doctor.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUTUtHIOXMYhSIEt1TrurPOA44FbZfS2esyNLzUeFgA&s"} alt={doctor.name} />
                      <AvatarFallback className="bg-primary text-white">
                        {doctor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{doctor.name}</p>
                      <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                      <p className="text-xs text-muted-foreground">{doctor.location}</p>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookAppointment(String(doctor.id))
                    }}
                    className="bg-primary hover:bg-primary-600 text-white ml-4 flex-shrink-0"
                  >
                    Book Now
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
