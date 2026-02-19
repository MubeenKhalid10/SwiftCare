'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/avatar-utils'

interface DoctorImageProps {
  src?: string
  alt: string
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function DoctorImage({
  src,
  alt,
  name,
  className = '',
  size = 'md',
}: DoctorImageProps) {
  const [error, setError] = useState(false)

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
  }

  // If no image or image failed to load, show avatar with initials
  if (!src || error) {
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarFallback className="bg-blue-600 text-white text-lg font-semibold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      onError={() => setError(true)}
      className={`object-cover rounded-lg ${sizeClasses[size]} ${className}`}
    />
  )
}

interface PatientImageProps {
  src?: string
  alt: string
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PatientImage({
  src,
  alt,
  name,
  className = '',
  size = 'md',
}: PatientImageProps) {
  const [error, setError] = useState(false)

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
  }

  if (!src || error) {
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarFallback className="bg-green-600 text-white text-lg font-semibold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      onError={() => setError(true)}
      className={`object-cover rounded-lg ${sizeClasses[size]} ${className}`}
    />
  )
}
