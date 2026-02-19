'use client'

import { Button } from '@/components/ui/button'
import AdminLayout from '@/components/admin/admin-layout'

export default function AdminProfilePage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-600">Dashboard / Profile</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold">Ryan Taylor</h2>
              <p className="text-gray-600">ryantaylor@admin.com</p>
              <p className="text-gray-600 flex items-center gap-1">📍 Florida, United States</p>
              <p className="text-gray-600 mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white ml-auto">Edit</Button>
          </div>

          <div className="flex gap-4 border-b border-gray-200 mb-6">
            <button className="px-4 py-2 text-cyan-500 border-b-2 border-cyan-500 font-medium">About</button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800">Password</button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Name</p>
                <p className="font-medium">John Doe</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Date of Birth</p>
                <p className="font-medium">24 Jul 1983</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email ID</p>
                <p className="font-medium">johndoe@example.com</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Mobile</p>
                <p className="font-medium">305-310-5857</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600 text-sm">Address</p>
                <p className="font-medium">4663 Agriculture Lane, Miami, Florida - 33165, United States.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
