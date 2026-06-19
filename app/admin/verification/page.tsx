"use client"

import React, { useEffect, useState } from "react"
import { getDoctors, getFacilities, approveDoctorVerification, rejectDoctorVerification, createFacility, updateFacility, updateDoctor } from "@/lib/api"
import { geocodeAddressWithMapbox } from "@/lib/location"
import type { Doctor, Facility } from "@/lib/types"
import { Search, ShieldCheck, Eye, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { DoctorVerificationModal } from "@/components/admin/doctor-verification-modal"
import AdminLayout from "@/components/admin/admin-layout"
import { LogoLoader } from "@/components/ui/logo-loader"
import { useRequireAuth } from "@/hooks/use-require-auth"

function AdminVerificationPageContent() {
    const { isLoading: authLoading } = useRequireAuth({ role: 'admin', loginPath: '/admin/login' })
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState<"action-required" | "approved" | "rejected" | "all">("action-required")

    const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchDoctors()
        fetchFacilities()
    }, [])

    const fetchDoctors = async () => {
        try {
            setLoading(true)
            const data = await getDoctors(undefined, undefined, true)
            // Sort so 'pending' doctors are on top (need action first)
            const sorted = data.sort((a, b) => {
                if (a.accountStatus?.verificationStatus === 'pending' && b.accountStatus?.verificationStatus !== 'pending') return -1;
                if (b.accountStatus?.verificationStatus === 'pending' && a.accountStatus?.verificationStatus !== 'pending') return 1;
                return 0;
            });
            setDoctors(sorted)
        } catch (error) {
            toast.error("Failed to fetch doctors")
        } finally {
            setLoading(false)
        }
    }

    const fetchFacilities = async () => {
        try {
            const data = await getFacilities(1, 100)
            setFacilities(data.items || [])
        } catch (error) {
            console.error("Failed to fetch facilities for verification review", error)
            setFacilities([])
        }
    }

    const getDoctorCurrentFacility = (doctorId: string, pendingAffiliation?: any) => {
        const pendingFacilityId = String(pendingAffiliation?.hospitalId || "")
        const matches = facilities.filter((facility) => {
            const doctorList = Array.isArray(facility.doctorList) ? facility.doctorList : []
            return doctorList.some((doctor) => String(typeof doctor === 'string' ? doctor : doctor.id || (doctor as any)._id) === doctorId)
        })

        if (matches.length === 0) return null

        const nonPending = matches.find((facility) => String(facility.id || facility._id) !== pendingFacilityId)
        return nonPending || matches[0] || null
    }

    const handleApprove = async (id: string) => {
        try {
            setActionLoading(id)
            
            // Auto-affiliate if a registered hospital was selected
            const doc = doctors.find(d => String((d as any)._id || d.id) === id)
            const affiliation = (doc as any)?.hospitalAffiliation
            
            if (affiliation && (affiliation.type === 'registered' || affiliation.affiliationType === 'registered') && affiliation.hospitalId) {
                const facility = facilities.find((item) => String(item.id || item._id) === String(affiliation.hospitalId))
                
                if (facility) {
                    const currentList = Array.isArray(facility.doctorList) 
                        ? facility.doctorList.map((d: any) => typeof d === 'string' ? d : String(d._id || d.id))
                        : []
                    
                    if (!currentList.includes(id)) {
                        await updateFacility(String(facility.id || (facility as any)._id), {
                            doctorList: [...currentList, id]
                        } as any)
                    }
                }
            }

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

    // Filter doctors based on active tab and search
    const getFilteredDoctors = () => {
        let filtered = doctors

        // Apply status filter based on active tab
        switch (activeTab) {
            case 'action-required':
                // Backend sets 'submitted' on form submit; 'pending' is the intended label
                filtered = doctors.filter(doc =>
                    doc.accountStatus?.verificationStatus === 'pending' ||
                    doc.accountStatus?.verificationStatus === 'submitted'
                )
                break
            case 'approved':
                filtered = doctors.filter(doc => doc.accountStatus?.verificationStatus === 'approved')
                break
            case 'rejected':
                filtered = doctors.filter(doc => doc.accountStatus?.verificationStatus === 'rejected')
                break
            case 'all':
                filtered = doctors
                break
        }

        // Apply search filter
        return filtered.filter(doc =>
            doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.credentials?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    const filteredDoctors = getFilteredDoctors()

    // Get tab counts
    const getCounts = () => ({
        actionRequired: doctors.filter(d =>
            d.accountStatus?.verificationStatus === 'pending' ||
            d.accountStatus?.verificationStatus === 'submitted'
        ).length,
        approved: doctors.filter(d => d.accountStatus?.verificationStatus === 'approved').length,
        rejected: doctors.filter(d => d.accountStatus?.verificationStatus === 'rejected').length,
        all: doctors.length
    })

    const counts = getCounts()

    // Helper badge color
    const handleAddAndAffiliateHospital = async (doctorId: string, hospitalName: string, hospitalLocation: string, hospitalImage?: File | string) => {
        try {
            setActionLoading(doctorId)
            const trimmedLocation = String(hospitalLocation || '').trim()
            if (!trimmedLocation) {
                toast.error('Hospital location is required')
                return
            }

            const resolvedLocation = await geocodeAddressWithMapbox(trimmedLocation)
            if (!resolvedLocation) {
                toast.error('Unable to fetch coordinates for this location')
                return
            }

            const [lng, lat] = resolvedLocation.coordinates
            let uploadedHospitalImageUrl: string | undefined

            if (hospitalImage instanceof File) {
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

                if (cloudName && uploadPreset) {
                    const formData = new FormData()
                    formData.append('file', hospitalImage)
                    formData.append('upload_preset', uploadPreset)

                    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
                        method: 'POST',
                        body: formData,
                    })

                    if (!uploadResponse.ok) {
                        throw new Error('Hospital image upload failed')
                    }

                    const uploadData = await uploadResponse.json()
                    uploadedHospitalImageUrl = uploadData.secure_url
                }
            } else if (typeof hospitalImage === 'string') {
                uploadedHospitalImageUrl = hospitalImage.trim() || undefined
            }

            // Create the facility
            const newFacility = await createFacility({
                name: hospitalName,
                about: '',
                image: uploadedHospitalImageUrl,
                location: {
                    label: resolvedLocation.label || trimmedLocation,
                    coordinates: [lng, lat],
                    geo: { type: 'Point', coordinates: [lng, lat] }
                },
                doctorList: [doctorId]
            } as any)
            // Auto-affiliate: add doctor to facility doctorList
            const facilityId = String((newFacility as any).id || (newFacility as any)._id || '')
            if (facilityId) {
                const currentList: string[] = Array.isArray((newFacility as any).doctorList)
                    ? (newFacility as any).doctorList.map((d: any) => typeof d === 'string' ? d : (d._id || d.id))
                    : []
                if (!currentList.includes(doctorId)) {
                    await updateFacility(facilityId, { doctorList: [...currentList, doctorId] } as any)
                }

                // Update doctor to link to this new facility and update location
                await updateDoctor(doctorId, {
                    hospitalAffiliation: {
                        affiliationType: 'registered',
                        type: 'registered',
                        hospitalId: facilityId,
                        hospitalName: hospitalName,
                        hospitalLocation: resolvedLocation.label || trimmedLocation
                    } as any,
                    location: {
                        label: resolvedLocation.label || trimmedLocation,
                        geo: { type: 'Point', coordinates: [lng, lat] }
                    } as any
                })
            }
            toast.success(`Hospital "${hospitalName}" added & doctor affiliated successfully!`)
            setSelectedDoctor(null)
            fetchDoctors()
        } catch (err: any) {
            toast.error(err.message || 'Failed to add hospital')
        } finally {
            setActionLoading(null)
        }
    }

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'approved':
                return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 w-fit"><ShieldCheck className="w-3 h-3" /> Approved</span>
            case 'rejected':
                return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Rejected</span>
            case 'pending':
            case 'submitted':
                return <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1 w-fit animate-pulse"><AlertCircle className="w-3 h-3" /> Action Required</span>
            default:
                return <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold w-fit">Unknown</span>
        }
    }

    if (authLoading) {
        return (
            <div className="flex justify-center py-20">
                <LogoLoader size={32} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Doctor Verification</h1>
                <p className="text-muted-foreground mt-1">Review and manage doctor applications</p>
            </div>

            {/* Tabs */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('action-required')}
                        className={`flex-1 px-6 py-4 text-center font-semibold transition-colors border-b-2 ${activeTab === 'action-required'
                                ? 'text-primary border-b-primary bg-icon-bg/50'
                                : 'text-muted-foreground border-b-transparent hover:bg-muted'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>Action Required</span>
                            {counts.actionRequired > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                                    {counts.actionRequired}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`flex-1 px-6 py-4 text-center font-semibold transition-colors border-b-2 ${activeTab === 'approved'
                                ? 'text-primary border-b-primary bg-icon-bg/50'
                                : 'text-muted-foreground border-b-transparent hover:bg-muted'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Approved</span>
                            {counts.approved > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                    {counts.approved}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`flex-1 px-6 py-4 text-center font-semibold transition-colors border-b-2 ${activeTab === 'rejected'
                                ? 'text-primary border-b-primary bg-icon-bg/50'
                                : 'text-muted-foreground border-b-transparent hover:bg-muted'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <XCircle className="w-4 h-4" />
                            <span>Rejected</span>
                            {counts.rejected > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {counts.rejected}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 px-6 py-4 text-center font-semibold transition-colors border-b-2 ${activeTab === 'all'
                                ? 'text-primary border-b-primary bg-icon-bg/50'
                                : 'text-muted-foreground border-b-transparent hover:bg-muted'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span>All Doctors</span>
                            {counts.all > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                                    {counts.all}
                                </span>
                            )}
                        </div>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-border bg-muted">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by doctor name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LogoLoader size={32} className="h-8 w-8" />
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <ShieldCheck className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-lg font-medium">No doctors found.</p>
                        <p className="text-sm">{activeTab === 'all' ? 'No doctors in the system yet.' : 'No doctors in this category.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Doctor Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Email</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Specialization</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredDoctors.map((doc) => (
                                    <tr key={doc._id || doc.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{doc.name}</div>
                                            <div className="text-sm text-muted-foreground">ID: {String(doc._id || doc.id).slice(-8)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-foreground">{doc.credentials?.email || doc.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-foreground/80">{doc.specialization || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(doc.accountStatus?.verificationStatus)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {(doc.accountStatus?.verificationStatus === 'pending' || doc.accountStatus?.verificationStatus === 'submitted') ? (
                                                <button
                                                    onClick={() => setSelectedDoctor(doc)}
                                                    className="flex items-center gap-1 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-semibold transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" /> Review
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedDoctor(doc)}
                                                    className="flex items-center gap-1 px-3 py-1.5 border border-border text-muted-foreground hover:bg-muted rounded-lg text-sm font-medium transition-colors"
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
                    currentFacility={getDoctorCurrentFacility(String(selectedDoctor._id || selectedDoctor.id), selectedDoctor.hospitalAffiliation)}
                    onClose={() => setSelectedDoctor(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onAddAndAffiliateHospital={handleAddAndAffiliateHospital}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    )
}

export default function AdminVerificationPage() {
    return (
        <AdminLayout>
            <AdminVerificationPageContent />
        </AdminLayout>
    )
}
