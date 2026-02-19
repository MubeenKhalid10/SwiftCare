'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Change Password' },
    { id: 'security', label: '2 Factor Authentication' },
    { id: 'delete', label: 'Delete Account' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
          <span className="text-blue-600">●</span>
          <span>Patient</span>
          <span>›</span>
          <span>Settings</span>
        </div>

        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-lg p-6 mb-8">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-blue-400"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <h3 className="text-white text-center font-bold text-lg mb-1">Hendrita Hayes</h3>
              <p className="text-blue-200 text-center text-sm mb-4">Patient ID : PT254654</p>
              <p className="text-blue-200 text-center text-sm">Female • 32 years 03 Months</p>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <span>⊞</span>
                <span>Dashboard</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <span>📅</span>
                <span>My Appointments</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <span>☆</span>
                <span>Favourites</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <span>👥</span>
                <span>Dependants</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <span>📋</span>
                <span>Medical Records</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <span>💳</span>
                <span>Wallet</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <span>📄</span>
                <span>Invoices</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <span>💬</span>
                <span>Message</span>
                <span className="ml-auto bg-yellow-400 text-xs text-white px-2 py-1 rounded-full">1</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <span>❤️</span>
                <span>Vitals</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded cursor-pointer">
                <span>⚙️</span>
                <span>Settings</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                <span>⤎</span>
                <span>Logout</span>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-semibold rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Profile Tab Content */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-8">Profile Settings</h2>

                {/* Profile Photo */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">📷</span>
                    </div>
                    <div>
                      <Button variant="outline" className="mr-2 bg-transparent">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload New
                      </Button>
                      <Button variant="ghost" className="text-red-600 hover:text-red-700">
                        Remove
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">Your image should be Below 4 MB, Accepted format jpg,png,svg</p>
                    </div>
                  </div>
                </div>

                {/* Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Information</h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                      <Input placeholder="First Name" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                      <Input placeholder="Last Name" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                      <Input type="date" className="w-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                      <Input placeholder="Phone Number" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <Input type="email" placeholder="Email Address" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Select</option>
                        <option>O+</option>
                        <option>O-</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Address</h3>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                    <Input placeholder="Address" className="w-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                      <Input placeholder="City" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                      <Input placeholder="State" className="w-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                      <Input placeholder="Country" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                      <Input placeholder="Pincode" className="w-full" />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
