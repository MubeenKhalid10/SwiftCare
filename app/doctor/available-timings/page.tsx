'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';

export default function AvailableTimings() {
  const [tab, setTab] = useState('general');
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'];

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
                  <span>Available Timings</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Available Timings</h1>
              </div>

              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6">Available Timings</h2>

                  <div className="flex gap-2 mb-6">
                    <Button variant={tab === 'general' ? 'default' : 'outline'} onClick={() => setTab('general')}>
                      General Availability
                    </Button>
                    <Button variant={tab === 'clinic' ? 'default' : 'outline'} onClick={() => setTab('clinic')}>
                      Clinic Availability
                    </Button>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4">Select Available Slots</h3>
                    <p className="text-sm text-gray-600 mb-3">Select Available days</p>
                    <div className="flex flex-wrap gap-2">
                      {days.map((day) => (
                        <Button
                          key={day}
                          variant={selectedDay === day ? 'default' : 'outline'}
                          onClick={() => setSelectedDay(day)}
                          className="text-sm"
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4">{selectedDay}</h3>
                    <div className="flex flex-wrap gap-3">
                      {timeSlots.map((slot) => (
                        <Button key={slot} variant="outline" className="text-sm bg-transparent">
                          🕐 {slot}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700">Appointment Fees ($)</label>
                    <Input type="text" defaultValue="254" className="mt-2 w-32" />
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t">
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
