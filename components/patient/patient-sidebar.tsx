'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Calendar,
  Star,
  ClipboardList,
  Settings,
  Bell,
  Shield,
  ScrollText,
  UserCircle,
} from 'lucide-react';
import { resolvePatientImage, onPatientImageError } from '@/lib/image-utils';

const NAV_ITEMS = [
  { href: '/patient/appointments', label: 'My Appointments', icon: Calendar },
  { href: '/patient/favourites', label: 'Favourites', icon: Star },
  { href: '/patient/medical-records', label: 'Medical Records', icon: ClipboardList },
  { href: '/patient/settings', label: 'Settings', icon: Settings },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/privacy-policy', label: 'Privacy Policy', icon: Shield },
  { href: '/terms-and-conditions', label: 'Terms and Conditions', icon: ScrollText },
] as const;

export function PatientSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItemClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname.startsWith(href)
      ? 'bg-primary/20 text-primary font-medium border-l-3 border-primary'
      : 'text-foreground/70 hover:bg-primary/10 hover:border-l-3 hover:border-primary/30'
    }`;

  return (
    <div className="w-64 bg-gradient-to-b from-primary-50 to-icon-bg border-r-2 border-primary/20 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <div className="w-32 h-32 rounded-lg mb-3 flex items-center justify-center overflow-hidden mx-auto border-2 border-primary/30 shadow-md bg-white">
          <img
            src={resolvePatientImage(user?.avatar)}
            alt={user?.name || 'Patient'}
            className="w-full h-full object-cover"
            onError={onPatientImageError}
          />
        </div>

        <h3 className="font-bold text-lg text-center">{user?.name || 'Patient'}</h3>
        <p className="text-sm text-primary mt-2 flex items-center justify-center gap-1.5">
          <UserCircle className="h-4 w-4 text-primary" />
          Patient
        </p>
      </div>

      <nav className="space-y-1 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={navItemClass(href)}>
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
