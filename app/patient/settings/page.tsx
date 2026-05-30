'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoLoader } from '@/components/ui/logo-loader';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PatientSidebar } from '@/components/patient/patient-sidebar';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getPatientById, updatePatient, sendContactMessage } from "@/lib/api"
import { getInitials } from "@/lib/avatar-utils"
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import type { Patient } from "@/lib/types"

const FAQsList = [
  {
    id: 1,
    question: 'How do I book an appointment?',
    answer: 'Select a doctor, choose an available date, and the system shows patients before you with the next available time.'
  },
  {
    id: 2,
    question: 'How does the queue-based booking work?',
    answer: 'Appointments are first-come, first-serve. Your time slot is assigned based on the number of patients already booked.'
  },
  {
    id: 3,
    question: 'Can I track my queue position?',
    answer: 'Yes. Use Track Queue to see current serving, your position, and estimated wait time in real time.'
  },
  {
    id: 4,
    question: 'Can I book for a family member?',
    answer: 'Yes. While booking, choose who the appointment is for and enter their details.'
  },
  {
    id: 5,
    question: 'Is my personal information secure?',
    answer: 'We use secure data handling practices to protect your information.'
  },
  {
    id: 6,
    question: 'Do doctors manage the live queue?',
    answer: 'Yes. Doctors start shifts, check in patients, and advance the queue from their dashboard.'
  },
  {
    id: 7,
    question: 'What if a doctor has no active shift?',
    answer: 'If no active shift is running, queue tracking and live serving will start once the doctor begins the shift.'
  },
  {
    id: 8,
    question: 'How do I find a doctor or specialty?',
    answer: 'Use the Doctors page to browse, filter, and open a doctor profile before booking.'
  },
  {
    id: 9,
    question: 'Will I receive appointment notifications?',
    answer: 'Yes. You receive confirmations and status updates, and queue notifications as your turn approaches.'
  },
  {
    id: 10,
    question: 'Can I cancel an appointment?',
    answer: 'Yes. You can cancel from your appointments page before the appointment time.'
  },
];

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

  // Contact Tab States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const tabs = [
    { id: 'profile', label: 'Profile Settings' },
    { id: 'faq', label: 'FAQ' },
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    try {
      setIsSubmitting(true)
      await sendContactMessage({
        name: formData.name,
        contactNumber: formData.contactNumber,
        email: user?.email || formData.email,
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
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Failed to send message.' })
    } finally {
      setIsSubmitting(false)
    }
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

                {/* Save Changes Button */}
                <div>
                  <div className="flex gap-4 mt-8">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? <LogoLoader size={16} className="h-4 w-4 mr-2" /> : "Save Changes"}
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
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Tab Content */}
            {activeTab === 'contact' && (
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-8">Contact / Support</h2>
                <div>
                    <h3 className="text-lg font-bold mb-6">Send a Message</h3>
                    <form className="space-y-4" onSubmit={handleContactSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Your Name *</label>
                          <Input name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                          <Input
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={user?.email || formData.email}
                            readOnly
                            disabled
                            required
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                          <Input name="contactNumber" type="tel" placeholder="+92 311 3333252" value={formData.contactNumber} onChange={handleChange} required className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Subject *</label>
                          <Input name="subject" placeholder="Project Inquiry" value={formData.subject} onChange={handleChange} required className="h-11" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Message *</label>
                        <textarea
                          name="message"
                          placeholder="Tell us about your project..."
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        ></textarea>
                      </div>

                      {status && (
                        <div className={`text-sm px-3 py-2 rounded-md ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                          {status.message}
                        </div>
                      )}

                      <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-600 text-white font-semibold h-11 px-6 rounded-full">
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
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
