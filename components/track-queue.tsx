"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, Users, RefreshCcw, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { trackQueue } from "@/lib/api"
import { socket, connectSocket } from "@/lib/socket"
import { useAuth } from "@/lib/auth-context"

export default function TrackQueue() {
  const { isAuthenticated } = useAuth()
  const [shiftId, setShiftId] = useState("")
  const [phoneLast4, setPhoneLast4] = useState("")
  const [trackingData, setTrackingData] = useState<{ shiftId: string; currentServing: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remainingQueue = trackingData ? Math.max(0, trackingData.lastQueueNumber - trackingData.currentServing) : 0
  const estimatedWaitMinutes = remainingQueue * 10

  useEffect(() => {
    if (!socket.connected) {
      connectSocket()
    }

    const onQueueUpdated = (data: { shiftId: string; currentServing: number }) => {
      if (trackingData && data.shiftId === trackingData.shiftId) {
        setTrackingData(data)
      }
    }

    socket.on("queueUpdated", onQueueUpdated)

    return () => {
      socket.off("queueUpdated", onQueueUpdated)
    }
  }, [trackingData])

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shiftId.trim()) return
    
    if (!isAuthenticated) {
      if (!phoneLast4.trim()) return
      if (phoneLast4.length !== 4) {
        setError("Please enter exactly 4 digits of your phone number.")
        return
      }
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const state = await trackQueue(shiftId, isAuthenticated ? "" : phoneLast4)
      setTrackingData({ shiftId, currentServing: state.currentServing })
      
      socket.emit("joinQueueRoom", shiftId)
    } catch (err: any) {
      setError(err.message || "Failed to track queue. Please check your details.")
      setTrackingData(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gray-50 overflow-hidden" id="track-queue">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-primary">
              Track Your Position <br />
              <span className="text-blue-600">In Real-Time</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              No need to wait in long lines. Enter your appointment details to see your current place in the queue and know exactly when it's your turn.
            </p>
            
            <div className="flex flex-col gap-4">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-blue-600">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Secure Access</h4>
                    <p className="text-gray-500 text-sm">Verified by your registered phone number.</p>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-blue-600">
                    <RefreshCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Live Updates</h4>
                    <p className="text-gray-500 text-sm">Instant notifications via Socket.IO technology.</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
            
            <Card className="relative border-blue-100 shadow-xl shadow-blue-500/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Queue Tracker</CardTitle>
                <CardDescription>Enter details to start live tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleTrack} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tracking ID (Shift ID)</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="e.g. 65d8c..."
                        className="pl-10 h-11 border-gray-200 focus:border-blue-500"
                        value={shiftId}
                        onChange={(e) => setShiftId(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {!isAuthenticated && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Suffix (Last 4 Digits)</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="e.g. 1234"
                          maxLength={4}
                          className="pl-10 h-11 border-gray-200 focus:border-blue-500"
                          value={phoneLast4}
                          onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-white shadow-lg shadow-blue-500/30" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                    Track Appointment
                  </Button>
                </form>

                {error && <p className="text-red-500 text-xs mt-2 bg-red-50 p-2 rounded border border-red-100">{error}</p>}

                {trackingData && (
                  <div className="pt-6 border-t border-gray-100 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-blue-50/50 rounded-2xl p-6 text-center border border-blue-100">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Currently Serving</p>
                      <p className="text-5xl font-black text-blue-600 mb-2">{trackingData.currentServing}</p>
                      <div className="flex items-center justify-center gap-2 text-xs text-green-600 font-bold">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live Updates Active
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-white rounded-xl border border-blue-100 p-4 text-center">
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">Remaining Queue</p>
                        <p className="text-2xl font-black text-gray-900">{remainingQueue}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-blue-100 p-4 text-center">
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">Approx. Wait</p>
                        <p className="text-2xl font-black text-gray-900">{estimatedWaitMinutes} min</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
