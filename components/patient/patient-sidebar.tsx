'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Search } from 'lucide-react';

export function PatientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const navItemClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname.startsWith(href)
      ? 'bg-blue-100 text-blue-600 font-medium'
      : 'text-gray-700 hover:bg-gray-100'
    }`;

  // Get initials from user name
  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'PT';

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      {/* Profile */}
      <div className="mb-8">
        <div className="w-32 h-32 rounded-lg mb-3 flex items-center justify-center overflow-hidden mx-auto border-2 border-blue-100 shadow-sm bg-white">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Patient")}&background=0D8ABC&color=fff`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{initials}</span>
            </div>
          )}
        </div>

        <h3 className="font-bold text-lg text-center">{user?.name || 'Patient'}</h3>
        <p className="text-sm text-gray-600 text-center">ID: PT{user?.id || 'XXXXX'}</p>
        <p className="text-sm text-blue-600 mt-2 text-center">
          ● Patient
        </p>
      </div>

      {/* Find Doctor Button */}
      <div className="mb-4">
        <Link
          href="/doctors"
          className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          <Search className="w-4 h-4" />
          Find Doctor
        </Link>
      </div>

      <nav className="space-y-1 flex-1">

        <Link href="/patient/appointments" className={navItemClass('/patient/appointments')}>
          <span>📅</span>
          <span>My Appointments</span>
        </Link>


        <Link href="/patient/favourites" className={navItemClass('/patient/favourites')}>
          <span>⭐</span>
          <span>Favourites</span>
        </Link>

        <Link
          href="/patient/medical-records"
          className={navItemClass('/patient/medical-records')}
        >
          <span>📋</span>
          <span>Medical Records</span>
        </Link>

        <Link href="/patient/settings" className={navItemClass('/patient/settings')}>
          <span>⚙️</span>
          <span>Settings</span>
        </Link>

        <Link href="/notifications" className={navItemClass('/notifications')}>
          <span>🔔</span>
          <span>Notifications</span>
        </Link>

        <Link href="/privacy-policy" className={navItemClass('/privacy-policy')}>
          <span>🔒</span>
          <span>Privacy Policy</span>
        </Link>

        <Link href="/terms-and-conditions" className={navItemClass('/terms-and-conditions')}>
          <span>📝</span>
          <span>Terms and Conditions</span>
        </Link>

        <Link
          href="/logout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 mt-4"
        >
          <span>🚪</span>
          <span>Logout</span>
        </Link>
      </nav>
    </div>
  );
}
