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
import { VerificationStatusAlert } from '@/components/doctor/verification-status-alert';
import { useAuth } from '@/lib/auth-context';
import { getAppointmentsByDoctorId, getPatients, getReviewsByDoctorId, getDoctorById, getDoctorInsights, getActiveShift, createShift, startRestShift, endRestShift, startShiftQueue, endShiftQueue, nextQueuePatient, getQueueState } from '@/lib/api';
import type { Appointment, Patient, Review, Doctor, DoctorInsights, Shift } from '@/lib/types';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { socket } from '@/lib/socket';

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [insights, setInsights] = useState<DoctorInsights | null>(null);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  const [showApprovalNotification, setShowApprovalNotification] = useState(false);

  const [queueStates, setQueueStates] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!socket.connected) socket.connect();
    
    const onQueueUpdated = (data: { shiftId: string, currentServing: number }) => {
      setQueueStates(prev => ({ ...prev, [data.shiftId]: data.currentServing }));
    };
    
    socket.on('queueUpdated', onQueueUpdated);
    return () => { socket.off('queueUpdated', onQueueUpdated); };
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'doctor') {
        router.push('/auth/login');
        return;
      }

      async function fetchData() {
        try {
          const profile = await getDoctorById(String(user?.id));
          
          // Check if verification status changed to approved
          if (previousStatus && previousStatus !== 'approved' && profile?.accountStatus?.verificationStatus === 'approved') {
            setShowApprovalNotification(true);
          }
          
          setPreviousStatus(profile?.accountStatus?.verificationStatus || 'pending');
          setDoctorProfile(profile);

          // Only fetch full stats if approved, to save load or just fetch anyway
          // We'll fetch anyway for now, but hide it in UI if pending
          const [aptsData, patientsData, reviewsData, insightsData, shiftData] = await Promise.all([
            getAppointmentsByDoctorId(String(user?.id)),
            getPatients(),
            getReviewsByDoctorId(String(user?.id)),
            getDoctorInsights(String(user?.id)),
            getActiveShift(String(user?.id))
          ]);
          setDoctorAppointments(aptsData);
          setPatients(patientsData);
          setReviews(reviewsData);
          setInsights(insightsData);
          setActiveShift(shiftData);
        } catch (err) {
          console.error('Error fetching data:', err);
        } finally {
          setIsLoading(false);
        }
      }

      fetchData();
    }
  }, [isAuthenticated, user, authLoading, router, previousStatus]);

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

  const weeklyData = insights?.weeklyOverview || [
    { day: 'M', revenue: 0, appointments: 0 },
    { day: 'T', revenue: 0, appointments: 0 },
    { day: 'W', revenue: 0, appointments: 0 },
    { day: 'T', revenue: 0, appointments: 0 },
    { day: 'F', revenue: 0, appointments: 0 },
    { day: 'S', revenue: 0, appointments: 0 },
    { day: 'S', revenue: 0, appointments: 0 },
  ];

  // Find the next upcoming appointment
  const nextAppointment = doctorAppointments
    .filter(apt => apt.status === 'Pending')
    .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())[0];

  // Get recent completed appointments (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCompletedAppointments = doctorAppointments
    .filter(apt => {
      if (!apt.date) return false;
      const aptDate = new Date(apt.date);
      return apt.status === 'Completed' && aptDate >= sevenDaysAgo;
    })
    .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
    .slice(0, 5);

  // Get unique recent patients from completed appointments
  const uniquePatientMap = new Map<string, any>();
  doctorAppointments
    .filter(apt => apt.status === 'Completed' && apt.patientId)
    .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
    .forEach(apt => {
      if (!uniquePatientMap.has(String(apt.patientId))) {
        const patient = patients.find(p => String(p.id) === String(apt.patientId));
        if (patient) {
          uniquePatientMap.set(String(apt.patientId), {
            id: apt.patientId,
            name: patient.name || apt.bookingFor || 'Patient',
            lastAppointment: apt.date,
            email: patient.email
          });
        }
      }
    });
  const recentPatients = Array.from(uniquePatientMap.values()).slice(0, 4);

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
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

                {/* Verification Status Alert Component */}
                <VerificationStatusAlert 
                  status={doctorProfile?.accountStatus?.verificationStatus}
                  showApprovalNotification={showApprovalNotification}
                  onDismiss={() => setShowApprovalNotification(false)}
                />

                {/* Show limited view if not verified */}
                {doctorProfile?.accountStatus?.verificationStatus !== 'approved' ? (
                  <Card className="text-center py-16 bg-gray-50 border-dashed">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Limited Access</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      You currently have limited access to the dashboard. Once your account is verified and approved, you will be able to manage appointments, patients, and view your revenue stats.
                    </p>
                  </Card>
                ) : (
                  <>
                  {/* Shift Management Component */}
                  <Card className="mb-6 bg-blue-50 border-blue-200 shadow-sm">
                    <CardHeader className="py-4">
                       <CardTitle className="text-blue-900 flex justify-between items-center text-lg">
                           <div className="flex items-center gap-2">
                             <Clock className="w-5 h-5" />
                             <span>Daily Shift Management</span>
                           </div>
                           <Badge variant="outline" className={activeShift?.status === 'active' ? "bg-green-100 text-green-800 border-green-300" : activeShift?.status === 'scheduled' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                               {activeShift ? activeShift.status.toUpperCase() : "NO SHIFT"}
                           </Badge>
                       </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!activeShift ? (
                           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                               <p className="text-sm text-gray-700">You don't have any shift scheduled for today. Create a shift so patients can book your slots and check in to the queue.</p>
                               <Button onClick={async () => {
                                   try {
                                     const res = await createShift({
                                        doctorId: String(user?.id),
                                        date: new Date().toISOString(),
                                        startTime: "09:00 AM",
                                        endTime: "05:00 PM",
                                        consultingFee: doctorProfile?.fee ? parseInt(doctorProfile.fee.replace(/[^0-9]/g, '')) : 100,
                                        isBookable: true
                                     });
                                     setActiveShift(res);
                                     toast.success("Shift created for today!");
                                   } catch (e) {
                                     toast.error("Failed to create shift")
                                   }
                               }}>Create Today's Shift</Button>
                           </div>
                        ) : activeShift.status === 'scheduled' ? (
                           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                               <div>
                                 <p className="text-sm text-gray-700 font-medium">You have a shift scheduled today from {activeShift.startTime} to {activeShift.endTime}.</p>
                                 <p className="text-xs text-gray-500 mt-1">Start your shift to begin accepting patients in the live queue.</p>
                               </div>
                               <Button onClick={async () => {
                                   try {
                                     // 1. Start Shift
                                     await startRestShift(String(activeShift._id || activeShift.id));
                                     // 2. Start Queue for Shift
                                     await startShiftQueue(String(activeShift._id || activeShift.id));
                                     setActiveShift({...activeShift, status: 'active'});
                                     toast.success("Shift started! The queue is now active.");
                                   } catch (e) {
                                     toast.error("Failed to start shift")
                                   }
                               }} className="bg-green-600 hover:bg-green-700">Start Shift</Button>
                           </div>
                        ) : activeShift.status === 'active' ? (
                           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                               <div>
                                 <p className="text-sm text-gray-700 font-medium whitespace-nowrap">Your shift is currently active.</p>
                                 <p className="text-xs text-green-700 font-semibold mt-1">Live queue is tracking {activeShift.patientsInQueue || 0} patients.</p>
                               </div>
                               <Button onClick={async () => {
                                   try {
                                     await endShiftQueue(String(activeShift._id || activeShift.id));
                                     await endRestShift(String(activeShift._id || activeShift.id));
                                     setActiveShift({...activeShift, status: 'ended'});
                                     toast.success("Shift ended successfully!");
                                   } catch (e) {
                                     toast.error("Failed to end shift")
                                   }
                               }} variant="destructive">End Shift</Button>
                           </div>
                        ) : (
                           <div className="flex items-center justify-between">
                               <p className="text-sm text-gray-700 font-medium">Your shift for today has been completed.</p>
                           </div>
                        )}
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Patients Seen</p>
                            <p className="text-3xl font-bold">{insights?.statistics.totalPatientsSeen || 0}</p>
                            <p className="text-xs text-green-600 mt-1">All time</p>
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
                            <p className="text-sm text-gray-600">Appointments Today</p>
                            <p className="text-3xl font-bold">{insights?.dailySummary.totalAppointments || 0}</p>
                            <p className="text-xs text-green-600 mt-1">{insights?.dailySummary.completedAppointments || 0} completed</p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600">📅</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Monthly Appointments</p>
                            <p className="text-3xl font-bold">{insights?.monthlyReport.totalAppointments || 0}</p>
                            <p className="text-xs text-green-600 mt-1">{insights?.monthlyReport.completedAppointments || 0} completed</p>
                          </div>
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600">📊</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Monthly Revenue</p>
                            <p className="text-3xl font-bold">{insights?.monthlyReport.totalRevenue || 0}</p>
                            <p className="text-xs text-green-600 mt-1">Avg: {Math.round(insights?.monthlyReport.averageRevenuePerAppointment || 0)}/apt</p>
                          </div>
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600">💰</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Doctor Insights Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Daily Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Daily Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Appointments</span>
                            <span className="font-semibold">{insights?.dailySummary.totalAppointments || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="font-semibold text-green-600">{insights?.dailySummary.completedAppointments || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Pending</span>
                            <span className="font-semibold text-yellow-600">{insights?.dailySummary.pendingAppointments || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Cancelled</span>
                            <span className="font-semibold text-red-600">{insights?.dailySummary.cancelledAppointments || 0}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm font-medium text-gray-900">Today's Revenue</span>
                            <span className="font-bold text-lg">{insights?.dailySummary.todaysRevenue || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Monthly Report */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Monthly Report</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Appointments</span>
                            <span className="font-semibold">{insights?.monthlyReport.totalAppointments || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="font-semibold text-green-600">{insights?.monthlyReport.completedAppointments || 0}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                            <span className="font-bold text-lg">{insights?.monthlyReport.totalRevenue || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg per Appointment</span>
                            <span className="font-semibold">{Math.round(insights?.monthlyReport.averageRevenuePerAppointment || 0)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Patients Seen</span>
                            <span className="font-semibold">{insights?.statistics.totalPatientsSeen || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg Consultation (min)</span>
                            <span className="font-semibold">{insights?.statistics.averageConsultationDuration || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Earnings</span>
                            <span className="font-semibold">{insights?.statistics.totalEarnings || 0}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm font-medium text-gray-900">Average Rating</span>
                            <span className="font-bold text-lg flex items-center">
                              ⭐ {insights?.statistics.averageRating ? insights.statistics.averageRating.toFixed(1) : '0.0'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Weekly Overview (Last 7 Days)</CardTitle>
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
                        {nextAppointment ? (
                          <div className="bg-blue-600 rounded-lg p-4 text-white mb-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center">
                                <span>🧑</span>
                              </div>
                              <div>
                                <p className="font-semibold">#{nextAppointment.id?.substring(0, 8) || 'APT001'}</p>
                                <p className="text-sm">{nextAppointment.bookingFor || 'Patient'}</p>
                              </div>
                            </div>
                            <p className="text-sm mb-3">{nextAppointment.problem || 'General visit'}</p>
                            <p className="text-sm mb-4">{nextAppointment.date}, {nextAppointment.time}</p>
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
                            
                            {/* Real-time Queue Status for Doctor */}
                            <div className="mt-4 pt-4 border-t border-blue-500/30 flex items-center justify-between">
                              <div className="text-xs">
                                <span className="opacity-80">Currently Serving: </span>
                                <span className="font-bold underline decoration-yellow-400 decoration-2">{nextAppointment?.shiftId ? queueStates[nextAppointment.shiftId] || 0 : 0}</span>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-bold border-none"
                                onClick={async () => {
                                  try {
                                    if (nextAppointment?.shiftId) {
                                      const res = await nextQueuePatient(String(nextAppointment.shiftId));
                                      toast.success(`Checking in next patient. Now serving: ${res.currentServing}`);
                                    } else {
                                      toast.error("No active shift found for this appointment");
                                    }
                                  } catch (err) {
                                    toast.error("Failed to advance queue");
                                  }
                                }}
                              >
                                Check-in Next
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl">📅</span>
                            </div>
                            <p className="text-gray-600">No upcoming appointments</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Patients</CardTitle>
                        <Link href="/doctor/my-patients" className="text-blue-600 text-sm hover:underline">
                          View All
                        </Link>
                      </CardHeader>
                      <CardContent>
                        {recentPatients.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4">
                            {recentPatients.map((patient) => (
                              <div key={patient.id} className="text-center">
                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-2 text-white font-semibold text-lg">
                                  {patient.name?.charAt(0).toUpperCase() || 'P'}
                                </div>
                                <p className="font-medium text-sm truncate">{patient.name}</p>
                                <p className="text-xs text-gray-500 mt-1">Last Appointment</p>
                                <p className="text-xs font-medium text-gray-700">
                                  {patient.lastAppointment ? new Date(patient.lastAppointment).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">No recent patients yet</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Your Schedule</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {doctorProfile?.schedule?.availableDays && doctorProfile.schedule.availableDays.length > 0 ? (
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Available Days:</p>
                              <div className="flex flex-wrap gap-2">
                                {doctorProfile.schedule.availableDays.map((day, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                                    {day}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {doctorProfile.schedule.availableHours && doctorProfile.schedule.availableHours.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Available Hours:</p>
                                <div className="flex flex-wrap gap-2">
                                  {doctorProfile.schedule.availableHours.slice(0, 3).map((hour, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                      {hour}
                                    </Badge>
                                  ))}
                                  {doctorProfile.schedule.availableHours.length > 3 && (
                                    <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700">
                                      +{doctorProfile.schedule.availableHours.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mt-4">
                              Consultation Fee: <span className="font-semibold">{doctorProfile.fee || 'Not set'}</span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">No schedule information available</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Invoices derived from completed appointments */}
                  <Card className="mt-6 mb-6">
                    <CardHeader>
                      <CardTitle>Recent Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentCompletedAppointments.length > 0 ? (
                        <div className="space-y-3">
                          {recentCompletedAppointments.map((apt) => {
                            const fee = apt.amount || (doctorProfile?.fee ? parseInt(String(doctorProfile.fee).replace(/[^0-9]/g, '')) : 0)
                            return (
                              <div key={apt.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                                <div>
                                  <p className="font-medium text-sm">Invoice for {apt.bookingFor || 'Patient'}</p>
                                  <p className="text-sm text-gray-600">{apt.date} • {apt.serviceType || 'Consultation'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">Rs. {fee}</p>
                                  <p className="text-xs text-gray-500">{apt.status}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-8">No invoices yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="mt-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Recent Completed Appointments</CardTitle>
                      <Link href="/doctor/appointments" className="text-blue-600 text-sm hover:underline">
                        View All
                      </Link>
                    </CardHeader>
                    <CardContent>
                      {recentCompletedAppointments.length > 0 ? (
                        <div className="space-y-3">
                          {recentCompletedAppointments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                              <div>
                                <p className="font-medium text-sm">{apt.bookingFor || 'Patient'}</p>
                                <p className="text-sm text-gray-600">{apt.date} at {apt.time}</p>
                                <p className="text-xs text-gray-500">{apt.serviceType || 'General Consultation'}</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800">{apt.status}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-8">No completed appointments yet</p>
                      )}
                    </CardContent>
                  </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
