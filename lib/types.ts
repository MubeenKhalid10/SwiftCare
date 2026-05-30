// API Response Types based on the backend at https://swiftcare.up.railway.app

export interface Doctor {
  id: number | string
  name: string
  email: string
  password?: string
  specialty?: string
  specialization?: string
  location?: string | {
    label?: string
    clinicName?: string
    coordinates?: [number, number]
    geo?: {
      type?: string
      coordinates?: [number, number]
    }
  }
  locationLabel?: string
  locationCoordinates?: [number, number]
  clinicName?: string
  rating?: number
  experience?: string
  fee?: string
  image?: string
  available?: boolean
  availableDays?: string[]
  availableHours?: string[]
  schedule?: {
    availableDays: string[];
    availableHours: string[];
  }
  phone?: string
  age?: number | string
  gender?: string
  about?: string
  education?: string[]
  services?: string[]
  memberSince?: string
  earned?: string
  totalAppointments?: number;
  verificationStatus?: 'pending' | 'submitted' | 'approved' | 'rejected';
  averageRating?: number
  reviewCount?: number
  accountStatus?: {
    registered?: boolean
    verificationStatus?: 'pending' | 'submitted' | 'approved' | 'rejected'
  }
}

export interface Patient {
  id: number
  name: string
  email: string
  password: string
  age: number | string
  gender: string
  phone: string
  address: string
  location?: {
    label: string;
    type: string;
    coordinates: number[];
  };
  avatar?: string
  bloodType?: string
  bloodGroup?: string
  dob?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  lastVisit?: string
  paid?: string
}

export interface Review {
  id: string
  doctorId: string
  patientId: string
  rating: number
  comment: string
  createdAt: string
  patientName?: string // Populated by frontend if needed
  avatar?: string
}

export interface Appointment {
  id?: string
  _id?: string
  patientId: string
  doctorId: string
  shiftId?: string
  queueNumber?: number
  doctorName?: string
  day?: string
  date?: string
  time?: string
  bookingFor?: string
  gender?: string
  age?: string
  problem?: string
  amount?: number
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled"
  fullDateIso?: string
  timestamp?: string
  // Frontend-only display fields (not stored in backend)
  patientName?: string
  doctorSpecialty?: string
  type?: "Video Call" | "Audio Call" | "Chat" | "Direct Visit"
  email?: string
  phone?: string
  avatar?: string
}

// Auth types
export interface User {
  id: string
  name: string
  email: string
  role: "patient" | "doctor" | "admin"
  avatar?: string
  verificationStatus?: 'pending' | 'submitted' | 'approved' | 'rejected'
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: "patient" | "doctor"
  phone?: string
  specialization?: string
  location?: {
    label: string;
    coordinates?: [number, number];
    clinicName?: string;
    source?: "browser" | "ip" | "address" | "manual";
  };
  schedule?: {
    availableDays: string[];
    availableHours: string[];
  };
  clinicName?: string
}

// Dashboard stats types
export interface DashboardStats {
  totalDoctors: number
  totalPatients: number
  totalAppointments: number
  totalRevenue: number
  revenueAnalytics: Array<{ year: number; revenue: number }>
  statusAnalytics: Array<{ year: number; doctors: number; patients: number }>
  topDoctors: (Doctor & { totalAppointments: number })[]
  recentAppointments: (Appointment & { doctorName: string; patientName: string })[]
}

export interface DoctorInsights {
  dailySummary: {
    totalAppointments: number
    completedAppointments: number
    pendingAppointments: number
    cancelledAppointments: number
    todaysRevenue: number
  }
  monthlyReport: {
    totalAppointments: number
    completedAppointments: number
    totalRevenue: number
    averageRevenuePerAppointment: number
  }
  statistics: {
    totalPatientsSeen: number
    averageConsultationDuration: number
    totalEarnings: number
    averageRating: number
  }
  weeklyOverview: Array<{
    day: string
    appointments: number
    revenue: number
  }>
}

export interface QueueState {
    shiftId: string;
    currentServing: number;
    lastQueueNumber: number;
}

export interface Shift {
  _id?: string;
  id?: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'ended';
  isBookable?: boolean;
  consultingFee?: number;
  patientsInQueue?: number;
}

export interface Hospital {
  _id?: string
  id?: string
  name: string
  address: string
  image?: string
  description?: string
  contactNumber?: string
  email?: string
  website?: string
  type?: 'government' | 'private' | 'charity' | 'other'
  specialties?: string[]
  status?: 'active' | 'inactive'
  affiliatedDoctorsCount?: number
  location?: {
    geo?: {
      type: string
      coordinates: [number, number]
    }
  }
  createdAt?: string
  updatedAt?: string
}

export interface Facility {
  id?: string
  _id?: string
  name: string
  about?: string
  image?: string
  location?: {
    label?: string
    geo?: {
      type?: string
      coordinates?: [number, number]
    }
    coordinates?: [number, number]
  }
  doctorList?: string[] | Doctor[]
  createdAt?: string
  updatedAt?: string
}

export interface Notification {
  _id?: string;
  id?: string;
  userId: string;
  role: 'patient' | 'doctor' | 'admin' | null;
  type: string;
  title: string;
  body: string;
  data: any;
  read: boolean;
  readAt?: string;
  createdAt?: string;
}

