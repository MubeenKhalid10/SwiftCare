'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';

export default function DoctorMyPatients() {
  const [filter, setFilter] = useState('active');

  const patients = [
    { id: '#Apr0001', name: 'Adrian', age: 42, gender: 'Male', blood: 'A+', time: '11 Nov 2024 10:45 AM', location: 'Alabama, USA', lastBooking: '27 Feb 2024' },
    { id: '#Apr0002', name: 'Kelly Stevens', age: 37, gender: 'Female', blood: 'O+', time: '05 Nov 2024 11:50 AM', location: 'San Diego, USA', lastBooking: '20 Mar 2024' },
    { id: '#Apr0003', name: 'Samuel James', age: 41, gender: 'Male', blood: 'B+', time: '27 Oct 2024 09:30 AM', location: 'Chicago, USA', lastBooking: '12 Mar 2024' },
    { id: '#Apr0004', name: 'Catherine Gracey', age: 36, gender: 'Female', blood: 'AB-', time: '18 Oct 2024 12:20 PM', location: 'Los Angeles, USA', lastBooking: '27 Feb 2024' },
    { id: '#Apr0005', name: 'Robert Hutchinson', age: 38, gender: 'Male', blood: 'A+', time: '10 Oct 2024 11:30 AM', location: 'Dallas, USA', lastBooking: '18 Feb 2024' },
    { id: '#Apr0006', name: 'Anderea Kearns', age: 40, gender: 'Female', blood: 'B-', time: '26 Sep 2024 10:20 AM', location: 'San Francisco, USA', lastBooking: '11 Feb 2024' },
    { id: '#Apr0007', name: 'Peter Anderson', age: 30, gender: 'Male', blood: 'A-', time: '14 Sep 2024 08:10 AM', location: 'Austin, USA', lastBooking: '25 Jan 2024' },
    { id: '#Apr0008', name: 'Emily Musick', age: 32, gender: 'Female', blood: 'D-', time: '03 Sep 2024 06:00 PM', location: 'Nashville, USA', lastBooking: '13 Jan 2024' },
    { id: '#Apr0009', name: 'Darrell Tan', age: 31, gender: 'Male', blood: 'AB+', time: '25 Aug 2024 10:45 AM', location: 'San Antonio, USA', lastBooking: '03 Jan 2024' },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <DoctorSidebar />
          <div className="flex-1">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Doctor</span>
                  <span>&gt;</span>
                  <span>My Patients</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
              </div>

              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">My Patients</h2>
                    <div className="flex items-center gap-4">
                      <Input placeholder="Search" className="w-48" />
                      <Button variant="outline" size="sm">Filter By</Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <Button variant={filter === 'active' ? 'default' : 'outline'} onClick={() => setFilter('active')}>
                      Active <Badge className="ml-2">250</Badge>
                    </Button>
                    <Button variant={filter === 'inactive' ? 'default' : 'outline'} onClick={() => setFilter('inactive')}>
                      InActive <Badge className="ml-2" variant="outline">22</Badge>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.map((patient) => (
                      <div key={patient.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <span>🧑</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-600">{patient.id}</p>
                            <p className="font-semibold">{patient.name}</p>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-3">
                          <p>Age: {patient.age} | {patient.gender} | {patient.blood}</p>
                        </div>

                        <div className="space-y-2 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span>●</span>
                            <span>{patient.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span>{patient.location}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t text-xs text-gray-500">
                          <p>Last Booking {patient.lastBooking}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <Button variant="outline" className="text-gray-600 bg-transparent">Load More</Button>
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
