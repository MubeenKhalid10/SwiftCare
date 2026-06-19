'use client';

import { useState, useEffect } from 'react';
import { Plus, Circle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoLoader } from '@/components/ui/logo-loader';
import Header from '@/components/header';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getPatientById, updatePatient } from "@/lib/api"
import { getInitials } from "@/lib/avatar-utils"
import { useRequireAuth } from '@/hooks/use-require-auth'
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import type { Patient } from "@/lib/types"
import { resolvePatientImage, onPatientImageError } from "@/lib/image-utils"

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useRequireAuth({ role: 'patient' });
  const { updateUser } = useAuth();

  const [patientData, setPatientData] = useState<Partial<Patient>>({});
  const [profileSnapshot, setProfileSnapshot] = useState<{
    firstName: string
    lastName: string
    patientData: Partial<Patient>
    profileImage: string | null
  } | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getPatientById(user.id.toString())
        .then((data) => {
          if (data) {
            setPatientData(data);
            const nameParts = data.name.split(' ');
            const loadedFirstName = nameParts[0] || '';
            const loadedLastName = nameParts.slice(1).join(' ') || '';
            setFirstName(loadedFirstName);
            setLastName(loadedLastName);
            setProfileSnapshot({
              firstName: loadedFirstName,
              lastName: loadedLastName,
              patientData: data,
              profileImage: localStorage.getItem(`patient_avatar_${user.id}`),
            });
          }
        })
        .catch(console.error);

      const localAvatar = localStorage.getItem(`patient_avatar_${user.id}`);
      if (localAvatar) {
        setProfileImage(localAvatar);
      }
    }
  }, [user?.id]);

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
      const payload: Record<string, unknown> = {
        name: fullName || patientData.name,
        phone: patientData.phone,
        age: patientData.age,
        gender: patientData.gender,
      };

      const updated = await updatePatient(user.id.toString(), payload);
      updateUser({ 
        name: updated.name,
        avatar: updated.avatar || (updated as { image?: string }).image 
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

  const handleCancelProfile = () => {
    if (!profileSnapshot) return;
    setFirstName(profileSnapshot.firstName);
    setLastName(profileSnapshot.lastName);
    setPatientData({ ...profileSnapshot.patientData });
    setProfileImage(profileSnapshot.profileImage);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LogoLoader size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8 text-sm text-foreground/70">
          <Circle className="w-2 h-2 fill-primary text-primary" />
          <span>Patient</span>
          <span>/</span>
          <span>Settings</span>
        </div>

        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-8">Profile Settings</h2>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 bg-muted">
                    <AvatarImage
                      src={resolvePatientImage(profileImage || patientData.avatar, patientData.gender)}
                      onError={(e) => onPatientImageError(e, patientData.gender)}
                    />
                    <AvatarFallback className="text-muted-foreground font-bold">
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
                    <p className="text-sm text-muted-foreground mt-2">Your image should be below 4 MB. Accepted formats: jpg, png, svg.</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">First Name *</label>
                    <Input placeholder="First Name" className="w-full" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Last Name *</label>
                    <Input placeholder="Last Name" className="w-full" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Age</label>
                    <Input placeholder="Age" name="age" className="w-full" value={patientData.age || ''} onChange={handleProfileChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Gender</label>
                    <select name="gender" value={patientData.gender || ''} onChange={handleProfileChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Phone Number *</label>
                    <Input placeholder="Phone Number" name="phone" className="w-full" value={patientData.phone || ''} onChange={handleProfileChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Email Address *</label>
                    <Input type="email" placeholder="Email Address" className="w-full bg-muted" value={patientData.email || user?.email || ''} readOnly disabled />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button variant="outline" type="button" onClick={handleCancelProfile}>Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <LogoLoader size={16} className="h-4 w-4 mr-2" /> : "Save Changes"}
                </Button>
              </div>
            </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card rounded-2xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Profile Updated!</h3>
            <p className="text-muted-foreground mb-6">Your profile information has been successfully saved and synchronized.</p>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 h-auto text-lg font-semibold"
              onClick={() => setShowSuccessModal(false)}
            >
              Great, thanks!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
