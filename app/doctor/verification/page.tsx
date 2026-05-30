'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getAccessToken } from '@/lib/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogoLoader } from '@/components/ui/logo-loader';

const STEP_LABELS = ["Personal", "Professional", "Documents", "Clinic"] as const;

// Interfaces for local state matching request
interface PersonalInfo {
    profilePic: File | string | null;
    name: string;
    email: string;
    phone: string;
    age: string;
    gender: string;
    address: string;
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
    bio: string;
    diseases: string[];
}

interface HospitalAffiliation {
    hospitalId?: string;
    hospitalName: string;
    hospitalLocation: string;
    type: 'registered' | 'na' | 'other';
}

const STORAGE_KEY = 'swiftcare_doctor_verification';

const SPECIALIZATION_OPTIONS = [
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Orthopedist',
    'Psychiatrist',
    'Radiologist',
    'Urologist',
    'Gynecologist',
    'Nephrologist',
    'Oncologist',
    'Other',
] as const;

const normalizeSpecialization = (value?: string) => {
    const normalized = String(value || '').trim();
    if (!normalized) return '';

    const aliases: Record<string, string> = {
        cardiology: 'Cardiologist',
        dermatologist: 'Dermatologist',
        dermatology: 'Dermatologist',
        neurology: 'Neurologist',
        orthopedics: 'Orthopedist',
        psychiatry: 'Psychiatrist',
        radiology: 'Radiologist',
        urology: 'Urologist',
        gynecology: 'Gynecologist',
        nephrology: 'Nephrologist',
        oncology: 'Oncologist',
    };

    return aliases[normalized.toLowerCase()] || normalized;
};

const looksLikeFieldName = (value: string) => /(?:ology|ics)$/i.test(value.trim());

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
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [error, setError] = useState('');
    const [customSpecialization, setCustomSpecialization] = useState('');
    const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState<any>(null);

    // Form State
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        profilePic: null, name: '', email: '', phone: '', age: '', gender: '', address: ''
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
        clinicName: '', days: [], hours: [], fees: '', location: '', bio: '', diseases: []
    });

    // Hospital Affiliation State
    const [facilities, setFacilities] = useState<any[]>([]);
    const [facilitiesLoading, setFacilitiesLoading] = useState(true);
    const [hospitalAffiliation, setHospitalAffiliation] = useState<HospitalAffiliation>({
        hospitalName: '',
        hospitalLocation: '',
        type: 'na'
    });

    // Fetch facilities/hospitals on mount
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                setFacilitiesLoading(true);
                const { getFacilities } = await import('@/lib/api');
                const data = await getFacilities(1, 100);
                setFacilities(data.items || []);
            } catch (err) {
                console.error('Failed to fetch facilities:', err);
                setFacilities([]);
            } finally {
                setFacilitiesLoading(false);
            }
        };
        fetchFacilities();
    }, []);

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
                if (parsed.hospitalAffiliation) setHospitalAffiliation(parsed.hospitalAffiliation);
                if (typeof parsed.currentStep === 'number') setCurrentStep(parsed.currentStep);
            } catch (err) {
                console.error('Error parsing local storage data', err);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            currentStep, personalInfo, identInfo, profInfo, docsInfo, clinicInfo, hospitalAffiliation
        }));
    }, [currentStep, personalInfo, identInfo, profInfo, docsInfo, clinicInfo, hospitalAffiliation]);

    // Prefill email and name from authenticated user and make email readonly
    useEffect(() => {
        if (user) {
            setPersonalInfo(prev => ({ ...prev, email: user.email || prev.email, name: prev.name || (user.name || '') }))
        }
    }, [user]);

    useEffect(() => {
        let cancelled = false;

        const loadDoctorProfile = async () => {
            if (!user?.id || user.role !== 'doctor') {
                setIsProfileLoading(false);
                return;
            }

            setIsProfileLoading(true);

            try {
                const { getDoctorById } = await import('@/lib/api');
                const profile = await getDoctorById(user.id);

                if (!profile || cancelled) {
                    setIsProfileLoading(false);
                    return;
                }

                const doctorData = profile as any;
                setDoctorProfile(doctorData);

                setPersonalInfo(prev => ({
                    ...prev,
                    name: doctorData.name || prev.name || user.name || '',
                    email: doctorData.credentials?.email || user.email || prev.email,
                    phone: doctorData.contactNo || prev.phone,
                    age: doctorData.age != null ? String(doctorData.age) : prev.age,
                    gender: doctorData.gender || prev.gender,
                }));

                setIdentInfo(prev => ({
                    ...prev,
                    idNumber: doctorData.identification?.idNumber || prev.idNumber,
                }));

                setProfInfo(prev => ({
                    ...prev,
                    degree: doctorData.professionalInfo?.degree || prev.degree,
                    specialization: normalizeSpecialization(doctorData.specialty || doctorData.specialization || prev.specialization),
                    registrationNumber: doctorData.professionalInfo?.registrationNumber || prev.registrationNumber,
                    yearsOfExperience: doctorData.experience || doctorData.yearsOfExperience || doctorData.professionalInfo?.yearsOfExperience || doctorData.professionalInfo?.experience || prev.yearsOfExperience,
                }));

                setClinicInfo(prev => ({
                    ...prev,
                    clinicName: doctorData.location?.clinicName || prev.clinicName,
                    location: doctorData.location?.label || doctorData.location || prev.location,
                    days: doctorData.schedule?.availableDays || prev.days,
                    hours: doctorData.schedule?.availableHours || prev.hours,
                    fees: doctorData.consultationFee ? String(doctorData.consultationFee) : prev.fees,
                    bio: doctorData.about || prev.bio,
                }));
            } catch (err) {
                console.error('Failed to load doctor profile for verification form', err);
            } finally {
                if (!cancelled) {
                    setIsProfileLoading(false);
                }
            }
        };

        loadDoctorProfile();

        return () => {
            cancelled = true;
        };
    }, [user?.id, user?.role, user?.email, user?.name]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <LogoLoader size={32} className="h-8 w-8" />
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
            return !!personalInfo.name && !!personalInfo.email && !!personalInfo.phone && !!personalInfo.age && !!personalInfo.gender && !!identInfo.idNumber;
        }
        if (stepIndex === 1) {
            return !!profInfo.degree && (!!profInfo.specialization || !!customSpecialization) && !!profInfo.registrationNumber;
        }
        if (stepIndex === 2) {
            // documents: degreeCert, regCert, CNIC front and back are required
            return !!docsInfo.degreeCert && !!docsInfo.regCert && !!identInfo.cnicFront && !!identInfo.cnicBack;
        }
        if (stepIndex === 3) {
            if (isProfileLoading) return false;
            // Hospital affiliation validation
            if (hospitalAffiliation.type === 'other' && (!hospitalAffiliation.hospitalName || !hospitalAffiliation.hospitalLocation)) {
                return false;
            }
            if (hospitalAffiliation.type === 'registered' && !hospitalAffiliation.hospitalId) {
                return false;
            }
            return clinicInfo.days.length > 0 && clinicInfo.hours.length > 0 && !!clinicInfo.fees && !!clinicInfo.location && !!clinicInfo.bio;
        }
        return false;
    }

    const missingFieldsForStep = (stepIndex: number) => {
        const missing: string[] = [];
        if (stepIndex === 0) {
            if (!personalInfo.name) missing.push('Full name');
            if (!personalInfo.email) missing.push('Email');
            if (!personalInfo.phone) missing.push('Phone');
            if (!personalInfo.age) missing.push('Age');
            if (!personalInfo.gender) missing.push('Gender');
            // Address is optional
            if (!identInfo.idNumber) missing.push('CNIC');
        }
        if (stepIndex === 1) {
            if (!profInfo.degree) missing.push('Degree');
            if (!profInfo.specialization && !customSpecialization) missing.push('Specialization');
            if (!profInfo.registrationNumber) missing.push('Registration number');
        }
        if (stepIndex === 2) {
            if (!docsInfo.degreeCert) missing.push('Degree certificate');
            if (!docsInfo.regCert) missing.push('Registration certificate');
            if (!identInfo.cnicFront) missing.push('CNIC front');
            if (!identInfo.cnicBack) missing.push('CNIC back');
        }
        if (stepIndex === 3) {
            if (isProfileLoading) missing.push('Clinic schedule is still loading');
            if (clinicInfo.days.length === 0) missing.push('Availability days');
            if (clinicInfo.hours.length === 0) missing.push('Availability hours');
            if (!clinicInfo.fees) missing.push('Consultation fee');
            if (!clinicInfo.location) missing.push('Location');
            if (!clinicInfo.bio) missing.push('Bio');
            if (hospitalAffiliation.type === 'other' && !hospitalAffiliation.hospitalName) missing.push('Hospital name (Others option)');
            if (hospitalAffiliation.type === 'other' && !hospitalAffiliation.hospitalLocation) missing.push('Hospital location (Others option)');
            if (hospitalAffiliation.type === 'registered' && !hospitalAffiliation.hospitalId) missing.push('Select a hospital from the dropdown');
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

    const validateDocumentType = (file: File) => {
        const isJpeg = file.type === 'image/jpeg' || /\.(jpe?g)$/i.test(file.name || '');
        if (!isJpeg) {
            alert('Only JPG/JPEG files are allowed for verification documents.');
            return false;
        }
        return true;
    };

    // Helpers for formatting
    const formatCnic = (value: string) => {
        const digits = value.replace(/[^0-9]/g, '');
        if (!digits) return '';
        if (digits.length <= 5) return digits;
        if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
        return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
    };

    const formatPhone = (value: string) => {
        const digits = value.replace(/[^0-9]/g, '');
        if (!digits) return '';
        if (digits.length <= 4) return digits;
        if (digits.length <= 11) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
        return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, setter: any, parentKey?: string, requireJpeg = false) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!validateSize(file)) {
            e.target.value = '';
            return;
        }
        if (requireJpeg && !validateDocumentType(file)) {
            e.target.value = '';
            return;
        }
        try {
            // If profilePic and Cloudinary env config exists, try client-side upload
            if (!requireJpeg && fieldName === 'profilePic' && process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
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
                if (personalInfo.age) updatePayload.age = String(personalInfo.age);
                if (personalInfo.gender) updatePayload.gender = personalInfo.gender;
                if (profInfo.yearsOfExperience) updatePayload.experience = String(profInfo.yearsOfExperience).trim();
                if (clinicInfo.fees) updatePayload.consultationFee = parseInt(String(clinicInfo.fees).replace(/[^0-9]/g, '')) || undefined;
                if (clinicInfo.bio) updatePayload.about = clinicInfo.bio.trim();
                const chosenSpec = profInfo.specialization === 'Other' ? customSpecialization : profInfo.specialization;
                if (chosenSpec) updatePayload.specialization = chosenSpec;

                // Persist hospital affiliation on doctor document so admin can read it
                updatePayload.hospitalAffiliation = {
                    affiliationType: hospitalAffiliation.type,
                    hospitalId: hospitalAffiliation.hospitalId || null,
                    hospitalName: hospitalAffiliation.hospitalName || null,
                    hospitalLocation: hospitalAffiliation.hospitalLocation || null,
                };

                if (hospitalAffiliation.type === 'registered' && hospitalAffiliation.hospitalLocation) {
                    updatePayload.location = {
                        label: hospitalAffiliation.hospitalLocation
                    };
                }

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
            formData.append('clinicInfo', JSON.stringify({ bio: clinicInfo.bio }));

            // Build schedule payload expected by backend from the immutable profile values.
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

            const token = getAccessToken();
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://swiftcare.up.railway.app'}/doctors/verification/submit`, {
                method: 'POST',
                headers,
                body: formData, // Auto sets multipart/form-data boundary
                credentials: 'include',
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

    const persistHospitalAffiliation = async (nextAffiliation: HospitalAffiliation) => {
        if (!user?.id) return;
        try {
            const { updateDoctor } = await import('@/lib/api');
            const payload: any = {
                hospitalAffiliation: {
                    affiliationType: nextAffiliation.type,
                    type: nextAffiliation.type,
                    hospitalId: nextAffiliation.hospitalId || null,
                    hospitalName: nextAffiliation.hospitalName || null,
                    hospitalLocation: nextAffiliation.hospitalLocation || null,
                }
            };

            if (nextAffiliation.type === 'registered' && nextAffiliation.hospitalLocation) {
                payload.location = {
                    label: nextAffiliation.hospitalLocation
                };
            }

            await updateDoctor(String(user.id), payload);
        } catch (e) {
            console.warn('Failed to persist hospital affiliation selection', e);
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
                        {/* Step 1: Personal Info */}
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
                                        <Input type="tel" placeholder="03xx-xxxxxxx" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: formatPhone(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Age <span className="text-red-500">*</span></label>
                                        <Input type="number" min="0" placeholder="e.g. 35" value={personalInfo.age} onChange={(e) => setPersonalInfo({ ...personalInfo, age: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Gender <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border rounded px-3 py-2 bg-white"
                                            value={personalInfo.gender}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
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
                                            {SPECIALIZATION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {profInfo.specialization === 'Other' && (
                                            <div className="mt-2 space-y-1">
                                                <Input placeholder="Type your specialist title, e.g. dermatologist" value={customSpecialization} onChange={(e) => setCustomSpecialization(e.target.value)} />
                                                <p className="text-xs text-gray-500">Use a specialist title, not a field name like dermatology.</p>
                                            </div>
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

                        {/* Step 3: Documents */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Degree Certificate (JPG/JPEG, Max 1MB) <span className="text-red-500">*</span></label>
                                        <Input type="file" accept="image/jpeg,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'degreeCert', setDocsInfo, undefined, true)} />
                                        {docsInfo.degreeCert && <p className="text-xs text-green-600 mt-1">File selected</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Registration Certificate (JPG/JPEG, Max 1MB) <span className="text-red-500">*</span></label>
                                        <Input type="file" accept="image/jpeg,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'regCert', setDocsInfo, undefined, true)} />
                                        {docsInfo.regCert && <p className="text-xs text-green-600 mt-1">File selected</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Other Certificates (can add multiple files,JPG/JPEG, Max 1MB each)</label>
                                    <Input type="file" accept="image/jpeg,.jpg,.jpeg" multiple onChange={(e) => handleFileChange(e, 'otherCerts', setDocsInfo, 'docsInfo', true)} />
                                    {docsInfo.otherCerts.length > 0 && <p className="text-xs text-green-600 mt-1">{docsInfo.otherCerts.length} files selected</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">CNIC Front (JPG/JPEG, Max 1MB) <span className="text-red-500">*</span></label>
                                        <Input type="file" accept="image/jpeg,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'cnicFront', setIdentInfo, undefined, true)} />
                                        {identInfo.cnicFront && <p className="text-xs text-green-600 mt-1">File selected</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">CNIC Back (JPG/JPEG, Max 1MB) <span className="text-red-500">*</span></label>
                                        <Input type="file" accept="image/jpeg,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'cnicBack', setIdentInfo, undefined, true)} />
                                        {identInfo.cnicBack && <p className="text-xs text-green-600 mt-1">File selected</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Clinic Info with Hospital Affiliation */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Consultation Fee <span className="text-red-500">*</span></label>
                                        <Input placeholder="e.g. 1500" value={clinicInfo.fees} onChange={(e) => setClinicInfo({ ...clinicInfo, fees: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Bio <span className="text-red-500">*</span></label>
                                    <Input placeholder="Short bio for your clinic / practice" value={clinicInfo.bio} onChange={(e) => setClinicInfo({ ...clinicInfo, bio: e.target.value })} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Location <span className="text-red-500">*</span></label>
                                    <Input value={clinicInfo.location} readOnly className="bg-gray-100" />
                                    <p className="text-xs text-gray-500 mt-1">This value is loaded from your doctor profile and cannot be changed here.</p>
                                </div>

                                {/* Hospital Affiliation Section */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Hospital Affiliation</label>
                                    {facilitiesLoading ? (
                                        <div className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-400 text-sm">Loading hospitals...</div>
                                    ) : (
                                        <select
                                            value={
                                                hospitalAffiliation.type === 'na' ? 'na'
                                                    : hospitalAffiliation.type === 'other' ? 'other'
                                                        : hospitalAffiliation.hospitalId || ''
                                            }
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'na') {
                                                    const next: HospitalAffiliation = { type: 'na', hospitalName: '', hospitalLocation: '' };
                                                    setHospitalAffiliation(next);
                                                    persistHospitalAffiliation(next);
                                                } else if (val === 'other') {
                                                    const next: HospitalAffiliation = { type: 'other', hospitalName: '', hospitalLocation: '' };
                                                    setHospitalAffiliation(next);
                                                    persistHospitalAffiliation(next);
                                                } else {
                                                    // It's a hospital ID
                                                    const selected = facilities.find(f => (f.id || f._id) === val);
                                                    if (selected) {
                                                        const loc = selected.location?.label || '';
                                                        const next = {
                                                            type: 'registered',
                                                            hospitalId: selected.id || selected._id,
                                                            hospitalName: selected.name,
                                                            hospitalLocation: loc
                                                        } as HospitalAffiliation;
                                                        setHospitalAffiliation(next);
                                                        persistHospitalAffiliation(next);
                                                        // Overwrite clinic location with hospital's location
                                                        if (loc) setClinicInfo(prev => ({ ...prev, location: loc }));
                                                    }
                                                }
                                            }}
                                            className="w-full border rounded px-3 py-2 bg-white"
                                        >
                                            <option value="na">N/A (Personal Clinic)</option>
                                            {facilities.map((facility) => (
                                                <option key={facility.id || facility._id} value={facility.id || facility._id}>
                                                    {facility.name}{facility.location?.label ? ` — ${facility.location.label}` : ''}
                                                </option>
                                            ))}
                                            <option value="other">Others — Add Custom Hospital</option>
                                        </select>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Select a registered hospital (its location will be used), N/A for personal clinic, or Others to request a new hospital.</p>

                                    {hospitalAffiliation.type === 'registered' && hospitalAffiliation.hospitalId && (
                                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                                            <p className="font-medium text-blue-900">✓ Affiliated with: {hospitalAffiliation.hospitalName}</p>
                                            <p className="text-blue-800 text-xs mt-1">Location auto-filled: {hospitalAffiliation.hospitalLocation}</p>
                                        </div>
                                    )}
                                </div>

                                {hospitalAffiliation.type === 'other' && (
                                    <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-sm font-medium text-amber-800">⚠ New hospital request — Admin will review and add it. You will be automatically affiliated once approved.</p>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Hospital / Clinic Name <span className="text-red-500">*</span></label>
                                            <Input
                                                placeholder="e.g. ABC Medical Center"
                                                value={hospitalAffiliation.hospitalName}
                                                onChange={(e) => {
                                                    const next = { ...hospitalAffiliation, hospitalName: e.target.value };
                                                    setHospitalAffiliation(next);
                                                    persistHospitalAffiliation(next);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Hospital / Clinic Location <span className="text-red-500">*</span></label>
                                            <Input
                                                placeholder="Full address e.g. 123 Main St, Lahore, Pakistan"
                                                value={hospitalAffiliation.hospitalLocation}
                                                onChange={(e) => {
                                                    const next = { ...hospitalAffiliation, hospitalLocation: e.target.value };
                                                    setHospitalAffiliation(next);
                                                    persistHospitalAffiliation(next);
                                                }}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Provide the complete address for admin verification.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Available Days <span className="text-red-500">*</span></label>
                                        <div className="min-h-12 rounded border bg-gray-50 p-3 flex flex-wrap gap-2">
                                            {isProfileLoading ? (
                                                <span className="text-sm text-gray-500">Loading from your doctor profile...</span>
                                            ) : clinicInfo.days.length > 0 ? (
                                                clinicInfo.days.map((day) => (
                                                    <span key={day} className="px-3 py-1 bg-indigo-100 text-indigo-900 text-xs font-semibold rounded-full">
                                                        {day}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">No availability found on your profile.</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Available Hours <span className="text-red-500">*</span></label>
                                        <div className="min-h-12 rounded border bg-gray-50 p-3 flex flex-wrap gap-2">
                                            {isProfileLoading ? (
                                                <span className="text-sm text-gray-500">Loading from your doctor profile...</span>
                                            ) : clinicInfo.hours.length > 0 ? (
                                                clinicInfo.hours.map((hour) => (
                                                    <span key={hour} className="px-3 py-1 bg-indigo-100 text-indigo-900 text-xs font-semibold rounded-full">
                                                        {hour}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">No hours found on your profile.</span>
                                            )}
                                        </div>
                                    </div>
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
                                {loading ? <LogoLoader size={16} className="h-4 w-4 mr-2" /> : null}
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
