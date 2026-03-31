"use client"

import React from "react"
import { Eye, FileText, X, Check, XCircle } from "lucide-react"

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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        Verification Review: Dr. {doctor.name}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column - Details */}
                    <div className="space-y-6">
                        <section className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">Identification</h3>
                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                                <div className="text-gray-500">ID Number:</div>
                                <div className="font-medium">{doctor.identification?.idNumber || 'N/A'}</div>

                                <div className="text-gray-500">CNIC Front:</div>
                                <div>{renderDocumentLink("CNIC Front", doctor.verificationDocuments?.cnicFront)}</div>

                                <div className="text-gray-500">CNIC Back:</div>
                                <div>{renderDocumentLink("CNIC Back", doctor.verificationDocuments?.cnicBack)}</div>
                            </div>
                        </section>

                        <section className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">Personal Details</h3>
                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                                <div className="text-gray-500">Email:</div>
                                <div className="font-medium">{doctor.personalInfo?.email || doctor.credentials?.email || 'N/A'}</div>

                                <div className="text-gray-500">Phone:</div>
                                <div className="font-medium">{doctor.personalInfo?.phone || 'N/A'}</div>

                                <div className="text-gray-500">Address:</div>
                                <div className="font-medium">{doctor.personalInfo?.address || 'N/A'}</div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Qualifications & Clinic */}
                    <div className="space-y-6">
                        <section className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">Professional Info</h3>
                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                                <div className="text-gray-500">Degree:</div>
                                <div className="font-medium">{doctor.professionalInfo?.degree || 'N/A'}</div>

                                <div className="text-gray-500">Specialization:</div>
                                <div className="font-medium">{doctor.professionalInfo?.specialization || 'N/A'}</div>

                                <div className="text-gray-500">Reg. Number:</div>
                                <div className="font-medium">{doctor.professionalInfo?.registrationNumber || 'N/A'}</div>

                                <div className="text-gray-500">Experience:</div>
                                <div className="font-medium">{doctor.professionalInfo?.yearsOfExperience ? `${doctor.professionalInfo.yearsOfExperience} Years` : 'N/A'}</div>

                                <div className="text-gray-500">Degree Cert:</div>
                                <div>{renderDocumentLink("Degree Certificate", doctor.verificationDocuments?.degreeCert)}</div>

                                <div className="text-gray-500">Reg Cert:</div>
                                <div>{renderDocumentLink("Registration Certificate", doctor.verificationDocuments?.regCert)}</div>

                                <div className="text-gray-500 col-span-2">Other Certs:</div>
                                <div className="col-span-2 space-y-1">
                                    {doctor.verificationDocuments?.otherCerts?.length > 0 ? (
                                        doctor.verificationDocuments.otherCerts.map((url: string, index: number) => (
                                            <div key={index}>{renderDocumentLink(`Document ${index + 1}`, url)}</div>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-sm italic">None provided</span>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">Clinic Info</h3>
                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                                <div className="text-gray-500">Clinic Name:</div>
                                <div className="font-medium">{doctor.clinicInfo?.clinicName || 'N/A'}</div>

                                <div className="text-gray-500">Clinic Address:</div>
                                <div className="font-medium">{doctor.clinicInfo?.clinicAddress || 'N/A'}</div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={() => onReject(doctor.id)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold transition-colors"
                    >
                        <XCircle className="w-5 h-5" /> Reject Application
                    </button>
                    <button
                        onClick={() => onApprove(doctor.id)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
                    >
                        <Check className="w-5 h-5" /> Approve Doctor
                    </button>
                </div>
            </div>
        </div>
    )
}
