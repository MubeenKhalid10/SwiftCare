'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';
import { useAuth } from '@/lib/auth-context';
import { getBookableShifts, getDoctorById, updateDoctor } from '@/lib/api';
import type { Shift } from '@/lib/types';
import { toast } from 'sonner';
import { Clock, CalendarDays } from 'lucide-react';
import { LogoLoader } from '@/components/ui/logo-loader';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getDateKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function formatDateLabel(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AvailableTimings() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consultationFee, setConsultationFee] = useState('');
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [isGeneratingShifts, setIsGeneratingShifts] = useState(false);
  const [isRefreshingShifts, setIsRefreshingShifts] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const [profile, shifts] = await Promise.all([
          getDoctorById(user.id.toString()),
          getBookableShifts(String(user.id)),
        ]);
        setDoctorProfile(profile);
        setConsultationFee(String((profile as any)?.consultationFee || profile?.fee || '250'));
        setUpcomingShifts(shifts || []);
      } catch (error) {
        console.error('Error loading doctor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const generatedCoverageDays = useMemo(() => {
    if (!upcomingShifts.length) return 0;

    const futureDates = upcomingShifts
      .map((shift) => getDateKey(shift.date))
      .filter(Boolean)
      .sort();

    if (!futureDates.length) return 0;

    const lastDate = new Date(futureDates[futureDates.length - 1]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const diff = Math.floor((lastDate.getTime() - today.getTime()) / MS_PER_DAY);
    return Math.max(0, diff + 1);
  }, [upcomingShifts]);

  const generationCoveredThrough = useMemo(() => {
    if (!upcomingShifts.length) return null;

    const futureDates = upcomingShifts
      .map((shift) => getDateKey(shift.date))
      .filter(Boolean)
      .sort();

    if (!futureDates.length) return null;

    return formatDateLabel(futureDates[futureDates.length - 1]);
  }, [upcomingShifts]);

  const hasFull30DayCoverage = generatedCoverageDays >= 30;

  const refreshShifts = async () => {
    if (!user?.id) return;

    try {
      setIsRefreshingShifts(true);
      const shifts = await getBookableShifts(String(user.id));
      setUpcomingShifts(shifts || []);
    } catch (error) {
      console.error('Failed to refresh shifts:', error);
    } finally {
      setIsRefreshingShifts(false);
    }
  };

  const handleGenerateNextShifts = async () => {
    if (!user?.id || hasFull30DayCoverage) return;

    try {
      setIsGeneratingShifts(true);
      const profile = doctorProfile || await getDoctorById(String(user.id));
      const schedule = profile?.schedule || {};
      const scheduleDays = Array.isArray(schedule.availableDays) ? schedule.availableDays : [];
      const scheduleHours = Array.isArray(schedule.availableHours) ? schedule.availableHours : [];

      if (scheduleDays.length === 0 || scheduleHours.length === 0) {
        toast.error('Doctor schedule is not set yet');
        return;
      }

      await updateDoctor(String(user.id), {
        schedule: {
          availableDays: scheduleDays,
          availableHours: scheduleHours,
        },
      });

      toast.success('Shift generation synced from your schedule', {
        description: 'Future shifts are now synced into the shift collection.',
      });

      await refreshShifts();
    } catch (error) {
      console.error('Failed to generate shifts:', error);
      toast.error('Failed to generate shifts');
    } finally {
      setIsGeneratingShifts(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const availableDays = doctorProfile?.schedule?.availableDays || [];
  const availableHours = doctorProfile?.schedule?.availableHours || [];


  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LogoLoader size={32} className="h-8 w-8" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <DoctorSidebar />
          <div className="flex-1">
            <div className="p-8">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Doctor</span>
                  <span>&gt;</span>
                  <span>Available Timings</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Clinic Availability</h1>
                <p className="text-gray-500 mt-2">Your appointment schedule and consultation fees</p>
              </div>

              <Card className="mb-8 border border-[#0073CF] shadow-sm bg-white">
                <div className="p-6 text-gray-900">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays className="w-4 h-4" />
                        <span>Shift Generation</span>
                      </div>
                      <h2 className="text-2xl font-bold">Generate the next 30 days of shifts</h2>
                      <p className="text-gray-600 max-w-2xl">
                        {hasFull30DayCoverage
                          ? `Your shifts are already generated for ${generatedCoverageDays} days${generationCoveredThrough ? `, through ${generationCoveredThrough}` : ''}.`
                          : generatedCoverageDays > 0
                            ? `Your shifts are already generated for ${generatedCoverageDays} day${generatedCoverageDays === 1 ? '' : 's'}${generationCoveredThrough ? `, through ${generationCoveredThrough}` : ''}. You can extend them when needed.`
                            : 'Generate shifts once to make your availability visible to patients on booking screens.'}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <Button
                        onClick={handleGenerateNextShifts}
                        disabled={isGeneratingShifts || isRefreshingShifts || hasFull30DayCoverage}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${hasFull30DayCoverage ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200 hover:bg-gray-100' : 'bg-[#0073CF] text-white hover:bg-[#0062B0]'}`}
                      >
                        {isGeneratingShifts ? (
                          <span className="flex items-center gap-2">
                            <LogoLoader size={16} className="h-4 w-4" />
                            Generating
                          </span>
                        ) : hasFull30DayCoverage ? (
                          `Shifts already generated for ${generatedCoverageDays} days`
                        ) : (
                          'Generate Next 30 Days'
                        )}
                      </Button>
                      {hasFull30DayCoverage && generationCoveredThrough && (
                        <p className="text-xs text-gray-500 text-right">
                          Covered through {generationCoveredThrough}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Consultation Fee Card */}
              <Card className="mb-8 border border-[#0073CF] shadow-sm bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium mb-2">Consultation Fee</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">Rs. {consultationFee}</span>
                        <span className="text-gray-500 text-sm">per appointment</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-[#0073CF]/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-[#0073CF]">Rs.</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Available Days and Hours */}
              <Card className="border border-[#0073CF] shadow-sm">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Schedule</h2>

                  {availableDays.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">No schedule slots configured yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {days.map((day) => {
                        const isAvailable = availableDays.includes(day);
                        return (
                          <div
                            key={day}
                            className={`rounded-lg p-5 transition-all ${
                              isAvailable
                                ? 'bg-white border border-[#0073CF] shadow-sm hover:shadow-md'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`h-2.5 w-2.5 rounded-full ${isAvailable ? 'bg-[#0073CF]' : 'bg-gray-300'}`} />
                              <h3 className={`text-lg font-bold ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                                {day}
                              </h3>
                            </div>

                            {isAvailable ? (
                              <div className="bg-[#0073CF]/10 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-4 h-4 text-[#0073CF]" />
                                  <p className="text-[#0073CF] text-xs font-semibold">Available Hours:</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {availableHours.map((hour: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      className="bg-white text-gray-700 border border-[#0073CF] font-semibold text-xs px-2 py-1"
                                    >
                                      {hour}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-200 rounded-lg p-3 text-center">
                                <p className="text-gray-600 font-semibold text-sm">Not Available</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
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
