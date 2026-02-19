'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';

export default function DoctorAppointments() {
  const [filter, setFilter] = useState('upcoming');

  const appointments = [
    { id: '#Apr0001', patient: 'Adrian', time: '11 Nov 2024 10:45 AM', email: 'adran@example.com', type: 'General Visit', communication: 'Video Call', phone: '+1 504 368 6874' },
    { id: '#Apr0003', patient: 'Kelly', time: '05 Nov 2024 11:50 AM', email: 'kelly@example.com', type: 'General Visit', communication: 'Audio Call', phone: '+1 832 891 8403', badge: 'Pro' },
    { id: '#Apr0003', patient: 'Samuel', time: '27 Oct 2024 09:30 AM', email: 'samuel@example.com', type: 'General Visit', communication: 'Video Call', phone: '+1 749 104 6291' },
    { id: '#Apr0004', patient: 'Catherine', time: '18 Oct 2024 12:20 PM', email: 'catherine@example.com', type: 'General Visit', communication: 'Direct Visit', phone: '+1 584 920 7183' },
    { id: '#Apr0005', patient: 'Robert', time: '10 Oct 2024 11:30 AM', email: 'robert@example.com', type: 'General Visit', communication: 'Chat', phone: '+1 059 327 6729' },
    { id: '#Apr0006', patient: 'Anderea', time: '26 Sep 2024 10:20 AM', email: 'anderea@example.com', type: 'General Visit', communication: 'Chat', phone: '+1 278 402 7103' },
    { id: '#Apr0007', patient: 'Peter', time: '14 Sep 2024 08:10 AM', email: 'peter@example.com', type: 'General Visit', communication: 'Chat', phone: '+1 638 278 0249' },
    { id: '#Apr0008', patient: 'Emily', time: '03 Sep 2024 06:00 PM', email: 'emily@example.com', type: 'General Visit', communication: 'Video Call', phone: '+1 261 037 1873' },
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
                  <span>Appointments</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
              </div>

              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Appointments</h2>
                    <div className="flex items-center gap-4">
                      <Input placeholder="Search" className="w-48" />
                      <Button variant="outline" size="sm">📅</Button>
                      <Button variant="outline" size="sm">📊</Button>
                      <Button variant="outline" size="sm">📋</Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <Button variant={filter === 'upcoming' ? 'default' : 'outline'} onClick={() => setFilter('upcoming')}>
                      Upcoming <Badge className="ml-2">21</Badge>
                    </Button>
                    <Button variant={filter === 'cancelled' ? 'default' : 'outline'} onClick={() => setFilter('cancelled')}>
                      Cancelled <Badge className="ml-2" variant="outline">16</Badge>
                    </Button>
                    <Button variant={filter === 'completed' ? 'default' : 'outline'} onClick={() => setFilter('completed')}>
                      Completed <Badge className="ml-2" variant="outline">214</Badge>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {appointments.map((apt, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full flex items-center justify-center">
                            <span>🧑</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{apt.id}</p>
                            <p className="text-sm font-semibold">{apt.patient}</p>
                            {apt.badge && <Badge className="text-xs">{apt.badge}</Badge>}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <span>●</span>
                            <span>{apt.time}</span>
                          </div>
                          <span className="text-xs text-gray-600">{apt.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{apt.type}</span>
                          <span className="text-xs text-gray-600">{apt.communication}</span>
                          <span className="text-xs text-gray-600">{apt.phone}</span>
                          <Button size="sm" className="text-xs">Start Now</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
                    <Button variant="outline" size="sm">&lt;</Button>
                    <Button variant="outline" size="sm">1</Button>
                    <Button className="text-xs">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <Button variant="outline" size="sm">4</Button>
                    <span className="text-sm text-gray-600">...</span>
                    <Button variant="outline" size="sm">&gt;</Button>
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
