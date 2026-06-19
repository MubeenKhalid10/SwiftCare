'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Phone, Mail, Calendar, Award, BookOpen, Circle } from 'lucide-react'
import { useRequireAuth } from '@/hooks/use-require-auth'
import { useAuth } from '@/lib/auth-context'
import { getDoctorById, updateDoctor } from '@/lib/api'
import { getApiBaseUrl } from '@/lib/api-config'
import { toast } from 'sonner'
import type { Doctor } from '@/lib/types'
import { LogoLoader } from '@/components/ui/logo-loader'

export default function DoctorProfileSettings() {
  const { user, isLoading: authLoading } = useRequireAuth({ role: 'doctor' })
  const { updateUser } = useAuth()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [errors, setErrors] = useState({
    experience: '',
    consultationFee: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    contactNo: '',
    experience: '',
    consultationFee: '',
    about: ''
  })

  const readOnlyInputClass = 'bg-muted text-muted-foreground border-border cursor-not-allowed'
  const editableInputClass = 'bg-card border-primary/30 focus:border-primary focus:ring-primary/50'

  const resolveDoctorImage = (image?: string | null) => {
    if (!image) return null
    if (image.startsWith('http')) return image
    return `${getApiBaseUrl()}${image.startsWith('/') ? '' : '/'}${image}`
  }

  useEffect(() => {
    async function fetchDoctor() {
      if (!user?.id) return
      try {
        const data = await getDoctorById(user.id.toString())
        if (data) {
          setDoctor(data)
          if (data.image) {
            setProfileImage(resolveDoctorImage(data.image))
          }
          setFormData({
            name: data.name || '',
            contactNo: (data as any).contactNo || '',
            experience: String((data as any).experience || (data as any).yearsOfExperience || data?.professionalInfo?.yearsOfExperience || ''),
            consultationFee: String((data as any).consultationFee || (data as any).fee || ''),
            about: (data as any).about || ''
          })
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
      const resolvedImage = resolveDoctorImage(result.imageUrl)
      setProfileImage(resolvedImage)
      setDoctor(prev => prev ? { ...prev, image: resolvedImage || result.imageUrl } : null)
      updateUser({ avatar: resolvedImage || result.imageUrl })
      toast.success('Profile image updated!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image upload failed'
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'experience' || name === 'consultationFee') {
      const next = value.trim()
      const num = Number(next)
      setErrors(prev => ({
        ...prev,
        [name]: next === '' || Number.isNaN(num) || num < 0 ? 'Enter a valid non-negative number' : ''
      }))
    }
  }

  const handleSave = async () => {
    if (!user?.id) return
    if (errors.experience || errors.consultationFee) {
      toast.error('Please fix the validation errors before saving')
      return
    }
    setIsSaving(true)
    setSaveMessage('')
    try {
      const experienceValue = Number(formData.experience)
      const feeValue = Number(formData.consultationFee)

      const payload: Partial<Doctor> & {
        contactNo?: string
        experience?: number | string
        consultationFee?: number | string
        about?: string
      } = {
        name: formData.name.trim(),
        contactNo: formData.contactNo.trim(),
        about: formData.about.trim(),
      }

      if (!Number.isNaN(experienceValue)) payload.experience = String(experienceValue)
      if (!Number.isNaN(feeValue)) payload.consultationFee = feeValue

      const updated = await updateDoctor(String(user.id), payload)
      setDoctor(updated)
      setFormData({
        name: updated.name || formData.name,
        contactNo: (updated as any).contactNo || formData.contactNo,
        experience: String((updated as any).experience || formData.experience),
        consultationFee: String((updated as any).consultationFee || formData.consultationFee),
        about: (updated as any).about || formData.about,
      })

      updateUser({
        name: updated.name || formData.name,
        avatar: (updated as any).image || profileImage || undefined
      })

      toast.success('Profile updated successfully')
      setSaveMessage('Changes saved successfully.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile'
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LogoLoader size={32} />
        </div>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
          <LogoLoader size={32} className="h-8 w-8" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Breadcrumb */}
        <div className="bg-card border-b">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-sm">
            <Circle className="w-2 h-2 fill-primary text-primary" />
            <span className="text-muted-foreground">Doctor</span>
            <span className="text-muted-foreground">›</span>
            <span className="text-foreground font-medium">Profile Settings</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Doctor Profile</h1>

          <div className="bg-card rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-foreground mb-8">Profile Settings</h2>

                {/* Profile Photo Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-lg text-foreground mb-4">Profile Photo</h3>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-primary" />
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
                          className="bg-icon-bg border-primary/30 hover:bg-icon-bg"
                          disabled={isUploading}
                          onClick={() => document.getElementById('doctor-avatar-upload')?.click()}
                        >
                          {isUploading ? <LogoLoader size={16} className="h-4 w-4 mr-2" /> : null}
                          {isUploading ? 'Uploading...' : 'Upload Photo'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG or WebP (Max 5MB). This image will be displayed on your patient and admin portals.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Information Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-lg text-foreground mb-4">Basic Information</h3>
                  <p className="text-sm text-muted-foreground mb-4">Information from your signup and verification form</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Full Name</label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={editableInputClass}
                        placeholder="Your full name"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Updates your profile across the platform</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Email</label>
                      <Input
                        type="email"
                        value={doctor?.credentials?.email || user?.email || ''}
                        readOnly
                        className={readOnlyInputClass}
                        placeholder="Your email"
                      />
                      <p className="text-xs text-muted-foreground mt-1">From signup (read-only)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Contact Number</label>
                      <Input
                        type="tel"
                        name="contactNo"
                        value={formData.contactNo}
                        onChange={handleChange}
                        className={editableInputClass}
                        placeholder="Your contact number"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Visible to patients on your profile</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Specialization</label>
                      <Input
                        type="text"
                        value={doctor?.specialization || ''}
                        readOnly
                        className={readOnlyInputClass}
                        placeholder="Your specialization"
                      />
                      <p className="text-xs text-muted-foreground mt-1">From verification form (read-only)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Age</label>
                      <Input
                        type="text"
                        value={doctor?.age != null ? String(doctor.age) : ''}
                        readOnly
                        className={readOnlyInputClass}
                        placeholder="Your age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Gender</label>
                      <Input
                        type="text"
                        value={doctor?.gender || ''}
                        readOnly
                        className={readOnlyInputClass}
                        placeholder="Your gender"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Professional Information
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Verification details (read-only)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Degree</label>
                      <Input
                        type="text"
                        value={doctor?.professionalInfo?.degree || ''}
                        readOnly
                        className={readOnlyInputClass}
                        placeholder="Your degree (e.g., MBBS)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Registration Number</label>
                      <Input
                        type="text"
                        value={doctor?.professionalInfo?.registrationNumber || ''}
                        readOnly
                        className={readOnlyInputClass}
                        placeholder="Your registration number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Years of Experience</label>
                      <Input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        min={0}
                        step={1}
                        className={editableInputClass}
                        placeholder="Years of experience"
                      />
                      {errors.experience && (
                        <p className="text-xs text-red-600 mt-1">{errors.experience}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Consultation Fee (RS.)</label>
                      <Input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        min={0}
                        step={1}
                        className={editableInputClass}
                        placeholder="Consultation fee"
                      />
                      {errors.consultationFee && (
                        <p className="text-xs text-red-600 mt-1">{errors.consultationFee}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Identification Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-lg text-foreground mb-4">Identification</h3>
                  <p className="text-sm text-muted-foreground mb-4">Verification details (read-only)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">CNIC Number</label>
                      <Input
                        type="text"
                        value={doctor?.identification?.idNumber || ''}
                        readOnly
                        className={readOnlyInputClass}
                        placeholder="CNIC number"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Schedule Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location & Schedule
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Clinic information from verification form (read-only)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Location</label>
                      <Input
                        type="text"
                        value={typeof doctor?.location === 'string' ? doctor.location : doctor?.location?.label || ''}
                        readOnly
                        className={readOnlyInputClass}
                        placeholder="Clinic location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Available Days</label>
                      <Input
                        type="text"
                        value={doctor?.schedule?.availableDays?.join(', ') || ''}
                        readOnly
                        className={readOnlyInputClass}
                        placeholder="Available days"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Available Hours</label>
                      <Input
                        type="text"
                        value={doctor?.schedule?.availableHours?.join(', ') || ''}
                        readOnly
                        className={readOnlyInputClass}
                        placeholder="Available hours"
                      />
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-lg text-foreground mb-4">About</h3>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full rounded-lg border px-4 py-3 text-sm text-foreground/80 focus:outline-none focus:ring-2 ${editableInputClass}`}
                    placeholder="Write a short bio about your experience, approach, and specialties."
                  ></textarea>
                </div>

                {/* Verification Status */}
                <div className="mb-8">
                  <h3 className="font-semibold text-lg text-foreground mb-4">Verification Status</h3>
                  <div className="flex items-center gap-3 p-4 bg-icon-bg rounded-lg border border-primary/30">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm text-foreground/80">
                      Status: <span className="font-semibold text-primary capitalize">{doctor?.accountStatus?.verificationStatus || 'pending'}</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t">
                  {saveMessage && (
                    <p className="text-sm text-green-600 mr-auto">{saveMessage}</p>
                  )}
                  <Button variant="outline">Back</Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={handleSave}
                    disabled={isSaving || Boolean(errors.experience || errors.consultationFee)}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
        </div>
      </div>
    </>
  )
}
