'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const STEP_LABELS = ["Personal", "Professional", "Documents", "Clinic"] as const;

// Interfaces for local state matching request
interface PersonalInfo {
    profilePic: File | string | null;
    name: string;
    email: string;
    phone: string;
    address: string;
    dob?: string;
    gender?: string;
}
interface Identification {
    idNumber: string;
    cnicFront: File | string | null;
    cnicBack: File | string | null;
}
interface ProfessionalInfo {
    degree: string;
    specialization: string;
    registrationNumber: string;
    yearsOfExperience: string;
}
interface Documents {
    degreeCert: File | string | null;
    regCert: File | string | null;
    otherCerts: (File | string)[];
}
interface ClinicInfo {
    clinicName: string;
    days: string[];
    hours: string[];
    fees: string;
    location: string;
    speciality: string;
    diseases: string[];
    contactNumber?: string;
}

const STORAGE_KEY = 'swiftcare_doctor_verification';

const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

const dataURLtoFile = (dataurl: string, filename: string) => {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream',
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

export default function DoctorVerification() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [customSpecialization, setCustomSpecialization] = useState('');
    const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);

    // Form State
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        profilePic: null, name: '', email: '', phone: '', address: '', dob: '', gender: ''
    });
    const [identInfo, setIdentInfo] = useState<Identification>({
        idNumber: '', cnicFront: null, cnicBack: null
    });
    const [profInfo, setProfInfo] = useState<ProfessionalInfo>({
        degree: '', specialization: '', registrationNumber: '', yearsOfExperience: ''
    });
    const [docsInfo, setDocsInfo] = useState<Documents>({
        degreeCert: null, regCert: null, otherCerts: []
    });
    const [clinicInfo, setClinicInfo] = useState<ClinicInfo>({
        clinicName: '', days: [], hours: [], fees: '', location: '', speciality: '', diseases: [], contactNumber: ''
    });

    // Common specializations (can be extended)
    const SPECIALIZATIONS = [
        'General Practitioner', 'Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'ENT', 'Neurology', 'Other'
    ];

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.personalInfo) setPersonalInfo(parsed.personalInfo);
                if (parsed.identInfo) setIdentInfo(parsed.identInfo);
                if (parsed.profInfo) setProfInfo(parsed.profInfo);
                if (parsed.docsInfo) setDocsInfo(parsed.docsInfo);
                if (parsed.clinicInfo) setClinicInfo(parsed.clinicInfo);
                if (typeof parsed.currentStep === 'number') setCurrentStep(parsed.currentStep);
            } catch (err) {
                console.error('Error parsing local storage data', err);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            currentStep, personalInfo, identInfo, profInfo, docsInfo, clinicInfo
        }));
    }, [currentStep, personalInfo, identInfo, profInfo, docsInfo, clinicInfo]);

    // Prefill email and name from authenticated user and make email readonly
    useEffect(() => {
        if (user) {
            setPersonalInfo(prev => ({ ...prev, email: user.email || prev.email, name: prev.name || (user.name || '') }))
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'doctor') {
        router.push('/auth/login');
        return null;
    }

    const isStepValid = (stepIndex: number) => {
        // All fields must be filled (basic validation) for the given step
        if (stepIndex === 0) {
            // Address is optional; do not block progress on it
            return !!personalInfo.name && !!personalInfo.email && !!personalInfo.phone && !!identInfo.idNumber && !!personalInfo.dob && !!personalInfo.gender;
        }
        if (stepIndex === 1) {
            return !!profInfo.degree && (!!profInfo.specialization || !!customSpecialization) && !!profInfo.registrationNumber;
        }
        if (stepIndex === 2) {
            // documents: degreeCert and regCert required; CNIC files optional if idNumber provided
            return !!docsInfo.degreeCert && !!docsInfo.regCert;
        }
        if (stepIndex === 3) {
            return !!clinicInfo.clinicName && clinicInfo.days.length > 0 && clinicInfo.hours.length > 0 && !!clinicInfo.fees && !!clinicInfo.location && !!clinicInfo.contactNumber;
        }
        return false;
    }

    const missingFieldsForStep = (stepIndex: number) => {
        const missing: string[] = [];
        if (stepIndex === 0) {
            if (!personalInfo.name) missing.push('Full name');
            if (!personalInfo.email) missing.push('Email');
            if (!personalInfo.phone) missing.push('Phone');
            // Address is optional
            if (!identInfo.idNumber) missing.push('CNIC');
            if (!personalInfo.dob) missing.push('Date of birth');
            if (!personalInfo.gender) missing.push('Gender');
        }
        if (stepIndex === 1) {
            if (!profInfo.degree) missing.push('Degree');
            if (!profInfo.specialization && !customSpecialization) missing.push('Specialization');
            if (!profInfo.registrationNumber) missing.push('Registration number');
        }
        if (stepIndex === 2) {
            if (!docsInfo.degreeCert) missing.push('Degree certificate');
            if (!docsInfo.regCert) missing.push('Registration certificate');
        }
        if (stepIndex === 3) {
            if (!clinicInfo.clinicName) missing.push('Clinic name');
            if (clinicInfo.days.length === 0) missing.push('Availability days');
            if (clinicInfo.hours.length === 0) missing.push('Availability hours');
            if (!clinicInfo.fees) missing.push('Consultation fee');
            if (!clinicInfo.location) missing.push('Location');
            if (!clinicInfo.contactNumber) missing.push('Clinic contact');
        }
        return missing;
    };

    const handleNext = () => {
        if (currentStep < STEP_LABELS.length - 1 && isStepValid(currentStep)) setCurrentStep((prev) => prev + 1);
    };
    const handleBack = () => {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    };

    const validateSize = (file: File) => {
        if (file.size > 1024 * 1024) {
            alert("File size exceeds 1MB limit.");
            return false;
        }
        return true;
    };

    // Helpers for formatting
    const formatCnic = (value: string) => {
        const digits = value.replace(/[^0-9]/g, '');
        if (!digits) return '';
        if (digits.length <= 5) return digits;
        if (digits.length <= 12) return `${digits.slice(0,5)}-${digits.slice(5)}`;
        return `${digits.slice(0,5)}-${digits.slice(5,12)}-${digits.slice(12,13)}`;
    };

    const formatPhone = (value: string) => {
        const digits = value.replace(/[^0-9]/g, '');
        if (!digits) return '';
        if (digits.length <= 4) return digits;
        if (digits.length <= 11) return `${digits.slice(0,4)}-${digits.slice(4)}`;
        return `${digits.slice(0,4)}-${digits.slice(4,11)}`;
    };

    const formatTime = (time24: string) => {
        if (!time24) return '';
        const [hStr, m] = time24.split(':');
        let h = parseInt(hStr, 10);
        const suffix = h >= 12 ? 'PM' : 'AM';
        if (h === 0) h = 12;
        if (h > 12) h = h - 12;
        const hh = String(h).padStart(2, '0');
        return `${hh}:${m} ${suffix}`;
    };

    const formatTimeRange = (start: string, end: string) => {
        const s = formatTime(start);
        const e = formatTime(end);
        return `${s} - ${e}`;
    };

    const normalizeHoursEntry = (entry: string) => {
        if (!entry) return null;
        // If already in target format like '09:00 AM - 06:00 PM'
        const targetRe = /^\d{2}:\d{2}\s(?:AM|PM)\s-\s\d{2}:\d{2}\s(?:AM|PM)$/;
        if (targetRe.test(entry)) return entry;

        // If in 'HH:MM - HH:MM' 24-hour format
        const simpleRangeRe = /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/;
        const m = entry.match(simpleRangeRe);
        if (m) {
            return formatTimeRange(m[1], m[2]);
        }

        // If contains AM/PM but different spacing, try to normalize
        const ampmRangeRe = /^(\d{1,2}:\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}:\d{2})\s*(AM|PM)$/i;
        const mm = entry.match(ampmRangeRe);
        if (mm) {
            const s = mm[1] + (mm[2].toUpperCase() === 'AM' ? ' AM' : ' PM');
            const e = mm[3] + (mm[4].toUpperCase() === 'AM' ? ' AM' : ' PM');
            // Ensure hours like '9:00 AM' become '09:00 AM'
            const pad = (t: string) => {
                const [hStr, min, suf] = t.split(/[:\s]/).filter(Boolean);
                const h = String(Number(hStr)).padStart(2, '0');
                return `${h}:${min} ${suf}`;
            };
            return `${pad(s)} - ${pad(e)}`;
        }

        return null;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, setter: any, parentKey?: string, acceptPdf = false) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!validateSize(file)) {
            e.target.value = '';
            return;
        }
        if (acceptPdf && file.type !== 'application/pdf') {
            alert('Only PDF files are allowed for this field.');
            e.target.value = '';
            return;
        }
        try {
            // If profilePic and Cloudinary env config exists, try client-side upload
            if (!acceptPdf && fieldName === 'profilePic' && process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
                try {
                    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
                    const fd = new FormData();
                    fd.append('file', file as Blob);
                    fd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string);
                    const res = await fetch(url, { method: 'POST', body: fd });
                    if (res.ok) {
                        const data = await res.json();
                        // store remote URL (will be fetched and converted to file at submit)
                        setter((prev: any) => ({ ...prev, [fieldName]: data.secure_url }));
                        return;
                    }
                } catch (e) {
                    console.warn('Cloudinary upload failed, falling back to local file', e);
                }
            }

            const base64 = await toBase64(file);
            if (parentKey === 'docsInfo' && fieldName === 'otherCerts') {
                setter((prev: any) => ({ ...prev, [fieldName]: [...prev[fieldName], base64] }));
            } else {
                setter((prev: any) => ({ ...prev, [fieldName]: base64 }));
            }
        } catch (err) {
            console.error('File reading failed', err);
        }
    };

    const getFileFromBase64 = (base64Str: string | File | null, fieldName: string): File | null => {
        if (!base64Str) return null;
        if (base64Str instanceof File) return base64Str;
        try {
            return dataURLtoFile(base64Str, `${fieldName}.jpg`);
        } catch (e) {
            return null;
        }
    };

    const fetchUrlAsFile = async (url: string, filename: string) => {
        try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const blob = await res.blob();
            return new File([blob], filename, { type: blob.type || 'application/octet-stream' });
        } catch (e) {
            console.error('Failed to fetch remote file', e);
            return null;
        }
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            // First, update doctor profile fields that backend expects (name, contactNo, consultationFee, specialization, location.label)
            try {
                const updatePayload: any = {};
                if (personalInfo.name) updatePayload.name = personalInfo.name;
                if (personalInfo.phone) updatePayload.contactNo = personalInfo.phone;
                if (clinicInfo.fees) updatePayload.consultationFee = parseInt(String(clinicInfo.fees).replace(/[^0-9]/g, '')) || undefined;
                const chosenSpec = profInfo.specialization === 'Other' ? customSpecialization : profInfo.specialization;
                if (chosenSpec) updatePayload.specialization = chosenSpec;
                if (clinicInfo.location) updatePayload.location = clinicInfo.location; // send as plain string to avoid malformed GeoJSON

                if (Object.keys(updatePayload).length) {
                    // Use API updateDoctor route
                    try {
                        const { updateDoctor } = await import('@/lib/api');
                        await updateDoctor(String(user?.id), updatePayload);
                    } catch (e) {
                        console.warn('Failed to update doctor profile before verification submit', e);
                    }
                }
            } catch (e) {
                console.warn('Profile update pre-submit failed', e);
            }

            const formData = new FormData();
            formData.append('doctorId', String(user?.id));

            const pInfoWithoutPic = { ...personalInfo, profilePic: undefined };
            formData.append('personalInfo', JSON.stringify(pInfoWithoutPic));
            const iInfoWithoutPics = { ...identInfo, cnicFront: undefined, cnicBack: undefined };
            formData.append('identification', JSON.stringify(iInfoWithoutPics));

            const professionalToSend = { ...profInfo, specialization: profInfo.specialization === 'Other' ? customSpecialization : profInfo.specialization };
            formData.append('professionalInfo', JSON.stringify(professionalToSend));

            // Build schedule payload expected by backend
            // Normalize availableHours entries to '09:00 AM - 06:00 PM' format
            const normalizedHours: string[] = [];
            for (const h of clinicInfo.hours) {
                const n = normalizeHoursEntry(h);
                if (!n) {
                    throw new Error('Each availableHours entry must be one range like 09:00 AM - 06:00 PM');
                }
                normalizedHours.push(n);
            }
            const schedulePayload: any = { availableDays: clinicInfo.days, availableHours: normalizedHours };
            formData.append('schedule', JSON.stringify(schedulePayload));

            // Append Files (handle remote URLs uploaded to cloudinary)
            const appendFile = async (key: string, value: string | File | null, filename: string) => {
                if (!value) return;
                if (typeof value === 'string' && value.startsWith('http')) {
                    const f = await fetchUrlAsFile(value, filename);
                    if (f) formData.append(key, f);
                } else {
                    const f = getFileFromBase64(value as string | File | null, filename);
                    if (f) formData.append(key, f);
                }
            };

            await appendFile('profilePic', personalInfo.profilePic as any, 'profilePic.jpg');
            await appendFile('cnicFront', identInfo.cnicFront as any, 'cnic_front.pdf');
            await appendFile('cnicBack', identInfo.cnicBack as any, 'cnic_back.pdf');
            await appendFile('degreeCert', docsInfo.degreeCert as any, 'degree_cert.pdf');
            await appendFile('regCert', docsInfo.regCert as any, 'reg_cert.pdf');
            for (let i = 0; i < docsInfo.otherCerts.length; i++) {
                // allow multiple otherCerts
                const cert = docsInfo.otherCerts[i];
                if (typeof cert === 'string' && cert.startsWith('http')) {
                    const f = await fetchUrlAsFile(cert, `otherCert_${i}.pdf`);
                    if (f) formData.append('otherCerts', f);
                } else {
                    const f = getFileFromBase64(cert as string, `otherCerts_${i}.pdf`);
                    if (f) formData.append('otherCerts', f);
                }
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/doctors/verification/submit`, {
                method: 'POST',
                body: formData, // Auto sets multipart/form-data boundary
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Submission failed');
            }

            localStorage.removeItem(STORAGE_KEY);
            router.push('/doctor/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-3xl mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Verification</h1>
                <p className="text-gray-600">Please complete all 4 steps to verify your account.</p>

                {/* Progress bar */}
                <div className="mt-8 relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        {STEP_LABELS.map((label, index) => (
                            <div key={label} className="text-center flex-1">
                                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-sm ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="text-xs mt-2 font-medium text-gray-500">{label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <div style={{ width: `${((currentStep + 1) / STEP_LABELS.length) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"></div>
                    </div>
                </div>
            </div>

            <Card className="w-full max-w-3xl shadow-lg border-0">
                <CardHeader className="bg-white border-b border-gray-100 rounded-t-xl">
                    <CardTitle className="text-xl">Step {currentStep + 1}: {STEP_LABELS[currentStep]}</CardTitle>
                    <CardDescription>Fill in your {STEP_LABELS[currentStep].toLowerCase()} details below.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 bg-white rounded-b-xl">
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">{error}</div>}

                    <div className="min-h-[300px]">
                        {/* Step 1: Personal Info (includes CNIC text) */}
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Profile Picture <span className="text-red-500">*</span> <span className="text-xs text-gray-400">(Max 1MB)</span></label>
                                    <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profilePic', setPersonalInfo)} />
                                    {personalInfo.profilePic && <p className="text-xs text-green-600 mt-1">Image selected</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
                                        <Input placeholder="As on CNIC (e.g. Dr. Ayesha Khan)" value={personalInfo.name} onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} />
                                        <p className="text-xs text-yellow-600 mt-1">Name must match CNIC exactly for verification.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                                        <Input type="email" value={personalInfo.email} readOnly className="bg-gray-100" />
                                        <p className="text-xs text-gray-500 mt-1">Email is taken from your account and cannot be changed here.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
                                        <Input type="tel" placeholder="03xx-xxxxxxx" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: formatPhone(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Date of Birth <span className="text-red-500">*</span></label>
                                        <Input type="date" value={personalInfo.dob} onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Gender <span className="text-red-500">*</span></label>
                                        <select value={personalInfo.gender} onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })} className="w-full p-2 border rounded">
                                            <option value="">Select gender</option>
                                            <option value="female">Female</option>
                                            <option value="male">Male</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">CNIC Number <span className="text-red-500">*</span></label>
                                    <Input placeholder="xxxxx-xxxxxxx-x (include dashes)" value={identInfo.idNumber} onChange={(e) => setIdentInfo({ ...identInfo, idNumber: formatCnic(e.target.value) })} />
                                    <p className="text-xs text-gray-500 mt-1">Enter CNIC with dashes. Example: 35202-1234567-1</p>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Professional Info */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Degree <span className="text-red-500">*</span></label>
                                        <Input placeholder="MBBS, MD etc. (e.g. MBBS)" value={profInfo.degree} onChange={(e) => setProfInfo({ ...profInfo, degree: e.target.value })} />
                                        <p className="text-xs text-gray-500 mt-1">Provide your highest qualification.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Specialization <span className="text-red-500">*</span></label>
                                        <select value={profInfo.specialization} onChange={(e) => setProfInfo({ ...profInfo, specialization: e.target.value })} className="w-full p-2 border rounded">
                                            <option value="">Select specialization</option>
                                            {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {profInfo.specialization === 'Other' && (
                                            <Input placeholder="Type your specialization" value={customSpecialization} onChange={(e) => setCustomSpecialization(e.target.value)} className="mt-2" />
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Registration Number <span className="text-red-500">*</span></label>
                                        <Input placeholder="PMC/REG-12345" value={profInfo.registrationNumber} onChange={(e) => setProfInfo({ ...profInfo, registrationNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Years of Experience</label>
                                        <Input type="number" min="0" placeholder="e.g. 8" value={profInfo.yearsOfExperience} onChange={(e) => setProfInfo({ ...profInfo, yearsOfExperience: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Documents (PDF only) */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Degree Certificate (PDF, Max 1MB) <span className="text-red-500">*</span></label>
                                        <Input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, 'degreeCert', setDocsInfo, undefined, true)} />
                                        {docsInfo.degreeCert && <p className="text-xs text-green-600 mt-1">File selected</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Registration Certificate (PDF, Max 1MB) <span className="text-red-500">*</span></label>
                                        <Input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, 'regCert', setDocsInfo, undefined, true)} />
                                        {docsInfo.regCert && <p className="text-xs text-green-600 mt-1">File selected</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Other Certificates (PDFs, Max 1MB each)</label>
                                    <Input type="file" accept="application/pdf" multiple onChange={(e) => handleFileChange(e, 'otherCerts', setDocsInfo, 'docsInfo', true)} />
                                    {docsInfo.otherCerts.length > 0 && <p className="text-xs text-green-600 mt-1">{docsInfo.otherCerts.length} files selected</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">CNIC Front (PDF or image, Max 1MB)</label>
                                        <Input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'cnicFront', setIdentInfo)} />
                                        {identInfo.cnicFront && <p className="text-xs text-green-600 mt-1">File selected</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">CNIC Back (PDF or image, Max 1MB)</label>
                                        <Input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'cnicBack', setIdentInfo)} />
                                        {identInfo.cnicBack && <p className="text-xs text-green-600 mt-1">File selected</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Clinic Info (days & hours picker) */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Clinic Name <span className="text-red-500">*</span></label>
                                        <Input placeholder="Your clinic / practice name" value={clinicInfo.clinicName} onChange={(e) => setClinicInfo({ ...clinicInfo, clinicName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Consultation Fee <span className="text-red-500">*</span></label>
                                        <Input placeholder="e.g. 1500" value={clinicInfo.fees} onChange={(e) => setClinicInfo({ ...clinicInfo, fees: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Clinic Contact Number <span className="text-red-500">*</span></label>
                                        <Input placeholder="03xx-xxxxxxx" value={clinicInfo.contactNumber || ''} onChange={(e) => setClinicInfo({ ...clinicInfo, contactNumber: formatPhone(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Location (address) <span className="text-red-500">*</span></label>
                                        <Input placeholder="Clinic address (will be shown on profile)" value={clinicInfo.location} onChange={(e) => setClinicInfo({ ...clinicInfo, location: e.target.value })} />
                                    </div>
                                </div>

                                {/* Speciality dropdown for clinic (optional additional) */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Clinic Speciality (optional)</label>
                                    <Input placeholder="e.g. Cardiology" value={clinicInfo.speciality} onChange={(e) => setClinicInfo({ ...clinicInfo, speciality: e.target.value })} />
                                </div>

                                {/* Days & Hours picker */}
                                <div className="grid grid-cols-3 gap-3 items-end">
                                    <select id="day-select" className="p-2 border rounded">
                                        <option value="">Select day</option>
                                        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <input id="start-time" type="time" className="p-2 border rounded" />
                                    <input id="end-time" type="time" className="p-2 border rounded" />
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => {
                                        const daySel = (document.getElementById('day-select') as HTMLSelectElement);
                                        const start = (document.getElementById('start-time') as HTMLInputElement);
                                        const end = (document.getElementById('end-time') as HTMLInputElement);
                                        if (!daySel || !start || !end) return;
                                        if (!daySel.value || !start.value || !end.value) return alert('Select day and start/end times');
                                        const day = daySel.value;
                                        // Validate times
                                        if (start.value >= end.value) return alert('End time must be after start time');
                                        const hoursStr = formatTimeRange(start.value, end.value);
                                        // avoid duplicates for day+same-range
                                        if (!clinicInfo.days.includes(day)) {
                                            setClinicInfo({ ...clinicInfo, days: [...clinicInfo.days, day], hours: [...clinicInfo.hours, hoursStr] });
                                        } else {
                                            // allow multiple ranges per day; prevent exact duplicate range
                                            const exists = clinicInfo.hours.includes(hoursStr);
                                            if (!exists) setClinicInfo({ ...clinicInfo, hours: [...clinicInfo.hours, hoursStr] });
                                        }
                                    }} className="px-4 py-2 bg-blue-600 text-white rounded">Add Availability</button>
                                    <button type="button" onClick={() => { setClinicInfo({ ...clinicInfo, days: [], hours: [] }) }} className="px-4 py-2 bg-gray-100 rounded">Clear</button>
                                </div>
                                <div>
                                    {clinicInfo.days.length > 0 ? (
                                        <div className="mt-3 space-y-2">
                                            {clinicInfo.days.map((d, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                                    <div>
                                                        <p className="font-medium">{d}</p>
                                                        <p className="text-xs text-gray-600">{clinicInfo.hours[idx] || clinicInfo.hours.join(', ')}</p>
                                                    </div>
                                                    <button type="button" onClick={() => {
                                                        const newDays = clinicInfo.days.filter((_, i) => i !== idx);
                                                        const newHours = clinicInfo.hours.filter((_, i) => i !== idx);
                                                        setClinicInfo({ ...clinicInfo, days: newDays, hours: newHours });
                                                    }} className="text-red-500">Remove</button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500">No availability added yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Show which required fields are missing for current step */}
                    {!isStepValid(currentStep) && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded text-sm">
                            <strong className="block mb-1">Missing required fields:</strong>
                            <ul className="list-disc list-inside">
                                {missingFieldsForStep(currentStep).map(f => <li key={f}>{f}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                        <Button
                            variant="outline"
                            disabled={currentStep === 0 || loading}
                            onClick={handleBack}
                            className="px-6"
                        >
                            Back
                        </Button>
                        {currentStep === STEP_LABELS.length - 1 ? (
                            <Button onClick={handleSubmit} disabled={!isStepValid(currentStep) || loading} className="px-6 bg-blue-600 hover:bg-blue-700">
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Submit Verification
                            </Button>
                        ) : (
                            <Button onClick={handleNext} disabled={!isStepValid(currentStep) || loading} className="px-6 bg-blue-600 hover:bg-blue-700">
                                Next
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
