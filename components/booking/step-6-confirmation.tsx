"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Calendar, Clock, MapPin, User, FileText, X, Printer, Download } from "lucide-react"
import Link from "next/link"

const ReceiptModal = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: any }) => {
  if (!isOpen) return null;

  const isPaid = data.payment?.method === 'stripe' || data.payment?.status === 'succeeded';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            <h3 className="text-xl font-bold font-heading">Appointment Receipt</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-6" id="receipt-content">
          <div className="text-center border-b border-dashed border-gray-200 pb-6">
            <h4 className="text-2xl font-bold text-gray-900 mb-1">SwiftCare</h4>
            <p className="text-sm text-gray-500 italic">"Your Trusted Healthcare Partner"</p>
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Booking Number</p>
              <p className="font-mono font-bold text-primary text-base">{data.bookingNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Status</p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {isPaid ? 'Paid' : 'Pay at Clinic'}
              </span>
            </div>
            
            <div className="col-span-2 pt-2 border-t border-gray-100">
              <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Doctor</p>
              <p className="font-bold text-gray-900 text-lg uppercase">{data.doctor.name}</p>
              <p className="text-primary text-xs font-medium">{data.doctor.specialty} Specialist</p>
            </div>

            <div>
              <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Date</p>
              <p className="font-semibold text-gray-900">{data.dateTime?.fullDate || 'TBD'}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Time</p>
              <p className="font-semibold text-gray-900">{data.dateTime?.time} {data.dateTime?.period}</p>
            </div>

            <div className="col-span-2 pt-4 border-t border-gray-100 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Consultation Fee</span>
                <span className="font-bold text-gray-900">{data.doctor.fee}</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-gray-400 text-xs italic">
                <span>Inclusive of all service charges</span>
                <span>RS. 0</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900">
                <span className="text-lg font-black uppercase text-gray-900">Total Amount</span>
                <span className="text-2xl font-black text-primary">{data.doctor.fee}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl text-[10px] text-gray-500 leading-relaxed text-center">
            This is a computer-generated receipt. Please present your Booking Number at the clinic reception upon arrival.
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button variant="ghost" className="flex-1 hover:bg-gray-200" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function BookingStep6({ data, onBack }: { data: any, onBack: () => void }) {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Format the date and time for display
  const formatDateTime = () => {
    if (data.dateTime) {
      return `${data.dateTime.time} ${data.dateTime.period}, ${data.dateTime.fullDate}`
    }
    return "Date not selected"
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      <div className="grid md:grid-cols-3 gap-6">
        {/* Confirmation Card */}
        <div className="md:col-span-2">
          <Card className="p-8 mb-6 border-none shadow-xl bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0 opacity-50" />
            
            <div className="flex flex-col items-center text-center mb-8 relative z-10">
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mb-4 animate-in zoom-in-50 duration-500">
                <Check className="w-10 h-10 text-teal-600" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-500 font-medium">Your appointment has been successfully scheduled.</p>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Appointment Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Doctor Name</p>
                    <p className="font-bold text-gray-900 text-lg">{data.doctor.name}</p>
                    <p className="text-primary italic">{data.doctor.specialty} Specialist</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Appointment Time</p>
                    <p className="font-bold text-gray-900 text-lg">{data.dateTime?.time} {data.dateTime?.period}</p>
                    <p className="text-gray-600 font-medium">{data.dateTime?.fullDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Consultation Fee</p>
                    <p className="font-bold text-gray-900 text-lg">{data.doctor.fee}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${data.payment?.method === 'clinic' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                      {data.payment?.method === 'clinic' ? 'Pay at Clinic' : 'Paid Online'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Location</p>
                    <p className="font-bold text-gray-900">{data.doctor.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <Button onClick={() => setIsReceiptOpen(true)} className="flex-1 bg-gray-900 hover:bg-black text-white h-12 rounded-xl font-bold gap-2">
                  <FileText className="w-5 h-5" /> View Receipt
                </Button>
                <Link href="/patient/appointments" className="flex-1">
                  <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-2 hover:bg-gray-50">
                    Go to Appointments
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <p className="text-center text-xs text-gray-400">
            A confirmation email has been sent to {data.basicInfo?.email || 'your registered email'}.
          </p>
        </div>

        {/* Info Column */}
        <div className="space-y-6">

          <Card className="p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-3">Next Steps</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-xs text-gray-600">
                <div className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <p>Arrive at the clinic 15 mins before your scheduled time.</p>
              </li>
              <li className="flex gap-3 text-xs text-gray-600">
                <div className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <p>Present your booking number at the check-in desk.</p>
              </li>
              <li className="flex gap-3 text-xs text-gray-600">
                <div className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <p>Consult with {data.doctor.name} at {data.dateTime?.time}.</p>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <ReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        data={data} 
      />
    </div>
  )
}
