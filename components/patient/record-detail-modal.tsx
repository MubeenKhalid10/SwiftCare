"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, FileText, Printer, Share2, X } from "lucide-react"
import { toast } from "sonner"
import { resolveDoctorImage, onDoctorImageError } from "@/lib/image-utils"

interface RecordDetailModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
}

export function RecordDetailModal({ isOpen, onClose, record }: RecordDetailModalProps) {
  if (!record) return null

  const handleShare = async () => {
    const shareText = [
      `Visit: ${record.name}`,
      `Date: ${record.date}`,
      `Doctor: ${record.doctor}`,
      record.comments ? `Notes: ${record.comments}` : '',
    ].filter(Boolean).join('\n')

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: record.name,
          text: shareText,
        })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(shareText)
      toast.success('Visit summary copied to clipboard')
    } catch {
      toast.error('Unable to share this record')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <div className="bg-gradient-to-r from-primary to-primary-600 p-6 text-white relative">
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
              <p className="text-white/80 text-sm font-medium">{record.id}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</p>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Calendar className="w-4 h-4 text-primary" />
                {record.date}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Time</p>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Clock className="w-4 h-4 text-primary" />
                {record.time || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</p>
              <Badge className="bg-primary/10 text-primary border-none font-bold">
                {record.status || "Completed"}
              </Badge>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="bg-muted rounded-2xl p-6 border border-border/50">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Attending Doctor</p>
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                <AvatarImage
                  src={resolveDoctorImage(record.avatar)}
                  onError={onDoctorImageError}
                />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold text-foreground">{record.doctor}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{record.location || "Clinic visit"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Notes */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clinical Notes / Comments</p>
            <div className="bg-icon-bg/50 p-6 rounded-2xl border border-primary/20 text-foreground/80 leading-relaxed italic">
              "{record.comments}"
            </div>
          </div>

          {/* Additional Details if any */}
          {record.problem && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reason for Visit / Problem</p>
              <p className="text-foreground font-medium bg-muted p-4 rounded-xl border border-border/50 italic">
                {record.problem}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4 border-t border-border/50">
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2" onClick={() => window.print()}>
              <Printer className="w-5 h-5" /> Print Record
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2" onClick={handleShare}>
              <Share2 className="w-5 h-5" /> Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
