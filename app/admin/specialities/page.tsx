'use client'

import { Trash2, Edit } from 'lucide-react'
import AdminLayout from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'

const specialitiesData = [
  { id: '#SP001', name: 'Urology', icon: 'kidney' },
  { id: '#SP002', name: 'Neurology', icon: 'brain' },
  { id: '#SP003', name: 'Orthopedic', icon: 'bone' },
  { id: '#SP004', name: 'Cardiologist', icon: 'heart' },
  { id: '#SP005', name: 'Dentist', icon: 'tooth' }
]

export default function SpecialitiesPage() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Specialities</h1>
            <p className="text-gray-600">Dashboard / Specialities</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add</Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Specialities</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {specialitiesData.map((spec, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{spec.id}</td>
                  <td className="px-6 py-4 text-sm font-medium flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-500 text-lg">☆</span>
                    </div>
                    {spec.name}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="text-blue-600 hover:text-blue-700">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-gray-200 text-right text-sm text-gray-600">
            Showing 1 to 5 of 5 entries
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
