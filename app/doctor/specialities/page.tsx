'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';

export default function DoctorSpecialities() {
  const [specialities, setSpecialities] = useState([
    { id: 1, name: 'Cardiology', service: '', price: '' },
    { id: 2, name: 'Neurology', service: 'Surgery', price: '454' },
    { id: 3, name: 'Urology', service: 'General Checkup', price: '454' },
  ]);

  const handleAddSpeciality = () => {
    setSpecialities([...specialities, { id: Date.now(), name: '', service: '', price: '' }]);
  };

  const handleDeleteSpeciality = (id: number) => {
    setSpecialities(specialities.filter(s => s.id !== id));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <DoctorSidebar />
          <div className="flex-1">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>Doctor</span>
                      <span>&gt;</span>
                      <span>Speciality & Services</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Speciality & Services</h1>
                  </div>
                  <Button className="rounded-full">Add New Speciality</Button>
                </div>
              </div>

              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6">Speciality & Services</h2>

                  <div className="space-y-6">
                    {specialities.map((spec) => (
                      <div key={spec.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold">{spec.name}</h3>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteSpeciality(spec.id)} className="text-red-600">
                            Delete ▼
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Speciality *</label>
                            <select className="mt-1 w-full px-3 py-2 border rounded-lg bg-white">
                              <option>Select Speciality</option>
                              <option>Cardiology</option>
                              <option>Neurology</option>
                              <option>Urology</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Service *</label>
                              <select className="mt-1 w-full px-3 py-2 border rounded-lg bg-white">
                                <option>Select Service</option>
                                <option>Surgery</option>
                                <option>General Checkup</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Price ($) *</label>
                              <Input type="text" placeholder="454" className="mt-1" />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700">About Service</label>
                            <Input type="text" placeholder="" className="mt-1" />
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                            <Link href="#" className="text-blue-600 text-sm hover:underline">Add New Service</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-blue-600">Save Changes</Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// Add missing Link import
import Link from 'next/link';
