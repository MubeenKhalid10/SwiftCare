'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, MapPin, Phone, Mail, Calendar, Award, BookOpen } from 'lucide-react'
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar'
import { useAuth } from '@/lib/auth-context'
import { getDoctorById } from '@/lib/api'
import { toast } from 'sonner'
import type { Doctor } from '@/lib/types'

export default function DoctorProfileSettings() {
  const { user } = useAuth()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    async function fetchDoctor() {
      if (!user?.id) return
      try {
        const data = await getDoctorById(user.id.toString())
        if (data) {
          setDoctor(data)
          if (data.image) {
            setProfileImage(data.image)
          }
        }
      } catch (err) {
        console.error('Failed to fetch doctor profile:', err)
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctor()
  }, [user?.id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const { uploadProfileImage } = await import('@/lib/auth.service')
      const result = await uploadProfileImage(user.id.toString(), 'doctor', file)
      setProfileImage(result.imageUrl)
      setDoctor(prev => prev ? { ...prev, image: result.imageUrl } : null)
      toast.success('Profile image updated!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image upload failed'
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-sm">
            <span className="text-blue-600">●</span>
            <span className="text-gray-600">Doctor</span>
            <span className="text-gray-600">›</span>
            <span className="text-gray-900 font-medium">Profile Settings</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctor Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <DoctorSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h2>

                {/* Profile Photo Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Profile Photo</h3>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-600" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                          {doctor?.name?.[0]?.toUpperCase() || 'D'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="file"
                          id="doctor-avatar-upload"
                          className="hidden"
                          accept="image/jpeg, image/png, image/webp"
                          onChange={handleImageUpload}
                        />
                        <Button
                          variant="outline"
                          className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                          disabled={isUploading}
                          onClick={() => document.getElementById('doctor-avatar-upload')?.click()}
                        >
                          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          {isUploading ? 'Uploading...' : 'Upload Photo'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        JPG, PNG or WebP (Max 5MB). This image will be displayed on your patient and admin portals.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Information Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Basic Information</h3>
                  <p className="text-sm text-gray-600 mb-4">Information from your signup and verification form</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <Input
                        type="text"
                        value={doctor?.name || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Your full name"
                      />
                      <p className="text-xs text-gray-500 mt-1">From verification form (read-only)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        type="email"
                        value={doctor?.credentials?.email || user?.email || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Your email"
                      />
                      <p className="text-xs text-gray-500 mt-1">From signup (read-only)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                      <Input
                        type="tel"
                        value={doctor?.contactNo || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Your contact number"
                      />
                      <p className="text-xs text-gray-500 mt-1">From verification form (read-only)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                      <Input
                        type="text"
                        value={doctor?.specialization || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Your specialization"
                      />
                      <p className="text-xs text-gray-500 mt-1">From verification form (read-only)</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Professional Information
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Verification details (read-only)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                      <Input
                        type="text"
                        value={doctor?.professionalInfo?.degree || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Your degree (e.g., MBBS)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                      <Input
                        type="text"
                        value={doctor?.professionalInfo?.registrationNumber || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Your registration number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                      <Input
                        type="text"
                        value={doctor?.experience || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Years of experience"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (RS.)</label>
                      <Input
                        type="text"
                        value={doctor?.consultationFee || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Consultation fee"
                      />
                    </div>
                  </div>
                </div>

                {/* Identification Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Identification</h3>
                  <p className="text-sm text-gray-600 mb-4">Verification details (read-only)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Number</label>
                      <Input
                        type="text"
                        value={doctor?.identification?.idNumber || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="CNIC number"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Schedule Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Location & Schedule
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Clinic information from verification form (read-only)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <Input
                        type="text"
                        value={typeof doctor?.location === 'string' ? doctor.location : doctor?.location?.label || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Clinic location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                      <Input
                        type="text"
                        value={doctor?.schedule?.availableDays?.join(', ') || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Available days"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Available Hours</label>
                      <Input
                        type="text"
                        value={doctor?.schedule?.availableHours?.join(', ') || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Available hours"
                      />
                    </div>
                  </div>
                </div>

                {/* About Section */}
                {doctor?.about && (
                  <div className="mb-8 pb-8 border-b">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4">About</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 text-sm">{doctor.about}</p>
                    </div>
                  </div>
                )}

                {/* Verification Status */}
                <div className="mb-8">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Verification Status</h3>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-sm text-gray-700">
                      Status: <span className="font-semibold text-blue-600 capitalize">{doctor?.accountStatus?.verificationStatus || 'pending'}</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t">
                  <Button variant="outline">Back</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled>
                    All fields are read-only
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
