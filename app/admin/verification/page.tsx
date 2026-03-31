"use client"

import React, { useEffect, useState } from "react"
import { getDoctors, approveDoctorVerification, rejectDoctorVerification } from "@/lib/api"
import type { Doctor } from "@/lib/types"
import { Loader2, Search, Filter, ShieldCheck, Eye, Clock, XCircle } from "lucide-react"
import { toast } from "sonner"
import { DoctorVerificationModal } from "@/components/admin/doctor-verification-modal"

export default function AdminVerificationPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "submitted" | "approved" | "rejected" | "pending">("submitted")

    const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchDoctors()
    }, [])

    const fetchDoctors = async () => {
        try {
            setLoading(true)
            const data = await getDoctors()
            // Sort so 'submitted' are on top
            const sorted = data.sort((a, b) => {
                if (a.verificationStatus === 'submitted' && b.verificationStatus !== 'submitted') return -1;
                if (b.verificationStatus === 'submitted' && a.verificationStatus !== 'submitted') return 1;
                return 0;
            });
            setDoctors(sorted)
        } catch (error) {
            toast.error("Failed to fetch doctors")
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id: string) => {
        try {
            setActionLoading(id)
            await approveDoctorVerification(id)
            toast.success("Doctor approved successfully!")
            setSelectedDoctor(null)
            fetchDoctors() // refresh data
        } catch (err: any) {
            toast.error(err.message || "Approval failed")
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id: string) => {
        try {
            setActionLoading(id)
            await rejectDoctorVerification(id)
            toast.success("Doctor application rejected!")
            setSelectedDoctor(null)
            fetchDoctors() // refresh data
        } catch (err: any) {
            toast.error(err.message || "Rejection failed")
        } finally {
            setActionLoading(null)
        }
    }

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" ? true : doc.verificationStatus === statusFilter

        // We only care about filtering if they have *started* the form ('submitted', 'approved', 'rejected') 
        // but we can expose 'pending' if the admin wants to know who signed up but hasn't uploaded docs.
        return matchesSearch && matchesStatus
    })

    // Helper badge color
    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'approved': return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Approved</span>
            case 'rejected': return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>
            case 'submitted': return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1 animate-pulse"><Clock className="w-3 h-3" /> Needs Review</span>
            default: return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">Pending Docs</span>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
                    <p className="text-gray-500 mt-1">Review and approve doctor registrations</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 p-1">
                    <button
                        onClick={() => setStatusFilter('submitted')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === 'submitted' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Action Required
                    </button>
                    <button
                        onClick={() => setStatusFilter('approved')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === 'approved' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setStatusFilter('rejected')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === 'rejected' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Rejected
                    </button>
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        All Doctors
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search doctors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <ShieldCheck className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-lg font-medium">No doctors found in this category.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Doctor Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredDoctors.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{doc.name}</div>
                                            <div className="text-sm text-gray-500">ID: {doc.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{doc.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(doc.verificationStatus)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {doc.verificationStatus === 'submitted' ? (
                                                <button
                                                    onClick={() => setSelectedDoctor(doc)}
                                                    className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" /> Review
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedDoctor(doc)}
                                                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    View Details
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Verification Modal */}
            {selectedDoctor && (
                <DoctorVerificationModal
                    doctor={selectedDoctor}
                    onClose={() => setSelectedDoctor(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    )
}
