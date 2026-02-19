'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';
import { useAuth } from '@/lib/auth-context';
import { getAppointmentsByDoctorId, getPatients, getReviewsByDoctorId } from '@/lib/api';
import type { Appointment, Patient, Review } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'doctor') {
        router.push('/auth/login');
        return;
      }

      async function fetchData() {
        try {
          const [aptsData, patientsData, reviewsData] = await Promise.all([
            getAppointmentsByDoctorId(String(user?.id)),
            getPatients(),
            getReviewsByDoctorId(String(user?.id)),
          ]);
          setDoctorAppointments(aptsData);
          setPatients(patientsData);
          setReviews(reviewsData);
        } catch (err) {
          console.error('Error fetching data:', err);
        } finally {
          setIsLoading(false);
        }
      }

      fetchData();
    }
  }, [isAuthenticated, user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const weeklyData = [
    { day: 'M', revenue: 45, appointments: 32 },
    { day: 'T', revenue: 52, appointments: 38 },
    { day: 'W', revenue: 48, appointments: 35 },
    { day: 'T', revenue: 61, appointments: 42 },
    { day: 'F', revenue: 55, appointments: 40 },
    { day: 'S', revenue: 67, appointments: 48 },
    { day: 'S', revenue: 72, appointments: 50 },
  ];

  const recentAppointments = [
    { id: '#Apr0001', patient: 'Adrian Marshall', time: '11 Nov 2024 10:45 AM', status: 'General', badge: 'General' },
    { id: '#Apr0005', patient: 'Kelly Stevens', time: '10 Nov 2024 11:00 AM', status: 'General', badge: 'Confirmed' },
    { id: '#Apr0003', patient: 'Samuel Anderson', time: '03 Nov 2024 02:00 PM', status: 'General', badge: 'General' },
    { id: '#Apr0004', patient: 'Catherine Griffin', time: '01 Nov 2024 04:00 PM', status: 'General', badge: 'Confirmed' },
    { id: '#Apr0005', patient: 'Robert Hutchinson', time: '28 Oct 2024 05:30 PM', status: 'General', badge: 'General' },
  ];

  const recentPatients = [
    { id: '#Apr0001', name: 'Adrian Marshall', lastAppointment: '15 Mar 2024', avatar: '/patient-1.jpg' },
    { id: '#Apr0002', name: 'Kelly Stevens', lastAppointment: '13 Mar 2024', avatar: '/patient-2.jpg' },
  ];

  const invoices = [
    { id: '#Apr0001', patient: 'Adrian', amount: '$450', date: '11 Nov 2024', status: 'Paid On' },
    { id: '#Apr0002', patient: 'Kelly', amount: '$500', date: '10 Nov 2024', status: 'Paid On' },
    { id: '#Apr0003', patient: 'Samuel', amount: '$320', date: '03 Nov 2024', status: 'Paid On' },
    { id: '#Apr0004', patient: 'Catherine', amount: '$240', date: '01 Nov 2024', status: 'Paid On' },
    { id: '#Apr0005', patient: 'Robert', amount: '$380', date: '28 Oct 2024', status: 'Paid On' },
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
                  <span>Dashboard</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Patient</p>
                        <p className="text-3xl font-bold">978</p>
                        <p className="text-xs text-green-600 mt-1">↑ 16% From Last Week</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600">👥</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Patients Today</p>
                        <p className="text-3xl font-bold">80</p>
                        <p className="text-xs text-green-600 mt-1">↑ 16% From Yesterday</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600">👤</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Appointments Today</p>
                        <p className="text-3xl font-bold">50</p>
                        <p className="text-xs text-green-600 mt-1">↑ 30% From Yesterday</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600">📅</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-3xl font-bold">$2,856</p>
                        <p className="text-xs text-green-600 mt-1">↑ 15% From Yesterday</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600">💰</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Overview Mar 14 - Mar 21</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          <span className="text-sm text-gray-600">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                          <span className="text-sm text-gray-600">Appointments</span>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="revenue" fill="#3b82f6" />
                          <Bar dataKey="appointments" fill="#fbbf24" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Appointment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-600 rounded-lg p-4 text-white mb-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center">
                          <span>🧑</span>
                        </div>
                        <div>
                          <p className="font-semibold">#Apr0001</p>
                          <p className="text-sm">Adrian Marshall</p>
                        </div>
                      </div>
                      <p className="text-sm mb-3">General visit</p>
                      <p className="text-sm mb-4">Today, 10:45 AM</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs bg-white text-blue-600 hover:bg-gray-100">
                          Video Appointment
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs bg-white text-blue-600 hover:bg-gray-100">
                          Chat Now
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs bg-white text-blue-600 hover:bg-gray-100">
                          Start Appointment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Invoices</CardTitle>
                    <Link href="/doctor/invoices" className="text-blue-600 text-sm hover:underline">
                      View All
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span>🧑</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{invoice.patient}</p>
                              <p className="text-xs text-gray-500">{invoice.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">{invoice.amount}</p>
                            <p className="text-xs text-gray-500">{invoice.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Patients</CardTitle>
                    <Link href="/doctor/my-patients" className="text-blue-600 text-sm hover:underline">
                      View All
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {recentPatients.map((patient) => (
                        <div key={patient.id} className="text-center">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full flex items-center justify-center mb-2">
                            <span className="text-2xl">🧑</span>
                          </div>
                          <p className="font-medium text-sm">{patient.name}</p>
                          <p className="text-xs text-gray-500">{patient.id}</p>
                          <p className="text-xs text-gray-500 mt-1">Last Appointment</p>
                          <p className="text-xs font-medium">{patient.lastAppointment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Appointments</CardTitle>
                    <span className="text-sm text-gray-500">Last 7 Days</span>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {doctorAppointments.map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium text-sm">{apt.id}</p>
                            <p className="text-sm text-gray-600">{apt.patient}</p>
                            <p className="text-xs text-gray-500 mt-1">{apt.time}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{apt.status}</Badge>
                            <span className="text-green-600">✓</span>
                            <span className="text-red-600">✗</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Notifications</CardTitle>
                    <Link href="#" className="text-blue-600 text-sm hover:underline">
                      View All
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex gap-3 p-3 bg-purple-50 rounded border border-purple-200">
                        <span className="text-lg">📅</span>
                        <div>
                          <p className="text-sm font-medium">Booking Confirmed on 21 Mar 2024 10:30 AM</p>
                          <p className="text-xs text-gray-500">Just Now</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <span className="text-lg">⭐</span>
                        <div>
                          <p className="text-sm font-medium">You have a New Review for your Appointment</p>
                          <p className="text-xs text-gray-500">5 Days ago</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 bg-red-50 rounded border border-red-200">
                        <span className="text-lg">📢</span>
                        <div>
                          <p className="text-sm font-medium">You have Appointment with Ahmed by 01:20 PM 12:55 PM</p>
                          <p className="text-xs text-gray-500">2 Days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Clinics & Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center">
                          <span>🏥</span>
                        </div>
                        <div>
                          <p className="font-medium">Sofi's Clinic</p>
                          <p className="text-sm text-gray-600">$900</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Tue: 07:00 AM - 09:00 PM</p>
                      <p className="text-xs text-gray-500">Wed: 07:00 AM - 09:00 PM</p>
                      <Link href="#" className="text-blue-600 text-xs hover:underline mt-2 inline-block">
                        Change
                      </Link>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full flex items-center justify-center">
                          <span>🦷</span>
                        </div>
                        <div>
                          <p className="font-medium">The Family Dentistry...</p>
                          <p className="text-sm text-gray-600">$600</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Sat: 07:00 AM - 09:00 PM</p>
                      <p className="text-xs text-gray-500">Tue: 07:00 AM - 09:00 PM</p>
                      <Link href="#" className="text-blue-600 text-xs hover:underline mt-2 inline-block">
                        Change
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
