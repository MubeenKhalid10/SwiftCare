'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'

type Review = {
  id: string
  patientId: string
  doctorId: string
  rating: number
  description: string
  date: string
}

type Patient = {
  id: string
  name: string
}

type Doctor = {
  id: string
  name: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [patients, setPatients] = useState<Record<string, Patient>>({})
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewsRes, patientsRes, doctorsRes] = await Promise.all([
          fetch('https://swiftcare.up.railway.app/reviews'),
          fetch('https://swiftcare.up.railway.app/patients'),
          fetch('https://swiftcare.up.railway.app/doctors')
        ])

        if (!reviewsRes.ok || !patientsRes.ok || !doctorsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const reviewsData: Review[] = await reviewsRes.json()
        const patientsData: Patient[] = await patientsRes.json()
        const doctorsData: Doctor[] = await doctorsRes.json()

        // Convert patients and doctors arrays to a map for easy lookup
        const patientsMap: Record<string, Patient> = {}
        patientsData.forEach((p) => {
          patientsMap[p.id] = p
        })

        const doctorsMap: Record<string, Doctor> = {}
        doctorsData.forEach((d) => {
          doctorsMap[d.id] = d
        })

        setPatients(patientsMap)
        setDoctors(doctorsMap)
        setReviews(reviewsData)
      } catch (err) {
        setError('Failed to load reviews')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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
                  <td className="px-6 py-4 text-sm text-gray-600">{review.description}</td>
                  <td className="px-6 py-4 text-sm">{review.date}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
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
