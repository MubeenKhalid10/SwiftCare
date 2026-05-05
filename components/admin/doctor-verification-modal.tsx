"use client"

import React from "react"
import { Eye, FileText, X, Check, XCircle, MapPin, Clock, DollarSign, Users, Award, Phone } from "lucide-react"

interface DoctorVerificationModalProps {
    doctor: any
    onClose: () => void
    onApprove: (id: string) => void
    onReject: (id: string) => void
}

export function DoctorVerificationModal({ doctor, onClose, onApprove, onReject }: DoctorVerificationModalProps) {
    if (!doctor) return null

    const renderDocumentLink = (title: string, path: string | undefined | null) => {
        if (!path) return <span className="text-gray-400 text-sm italic">Not provided</span>
        return (
            <a
                href={`http://localhost:5000${path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:underline mt-1"
            >
                <FileText className="w-4 h-4 mr-1" /> View {title}
            </a>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Verification Review: Dr. {doctor.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">{doctor.specialization} • Status: <span className="font-semibold">{doctor.accountStatus?.verificationStatus || 'pending'}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* Basic Profile Info */}
                    <section className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-blue-600" />
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
                                <p className="font-medium text-gray-900 mt-1">{doctor.experience || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Email</p>
                                <p className="font-medium text-gray-900 mt-1 text-sm">{doctor.credentials?.email || 'N/A'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact & Fee Information */}
                    <section className="bg-green-50 border border-green-200 p-5 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Phone className="w-5 h-5 text-green-600" />
                            Contact & Services
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
                                        <p className="text-xs text-gray-600 uppercase tracking-wide">Patients</p>
                                        <p className="font-medium text-gray-900 mt-1">{doctor.patients || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">About</p>
                                <p className="font-medium text-gray-900 mt-1 text-sm">{doctor.about ? doctor.about.slice(0, 30) + '...' : 'N/A'}</p>
                            </div>
                        </div>
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
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Qualification & Education</h3>
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
                        onClick={() => onReject(doctor._id || doctor.id)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold transition-colors"
                    >
                        <XCircle className="w-5 h-5" /> Reject Application
                    </button>
                    <button
                        onClick={() => onApprove(doctor._id || doctor.id)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
                    >
                        <Check className="w-5 h-5" /> Approve Doctor
                    </button>
                </div>
            </div>
        </div>
    )
}
