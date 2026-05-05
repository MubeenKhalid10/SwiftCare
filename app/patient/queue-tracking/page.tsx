"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2, Users, ArrowRight, RefreshCcw, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { PatientSidebar } from "@/components/patient/patient-sidebar"
import { useAuth } from "@/lib/auth-context"
import { getQueueState, trackQueue } from "@/lib/api"
import { socket, connectSocket } from "@/lib/socket"
import type { QueueState } from "@/lib/types"

export default function QueueTrackingPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [shiftId, setShiftId] = useState("")
  const [trackingId, setTrackingId] = useState<string | null>(null)
  const [queueState, setQueueState] = useState<QueueState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remainingQueue = queueState ? Math.max(0, queueState.lastQueueNumber - queueState.currentServing) : 0
  const estimatedWaitMinutes = remainingQueue * 10

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "patient")) {
      router.push("/auth/login")
      return
    }
  }, [isAuthenticated, authLoading, router, user?.role])

  useEffect(() => {
    if (!socket.connected) {
      connectSocket()
    }

    const onQueueUpdated = (data: { shiftId: string; currentServing: number }) => {
      if (data.shiftId === trackingId) {
        setQueueState(prev => prev ? { ...prev, currentServing: data.currentServing } : {
          shiftId: data.shiftId,
          currentServing: data.currentServing,
          lastQueueNumber: 0,
        })
      }
    }

    socket.on("queueUpdated", onQueueUpdated)

    return () => {
      socket.off("queueUpdated", onQueueUpdated)
    }
  }, [trackingId])

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shiftId.trim()) return

    try {
      setIsLoading(true)
      setError(null)
      
      const state = await trackQueue(shiftId, "") // phoneLast4 is not needed for authenticated users
      setQueueState(state)
      setTrackingId(shiftId)
      
      socket.emit("joinQueueRoom", shiftId)
    } catch (err: any) {
      setError(err.message || "Failed to fetch queue state. Please check the Shift ID and Phone digits.")
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <span className="text-blue-600">●</span>
          <span className="text-gray-600">Patient</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Queue Tracking</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">Live Queue Tracking</h1>
          <p className="text-gray-600 mt-2">Enter your Shift ID to track your position in real-time.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <PatientSidebar />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Track a Queue</CardTitle>
                <CardDescription>
                  Enter the Shift ID provided in your appointment details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrack} className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Enter Shift ID"
                      className="pl-10"
                      value={shiftId}
                      onChange={(e) => setShiftId(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="bg-blue-600" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                    Track
                  </Button>
                </form>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </CardContent>
            </Card>

            {trackingId && queueState !== null && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Queue Active</h2>
                    <p className="text-gray-600 mb-8 font-mono text-sm">Tracking: {trackingId}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-md">
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                        <p className="text-sm text-gray-500 mb-1 capitalize">Currently Serving</p>
                        <p className="text-4xl font-extrabold text-blue-600">
                          {queueState.currentServing > 0 ? `Queue #${queueState.currentServing}` : 'Waiting'}
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex flex-col items-center justify-center">
                        <p className="text-sm text-gray-500 mb-1">Remaining Queue</p>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                          </span>
                          {remainingQueue > 0 ? `${remainingQueue} patients ahead` : 'No patients waiting'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                      Approx. wait: {estimatedWaitMinutes} min
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {!trackingId && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                <Users className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Your tracking results will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
