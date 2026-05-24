'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, Phone, Users, Clock, Microscope, HandshakeIcon, Loader2, MapPin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PatientSidebar } from '@/components/patient/patient-sidebar';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getDoctors, getReviews, getDashboardStats, getPatientById, updatePatient } from "@/lib/api"
import { getInitials } from "@/lib/avatar-utils"
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import type { Doctor, Review, DashboardStats, Patient } from "@/lib/types"

const FAQsList = [
  { id: 1, question: 'How do I book an appointment?' },
  { id: 2, question: 'Can I book appointments for family members through my account?' },
  { id: 3, question: 'Can i make an Appointment Online with White Plains Hospital Kendl?' },
  { id: 4, question: 'Is my payment information secure?' },
  { id: 5, question: 'Is my personal information secure?' },
  { id: 6, question: 'Can I use Doccure on my mobile device?' },
  { id: 7, question: 'Can I cancel or reschedule my appointment?' },
  { id: 8, question: 'How can I change my password or update my account information?' },
  { id: 9, question: 'How do I find a specific doctor or specialist?' },
  { id: 10, question: 'What happens if my chosen doctor is unavailable for the selected time?' },
];

const whyChooseUs = [
  { icon: Users, title: "Qualified Staff of Doctors", description: "We have a team of highly qualified doctors with years of experience delivering top-notch healthcare." },
  { icon: Clock, title: "24 Hours Service", description: "Experience healthcare advantage whether day or night. Find & book appointments easily." },
  { icon: Microscope, title: "Quality Lab Services", description: "High standards of excellence in lab services & medical operations for highest expertise." },
  { icon: HandshakeIcon, title: "Free Consultations", description: "Accessible care begins with a free initial consultation." },
]

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  // Profile Form States
  const [patientData, setPatientData] = useState<Partial<Patient>>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // About Tab States
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Contact Tab States
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', services: '', message: '' });

  const tabs = [
    { id: 'profile', label: 'Profile Setting' },
    { id: 'faq', label: 'FAQ' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact/Support' },
  ];

  // Fetch logic for Profile tab when activated
  useEffect(() => {
    if (activeTab === 'profile' && user?.id) {
      getPatientById(user.id.toString())
        .then((data) => {
          if (data) {
            setPatientData(data);
            const nameParts = data.name.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
          }
        })
        .catch(console.error);

      // Try load avatar from local storage
      const localAvatar = localStorage.getItem(`patient_avatar_${user.id}`);
      if (localAvatar) {
        setProfileImage(localAvatar);
      }
    }
  }, [activeTab, user?.id]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      const { uploadProfileImage } = await import('@/lib/auth.service');
      toast.info("Uploading image...");
      const result = await uploadProfileImage(user.id.toString(), 'patient', file);
      setProfileImage(result.imageUrl);
      
      // Update local state and global auth state immediately
      setPatientData(prev => ({ ...prev, avatar: result.imageUrl, image: result.imageUrl }));
      updateUser({ avatar: result.imageUrl });
      
      toast.success("Profile image updated!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      toast.error(msg);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Prepare payload to match backend schema
      const payload: any = {
        ...patientData,
        name: fullName || patientData.name,
      };

      // Map address to location if it exists
      if (patientData.address) {
        payload.location = {
          label: patientData.address,
          type: "Point",
          coordinates: patientData.location?.coordinates || [0, 0]
        };
      }

      const updated = await updatePatient(user.id.toString(), payload);
      
      // Sync with global auth state
      updateUser({ 
        name: updated.name,
        avatar: updated.avatar || (updated as any).image 
      });

      toast.success("Profile updated successfully!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8 text-sm text-foreground/70">
          <span className="text-primary">●</span>
          <span>Patient</span>
          <span>/</span>
          <span>Settings</span>
        </div>

        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <PatientSidebar />
          </div>

          <div className="lg:col-span-3">
            {/* Tabs - Vertical Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Tabs */}
              <div className="lg:w-48 flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-left font-medium rounded-lg transition ${activeTab === tab.id
                      ? 'bg-primary/10 text-primary border-l-4 border-primary'
                      : 'text-foreground/70 hover:bg-muted'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1">

            {/* Profile Tab Content */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-8">Profile Settings</h2>

                {/* Profile Photo */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 bg-gray-200">
                      <AvatarImage src={profileImage || patientData.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-gray-400 font-bold">
                        {getInitials(patientData.name || firstName || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <input
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/jpeg, image/png, image/svg+xml"
                          onChange={handleImageUpload}
                        />
                        <Button variant="outline" className="mr-2 bg-transparent" onClick={() => document.getElementById('avatar-upload')?.click()}>
                          <Plus className="w-4 h-4 mr-2" />
                          Upload New
                        </Button>
                        <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => {
                          setProfileImage(null);
                          if (user?.id) localStorage.removeItem(`patient_avatar_${user.id}`);
                        }}>
                          Remove
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Your image should be below 4 MB. Accepted formats: jpg, png, svg.</p>
                    </div>
                  </div>
                </div>

                {/* Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                      <Input placeholder="First Name" className="w-full" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                      <Input placeholder="Last Name" className="w-full" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                      <Input placeholder="Age" name="age" className="w-full" value={patientData.age || ''} onChange={handleProfileChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                      <select name="gender" value={patientData.gender || ''} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                      <Input placeholder="Phone Number" name="phone" className="w-full" value={patientData.phone || ''} onChange={handleProfileChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <Input type="email" placeholder="Email Address" className="w-full bg-gray-50" value={patientData.email || user?.email || ''} readOnly disabled />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Address</h3>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                    <Input 
                      placeholder="Address" 
                      name="address" 
                      className="w-full" 
                      value={patientData.address || ''} 
                      onChange={handleProfileChange}
                      onBlur={async () => {
                        // Auto-geocode address when user leaves the field
                        if (patientData.address && patientData.address.trim()) {
                          try {
                            const { geocodeAddress } = await import('@/lib/geocode');
                            const coords = await geocodeAddress(patientData.address);
                            if (coords) {
                              // Update location data with coordinates
                              setPatientData(prev => ({
                                ...prev,
                                location: {
                                  label: patientData.address || '',
                                  type: 'Point',
                                  coordinates: [coords.lng, coords.lat]
                                }
                              }));
                              console.log(`📍 Geocoded "${patientData.address}" to:`, coords);
                            }
                          } catch (err) {
                            console.warn('Geocoding unavailable', err);
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">💡 Location coordinates will be auto-filled from address</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                      <Input placeholder="City" name="city" className="w-full" value={patientData.city || ''} onChange={handleProfileChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                      <Input placeholder="State" name="state" className="w-full" value={patientData.state || ''} onChange={handleProfileChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                      <Input placeholder="Country" name="country" className="w-full" value={patientData.country || ''} onChange={handleProfileChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                      <Input placeholder="Pincode" name="pincode" className="w-full" value={patientData.pincode || ''} onChange={handleProfileChange} />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Tab Content */}
            {activeTab === 'faq' && (
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 gap-4">
                  {FAQsList.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                      <button
                        onClick={() => setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="font-semibold text-gray-900">{faq.question}</span>
                        <Plus className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFaqId === faq.id ? 'rotate-45' : ''}`} />
                      </button>
                      {expandedFaqId === faq.id && (
                        <div className="px-4 pb-4 border-t border-gray-100 mt-2 pt-2 text-gray-600 text-sm">
                          Answer content would go here
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Tab Content */}
            {activeTab === 'about' && (
              <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-12">
                <div>
                  <h2 className="text-2xl font-bold mb-4">About Us</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Our mission is to simplify finding and booking appointments with highly qualified medical professionals.
                    We connect you with the right medical expert when you need it.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Over 25+ Years of Experience in ensuring the best medical treatment for your health.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6">Why Choose Us</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {whyChooseUs.map((item, idx) => {
                      const Icon = item.icon
                      return (
                        <div key={idx} className="flex gap-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6">Best Doctors</h3>
                  {isLoadingDoctors ? (
                    <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctors.map(doctor => (
                        <div key={doctor.id} className="flex gap-4 p-4 border rounded-lg items-center">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={doctor.image || ""} />
                            <AvatarFallback className="bg-blue-600 text-white font-bold">{getInitials(doctor.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold text-gray-900">{doctor.name}</h4>
                            <p className="text-sm text-blue-600">{doctor.specialty}</p>
                            <p className="text-xs text-gray-500">{doctor.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6">Platform Stats</h3>
                  {isLoadingStats || !stats ? (
                    <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <p className="text-2xl font-bold text-blue-600">{stats.totalDoctors}</p>
                        <p className="text-xs text-gray-600 mt-1">Doctors</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <p className="text-2xl font-bold text-blue-600">{stats.totalPatients}</p>
                        <p className="text-xs text-gray-600 mt-1">Patients</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <p className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</p>
                        <p className="text-xs text-gray-600 mt-1">Appointments</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <p className="text-2xl font-bold text-blue-600">${stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 mt-1">Revenue</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Tab Content */}
            {activeTab === 'contact' && (
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-8">Contact / Support</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-lg font-bold mb-6">Contact Information</h3>
                    <div className="space-y-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                          <MapPin className="w-4 h-4" /> Address
                        </div>
                        <p className="text-gray-600 text-sm pl-6">8432 Mante Highway, Aminaport, USA</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                          <Phone className="w-4 h-4" /> Phone Number
                        </div>
                        <p className="text-gray-600 text-sm pl-6">+1 315 369 5943</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                          <Mail className="w-4 h-4" /> Email Address
                        </div>
                        <p className="text-gray-600 text-sm pl-6">doccure@example.com</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-6">Send a Message</h3>
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
                        <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
                        <select name="services" value={formData.services} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                          <option value="">Select Service</option>
                          <option value="cardiology">Cardiology</option>
                          <option value="dentistry">Dentistry</option>
                          <option value="orthopedics">Orthopedics</option>
                        </select>
                      </div>
                      <textarea
                        name="message"
                        placeholder="Your Message..."
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                      ></textarea>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Send Message</Button>
                    </form>
                  </div>
                </div>
              </div>
            )}

              </div>
            </div>
          </div>
        </div>
      </main >

      <Footer />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-2xl">✓</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Profile Updated!</h3>
            <p className="text-gray-600 mb-6">Your profile information has been successfully saved and synchronized.</p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 h-auto text-lg font-semibold"
              onClick={() => setShowSuccessModal(false)}
            >
              Great, thanks!
            </Button>
          </div>
        </div>
      )}
    </div >
  );
}
