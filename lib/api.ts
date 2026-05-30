import type { Doctor, Patient, Review, Appointment, LoginCredentials, RegisterData, User, DashboardStats, DoctorInsights, QueueState, Shift, Notification, Facility } from "./types"
import { getAccessToken, refreshAccessToken } from "./auth.service"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://swiftcare.up.railway.app").replace(/\/+$/, "")

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

function normalizeAppointmentStatusDisplay(status?: string): Appointment["status"] {
  const raw = String(status || "").trim().toLowerCase()

  if (raw === "in progress" || raw === "in-progress" || raw === "inprogress" || raw === "in_progress") {
    return "In Progress"
  }

  if (raw === "pending" || raw === "confirmed") {
    return "Pending"
  }

  if (raw === "completed") {
    return "Completed"
  }

  if (raw === "cancelled" || raw === "canceled") {
    return "Cancelled"
  }

  return "Pending"
}

function normalizeAppointmentRecord<T extends Appointment & { [key: string]: any }>(appointment: T): T {
  return {
    ...appointment,
    status: normalizeAppointmentStatusDisplay(appointment.status),
    type: ensureString(appointment.type),
    location: ensureString(appointment.location),
    patientName: appointment.patientName || appointment.bookingFor || 'Unknown Patient',
  }
}

function extractLocationCoordinates(value: any): [number, number] | undefined {
  const rawCoordinates = value?.coordinates || value?.geo?.coordinates
  if (!Array.isArray(rawCoordinates) || rawCoordinates.length < 2) return undefined

  const lng = Number(rawCoordinates[0])
  const lat = Number(rawCoordinates[1])
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return undefined

  return [lng, lat]
}

function extractLocationLabel(value: any): string | undefined {
  if (!value) return undefined
  if (typeof value === "string") return value
  return value.label || value.clinicName || value.address || value.name || undefined
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
      console.log(`[v0] Authorization token attached (length: ${token.length})`)
    } else {
      console.warn(`[v0] No access token available for: ${endpoint}`)
    }

    console.log(`[v0] API call: ${endpoint}`)

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // CRITICAL: Send cookies with request
    })

    // Handle 401 - token expired, try to refresh and retry
    if (response.status === 401 && retry) {
      if (!token) {
        throw new Error("Unauthorized")
      }

      try {
        console.log(`[v0] Token expired (401), refreshing...`)
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
        console.log(`[v0] Retry successful after token refresh`)
        return data
      } catch (err) {
        if (err instanceof Error && (err.message === "Unauthorized" || err.message === "No refresh token" || err.message === "Authentication failed. Please login again.")) {
          throw err
        }
        console.error(`[v0] Token refresh failed:`, err)
        throw new Error("Authentication failed. Please login again.")
      }
    }

    // Handle 403 - user doesn't have permission, don't retry
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`[v0] Access forbidden (403):`, errorData)
      throw new Error(errorData.message || errorData.error || "You don't have permission to access this resource")
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || `API Error: ${response.status} ${response.statusText}`
      
      // Only log non-validation errors to console
      if (!isExpectedValidationError(errorMessage)) {
        console.error(`[v0] API error ${response.status}:`, errorData)
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    if (errorMessage !== "Unauthorized" && !isExpectedValidationError(errorMessage)) {
      console.error(`[v0] Error fetching ${endpoint}:`, errorMessage)
    }
    throw err
  }
}

// Check if an error message is an expected validation error that should not be logged to console
function isExpectedValidationError(message: string): boolean {
  if (!message) return false
  const lowerMsg = message.toLowerCase()
  
  // Expected shift management validation errors
  if (lowerMsg.includes("another shift is already active")) return true
  if (lowerMsg.includes("shift is not active")) return true
  if (lowerMsg.includes("already has an active shift")) return true
  if (lowerMsg.includes("no shift is active")) return true
  if (lowerMsg.includes("no active shift found")) return true
  
  return false
}

function normalizeAppointmentStatusValue(status: string): string {
  const raw = String(status || '').trim().toLowerCase()
  if (raw === 'in progress' || raw === 'in-progress' || raw === 'inprogress' || raw === 'in_progress') return 'in-progress'
  return raw
}

// ============ DOCTORS API ============
export async function getDoctors(minRating?: number, sortBy?: string, includeUnapproved?: boolean): Promise<Doctor[]> {
  try {
    const params = new URLSearchParams()
    if (minRating) params.append('minRating', minRating.toString())
    if (sortBy) params.append('sortBy', sortBy)
    
    const query = params.toString() ? `?${params.toString()}` : ""
    const data = await fetchAPI<any[]>(`/doctors${query}`)
    const reviews = await getReviews()
    
    // Filter out unapproved doctors unless explicitly requested
    const filteredData = includeUnapproved ? data : data.filter(doc => 
      (doc as any)?.accountStatus?.verificationStatus === 'approved'
    )
    
    return filteredData.map((doc) => {
      const transformed = { ...doc }
      
      // Transform MongoDB _id to id if needed
      if ((doc as any)._id && !transformed.id) {
        transformed.id = (doc as any)._id
      }
      
      // Override location with hospital affiliation if available
      const affiliation = (doc as any).hospitalAffiliation;
      const isRegisteredAffiliation = affiliation && (affiliation.type === 'registered' || affiliation.affiliationType === 'registered');
      const affiliationLocation = isRegisteredAffiliation ? affiliation.hospitalLocation : null;
      const affiliationName = isRegisteredAffiliation ? affiliation.hospitalName : null;

      const locationValue = (doc as any).location || (doc as any).clinicInfo?.location
      transformed.location = affiliationLocation || ensureString(locationValue) || (doc as any).clinicInfo?.location
      transformed.locationLabel = affiliationLocation || extractLocationLabel(locationValue) || transformed.location
      transformed.locationCoordinates = extractLocationCoordinates(locationValue) || extractLocationCoordinates((doc as any).location?.geo)
      transformed.clinicName = affiliationName || (locationValue && typeof locationValue === 'object' ? locationValue.clinicName : undefined) || (doc as any).clinicName || transformed.clinicName
      
      // Calculate ratings for this doctor
      const docReviews = reviews.filter(r => String(r.doctorId) === String(transformed.id || doc.id || (doc as any)._id))
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
    
    // Extract schedule from nested or top-level structure
    const schedule = (doc as any).schedule || {
      availableDays: (doc as any).availableDays || [],
      availableHours: (doc as any).availableHours || []
    }
    
    // Override location with hospital affiliation if available
    const affiliation = (doc as any).hospitalAffiliation;
    const isRegisteredAffiliation = affiliation && (affiliation.type === 'registered' || affiliation.affiliationType === 'registered');
    const affiliationLocation = isRegisteredAffiliation ? affiliation.hospitalLocation : null;
    const affiliationName = isRegisteredAffiliation ? affiliation.hospitalName : null;

    return {
      ...doc,
      location: affiliationLocation || ensureString(doc.location) || (doc as any).clinicInfo?.location,
      locationLabel: affiliationLocation || extractLocationLabel((doc as any).location) || ensureString(doc.location) || (doc as any).clinicInfo?.location,
      locationCoordinates: extractLocationCoordinates((doc as any).location) || extractLocationCoordinates((doc as any).location?.geo),
      clinicName: affiliationName || (doc.location && typeof doc.location === 'object' ? (doc.location as any).clinicName : undefined) || (doc as any).clinicName || doc.clinicName,
      schedule: schedule,  // Ensure schedule is included
      availableDays: schedule.availableDays,  // Also map to top-level for compatibility
      availableHours: schedule.availableHours,
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
    const data = await fetchAPI<any>("/patients")
    // Handle both array response and paginated response
    const items = Array.isArray(data) ? data : (data?.items || [])
    return transformMongoArray(items).map((p: any) => ({
      ...p,
      id: p.id || p._id,
      email: p.email || p.credentials?.email || '',
      location: ensureString((p as any).location),
      address: p.address || ensureString((p as any).location),
      avatar: p.avatar || p.image
    })) as Patient[]
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
      id: (p as any).id || (p as any)._id,
      email: (p as any).email || (p as any).credentials?.email || '',
      location: ensureString((p as any).location),
      address: p.address || ensureString((p as any).location),
      avatar: (p as any).image || p.avatar // Map backend 'image' to 'avatar'
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    // 403 Forbidden is expected when non-admin users try to access other users' patient profiles
    // Only log other errors
    if (!errorMsg.includes('403')) {
      console.error("[v0] Error fetching patient:", err)
    }
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
    const data = await fetchAPI<any>("/reviews")
    // Backend returns paginated response: { page, limit, totalCount, items: [...] }
    const items = Array.isArray(data) ? data : (data?.items || [])
    return transformMongoArray(items)
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
    const data = await fetchAPI<any>("/appointments")
    // Handle both array response and paginated response
    const items = Array.isArray(data) ? data : (data?.items || [])
    return transformMongoArray(items).map((apt: any) => normalizeAppointmentRecord({
      ...apt,
      // Backend sometimes stores type or location as nested objects
      type: ensureString(apt.type),
      location: ensureString(apt.location),
      patientName: apt.patientName || apt.bookingFor || 'Unknown Patient',
    })) as Appointment[]
  } catch (err) {
    console.error("[v0] Error fetching appointments:", err)
    return []
  }
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    const data = await fetchAPI<any>(`/appointments/${id}`)
    return normalizeAppointmentRecord(transformMongoDocument(data))
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
    const [appointments, patients] = await Promise.all([
      getAppointments(),
      getPatients(),
    ])

    const patientNameById = new Map(
      patients.map((patient: any) => [String(patient.id || patient._id), patient.name || 'Unknown Patient'])
    )

    return appointments
      .filter((a) => String(a.doctorId) === String(doctorId))
      .map((appointment) => ({
        ...appointment,
        patientName: appointment.patientName || patientNameById.get(String(appointment.patientId)) || appointment.bookingFor || 'Unknown Patient',
      }))
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
  const data = await fetchAPI<Appointment>("/appointments", {
    method: "POST",
    body: JSON.stringify(appointment),
  })

  return normalizeAppointmentRecord(transformMongoDocument(data as any))
}

export async function updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
  const data = await fetchAPI<Appointment>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(appointment),
  })

  return normalizeAppointmentRecord(transformMongoDocument(data as any))
}

export async function deleteAppointment(id: string): Promise<void> {
  const endpoint = `/appointments/${id}`

  async function executeDelete(token?: string) {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    })
  }

  const token = getAccessToken()
  let response = await executeDelete(token || undefined)

  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken()
      response = await executeDelete(refreshedToken || undefined)
    } catch {
      throw new Error("Authentication failed. Please login again.")
    }
  }

  if (response.status === 404) {
    return
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || errorData.error || `API Error: ${response.status} ${response.statusText}`)
  }
}

export async function updateAppointmentStatus(id: string, status: string, consultationNotes?: string): Promise<Appointment> {
  const data = await fetchAPI<Appointment>(`/appointments/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: normalizeAppointmentStatusValue(status), ...(consultationNotes !== undefined && { consultationNotes }) }),
  })

  return normalizeAppointmentRecord(transformMongoDocument(data as any))
}

export type SlotAvailability = {
  doctorId: string
  date: string
  shiftId: string
  nextAvailableTime: string | null
  patientsBefore: number
}

export async function getSlotAvailability(doctorId: string, date: string, shiftId: string): Promise<SlotAvailability> {
  try {
    const res = await fetchAPI<SlotAvailability>(`/appointments/slot?doctorId=${doctorId}&date=${date}&shiftId=${shiftId}`)
    return {
      doctorId: String(res.doctorId || doctorId),
      date: String(res.date || date),
      shiftId: String(res.shiftId || shiftId),
      nextAvailableTime: res.nextAvailableTime ?? null,
      patientsBefore: Number.isFinite(Number(res.patientsBefore)) ? Number(res.patientsBefore) : 0,
    }
  } catch (err) {
    return {
      doctorId: String(doctorId),
      date: String(date),
      shiftId: String(shiftId),
      nextAvailableTime: null,
      patientsBefore: 0,
    }
  }
}

export async function getDoctorShiftsForBooking(doctorId: string): Promise<Shift[]> {
  try {
    return await fetchAPI<Shift[]>(`/shifts/upcoming?doctorId=${doctorId}`)
  } catch (err) {
    return []
  }
}

export async function getDoctorShifts(doctorId: string): Promise<Shift[]> {
  try {
    return await fetchAPI<Shift[]>(`/shifts/upcoming?doctorId=${doctorId}`)
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
    const [appointments, patients] = await Promise.all([
      getAppointmentsByDoctorId(doctorId),
      getPatients(),
    ])

    const patientMap = new Map(
      patients.map((patient: any) => [String(patient.id || patient._id), patient])
    )

    const uniquePatients = new Map<string, any>()
    appointments
      .filter((apt) => String(apt.doctorId) === String(doctorId))
      .sort((a, b) => {
        const dateB = b.date ? new Date(`${b.date} ${b.time || ''}`).getTime() : 0
        const dateA = a.date ? new Date(`${a.date} ${a.time || ''}`).getTime() : 0
        return dateB - dateA
      })
      .forEach((apt) => {
        const patientId = String(apt.patientId)
        if (!uniquePatients.has(patientId)) {
          const patient = patientMap.get(patientId)
          uniquePatients.set(patientId, {
            id: patientId,
            name: patient?.name || apt.patientName || 'Unknown Patient',
            age: patient?.age || apt.age || 'N/A',
            gender: patient?.gender || apt.gender || 'N/A',
            blood: patient?.bloodType || patient?.bloodGroup || 'N/A',
            location: patient?.location?.label || patient?.address || 'N/A',
            time: apt.time,
            lastBooking: apt.date,
            totalVisits: 1,
          })
        } else {
          const existing = uniquePatients.get(patientId)
          existing.totalVisits += 1
          existing.lastBooking = apt.date || existing.lastBooking
        }
      })

    return Array.from(uniquePatients.values())
  } catch (err) {
    console.error("Error fetching unique patients:", err)
    return []
  }
}



// ============ DASHBOARD STATS API ============
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [doctors, patients, appointments] = await Promise.all([
      getDoctors(undefined, undefined, true),
      getPatients(),
      getAppointments(),
    ])

    // Calculate total revenue from appointment amounts when available.
    // Fall back to doctor consultation fee for older records.
    const totalRevenue = appointments.reduce((sum, apt) => {
      if (typeof apt.amount === 'number' && Number.isFinite(apt.amount)) {
        return sum + apt.amount
      }

      const doctor = doctors.find(d => String(d.id) === String(apt.doctorId))
      const fee = doctor?.fee ? parseInt(doctor.fee.replace(/[^0-9]/g, '')) : 0
      return sum + fee
    }, 0)

    const getYear = (value: any): number | null => {
      if (!value) return null
      const dt = new Date(value)
      return Number.isNaN(dt.getTime()) ? null : dt.getFullYear()
    }

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 6 }, (_, idx) => currentYear - (5 - idx))

    const revenueByYear = new Map<number, number>()
    years.forEach((y) => revenueByYear.set(y, 0))

    for (const apt of appointments) {
      const year = getYear((apt as any).fullDateIso) ?? getYear(apt.date) ?? getYear((apt as any).createdAt)
      if (year == null || !revenueByYear.has(year)) continue

      const amount = typeof apt.amount === 'number' && Number.isFinite(apt.amount)
        ? apt.amount
        : (() => {
            const doctor = doctors.find(d => String(d.id) === String(apt.doctorId))
            return doctor?.fee ? parseInt(doctor.fee.replace(/[^0-9]/g, '')) : 0
          })()

      revenueByYear.set(year, (revenueByYear.get(year) || 0) + amount)
    }

    const doctorRegistrationsByYear = new Map<number, number>()
    const patientRegistrationsByYear = new Map<number, number>()
    years.forEach((y) => {
      doctorRegistrationsByYear.set(y, 0)
      patientRegistrationsByYear.set(y, 0)
    })

    for (const doctor of doctors) {
      const year = getYear((doctor as any).createdAt)
      if (year != null && doctorRegistrationsByYear.has(year)) {
        doctorRegistrationsByYear.set(year, (doctorRegistrationsByYear.get(year) || 0) + 1)
      }
    }

    for (const patient of patients) {
      const year = getYear((patient as any).createdAt)
      if (year != null && patientRegistrationsByYear.has(year)) {
        patientRegistrationsByYear.set(year, (patientRegistrationsByYear.get(year) || 0) + 1)
      }
    }

    let runningDoctors = 0
    let runningPatients = 0

    const revenueAnalytics = years.map((year) => ({
      year,
      revenue: revenueByYear.get(year) || 0,
    }))

    const statusAnalytics = years.map((year) => {
      runningDoctors += doctorRegistrationsByYear.get(year) || 0
      runningPatients += patientRegistrationsByYear.get(year) || 0

      return {
        year,
        doctors: runningDoctors,
        patients: runningPatients,
      }
    })

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
      revenueAnalytics,
      statusAnalytics,
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
      revenueAnalytics: [],
      statusAnalytics: [],
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

    const patients = Array.isArray(res?.patients) ? res.patients : []
    const sortedPatients = [...patients].sort((a: any, b: any) => {
      const aQueue = Number.isFinite(Number(a?.queueNumber)) ? Number(a.queueNumber) : Number.MAX_SAFE_INTEGER
      const bQueue = Number.isFinite(Number(b?.queueNumber)) ? Number(b.queueNumber) : Number.MAX_SAFE_INTEGER
      if (aQueue !== bQueue) return aQueue - bQueue

      const aTime = new Date(`${a?.date || ''} ${a?.time || ''}`).getTime()
      const bTime = new Date(`${b?.date || ''} ${b?.time || ''}`).getTime()
      if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== bTime) return aTime - bTime

      return String(a?._id || a?.id || '').localeCompare(String(b?._id || b?.id || ''))
    })

    const rawCurrentServing = Number.isFinite(Number(res?.currentServing)) ? Number(res.currentServing) : 0
    // Convert sparse slot-based queue progress into dense progress based on booked appointments only.
    const denseCurrentServing = sortedPatients.reduce((count: number, patient: any) => {
      const queueNum = Number.isFinite(Number(patient?.queueNumber)) ? Number(patient.queueNumber) : Number.MAX_SAFE_INTEGER
      return queueNum <= rawCurrentServing ? count + 1 : count
    }, 0)

    // If backend queue counter is stale, infer current serving from explicit in-progress appointment.
    const inProgressPosition = sortedPatients.findIndex((patient: any) => {
      const status = String(patient?.status || '').trim().toLowerCase()
      return status === 'in_progress' || status === 'in progress' || status === 'in-progress' || status === 'inprogress'
    }) + 1

    const effectiveCurrentServing = inProgressPosition > 0 ? inProgressPosition : denseCurrentServing

    return { 
      shiftId, 
      currentServing: effectiveCurrentServing,
      lastQueueNumber: sortedPatients.length
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

export const nextQueuePatient = async (shiftId: string): Promise<{ message: string; currentServing: number; currentAppointment?: any }> => {
  return fetchAPI<{ message: string; currentServing: number; currentAppointment?: any }>('/queue/next', {
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
    return await fetchAPI<Shift[]>(`/shifts/upcoming${query}`)
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

export const generateNextShifts = async (doctorId: string, days = 30): Promise<any> => {
  return fetchAPI<any>('/shifts/generate-next', {
    method: 'POST',
    body: JSON.stringify({ doctorId, days })
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

export type ContactMessagePayload = {
  name: string
  contactNumber: string
  email: string
  subject: string
  message: string
}

export async function sendContactMessage(payload: ContactMessagePayload): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`/api/user/contact`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
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

// ============ FACILITIES API ============
export async function getFacilities(page = 1, limit = 20): Promise<{ items: Facility[], page: number, limit: number, totalCount: number }> {
  try {
    const data = await fetchAPI<any>(`/facilities?page=${page}&limit=${limit}`)
    return {
      items: transformMongoArray(data.items || []),
      page: data.page || 1,
      limit: data.limit || 20,
      totalCount: data.totalCount || 0
    }
  } catch (err) {
    console.error("[v0] Error fetching facilities:", err instanceof Error ? err.message : err)
    return { items: [], page: 1, limit: 20, totalCount: 0 }
  }
}

export async function getFacilityById(id: string): Promise<Facility | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
      return transformMongoDocument(data) as Facility
    }

    if (response.status !== 403) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[v0] Error fetching facility:", errorData.error || response.statusText || response.status)
    }

    const targetId = String(id)
    const maxPages = 20
    const pageSize = 100

    for (let page = 1; page <= maxPages; page += 1) {
      const data = await getFacilities(page, pageSize)
      const match = data.items.find((facility) => String(facility.id || facility._id) === targetId)
      if (match) {
        return match
      }

      if (!data.items.length || page * pageSize >= data.totalCount) {
        break
      }
    }

    return null
  } catch (err) {
    console.error("[v0] Error fetching facility:", err instanceof Error ? err.message : err)
    return null
  }
}

export async function createFacility(facility: Omit<Facility, "id" | "_id">): Promise<Facility> {
  try {
    const response = await fetchAPI<any>('/facilities', {
      method: 'POST',
      body: JSON.stringify(facility)
    })
    return transformMongoDocument(response.facility) as Facility
  } catch (err) {
    console.error("[v0] Error creating facility:", err instanceof Error ? err.message : err)
    throw err
  }
}

export async function updateFacility(id: string, facility: Partial<Facility>): Promise<Facility> {
  try {
    const response = await fetchAPI<any>(`/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(facility)
    })
    return transformMongoDocument(response.facility) as Facility
  } catch (err) {
    console.error("[v0] Error updating facility:", err instanceof Error ? err.message : err)
    throw err
  }
}

export async function deleteFacility(id: string): Promise<void> {
  try {
    await fetchAPI<any>(`/facilities/${id}`, {
      method: 'DELETE'
    })
  } catch (err) {
    console.error("[v0] Error deleting facility:", err instanceof Error ? err.message : err)
    throw err
  }
}
