import type { Doctor, Patient, Review, Appointment, LoginCredentials, RegisterData, User, DashboardStats, DoctorInsights, QueueState, Shift, Notification } from "./types"
import { getAccessToken, refreshAccessToken } from "./auth.service"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "")

// Helper to transform MongoDB _id to id
function transformMongoDocument<T extends { _id?: string; id?: string | number }>(doc: T): T {
  if (doc._id && !doc.id) {
    return { ...doc, id: doc._id }
  }
  return doc
}

function transformMongoArray<T extends { _id?: string; id?: string | number }>(docs: T[]): T[] {
  return docs.map(transformMongoDocument)
}

/**
 * Defensive helper to ensure location or type fields are strings.
 * Used to prevent React "Objects are not valid as a React child" errors
 * when backend returns GeoJSON objects for location fields.
 */
function ensureString(value: any, fallback?: string): string | undefined {
  if (value == null) return fallback
  if (typeof value === "string") return value
  
  // Handle GeoJSON point {type: "Point", coordinates: [...], label?: "..."}
  if (typeof value === "object") {
    if (value.label) return value.label
    if (value.location) return ensureString(value.location)
    if (value.type && typeof value.type === "string") return value.type
    return fallback ?? String(value)
  }
  
  return String(value)
}

// Generic fetch wrapper with error handling and token management
async function fetchAPI<T>(endpoint: string, options?: RequestInit, retry = true): Promise<T> {
  try {
    const token = getAccessToken()

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    console.log(`[v0] API call: ${endpoint}`)

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // CRITICAL: Send cookies with request
    })

    // Handle 401 - try to refresh token and retry
    if (response.status === 401 && retry) {
      try {
        console.log(`[v0] Token expired, refreshing...`)
        const newToken = await refreshAccessToken()
        const retryHeaders: HeadersInit = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${newToken}`,
          ...options?.headers,
        }

        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: retryHeaders,
          credentials: "include",
        })

        if (!retryResponse.ok) {
          throw new Error(`API Error: ${retryResponse.status} ${retryResponse.statusText}`)
        }

        const data = await retryResponse.json()
        return data
      } catch (err) {
        console.error(`[v0] Token refresh failed:`, err)
        throw new Error("Authentication failed. Please login again.")
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`[v0] API error ${response.status}:`, errorData)
      throw new Error(errorData.message || errorData.error || `API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.error(`[v0] Error fetching ${endpoint}:`, errorMessage)
    throw err
  }
}

// ============ DOCTORS API ============
export async function getDoctors(minRating?: number, sortBy?: string): Promise<Doctor[]> {
  try {
    const params = new URLSearchParams()
    if (minRating) params.append('minRating', minRating.toString())
    if (sortBy) params.append('sortBy', sortBy)
    
    const query = params.toString() ? `?${params.toString()}` : ""
    const data = await fetchAPI<any[]>(`/doctors${query}`)
    const reviews = await getReviews()
    
    return transformMongoArray(data).map((doc) => {
      const transformed = { ...doc }
      transformed.location = ensureString(doc.location) || (doc as any).clinicInfo?.location
      
      // Calculate ratings for this doctor
      const docReviews = reviews.filter(r => String(r.doctorId) === String(doc.id || doc._id))
      transformed.reviewCount = docReviews.length
      transformed.averageRating = docReviews.length > 0 
        ? docReviews.reduce((acc, r) => acc + r.rating, 0) / docReviews.length 
        : 0

      // Map consultationFee to fee
      if ((doc as any).consultationFee && !transformed.fee) {
        transformed.fee = `RS. ${(doc as any).consultationFee}`
      }
      // Ensure frontend uses `specialty` while backend may provide `specialization`
      if ((doc as any).specialization && !transformed.specialty) {
        (transformed as any).specialty = (doc as any).specialization
      } else if ((doc as any).professionalInfo && (doc as any).professionalInfo.specialization && !transformed.specialty) {
        (transformed as any).specialty = (doc as any).professionalInfo.specialization
      }
      return transformed
    })
  } catch (err) {
    console.error("[v0] Error fetching doctors:", err instanceof Error ? err.message : err)
    return []
  }
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  try {
    const [docData, reviews] = await Promise.all([
      fetchAPI<any>(`/doctors/${id}`),
      getReviewsByDoctorId(id)
    ])
    const doc = transformMongoDocument(docData)
    if (!doc) return null
    
    return {
      ...doc,
      location: ensureString(doc.location) || (doc as any).clinicInfo?.location,
      // Aggregated ratings
      reviewCount: reviews.length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0,
      // Map consultationFee to fee
      fee: doc.fee || ((docData as any).consultationFee ? `RS. ${(docData as any).consultationFee}` : undefined),
      // Backwards compatible specialty mapping
      specialty: (doc as any).specialty || (doc as any).specialization || ((doc as any).professionalInfo ? (doc as any).professionalInfo.specialization : undefined)
    }
  } catch (err) {
    console.error("[v0] Error fetching doctor:", err)
    return null
  }
}

export async function getDoctorByEmail(email: string): Promise<Doctor | undefined> {
  try {
    const doctors = await getDoctors()
    return doctors.find((d) => d.email === email)
  } catch (err) {
    console.error("Error fetching doctor by email:", err)
    return undefined
  }
}

export async function createDoctor(doctor: Omit<Doctor, "id">): Promise<Doctor> {
  return fetchAPI<Doctor>("/doctors", {
    method: "POST",
    body: JSON.stringify(doctor),
  })
}

export async function updateDoctor(id: string, doctor: Partial<Doctor>): Promise<Doctor> {
  return fetchAPI<Doctor>(`/doctors/${id}`, {
    method: "PUT",
    body: JSON.stringify(doctor),
  })
}

export async function deleteDoctor(id: string): Promise<void> {
  await fetchAPI(`/doctors/${id}`, { method: "DELETE" })
}

export async function approveDoctorVerification(id: string): Promise<Doctor> {
  return fetchAPI<Doctor>(`/doctors/verification/${id}/approve`, {
    method: "PUT",
  })
}

export async function rejectDoctorVerification(id: string): Promise<Doctor> {
  return fetchAPI<Doctor>(`/doctors/verification/${id}/reject`, {
    method: "PUT",
  })
}

// ============ PATIENTS API ============
export async function getPatients(): Promise<Patient[]> {
  try {
    const data = await fetchAPI<any[]>("/patients")
    return transformMongoArray(data).map(p => ({
      ...p,
      location: ensureString((p as any).location),
      address: p.address || ensureString((p as any).location)
    }))
  } catch (err) {
    console.error("[v0] Error fetching patients:", err)
    return []
  }
}

export async function getPatientById(id: string): Promise<Patient | null> {
  try {
    const data = await fetchAPI<any>(`/patients/${id}`)
    const p = transformMongoDocument(data)
    if (!p) return null
    
    return {
      ...p,
      location: ensureString((p as any).location),
      address: p.address || ensureString((p as any).location),
      avatar: (p as any).image || p.avatar // Map backend 'image' to 'avatar'
    }
  } catch (err) {
    console.error("[v0] Error fetching patient:", err)
    return null
  }
}

export async function getPatientByEmail(email: string): Promise<Patient | undefined> {
  try {
    const patients = await getPatients()
    return patients.find((p) => p.email === email)
  } catch (err) {
    console.error("Error fetching patient by email:", err)
    return undefined
  }
}

export async function createPatient(patient: Omit<Patient, "id">): Promise<Patient> {
  return fetchAPI<Patient>("/patients", {
    method: "POST",
    body: JSON.stringify(patient),
  })
}

export async function updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
  const data = await fetchAPI<any>(`/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(patient),
  });
  
  const updated = transformMongoDocument(data);
  return {
    ...updated,
    avatar: (updated as any).image || updated.avatar
  } as Patient;
}

export async function toggleFavoriteDoctor(doctorId: string): Promise<any> {
  return fetchAPI<any>('/users/toggle-favorite', {
    method: 'POST',
    body: JSON.stringify({ doctorId })
  })
}

export async function deletePatient(id: string): Promise<void> {
  await fetchAPI(`/patients/${id}`, { method: "DELETE" })
}

// ============ REVIEWS API ============
export async function getReviews(): Promise<Review[]> {
  try {
    const data = await fetchAPI<any[]>("/reviews")
    return transformMongoArray(data)
  } catch (err) {
    console.error("[v0] Error fetching reviews:", err)
    return []
  }
}

export async function getReviewsByDoctorId(doctorId: string): Promise<Review[]> {
  try {
    const reviews = await getReviews()
    return reviews.filter((r) => String(r.doctorId) === String(doctorId))
  } catch (err) {
    console.error("Error fetching reviews by doctor:", err)
    return []
  }
}

export async function getReviewsByPatientId(patientId: string): Promise<Review[]> {
  try {
    const reviews = await getReviews()
    return reviews.filter((r) => String(r.patientId) === String(patientId))
  } catch (err) {
    console.error("Error fetching reviews by patient:", err)
    return []
  }
}

export async function createReview(review: { doctorId: string; patientId: string; rating: number; comment: string }): Promise<void> {
  await fetchAPI("/reviews", {
    method: "POST",
    body: JSON.stringify(review),
  })
}

export async function deleteReview(id: string): Promise<void> {
  await fetchAPI(`/reviews/${id}`, { method: "DELETE" })
}

// ============ APPOINTMENTS API ============
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const data = await fetchAPI<any[]>("/appointments")
    return transformMongoArray(data).map((apt) => ({
      ...apt,
      // Backend sometimes stores type or location as nested objects
      type: ensureString(apt.type),
      location: ensureString(apt.location),
    }))
  } catch (err) {
    console.error("[v0] Error fetching appointments:", err)
    return []
  }
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    const data = await fetchAPI<any>(`/appointments/${id}`)
    return transformMongoDocument(data)
  } catch (err) {
    console.error("[v0] Error fetching appointment:", err)
    return null
  }
}

export async function getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
  try {
    const appointments = await getAppointments()
    return appointments.filter((a) => String(a.patientId) === String(patientId))
  } catch (err) {
    console.error("Error fetching appointments by patient:", err)
    return []
  }
}

export async function getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]> {
  try {
    const appointments = await getAppointments()
    return appointments.filter((a) => String(a.doctorId) === String(doctorId))
  } catch (err) {
    console.error("Error fetching appointments by doctor:", err)
    return []
  }
}

export async function getMedicalRecordsByPatientId(patientId: string): Promise<any[]> {
  // Backend does not support separate medical records yet. 
  // Records are derived from appointments in the frontend.
  return []
}

export async function createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment> {
  return fetchAPI<Appointment>("/appointments", {
    method: "POST",
    body: JSON.stringify(appointment),
  })
}

export async function updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
  return fetchAPI<Appointment>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(appointment),
  })
}

export async function deleteAppointment(id: string): Promise<void> {
  await fetchAPI(`/appointments/${id}`, { method: "DELETE" })
}

export async function updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
  return fetchAPI<Appointment>(`/appointments/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  })
}

export async function getAvailableSlots(doctorId: string, date: string, shiftId: string): Promise<string[]> {
  try {
    const res = await fetchAPI<any>(`/appointments/available-slots?doctorId=${doctorId}&date=${date}&shiftId=${shiftId}`)
    return res.freeSlots || []
  } catch (err) {
    return []
  }
}

// ============ PAYMENT API ============
export async function createPaymentIntent(amount: number, appointmentId?: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
  return fetchAPI<{ clientSecret: string; paymentIntentId: string }>('/payment/create-intent', {
    method: 'POST',
    body: JSON.stringify({ amount, appointmentId })
  })
}

export async function confirmPayment(data: { appointmentId: string; amount: number; paymentIntentId: string; currency?: string; status?: string }): Promise<any> {
  return fetchAPI<any>('/payment/confirm', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function getDoctorUniquePatients(doctorId: string): Promise<any[]> {
  try {
    const data = await fetchAPI<any[]>(`/appointments/doctor/${doctorId}/patients`)
    return data
  } catch (err) {
    console.error("Error fetching unique patients:", err)
    return []
  }
}



// ============ DASHBOARD STATS API ============
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [doctors, patients, appointments] = await Promise.all([
      getDoctors(),
      getPatients(),
      getAppointments(),
    ])

    // Calculate total revenue (sum of appointment fees)
    const totalRevenue = appointments.reduce((sum, apt) => {
      const doctor = doctors.find(d => String(d.id) === String(apt.doctorId))
      const fee = doctor?.fee ? parseInt(doctor.fee.replace(/[^0-9]/g, '')) : 0
      return sum + fee
    }, 0)

    // Get top doctors by appointment count
    const doctorAppointmentCounts = doctors.map(doctor => ({
      ...doctor,
      totalAppointments: appointments.filter(a => String(a.doctorId) === String(doctor.id)).length
    }))
    const topDoctors = doctorAppointmentCounts
      .sort((a, b) => b.totalAppointments - a.totalAppointments)
      .slice(0, 5)

    // Get recent appointments
    const recentAppointments = appointments
      .sort((a, b) => {
        const dateB = b.date ? new Date(b.date).getTime() : 0
        const dateA = a.date ? new Date(a.date).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 5)
      .map(apt => ({
        ...apt,
        doctorName: doctors.find(d => String(d.id) === String(apt.doctorId))?.name || 'Unknown',
        patientName: patients.find(p => String(p.id) === String(apt.patientId))?.name || 'Unknown',
      }))

    return {
      totalDoctors: doctors.length,
      totalPatients: patients.length,
      totalAppointments: appointments.length,
      totalRevenue,
      topDoctors,
      recentAppointments,
    }
  } catch (err) {
    console.error("Error fetching dashboard stats:", err)
    return {
      totalDoctors: 0,
      totalPatients: 0,
      totalAppointments: 0,
      totalRevenue: 0,
      topDoctors: [],
      recentAppointments: [],
    }
  }
}

// ============ QUEUE API ============
export const getQueueState = async (shiftId: string): Promise<QueueState> => {
  try {
    // Backend doesn't have GET /queue/:id, use /queue/patients which returns currentServing
    const res = await fetchAPI<any>('/queue/patients', {
      method: 'POST',
      body: JSON.stringify({ shiftId })
    })
    return { 
      shiftId, 
      currentServing: res.currentServing || 0, 
      lastQueueNumber: (res.patients || []).length 
    }
  } catch (err) {
    console.error("Error fetching queue state:", err)
    return { shiftId, currentServing: 0, lastQueueNumber: 0 }
  }
}

export const trackQueue = async (shiftId: string, phoneLast4: string): Promise<QueueState> => {
  // Use getQueueState since /queue/track doesn't exist on backend
  return getQueueState(shiftId)
}

export const nextQueuePatient = async (shiftId: string): Promise<{ message: string; currentServing: number }> => {
  return fetchAPI<{ message: string; currentServing: number }>('/queue/next', {
    method: 'POST',
    body: JSON.stringify({ shiftId })
  })
}

export const startShiftQueue = async (shiftId: string): Promise<any> => {
  return fetchAPI<any>('/queue/start-shift', {
    method: 'POST',
    body: JSON.stringify({ shiftId })
  })
}

export const endShiftQueue = async (shiftId: string): Promise<any> => {
  return fetchAPI<any>('/queue/end-shift', {
    method: 'POST',
    body: JSON.stringify({ shiftId })
  })
}

export const getQueuePatients = async (shiftId: string): Promise<any> => {
  return fetchAPI<any>('/queue/patients', {
    method: 'POST',
    body: JSON.stringify({ shiftId })
  })
}

// ============ SHIFTS API ============
export const createShift = async (shiftData: Partial<Shift>): Promise<Shift> => {
  return fetchAPI<Shift>('/shifts', {
    method: 'POST',
    body: JSON.stringify(shiftData)
  })
}

export const getActiveShift = async (doctorId: string): Promise<Shift | null> => {
  try {
    return await fetchAPI<Shift>(`/shifts/active?doctorId=${doctorId}`)
  } catch (err) {
    return null
  }
}

export const getBookableShifts = async (doctorId: string, date?: string): Promise<Shift[]> => {
  try {
    const query = date ? `?doctorId=${doctorId}&date=${date}` : `?doctorId=${doctorId}`
    return await fetchAPI<Shift[]>(`/shifts/for-booking${query}`)
  } catch (err) {
    return []
  }
}

export const startRestShift = async (shiftId: string): Promise<any> => {
  return fetchAPI<any>('/shifts/start', {
    method: 'POST',
    body: JSON.stringify({ shiftId })
  })
}

export const endRestShift = async (shiftId: string): Promise<any> => {
  return fetchAPI<any>('/shifts/end', {
    method: 'POST',
    body: JSON.stringify({ shiftId })
  })
}

// ============ NOTIFICATIONS API ============
export const getNotifications = async (unreadOnly = false): Promise<{ items: Notification[], total: number }> => {
  try {
    return await fetchAPI<any>(`/notifications?unreadOnly=${unreadOnly}`)
  } catch (err) {
    return { items: [], total: 0 }
  }
}

export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const res = await fetchAPI<{ unreadCount: number }>('/notifications/unread-count')
    return res.unreadCount
  } catch (err) {
    return 0
  }
}

export const markNotificationAsRead = async (id: string): Promise<any> => {
  return fetchAPI<any>(`/notifications/${id}/read`, { method: 'PATCH' })
}

export const markAllNotificationsAsRead = async (): Promise<any> => {
  return fetchAPI<any>(`/notifications/read-all`, { method: 'PATCH' })
}


// ============ DOCTOR INSIGHTS API ============
// Interface removed, imported from types.ts

export async function getDoctorInsights(doctorId: string): Promise<DoctorInsights> {
  try {
    const [appointments, doctor] = await Promise.all([
      getAppointmentsByDoctorId(doctorId),
      getDoctorById(doctorId)
    ])

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Daily summary - appointments for today
    const todaysAppointments = appointments.filter(apt => {
      if (!apt.date) return false
      const aptDate = new Date(apt.date)
      return aptDate.toISOString().split('T')[0] === today
    })

    const todaysRevenue = todaysAppointments
      .filter(apt => apt.status === 'Completed')
      .reduce((sum, apt) => {
        const fee = doctor?.fee ? parseInt(doctor.fee.replace(/[^0-9]/g, '')) : 0
        return sum + fee
      }, 0)

    // Monthly report - appointments for current month
    const monthlyAppointments = appointments.filter(apt => {
      if (!apt.date) return false
      const aptDate = new Date(apt.date)
      return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear
    })

    const monthlyRevenue = monthlyAppointments
      .filter(apt => apt.status === 'Completed')
      .reduce((sum, apt) => {
        const fee = doctor?.fee ? parseInt(doctor.fee.replace(/[^0-9]/g, '')) : 0
        return sum + fee
      }, 0)

    // Statistics
    const completedAppointments = appointments.filter(apt => apt.status === 'Completed')
    const uniquePatients = new Set(completedAppointments.map(apt => apt.patientId)).size
    const totalEarnings = completedAppointments.reduce((sum, apt) => {
      const fee = doctor?.fee ? parseInt(doctor.fee.replace(/[^0-9]/g, '')) : 0
      return sum + fee
    }, 0)

    // Weekly overview - last 7 days
    const weeklyOverview = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayAppointments = appointments.filter(apt => {
        if (!apt.date) return false
        const aptDate = new Date(apt.date)
        return aptDate.toISOString().split('T')[0] === dateStr
      })
      
      const dayRevenue = dayAppointments
        .filter(apt => apt.status === 'Completed')
        .reduce((sum, apt) => {
          const fee = doctor?.fee ? parseInt(doctor.fee.replace(/[^0-9]/g, '')) : 0
          return sum + fee
        }, 0)

      weeklyOverview.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        appointments: dayAppointments.length,
        revenue: dayRevenue
      })
    }

    return {
      dailySummary: {
        totalAppointments: todaysAppointments.length,
        completedAppointments: todaysAppointments.filter(apt => apt.status === 'Completed').length,
        pendingAppointments: todaysAppointments.filter(apt => apt.status === 'Pending').length,
        cancelledAppointments: todaysAppointments.filter(apt => apt.status === 'Cancelled').length,
        todaysRevenue
      },
      monthlyReport: {
        totalAppointments: monthlyAppointments.length,
        completedAppointments: monthlyAppointments.filter(apt => apt.status === 'Completed').length,
        totalRevenue: monthlyRevenue,
        averageRevenuePerAppointment: monthlyAppointments.length > 0 ? monthlyRevenue / monthlyAppointments.length : 0
      },
      statistics: {
        totalPatientsSeen: uniquePatients,
        averageConsultationDuration: 30, // Placeholder - would need actual duration data
        totalEarnings,
        averageRating: doctor?.averageRating || 0
      },
      weeklyOverview
    }
  } catch (err) {
    console.error("Error fetching doctor insights:", err)
    return {
      dailySummary: {
        totalAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        cancelledAppointments: 0,
        todaysRevenue: 0
      },
      monthlyReport: {
        totalAppointments: 0,
        completedAppointments: 0,
        totalRevenue: 0,
        averageRevenuePerAppointment: 0
      },
      statistics: {
        totalPatientsSeen: 0,
        averageConsultationDuration: 0,
        totalEarnings: 0,
        averageRating: 0
      },
      weeklyOverview: []
    }
  }
}
