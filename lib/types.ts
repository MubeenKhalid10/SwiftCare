// API Response Types based on the backend at https://swiftcare.up.railway.app

export interface Doctor {
  id: number
  name: string
  email: string
  password: string
  specialty: string
  location: string
  rating: number
  experience: string
  fee: string
  image: string
  available: boolean
  phone?: string
  about?: string
  education?: string[]
  services?: string[]
  memberSince?: string
  earned?: string
}

export interface Patient {
  id: number
  name: string
  email: string
  password: string
  age: number
  gender: string
  phone: string
  address: string
  avatar?: string
  bloodType?: string
  lastVisit?: string
  paid?: string
}

export interface Review {
  id: number
  patientId: number
  doctorId: number
  patientName: string
  doctorName: string
  rating: number
  text: string
  date: string
  avatar?: string
}

export interface Appointment {
  id: number
  patientId: number
  doctorId: number
  patientName: string
  doctorName: string
  doctorSpecialty: string
  date: string
  time: string
  type: "Video Call" | "Audio Call" | "Chat" | "Direct Visit"
  status: "upcoming" | "completed" | "cancelled"
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
}

// Dashboard stats types
export interface DashboardStats {
  totalDoctors: number
  totalPatients: number
  totalAppointments: number
  totalRevenue: number
  topDoctors: (Doctor & { totalAppointments: number })[]
  recentAppointments: (Appointment & { doctorName: string; patientName: string })[]
}
