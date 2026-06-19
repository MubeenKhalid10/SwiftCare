'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AdminLayout from '@/components/admin/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, MapPin, ShieldCheck, UserCircle2 } from 'lucide-react'
import { LogoLoader } from '@/components/ui/logo-loader'
import { resolvePatientImage, onPatientImageError } from '@/lib/image-utils'

type ProfileFormState = {
  name: string
  email: string
  avatar: string
  about: string
}

const DEFAULT_ABOUT = 'Administrator account for managing the SwiftCare platform.'

export default function AdminProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<ProfileFormState>({
    name: '',
    email: '',
    avatar: '',
    about: DEFAULT_ABOUT,
  })

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login')
      return
    }

    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
      about: DEFAULT_ABOUT,
    })
  }, [authLoading, isAuthenticated, router, user])

  const initials = useMemo(() => {
    const source = user?.name || 'Admin User'
    return source
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [user?.name])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      updateUser({
        name: formData.name.trim() || user?.name || 'Admin User',
        email: formData.email.trim() || user?.email || 'admin@swiftcare.com',
        avatar: formData.avatar.trim(),
      })
      setIsEditOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <LogoLoader size={32} className="h-8 w-8" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Profile</p>
        </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-primary/15">
              <AvatarImage
                src={resolvePatientImage(user?.avatar)}
                alt={user?.name || 'Admin'}
                onError={onPatientImageError}
              />
              <AvatarFallback className="bg-primary text-white text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">{user?.name || 'Admin User'}</h2>
                <Badge className="bg-icon-bg text-primary hover:bg-icon-bg">Admin</Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" />{user?.email || 'admin@swiftcare.com'}</p>
              <p className="text-muted-foreground flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Platform administrator</p>
              <p className="text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" />SwiftCare Admin Portal</p>
              <p className="text-muted-foreground max-w-2xl">{formData.about}</p>
            </div>
          </div>

          <div className="flex gap-4 border-b border-border mb-6">
            <button className="px-4 py-2 text-cyan-500 border-b-2 border-cyan-500 font-medium">About</button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Name</p>
                <p className="font-medium">{user?.name || 'Admin User'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Email ID</p>
                <p className="font-medium">{user?.email || 'admin@swiftcare.com'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Role</p>
                <p className="font-medium capitalize">{user?.role || 'admin'}</p>
              </div>
              <div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-sm">About</p>
                <p className="font-medium">{formData.about}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-border bg-muted p-4">
            <div className="flex items-start gap-3">
              <UserCircle2 className="w-5 h-5 text-muted-foreground mt-0.5" />
            </div>
          </div>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-lg">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) => setFormData((prev) => ({ ...prev, about: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="bg-transparent" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
