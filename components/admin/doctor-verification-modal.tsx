"use client"

import React, { useState } from "react"
import { FileText, X, Check, XCircle, MapPin, Clock, DollarSign, Users, Award, Phone, Building2, Loader2, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Facility } from "@/lib/types"

interface DoctorVerificationModalProps {
    doctor: any
    currentFacility?: Facility | null
    onClose: () => void
    onApprove: (id: string) => void
    onReject: (id: string) => void
    onAddAndAffiliateHospital?: (doctorId: string, hospitalName: string, hospitalLocation: string, hospitalImage?: File | string) => Promise<void>
    actionLoading?: string | null
}

export function DoctorVerificationModal({ doctor, currentFacility, onClose, onApprove, onReject, onAddAndAffiliateHospital, actionLoading }: DoctorVerificationModalProps) {
    if (!doctor) return null

    const [hospitalImageFile, setHospitalImageFile] = useState<File | null>(null)
    const [hospitalImagePreview, setHospitalImagePreview] = useState('')

    const doctorId = String(doctor._id || doctor.id)
    const isLoading = actionLoading === doctorId

    const experienceValue =
        doctor.experience ||
        doctor.yearsOfExperience ||
        doctor.professionalInfo?.yearsOfExperience ||
        doctor.professionalInfo?.experience ||
        'N/A'

    const bioValue = doctor.about || 'N/A'

    // Hospital affiliation submitted by doctor (saved via updateDoctor pre-submit)
    const affiliationRaw = doctor.hospitalAffiliation as {
        affiliationType?: string
        type?: string           // legacy fallback
        hospitalId?: string
        hospitalName?: string
        hospitalLocation?: string
    } | undefined

    // Normalize: backend schema uses 'affiliationType' to avoid Mongoose 'type' conflict
    const affiliation = affiliationRaw ? {
        type: (affiliationRaw.affiliationType || affiliationRaw.type || 'na') as 'na' | 'registered' | 'other',
        hospitalId: affiliationRaw.hospitalId,
        hospitalName: affiliationRaw.hospitalName,
        hospitalLocation: affiliationRaw.hospitalLocation,
    } : undefined

    const renderDocumentLink = (title: string, path: string | undefined | null) => {
        if (!path) return <span className="text-gray-400 text-sm italic">Not provided</span>
        return (
            <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'https://swiftcare.up.railway.app'}${path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-primary hover:underline mt-1"
            >
                <FileText className="w-4 h-4 mr-1" /> View {title}
            </a>
        )
    }

    const renderAffiliationBadge = () => {
        if (!affiliation || affiliation.type === 'na' || !affiliation.type) {
            return (
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">No Hospital Affiliation</p>
                        <p className="text-xs text-gray-500 mt-0.5">Doctor operates from a personal clinic.</p>
                    </div>
                </div>
            )
        }

        if (affiliation.type === 'registered') {
            return (
                <div className="space-y-3">
                    {currentFacility && (
                        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-800">Current Hospital Affiliation</p>
                                <p className="text-sm font-bold text-blue-900 mt-0.5">{currentFacility.name || 'N/A'}</p>
                                {currentFacility.location?.label && (
                                    <p className="text-xs text-blue-700 mt-0.5 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {currentFacility.location.label}
                                    </p>
                                )}
                                {currentFacility.image && (
                                    <div className="mt-3 overflow-hidden rounded-md border border-blue-200 max-w-xs">
                                        <img src={currentFacility.image} alt={currentFacility.name || 'Current hospital'} className="h-28 w-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <Building2 className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm font-medium text-green-800">Requested Registered Hospital</p>
                            <p className="text-sm font-bold text-green-900 mt-0.5">{affiliation.hospitalName || 'N/A'}</p>
                            {affiliation.hospitalLocation && (
                                <p className="text-xs text-green-700 mt-0.5 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {affiliation.hospitalLocation}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )
        }

        if (affiliation.type === 'other') {
            return (
                <div className="space-y-3">
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-800">New Hospital Request</p>
                            <p className="text-sm font-bold text-amber-900 mt-1">{affiliation.hospitalName || 'N/A'}</p>
                            {affiliation.hospitalLocation && (
                                <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {affiliation.hospitalLocation}
                                </p>
                            )}
                            <p className="text-xs text-amber-600 mt-2">
                                This hospital is not yet registered. Add it to the system and the doctor will be automatically affiliated.
                            </p>
                        </div>
                    </div>

                    {currentFacility && (
                        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-800">Previous Hospital Affiliation</p>
                                <p className="text-sm font-bold text-blue-900 mt-0.5">{currentFacility.name || 'N/A'}</p>
                                {currentFacility.location?.label && (
                                    <p className="text-xs text-blue-700 mt-0.5 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {currentFacility.location.label}
                                    </p>
                                )}
                                {currentFacility.image && (
                                    <div className="mt-3 overflow-hidden rounded-md border border-blue-200 max-w-xs">
                                        <img src={currentFacility.image} alt={currentFacility.name || 'Previous hospital'} className="h-28 w-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 p-3 bg-white border border-amber-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700">Hospital Picture</label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                setHospitalImageFile(file)
                                setHospitalImagePreview(file ? URL.createObjectURL(file) : '')
                            }}
                        />
                        <p className="text-xs text-gray-500">Upload a JPG, PNG, or WebP image for the new hospital.</p>
                        {hospitalImagePreview && (
                            <div className="overflow-hidden rounded-md border border-gray-200 max-w-xs">
                                <img src={hospitalImagePreview} alt="Hospital preview" className="h-28 w-full object-cover" />
                            </div>
                        )}
                    </div>

                    {onAddAndAffiliateHospital && affiliation.hospitalName && (
                        <button
                            onClick={() => onAddAndAffiliateHospital(
                                doctorId,
                                affiliation.hospitalName!,
                                affiliation.hospitalLocation || '',
                                hospitalImageFile || undefined
                            )}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Adding Hospital...</>
                            ) : (
                                <><Building2 className="w-4 h-4" /> Add Hospital &amp; Affiliate Doctor</>
                            )}
                        </button>
                    )}
                </div>
            )
        }

        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-icon-bg to-icon-bg/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Verification Review: Dr. {doctor.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">{doctor.specialization} • Status: <span className="font-semibold capitalize">{doctor.accountStatus?.verificationStatus || 'pending'}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* Basic Profile Info */}
                    <section className="bg-primary/5 border border-border p-5 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-primary" />
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Name</p>
                                <p className="font-medium text-gray-900 mt-1">{doctor.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Specialization</p>
                                <p className="font-medium text-gray-900 mt-1">{doctor.specialization || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Experience</p>
                                <p className="font-medium text-gray-900 mt-1">{experienceValue}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Email</p>
                                <p className="font-medium text-gray-900 mt-1 text-sm">{doctor.credentials?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Age</p>
                                <p className="font-medium text-gray-900 mt-1">{doctor.age ?? 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Gender</p>
                                <p className="font-medium text-gray-900 mt-1">{doctor.gender || 'N/A'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact & Fee Information */}
                    <section className="bg-green-50 border border-green-200 p-5 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Phone className="w-5 h-5 text-green-600" />
                            Contact &amp; Services
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Contact Number</p>
                                <p className="font-medium text-gray-900 mt-1">{doctor.contactNo || 'N/A'}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <div>
                                        <p className="text-xs text-gray-600 uppercase tracking-wide">Consultation Fee</p>
                                        <p className="font-medium text-gray-900 mt-1">{doctor.consultationFee ? `Rs. ${doctor.consultationFee}` : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-600" />
                                    <div>
                                        <p className="text-xs text-gray-600 uppercase tracking-wide">Bio</p>
                                        <p className="font-medium text-gray-900 mt-1 text-sm">{bioValue === 'N/A' ? 'N/A' : bioValue.slice(0, 30) + (bioValue.length > 30 ? '...' : '')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Hospital Affiliation */}
                    <section className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Hospital Affiliation
                        </h3>
                        {renderAffiliationBadge()}
                    </section>

                    {/* Identification Section */}
                    <section className="bg-yellow-50 border border-yellow-200 p-5 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Identification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">ID Number</p>
                                <p className="text-gray-900 font-medium">{doctor.identification?.idNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">CNIC Front</p>
                                {renderDocumentLink("CNIC Front", doctor.identification?.cnicFront)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">CNIC Back</p>
                                {renderDocumentLink("CNIC Back", doctor.identification?.cnicBack)}
                            </div>
                        </div>
                    </section>

                    {/* Professional Information */}
                    <section className="bg-purple-50 border border-purple-200 p-5 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Professional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Degree</p>
                                <p className="text-gray-900 font-medium">{doctor.professionalInfo?.degree || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Registration Number</p>
                                <p className="text-gray-900 font-medium">{doctor.professionalInfo?.registrationNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Degree Certificate</p>
                                {renderDocumentLink("Degree Certificate", doctor.verificationDocuments?.degreeCert)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Registration Certificate</p>
                                {renderDocumentLink("Registration Certificate", doctor.verificationDocuments?.regCert)}
                            </div>
                            {doctor.verificationDocuments?.otherCerts && doctor.verificationDocuments.otherCerts.length > 0 && (
                                <div className="md:col-span-2">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Other Certificates</p>
                                    <div className="space-y-1">
                                        {doctor.verificationDocuments.otherCerts.map((url: string, index: number) => (
                                            <div key={index}>{renderDocumentLink(`Certificate ${index + 1}`, url)}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Schedule Information */}
                    {(doctor.schedule?.availableDays?.length > 0 || doctor.schedule?.availableHours?.length > 0) && (
                        <section className="bg-indigo-50 border border-indigo-200 p-5 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-indigo-600" />
                                Schedule
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Available Days</p>
                                    <div className="flex flex-wrap gap-2">
                                        {doctor.schedule?.availableDays?.length > 0 ? (
                                            doctor.schedule.availableDays.map((day: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1 bg-indigo-200 text-indigo-900 text-xs font-semibold rounded-full">
                                                    {day}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-500 text-sm italic">Not specified</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Available Hours</p>
                                    <div className="flex flex-wrap gap-2">
                                        {doctor.schedule?.availableHours?.length > 0 ? (
                                            doctor.schedule.availableHours.map((hour: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1 bg-indigo-200 text-indigo-900 text-xs font-semibold rounded-full">
                                                    {hour}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-500 text-sm italic">Not specified</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Location Information */}
                    {doctor.location?.label && (
                        <section className="bg-orange-50 border border-orange-200 p-5 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-orange-600" />
                                Location
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Location Address</p>
                                    <p className="text-gray-900 font-medium">{doctor.location.label}</p>
                                </div>
                                {doctor.location?.coordinates && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Coordinates</p>
                                        <p className="text-gray-900 font-medium text-sm">
                                            {doctor.location.coordinates[1]}, {doctor.location.coordinates[0]}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Qualification/Education */}
                    {doctor.qualification?.education && doctor.qualification.education.length > 0 && (
                        <section className="bg-teal-50 border border-teal-200 p-5 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Qualification &amp; Education</h3>
                            <div className="space-y-3">
                                {doctor.qualification.education.map((edu: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <span className="inline-block w-2 h-2 bg-teal-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                        <p className="text-gray-900 font-medium">{edu}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={() => onReject(doctorId)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 font-semibold transition-colors"
                    >
                        <XCircle className="w-5 h-5" /> Reject Application
                    </button>
                    <button
                        onClick={() => onApprove(doctorId)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        Approve Doctor
                    </button>
                </div>
            </div>
        </div>
    )
}
