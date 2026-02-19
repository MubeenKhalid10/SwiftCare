import type { Doctor, Patient, Review, Appointment, LoginCredentials, RegisterData, User, DashboardStats } from "./types"
import { getAccessToken, refreshAccessToken } from "./auth.service"

const API_BASE_URL = "https://swiftcare.up.railway.app"

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

// Generic fetch wrapper with error handling and token management
async function fetchAPI<T>(endpoint: string, options?: RequestInit, retry = true): Promise<T> {
  try {
    const token = getAccessToken()
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options?.headers,
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
      throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`)
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
export async function getDoctors(): Promise<Doctor[]> {
  try {
    const data = await fetchAPI<any[]>("/doctors")
    return transformMongoArray(data)
  } catch (err) {
    console.error("[v0] Error fetching doctors:", err instanceof Error ? err.message : err)
    return []
  }
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  try {
    const data = await fetchAPI<any>(`/doctors/${id}`)
    return transformMongoDocument(data)
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

// ============ PATIENTS API ============
export async function getPatients(): Promise<Patient[]> {
  try {
    const data = await fetchAPI<any[]>("/patients")
    return transformMongoArray(data)
  } catch (err) {
    console.error("[v0] Error fetching patients:", err)
    return []
  }
}

export async function getPatientById(id: string): Promise<Patient | null> {
  try {
    const data = await fetchAPI<any>(`/patients/${id}`)
    return transformMongoDocument(data)
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
  return fetchAPI<Patient>(`/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(patient),
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

export async function createReview(review: Omit<Review, "id">): Promise<Review> {
  return fetchAPI<Review>("/reviews", {
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
    return transformMongoArray(data)
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
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
