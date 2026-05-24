'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getDoctorById } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api-config';
import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function DoctorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [doctorImage, setDoctorImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch doctor profile to get verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (user?.id) {
        try {
          const profile: any = await getDoctorById(String(user.id));
          setVerificationStatus(profile?.accountStatus?.verificationStatus || 'pending');
          setDoctorImage(profile?.image || '');
        } catch (err) {
          console.error('Error fetching doctor profile:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchVerificationStatus();
  }, [user?.id]);

  const isApproved = verificationStatus === 'approved';
  const hasLimitedAccess = !isApproved;

  const navItemClass = (href: string) => {
    const disabled = hasLimitedAccess && href !== '/doctor/dashboard' && href !== '/logout';
    return `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
      disabled
        ? 'text-gray-400 cursor-not-allowed opacity-50'
        : pathname.startsWith(href)
        ? 'bg-primary/20 text-primary font-medium border-l-3 border-primary'
        : 'text-foreground/70 hover:bg-primary/10 hover:border-l-3 hover:border-primary/30 cursor-pointer'
    }`;
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    const disabled = hasLimitedAccess && href !== '/doctor/dashboard' && href !== '/logout' && href !== '/doctor/verification';
    if (disabled) {
      e.preventDefault();
      return false;
    }
    return true;
  };

  // Get initials from user name
  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'DR';

  const resolvedDoctorImage = doctorImage
    ? (doctorImage.startsWith('http') ? doctorImage : `${API_BASE_URL}${doctorImage.startsWith('/') ? '' : '/'}${doctorImage}`)
    : '';

  return (
    <div className="w-64 bg-gradient-to-b from-primary-50 to-icon-bg border-r-2 border-primary/20 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <Avatar className="w-40 h-40 rounded-lg mb-3 ring-4 ring-primary/20 shadow-sm">
          <AvatarImage src={resolvedDoctorImage || undefined} alt={user?.name || 'Doctor'} className="object-cover" />
          <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary-600 text-white text-3xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-bold text-lg">Dr {user?.name || 'Doctor'}</h3>
        <p className="text-sm text-gray-600">
          Medical Professional
        </p>
        {hasLimitedAccess ? (
          <div className="flex items-center gap-1 text-sm text-orange-600 font-semibold mt-2">
            <AlertCircle className="w-4 h-4" />
            <span>Limited Access</span>
          </div>
        ) : (
          <p className="text-sm text-green-600 mt-2">● Verified & Active</p>
        )}
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Availability *
        </label>
        <select 
          className="w-full px-3 py-2 border rounded-lg bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={hasLimitedAccess}
        >
        </select>
      </div>

      {/* Limited Access Banner */}
      {hasLimitedAccess && (
        <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-900 mb-2">
                {verificationStatus === 'pending' && 'Verification Required'}
                {verificationStatus === 'submitted' && 'Verification Pending'}
                {verificationStatus === 'rejected' && 'Verification Rejected'}
              </p>
              <p className="text-xs text-orange-700 mb-2">
                {verificationStatus === 'pending' && 'Complete your verification to unlock full access.'}
                {verificationStatus === 'submitted' && 'Your documents are being reviewed.'}
                {verificationStatus === 'rejected' && 'Please resubmit your documents.'}
              </p>
              <Link 
                href="/doctor/verification"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline"
              >
                {verificationStatus === 'rejected' ? 'Resubmit →' : 'Complete Verification →'}
              </Link>
            </div>
          </div>
        </div>
      )}

      <nav className="space-y-1 flex-1">
        <Link 
          href="/doctor/dashboard" 
          className={navItemClass('/doctor/dashboard')}
          onClick={(e) => handleNavClick(e, '/doctor/dashboard')}
        >
          <span>📊</span>
          <span>Dashboard</span>
        </Link>

        <Link 
          href="/doctor/appointments" 
          className={navItemClass('/doctor/appointments')}
          onClick={(e) => {
            if (!handleNavClick(e, '/doctor/appointments')) e.preventDefault();
          }}
          style={{ pointerEvents: hasLimitedAccess ? 'none' : 'auto' }}
        >
          <span>📅</span>
          <span>Appointments</span>
        </Link>

        <Link
          href="/doctor/available-timings"
          className={navItemClass('/doctor/available-timings')}
          onClick={(e) => {
            if (!handleNavClick(e, '/doctor/available-timings')) e.preventDefault();
          }}
          style={{ pointerEvents: hasLimitedAccess ? 'none' : 'auto' }}
        >
          <span>🕐</span>
          <span>Available Timings</span>
        </Link>

        <Link 
          href="/doctor/my-patients" 
          className={navItemClass('/doctor/my-patients')}
          onClick={(e) => {
            if (!handleNavClick(e, '/doctor/my-patients')) e.preventDefault();
          }}
          style={{ pointerEvents: hasLimitedAccess ? 'none' : 'auto' }}
        >
          <span>👥</span>
          <span>My Patients</span>
        </Link>

        {/* <Link 
          href="/doctor/specialities" 
          className={navItemClass('/doctor/specialities')}
          onClick={(e) => {
            if (!handleNavClick(e, '/doctor/specialities')) e.preventDefault();
          }}
          style={{ pointerEvents: hasLimitedAccess ? 'none' : 'auto' }}
        >
          <span>⚕️</span>
          <span>Specialities & Services</span>
        </Link> */}

        <Link 
          href="/doctor/reviews" 
          className={navItemClass('/doctor/reviews')}
          onClick={(e) => {
            if (!handleNavClick(e, '/doctor/reviews')) e.preventDefault();
          }}
          style={{ pointerEvents: hasLimitedAccess ? 'none' : 'auto' }}
        >
          <span>⭐</span>
          <span>Reviews</span>
        </Link>

        {/* <Link 
          href="/doctor/accounts" 
          className={navItemClass('/doctor/accounts')}
          onClick={(e) => {
            if (!handleNavClick(e, '/doctor/accounts')) e.preventDefault();
          }}
          style={{ pointerEvents: hasLimitedAccess ? 'none' : 'auto' }}
        >
          <span>💳</span>
          <span>Accounts</span>
        </Link> */}

        <Link
          href="/doctor/profile-settings"
          className={navItemClass('/doctor/profile-settings')}
          onClick={(e) => {
            if (!handleNavClick(e, '/doctor/profile-settings')) e.preventDefault();
          }}
          style={{ pointerEvents: hasLimitedAccess ? 'none' : 'auto' }}
        >
          <span>👤</span>
          <span>Profile Settings</span>
        </Link>

        {/* <Link
          href="/doctor/change-password"
          className={navItemClass('/doctor/change-password')}
          onClick={(e) => {
            if (!handleNavClick(e, '/doctor/change-password')) e.preventDefault();
          }}
          style={{ pointerEvents: hasLimitedAccess ? 'none' : 'auto' }}
        >
          <span>🔐</span>
          <span>Change Password</span>
        </Link> */}

        <Link
          href="/notifications"
          className={navItemClass('/notifications')}
          onClick={(e) => {
            if (!handleNavClick(e, '/notifications')) e.preventDefault();
          }}
          style={{ pointerEvents: hasLimitedAccess ? 'none' : 'auto' }}
        >
          <span>🔔</span>
          <span>Notifications</span>
        </Link>

        <Link 
          href="/logout" 
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
          onClick={(e) => handleNavClick(e, '/logout')}
        >
          <span>🚪</span>
          <span>Logout</span>
        </Link>
      </nav>
    </div>
  );
}
