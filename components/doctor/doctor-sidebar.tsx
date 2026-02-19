'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function DoctorSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItemClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
      pathname.startsWith(href)
        ? 'bg-blue-100 text-blue-600 font-medium'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  // Get initials from user name
  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'DR';

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-3 flex items-end justify-center overflow-hidden">
          <div className="w-24 h-32 bg-gradient-to-t from-blue-400 to-transparent rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{initials}</span>
          </div>
        </div>
        <h3 className="font-bold text-lg">Dr {user?.name || 'Doctor'}</h3>
        <p className="text-sm text-gray-600">
          Medical Professional
        </p>
        <p className="text-sm text-blue-600 mt-2">● Doctor</p>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Availability *
        </label>
        <select className="w-full px-3 py-2 border rounded-lg bg-white text-sm">
          <option>I am Available Now</option>
          <option>Busy</option>
          <option>Away</option>
        </select>
      </div>

      <nav className="space-y-1 flex-1">
        <Link href="/doctor/dashboard" className={navItemClass('/doctor/dashboard')}>
          <span>📊</span>
          <span>Dashboard</span>
        </Link>

        <Link href="/doctor/appointments" className={navItemClass('/doctor/appointments')}>
          <span>📅</span>
          <span>Appointments</span>
        </Link>

        <Link
          href="/doctor/available-timings"
          className={navItemClass('/doctor/available-timings')}
        >
          <span>🕐</span>
          <span>Available Timings</span>
        </Link>

        <Link href="/doctor/my-patients" className={navItemClass('/doctor/my-patients')}>
          <span>👥</span>
          <span>My Patients</span>
        </Link>

        <Link href="/doctor/specialities" className={navItemClass('/doctor/specialities')}>
          <span>⚕️</span>
          <span>Specialities & Services</span>
        </Link>

        <Link href="/doctor/reviews" className={navItemClass('/doctor/reviews')}>
          <span>⭐</span>
          <span>Reviews</span>
        </Link>

        <Link href="/doctor/accounts" className={navItemClass('/doctor/accounts')}>
          <span>💳</span>
          <span>Accounts</span>
        </Link>

        <Link
          href="/doctor/profile-settings"
          className={navItemClass('/doctor/profile-settings')}
        >
          <span>👤</span>
          <span>Profile Settings</span>
        </Link>

        <Link
          href="/doctor/change-password"
          className={navItemClass('/doctor/change-password')}
        >
          <span>🔐</span>
          <span>Change Password</span>
        </Link>

        <Link href="/logout" className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50">
          <span>🚪</span>
          <span>Logout</span>
        </Link>
      </nav>
    </div>
  );
}
