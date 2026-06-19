'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRequireAuth } from '@/hooks/use-require-auth';
import {
  getDoctorShifts,
  getAppointmentsByDoctorId,
  getPatients,
  startRestShift,
  endRestShift,
  getQueuePatients,
  startShiftQueue,
  nextQueuePatient,
  updateAppointmentStatus,
  generateNextShifts,
  getDoctorById,
  getSlotAvailability,
  createAppointment,
} from '@/lib/api';
import type { Appointment, Patient, Shift } from '@/lib/types';
import { socket, connectSocket } from '@/lib/socket';
import { getAppointmentDisplayName } from '@/lib/utils';
import { LogoLoader } from '@/components/ui/logo-loader';
import { toast } from 'sonner';
import { resolvePatientImage, onPatientImageError } from '@/lib/image-utils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  UserCheck,
  Play,
  ListOrdered,
  Stethoscope,
  Plus,
} from 'lucide-react';

type ShiftTab = 'active' | 'upcoming' | 'completed';
type ShiftView = 'list' | 'detail' | 'queue' | 'consultation';

type QueueSnapshot = {
  currentServing: number;
  patients: Appointment[];
};

const WALK_IN_PATIENT_ID = '6a3305b1897b3d6ab54641ab';

function getShiftId(shift: Shift): string {
  return String(shift.id || shift._id || '');
}

function normalizeStatus(value?: string): string {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'in progress' || raw === 'in-progress' || raw === 'inprogress' || raw === 'in_progress') {
    return 'in_progress';
  }
  return raw;
}

function getAppointmentId(apt: Appointment): string {
  return String(apt.id || apt._id || '');
}

function queueSortKey(apt: Appointment): number {
  return typeof apt.queueNumber === 'number' ? apt.queueNumber : 999999;
}

function isCheckedIn(apt: Appointment): boolean {
  const status = normalizeStatus(apt.status);
  return status !== 'pending' && status !== 'cancelled';
}

function isCancelled(apt: Appointment): boolean {
  return normalizeStatus(apt.status) === 'cancelled';
}

function filterShiftsByTab(shifts: Shift[], tab: ShiftTab): Shift[] {
  const filtered = shifts.filter((shift) => {
    const status = String(shift.status || '').trim().toLowerCase();
    if (tab === 'active') return status === 'active';
    if (tab === 'completed') return status === 'ended';
    return status !== 'active' && status !== 'ended';
  });

  return filtered.sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function getShiftStatusMeta(status?: string) {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'active') {
    return { label: 'Ongoing', className: 'bg-green-100 text-green-700' };
  }
  if (value === 'ended') {
    return { label: 'Completed', className: 'bg-muted text-muted-foreground' };
  }
  if (value === 'cancelled') {
    return { label: 'Cancelled', className: 'bg-red-100 text-red-700' };
  }
  return { label: 'Upcoming', className: 'bg-orange-100 text-orange-700' };
}

function getShiftStartSortValue(shift: Shift): number {
  const datePart = String(shift.date || '').trim();
  const timePart = String(shift.startTime || '').trim();
  const parsed = new Date(`${datePart} ${timePart}`);
  const timestamp = parsed.getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}

function getLocalDateKey(value?: string): string {
  const parsed = value ? new Date(value) : new Date();
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DoctorShiftsPage() {
  const { user, isLoading: authLoading } = useRequireAuth({ role: 'doctor' });
  const [activeTab, setActiveTab] = useState<ShiftTab>('active');
  const [view, setView] = useState<ShiftView>('list');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [queueSnapshot, setQueueSnapshot] = useState<QueueSnapshot>({ currentServing: 0, patients: [] });
  const [consultationNotes, setConsultationNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [startingShiftId, setStartingShiftId] = useState<string | null>(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [generatingShifts, setGeneratingShifts] = useState(false);
  const [showEmptyQueueModal, setShowEmptyQueueModal] = useState(false);
  const [walkInDialogOpen, setWalkInDialogOpen] = useState(false);
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    patientName: '',
    age: '',
    gender: 'Male',
    problem: '',
  });

  const patientMap = useMemo(() => {
    return new Map(
      patients.map((patient) => [
        String(patient.id || (patient as any)._id),
        patient,
      ])
    );
  }, [patients]);

  const filteredShifts = useMemo(
    () => filterShiftsByTab(shifts, activeTab),
    [shifts, activeTab]
  );

  const nearestUpcomingShiftId = useMemo(() => {
    const upcomingShifts = shifts.filter((shift) => {
      const status = String(shift.status || '').trim().toLowerCase();
      return status !== 'active' && status !== 'ended' && status !== 'cancelled';
    });

    const nearestShift = [...upcomingShifts].sort(
      (a, b) => getShiftStartSortValue(a) - getShiftStartSortValue(b)
    )[0];

    return nearestShift ? getShiftId(nearestShift) : null;
  }, [shifts]);

  const todayDateKey = useMemo(() => getLocalDateKey(), []);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [shiftData, appointmentData, patientData] = await Promise.all([
        getDoctorShifts(String(user.id)),
        getAppointmentsByDoctorId(String(user.id)),
        getPatients(),
      ]);
      setShifts(shiftData);
      setAppointments(appointmentData);
      setPatients(patientData);
    } catch {
      toast.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshQueue = useCallback(async (shiftId: string) => {
    try {
      setQueueLoading(true);
      const response = await getQueuePatients(shiftId);
      const rawPatients = Array.isArray(response?.patients) ? response.patients : [];
      const sorted = [...rawPatients].sort((a: Appointment, b: Appointment) => queueSortKey(a) - queueSortKey(b));
      const currentServing = Number.isFinite(Number(response?.currentServing))
        ? Number(response.currentServing)
        : 0;
      setQueueSnapshot({ currentServing, patients: sorted });
    } catch {
      toast.error('Failed to load queue');
    } finally {
      setQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id, loadData]);

  useEffect(() => {
    if (!selectedShift) return;
    const shiftId = getShiftId(selectedShift);
    if (!shiftId) return;

    if (!socket.connected) connectSocket();
    socket.emit('joinQueueRoom', shiftId);

    const onQueueUpdated = (data: { shiftId?: string; currentServing?: number }) => {
      if (String(data?.shiftId) !== shiftId) return;
      setQueueSnapshot((prev) => ({
        ...prev,
        currentServing: Number(data.currentServing ?? prev.currentServing),
      }));
    };

    const onBookingUpdated = (data: { shiftId?: string; currentServing?: number; patients?: Appointment[] }) => {
      if (String(data?.shiftId) !== shiftId) return;
      setQueueSnapshot({
        currentServing: Number(data.currentServing ?? 0),
        patients: Array.isArray(data.patients) ? data.patients : [],
      });
    };

    socket.on('queueUpdated', onQueueUpdated);
    socket.on('bookingUpdated', onBookingUpdated);

    return () => {
      socket.off('queueUpdated', onQueueUpdated);
      socket.off('bookingUpdated', onBookingUpdated);
      socket.emit('leaveQueueRoom', shiftId);
    };
  }, [selectedShift]);

  useEffect(() => {
    if (selectedShift && (view === 'detail' || view === 'queue' || view === 'consultation')) {
      refreshQueue(getShiftId(selectedShift));
    }
  }, [selectedShift, view, refreshQueue, appointments]);

  const getShiftAppointments = (shift: Shift) => {
    const shiftId = getShiftId(shift);
    return appointments.filter((apt) => String(apt.shiftId) === shiftId);
  };

  const openShift = async (shift: Shift) => {
    const status = String(shift.status || '').trim().toLowerCase();
    const shiftId = getShiftId(shift);
    const shiftDateKey = getLocalDateKey(shift.date);
    if (status !== 'active' && status !== 'ended' && shiftDateKey !== todayDateKey) {
      toast.error('You can only start a shift on its scheduled day');
      return;
    }
    if (status !== 'active' && status !== 'ended' && nearestUpcomingShiftId && shiftId !== nearestUpcomingShiftId) {
      toast.error('Only the nearest upcoming shift can be started');
      return;
    }
    if (status !== 'active' && status !== 'ended') {
      try {
        setStartingShiftId(shiftId);
        const response = await startRestShift(shiftId);
        const updated = (response?.shift || response) as Shift;
        const nextShift = updated?.id || updated?._id ? updated : { ...shift, status: 'active' as const };
        setShifts((prev) =>
          prev.map((item) => (getShiftId(item) === shiftId ? { ...item, ...nextShift, status: 'active' } : item))
        );
        setSelectedShift({ ...shift, ...nextShift, status: 'active' });
      } catch (error: any) {
        toast.error(error?.message || 'Failed to start shift');
        return;
      } finally {
        setStartingShiftId(null);
      }
    } else {
      setSelectedShift(shift);
    }
    setView('detail');
  };

  const handleGenerateShifts = async () => {
    if (!user?.id) return;
    try {
      setGeneratingShifts(true);
      const profile = await getDoctorById(String(user.id));
      const scheduleDays = profile?.schedule?.availableDays || [];
      const scheduleHours = profile?.schedule?.availableHours || [];
      if (!scheduleDays.length || !scheduleHours.length) {
        toast.error('Set your availability schedule first');
        return;
      }
      await generateNextShifts(String(user.id), 30);
      toast.success('Shifts generated');
      await loadData();
    } catch {
      toast.error('Failed to generate shifts');
    } finally {
      setGeneratingShifts(false);
    }
  };

  const handleWalkInFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setWalkInForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateWalkIn = async () => {
    if (!user?.id || !selectedShift) return;

    const shiftId = getShiftId(selectedShift);
    const date = getLocalDateKey(selectedShift.date);
    if (!shiftId || !date) {
      toast.error('Selected shift is not ready for walk-in booking');
      return;
    }

    if (!walkInForm.patientName.trim() || !walkInForm.age.trim() || !walkInForm.gender.trim() || !walkInForm.problem.trim()) {
      toast.error('Fill name, age, gender, and problem');
      return;
    }

    try {
      setWalkInSubmitting(true);
      const availability = await getSlotAvailability(String(user.id), date, shiftId);
      if (!availability.nextAvailableTime) {
        toast.error('No available queue slot for this shift');
        return;
      }

      const appointmentDate = new Date(date);
      const day = Number.isNaN(appointmentDate.getTime())
        ? selectedShift.date
        : appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

      await createAppointment({
        patientId: WALK_IN_PATIENT_ID,
        doctorId: String(user.id),
        doctorName: user.name,
        shiftId,
        day,
        date,
        time: availability.nextAvailableTime,
        bookingFor: 'Walk-in',
        patientName: walkInForm.patientName.trim(),
        age: walkInForm.age.trim(),
        gender: walkInForm.gender.trim(),
        problem: walkInForm.problem.trim(),
        amount: Number(selectedShift.consultingFee ?? 0),
        timestamp: new Date().toISOString(),
        fullDateIso: new Date(`${date}T00:00:00`).toISOString(),
      });

      toast.success('Walk-in patient added to the queue');
      setWalkInDialogOpen(false);
      setWalkInForm({ patientName: '', age: '', gender: 'Male', problem: '' });
      await refreshQueue(shiftId);
      await loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add walk-in patient');
    } finally {
      setWalkInSubmitting(false);
    }
  };

  const orderedQueue = useMemo(
    () => [...queueSnapshot.patients].sort((a, b) => queueSortKey(a) - queueSortKey(b)),
    [queueSnapshot.patients]
  );

  const currentAppointment = orderedQueue.find(
    (apt) => {
      const status = normalizeStatus(apt.status)
      return (
        apt.queueNumber != null &&
        apt.queueNumber === queueSnapshot.currentServing &&
        status !== 'completed' &&
        status !== 'cancelled'
      )
    }
  );

  const upcomingAppointments = orderedQueue.filter(
    (apt) => apt.queueNumber != null && apt.queueNumber > queueSnapshot.currentServing
  );

  const servedCount = orderedQueue.filter(
    (apt) => apt.queueNumber != null && apt.queueNumber <= queueSnapshot.currentServing
  ).length;

  const completedAppointmentSummary =
    !currentAppointment && selectedAppointment && normalizeStatus(selectedAppointment.status) === 'completed'
      ? selectedAppointment
      : null;

  const beginConsultation = async (appointment: Appointment) => {
    try {
      setActionLoading(true);
      await updateAppointmentStatus(getAppointmentId(appointment), 'in_progress');
      setAppointments((prev) =>
        prev.map((apt) =>
          getAppointmentId(apt) === getAppointmentId(appointment)
            ? { ...apt, status: 'In Progress' }
            : apt
        )
      );
      setSelectedAppointment(appointment);
      setConsultationNotes('');
      setView('consultation');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to start consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartConsultation = async () => {
    if (!selectedShift) return;
    const shiftId = getShiftId(selectedShift);
    try {
      setActionLoading(true);
      await refreshQueue(shiftId);
      if (currentAppointment) {
        await beginConsultation(currentAppointment);
        return;
      }
      if (upcomingAppointments.length === 0) {
        setShowEmptyQueueModal(true);
        return;
      }
      await startShiftQueue(shiftId);
      const next = await nextQueuePatient(shiftId);
      const nextAppointment = next.currentAppointment || upcomingAppointments[0];
      if (!nextAppointment) {
        setShowEmptyQueueModal(true);
        return;
      }
      await beginConsultation(nextAppointment);
      await refreshQueue(shiftId);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to start consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallNext = async () => {
    if (!selectedShift) return;
    const shiftId = getShiftId(selectedShift);
    try {
      setActionLoading(true);
      if (currentAppointment) {
        await updateAppointmentStatus(getAppointmentId(currentAppointment), 'completed', consultationNotes);
      }
      const next = await nextQueuePatient(shiftId);
      const nextAppointment = next.currentAppointment;
      if (!nextAppointment) {
        setShowEmptyQueueModal(true);
        return;
      }
      await updateAppointmentStatus(getAppointmentId(nextAppointment), 'in_progress');
      setSelectedAppointment(nextAppointment);
      setConsultationNotes('');
      setView('consultation');
      await refreshQueue(shiftId);
      await loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to call next patient');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteAndNext = async () => {
    if (!selectedAppointment || !selectedShift) return;
    try {
      setActionLoading(true);
      const completedAppointment = {
        ...selectedAppointment,
        status: 'Completed' as Appointment['status'],
      }
      await updateAppointmentStatus(
        getAppointmentId(selectedAppointment),
        'completed',
        consultationNotes
      );
      const shiftId = getShiftId(selectedShift);
      const next = await nextQueuePatient(shiftId);
      const nextAppointment = next.currentAppointment;
      if (!nextAppointment) {
        toast.success('Consultation completed');
        setView('detail');
        setSelectedAppointment(completedAppointment);
        await refreshQueue(shiftId);
        await loadData();
        return;
      }
      await updateAppointmentStatus(getAppointmentId(nextAppointment), 'in_progress');
      setSelectedAppointment(nextAppointment);
      setConsultationNotes('');
      await refreshQueue(shiftId);
      await loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to complete consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndShift = async () => {
    if (!selectedShift) return;
    const shiftId = getShiftId(selectedShift);
    if (upcomingAppointments.length > 0) {
      toast.error('Patients are still waiting in the queue');
      return;
    }
    if (!confirm('End this shift?')) return;
    try {
      setActionLoading(true);
      await endRestShift(shiftId);
      toast.success('Shift ended');
      setShowEmptyQueueModal(false);
      setView('list');
      setSelectedShift(null);
      await loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to end shift');
    } finally {
      setActionLoading(false);
    }
  };

  const renderPatientName = (apt: Appointment) => {
    const patient = patientMap.get(String(apt.patientId));
    return patient?.name || apt.patientName || getAppointmentDisplayName(apt);
  };

  const renderShiftCard = (shift: Shift) => {
    const shiftAppointments = getShiftAppointments(shift);
    const total = shiftAppointments.filter((apt) => !isCancelled(apt)).length;
    const checkedIn = shiftAppointments.filter(isCheckedIn).length;
    const statusMeta = getShiftStatusMeta(shift.status);
    const statusLower = String(shift.status || '').trim().toLowerCase();
    const shiftId = getShiftId(shift);
    const actionLabel =
      statusLower === 'active' ? 'Open Shift' : statusLower === 'ended' ? 'View Detail' : 'Start Shift';
    const canStartShift =
      statusLower === 'active' ||
      statusLower === 'ended' ||
      (shiftId === nearestUpcomingShiftId && getLocalDateKey(shift.date) === todayDateKey);

    return (
      <Card key={shiftId} className="border border-border/60 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="font-semibold text-foreground">{shift.date}</p>
              <p className="text-sm text-muted-foreground">{shift.startTime} – {shift.endTime}</p>
            </div>
            <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 rounded-lg bg-icon-bg/50 p-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Patients</p>
                <p className="font-bold text-foreground">{total}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-icon-bg/50 p-3">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Checked-in</p>
                <p className="font-bold text-foreground">{checkedIn}</p>
              </div>
            </div>
          </div>

          {statusLower !== 'cancelled' && (
            <Button
              variant="outline"
              className="w-full border-primary/30 text-primary hover:bg-icon-bg"
              disabled={startingShiftId === shiftId || !canStartShift}
              onClick={() => openShift(shift)}
            >
              {startingShiftId === shiftId ? <LogoLoader size={16} className="h-4 w-4 mr-2" /> : null}
              {actionLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDetail = () => {
    if (!selectedShift) return null;
    const statusMeta = getShiftStatusMeta(selectedShift.status);
    const shiftEnded = String(selectedShift.status).toLowerCase() === 'ended';
    const preview = upcomingAppointments.slice(0, 3);

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setView('list'); setSelectedShift(null); }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shifts
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Shift Details</CardTitle>
              <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {selectedShift.date}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {selectedShift.startTime} – {selectedShift.endTime}</div>
              <div className="flex items-center gap-2"><ListOrdered className="h-4 w-4 text-primary" /> Queue #{queueSnapshot.currentServing || 0}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{orderedQueue.length}</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-xs text-muted-foreground">Waiting</p>
                <p className="text-xl font-bold">{upcomingAppointments.length}</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-xs text-muted-foreground">Done</p>
                <p className="text-xl font-bold">{servedCount}</p>
              </div>
            </div>

            {currentAppointment ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-xs font-semibold text-green-700 mb-1">Currently Serving</p>
                <p className="font-semibold text-foreground">{renderPatientName(currentAppointment)}</p>
                <p className="text-sm text-muted-foreground">Queue #{currentAppointment.queueNumber}</p>
              </div>
            ) : completedAppointmentSummary ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">Completed</p>
                <p className="font-semibold text-foreground">{renderPatientName(completedAppointmentSummary)}</p>
                <p className="text-sm text-muted-foreground">Queue #{completedAppointmentSummary.queueNumber}</p>
              </div>
            ) : null}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Upcoming Patients</h3>
              </div>
              {preview.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming patients</p>
              ) : (
                <div className="space-y-2">
                  {preview.map((apt) => (
                    <div key={getAppointmentId(apt)} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{renderPatientName(apt)}</p>
                        <p className="text-xs text-muted-foreground">Queue #{apt.queueNumber}</p>
                      </div>
                      <Badge variant="outline">{normalizeStatus(apt.status) || 'pending'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!shiftEnded && (
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="outline" onClick={handleEndShift} disabled={actionLoading}>
                  End Shift
                </Button>
                <Button onClick={handleStartConsultation} disabled={actionLoading}>
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Start Consultation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQueue = () => {
    if (!selectedShift) return null;
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setView('detail')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shift Detail
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Live Queue</span>
              <Badge className="bg-green-100 text-green-700">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {queueLoading ? (
              <div className="flex justify-center py-10"><LogoLoader size={32} /></div>
            ) : (
              <>
                {currentAppointment ? (
                  <button
                    type="button"
                    className="w-full text-left rounded-xl border-2 border-primary/30 bg-icon-bg p-4 hover:shadow-md transition"
                    onClick={() => beginConsultation(currentAppointment)}
                  >
                    <p className="text-xs font-semibold text-primary mb-1">Currently Serving</p>
                    <p className="font-bold text-lg">{renderPatientName(currentAppointment)}</p>
                    <p className="text-sm text-muted-foreground">Queue #{currentAppointment.queueNumber}</p>
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">No patient is currently being served.</p>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Upcoming Patients</h3>
                  <div className="space-y-2">
                    {upcomingAppointments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Queue is empty</p>
                    ) : (
                      upcomingAppointments.map((apt) => (
                        <div key={getAppointmentId(apt)} className="rounded-lg border p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{renderPatientName(apt)}</p>
                            <p className="text-xs text-muted-foreground">Queue #{apt.queueNumber}</p>
                          </div>
                          <Badge variant="outline">Waiting</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleCallNext}
                    disabled={actionLoading || (upcomingAppointments.length === 0 && !currentAppointment)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Call Next Patient
                  </Button>
                  <Button variant="outline" onClick={() => setWalkInDialogOpen(true)} disabled={actionLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Walk-in Patient
                  </Button>
                  <Button variant="outline" onClick={handleEndShift} disabled={actionLoading}>
                    End Shift
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderConsultation = () => {
    if (!selectedAppointment) return null;
    const patient = patientMap.get(String(selectedAppointment.patientId));
    const initials = renderPatientName(selectedAppointment)
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setView('queue')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Queue
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Active Consultation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={resolvePatientImage(patient?.avatar || selectedAppointment.avatar, patient?.gender)}
                  onError={(e) => onPatientImageError(e, patient?.gender)}
                />
                <AvatarFallback className="bg-primary text-white">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-bold">{renderPatientName(selectedAppointment)}</p>
                <p className="text-sm text-muted-foreground">
                  Queue #{selectedAppointment.queueNumber}
                  {patient?.age ? ` • ${patient.age} yrs` : ''}
                  {patient?.gender ? ` • ${patient.gender}` : ''}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Current Symptoms</p>
              <div className="rounded-lg bg-muted p-4 text-sm">
                {selectedAppointment.problem || 'No symptoms provided'}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Consultation Notes</p>
              <Textarea
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                placeholder="Add consultation notes..."
                className="min-h-[120px]"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleEndShift} disabled={actionLoading}>
                End Shift
              </Button>
              <Button onClick={handleCompleteAndNext} disabled={actionLoading}>
                Complete &amp; Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-muted flex items-center justify-center">
          <LogoLoader size={32} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-muted">
        <Dialog open={walkInDialogOpen} onOpenChange={setWalkInDialogOpen}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Add Walk-in Patient</DialogTitle>
              <DialogDescription>
                Enter the patient details that should appear on the queue. Doctor, shift, date, time, and patient ID are filled automatically.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Patient Name</label>
                <Input
                  name="patientName"
                  value={walkInForm.patientName}
                  onChange={handleWalkInFieldChange}
                  placeholder="Enter patient name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Age</label>
                  <Input
                    name="age"
                    value={walkInForm.age}
                    onChange={handleWalkInFieldChange}
                    placeholder="Enter age"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Gender</label>
                  <select
                    name="gender"
                    value={walkInForm.gender}
                    onChange={handleWalkInFieldChange}
                    className="w-full h-11 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm shadow-sm backdrop-blur-md outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-500/20"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Problem</label>
                <Textarea
                  name="problem"
                  value={walkInForm.problem}
                  onChange={handleWalkInFieldChange}
                  placeholder="Describe the problem"
                  className="min-h-[120px]"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setWalkInDialogOpen(false)} disabled={walkInSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleCreateWalkIn} disabled={walkInSubmitting}>
                {walkInSubmitting ? 'Adding...' : 'Add to Queue'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {showEmptyQueueModal && selectedShift && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md px-4">
            <Card className="w-full max-w-md border border-border/60 shadow-2xl">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-2xl">No Patients in Queue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  There are no patients waiting for this shift right now. You can go back to the shifts list or end the shift.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEmptyQueueModal(false);
                      setView('list');
                      setSelectedShift(null);
                    }}
                  >
                    Back to Shifts
                  </Button>
                  <Button
                    onClick={handleEndShift}
                    disabled={actionLoading}
                  >
                    End Shift
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div className="max-w-7xl mx-auto p-6">
          {view === 'list' && (
            <>
              <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>Doctor</span>
                    <span>&gt;</span>
                    <span>Shifts</span>
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">My Shifts</h1>
                </div>
              </div>

              <div className="flex gap-2 mb-6 border-b pb-4">
                {(['active', 'upcoming', 'completed'] as ShiftTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                      activeTab === tab ? 'bg-primary text-white' : 'bg-card text-foreground/70 hover:bg-muted'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {filteredShifts.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center text-muted-foreground">
                    No {activeTab} shifts
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredShifts.map(renderShiftCard)}
                </div>
              )}
            </>
          )}

          {view === 'detail' && renderDetail()}
          {view === 'queue' && renderQueue()}
          {view === 'consultation' && renderConsultation()}
        </div>
      </div>
    </>
  );
}
