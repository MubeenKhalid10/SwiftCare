"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, User, FileText, Printer, Share2, X } from "lucide-react"

interface RecordDetailModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
}

export function RecordDetailModal({ isOpen, onClose, record }: RecordDetailModalProps) {
  if (!record) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">{record.name}</DialogTitle>
              <p className="text-blue-100 text-sm font-medium">{record.id}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p>
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Calendar className="w-4 h-4 text-blue-500" />
                {record.date}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time</p>
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Clock className="w-4 h-4 text-blue-500" />
                {record.time || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
              <Badge className="bg-blue-100 text-blue-700 border-none font-bold">
                {record.status || "Completed"}
              </Badge>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Attending Doctor</p>
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                <AvatarImage src={record.avatar} />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold text-gray-900">{record.doctor}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>SwiftCare Clinic</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Notes */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clinical Notes / Comments</p>
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-gray-700 leading-relaxed italic">
              "{record.comments}"
            </div>
          </div>

          {/* Additional Details if any */}
          {record.problem && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reason for Visit / Problem</p>
              <p className="text-gray-900 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                {record.problem}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2" onClick={() => window.print()}>
              <Printer className="w-5 h-5" /> Print Record
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2">
              <Share2 className="w-5 h-5" /> Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
