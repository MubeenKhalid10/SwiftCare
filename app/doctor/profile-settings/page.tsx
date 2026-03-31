'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Loader2 } from 'lucide-react'
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

export default function DoctorProfileSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('basic')
  const [languages, setLanguages] = useState(['English', 'German'])
  const [newLanguage, setNewLanguage] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang))
  }

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage])
      setNewLanguage('')
    }
  }

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
      toast.success('Profile image updated!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image upload failed'
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-6 w-full mb-8">
                    <TabsTrigger value="basic">Basic Details</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="awards">Awards</TabsTrigger>
                    <TabsTrigger value="insurances">Insurances</TabsTrigger>
                    <TabsTrigger value="clinics">Clinics</TabsTrigger>
                  </TabsList>

                  {/* Basic Details Tab */}
                  <TabsContent value="basic">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Profile Photo</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                          <div className="flex items-center gap-4">
                            {profileImage ? (
                              <img src={profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold">
                                {user?.name?.[0]?.toUpperCase() || 'D'}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  id="doctor-avatar-upload"
                                  className="hidden"
                                  accept="image/jpeg, image/png, image/svg+xml"
                                  onChange={handleImageUpload}
                                />
                                <Button
                                  variant="outline"
                                  className="bg-transparent"
                                  disabled={isUploading}
                                  onClick={() => document.getElementById('doctor-avatar-upload')?.click()}
                                >
                                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                  {isUploading ? 'Uploading...' : 'Upload New'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => setProfileImage(null)}
                                >
                                  Remove
                                </Button>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Max 5MB. Accepted formats: jpg, png, svg
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <Input placeholder="First Name" />
                          <Input placeholder="Last Name" />
                          <Input placeholder="Display Name" />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <Input placeholder="Designation" />
                          <Input placeholder="Phone Numbers" />
                          <Input placeholder="Email Address" />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Known Languages</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {languages.map(lang => (
                            <span
                              key={lang}
                              className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                              {lang} <X size={14} className="cursor-pointer" onClick={() => removeLanguage(lang)} />
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a language"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                          />
                          <Button onClick={addLanguage} variant="outline">Add</Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Experience Tab */}
                  <TabsContent value="experience">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Experience</h3>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add New Experience</Button>
                      </div>
                      {/* Experience form here (same as before) */}
                    </div>
                  </TabsContent>

                  {/* Education Tab */}
                  <TabsContent value="education">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Education</h3>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add New Education</Button>
                      </div>
                      {/* Education form here (same as before) */}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 mt-8 pt-8 border-t">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
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
