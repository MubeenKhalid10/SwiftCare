'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { getReviews, deleteReview, getPatients, getDoctors } from '@/lib/api'
import type { Review, Patient, Doctor } from '@/lib/types'
import { LogoLoader } from '@/components/ui/logo-loader'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://swiftcare.up.railway.app').replace(/\/+$/, '')

export default function ReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [patients, setPatients] = useState<Record<string, Patient>>({})
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({})
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewsData, patientsData, doctorsData] = await Promise.all([
          getReviews(),
          getPatients(),
          getDoctors()
        ])

        const patientsMap: Record<string, Patient> = {}
        patientsData.forEach((p) => {
          patientsMap[String(p.id)] = p
        })

        const doctorsMap: Record<string, Doctor> = {}
        doctorsData.forEach((d) => {
          doctorsMap[String(d.id)] = d
        })

        setPatients(patientsMap)
        setDoctors(doctorsMap)
        setReviews(reviewsData)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (message === 'Unauthorized') {
          router.push('/admin/login')
          return
        }

        setError('Failed to load reviews')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return
    
    try {
      setIsDeleting(id)
      await deleteReview(id)
      setReviews(reviews.filter(r => String(r.id) !== String(id)))
    } catch (err) {
      alert("Failed to delete review")
      console.error(err)
    } finally {
      setIsDeleting(null)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">Loading...</div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center text-red-600 py-12">{error}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-gray-600">Dashboard / Reviews</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Doctor Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">
                    {patients[review.patientId]?.name ?? 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {doctors[review.doctorId]?.name ?? 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{review.comment}</td>
                  <td className="px-6 py-4 text-sm">{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => handleDelete(review.id)}
                      disabled={isDeleting === review.id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {isDeleting === review.id ? <LogoLoader size={16} className="h-4 w-4" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-gray-200 text-right text-sm text-gray-600">
            Showing 1 to {reviews.length} of {reviews.length} entries
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

