"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  LogOut,
  Calendar,
  Stethoscope,
  Home,
  Info,
  Building2,
  ChevronDown,
  Star,
  ClipboardList,
  Settings,
  Bell,
  Shield,
  ScrollText,
  User,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  resolveDoctorImage,
  resolvePatientImage,
  onDoctorImageError,
  onPatientImageError,
} from "@/lib/image-utils"

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/about", label: "About", icon: Info, match: (p: string) => p.startsWith("/about") },
  { href: "/doctors", label: "Doctors", icon: Stethoscope, match: (p: string) => p.startsWith("/doctors") || p.startsWith("/doctor-profile") || p.startsWith("/booking") },
  { href: "/hospitals", label: "Hospitals", icon: Building2, match: (p: string) => p.startsWith("/hospitals") },
] as const

function NavLink({
  href,
  label,
  isActive,
  onClick,
  className,
}: {
  href: string
  label: string
  isActive: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "px-3 py-2 text-sm font-medium transition-colors duration-200",
        isActive
          ? "text-primary"
          : "text-foreground/70 hover:text-primary",
        className
      )}
    >
      {label}
    </Link>
  )
}

const PATIENT_MENU_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/patient/appointments", label: "My Appointments", icon: Calendar },
  { href: "/patient/favourites", label: "Favourites", icon: Star },
  { href: "/patient/medical-records", label: "Medical Records", icon: ClipboardList },
  { href: "/patient/settings", label: "Settings", icon: Settings },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/privacy-policy", label: "Privacy Policy", icon: Shield },
  { href: "/terms-and-conditions", label: "Terms and Conditions", icon: ScrollText },
]

const DOCTOR_NAV_LINKS = [
  { href: "/doctor/dashboard", label: "Dashboard", match: (p: string) => p.startsWith("/doctor/dashboard") },
  { href: "/doctor/shifts", label: "Shifts", match: (p: string) => p.startsWith("/doctor/shifts") },
  { href: "/doctor/availability", label: "Availability", match: (p: string) => p.startsWith("/doctor/availability") || p.startsWith("/doctor/available-timings") },
  { href: "/doctor/patients", label: "Patients", match: (p: string) => p.startsWith("/doctor/patients") || p.startsWith("/doctor/my-patients") },
] as const

const DOCTOR_MENU_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/doctor/reviews", label: "Reviews", icon: Star },
  { href: "/doctor/profile-settings", label: "Profile", icon: User },
  { href: "/notifications", label: "Notifications", icon: Bell },
]

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
    setMobileMenuOpen(false)
  }

  const patientInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "PT"

  const doctorInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DR"

  const isDoctor = isAuthenticated && user?.role === "doctor"
  const isPatient = isAuthenticated && user?.role === "patient"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border/80 bg-card/95 shadow-lg shadow-primary/5 backdrop-blur-xl"
          : "border-border/50 bg-background/80 backdrop-blur-lg"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 transition-all duration-300",
          scrolled ? "py-2.5" : "py-3.5"
        )}
      >
        {/* Logo — left */}
        {isDoctor ? (
          <div className="flex shrink-0 items-center gap-2.5 cursor-default" aria-label="SwiftCare">
            <Image
              src="/assets/Logo(1).png"
              alt="SwiftCare"
              width={44}
              height={44}
              className={cn("w-auto object-contain transition-all", scrolled ? "h-9" : "h-10")}
              priority
            />
            <div className="hidden flex-col sm:flex">
              <Image
                src="/assets/Logo(2).png"
                alt="SwiftCare"
                width={120}
                height={28}
                className={cn("w-auto object-contain transition-all", scrolled ? "h-6" : "h-7")}
                priority
              />
              <span className="text-[10px] font-medium tracking-wide text-muted-foreground">
                Smarter care. Shorter waits
              </span>
            </div>
          </div>
        ) : (
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/assets/Logo(1).png"
            alt="SwiftCare"
            width={44}
            height={44}
            className={cn("w-auto object-contain transition-all", scrolled ? "h-9" : "h-10")}
            priority
          />
          <div className="hidden flex-col sm:flex">
            <Image
              src="/assets/Logo(2).png"
              alt="SwiftCare"
              width={120}
              height={28}
              className={cn("w-auto object-contain transition-all", scrolled ? "h-6" : "h-7")}
              priority
            />
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground">
              Smarter care. Shorter waits
            </span>
          </div>
        </Link>
        )}

        {/* Desktop nav — right */}
        <div className="hidden items-center gap-1 lg:flex">
          <nav className="flex items-center gap-1">
            {isDoctor
              ? DOCTOR_NAV_LINKS.map(({ href, label, match }) => (
                  <NavLink key={href} href={href} label={label} isActive={match(pathname)} />
                ))
              : NAV_LINKS.map(({ href, label, match }) => (
                  <NavLink key={href} href={href} label={label} isActive={match(pathname)} />
                ))}
          </nav>

          <div className="ml-4 flex items-center gap-2 border-l border-border/60 pl-4">
            {isPatient ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/30 hover:bg-muted/50"
                  >
                    <Avatar className="h-7 w-7 border border-border">
                      <AvatarImage
                        src={resolvePatientImage(user.avatar)}
                        onError={onPatientImageError}
                      />
                      <AvatarFallback className="bg-icon-bg text-xs font-bold text-primary">
                        {patientInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span>Profile</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl border border-border bg-card shadow-xl">
                  <div className="px-3 py-3 border-b border-border/50">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  {PATIENT_MENU_LINKS.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer">
                        <item.icon className="mr-2 h-4 w-4 text-primary" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isDoctor ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/30 hover:bg-muted/50"
                  >
                    <Avatar className="h-7 w-7 border border-border">
                      <AvatarImage
                        src={resolveDoctorImage(user.avatar)}
                        onError={onDoctorImageError}
                      />
                      <AvatarFallback className="bg-icon-bg text-xs font-bold text-primary">
                        {doctorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span>Profile</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl border border-border bg-card shadow-xl">
                  <div className="px-3 py-3 border-b border-border/50">
                    <p className="text-sm font-semibold text-foreground">Dr {user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-xs text-primary">Doctor</p>
                  </div>
                  {DOCTOR_MENU_LINKS.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer">
                        <item.icon className="mr-2 h-4 w-4 text-primary" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100vw-2rem,320px)] border-l border-border bg-background p-0">
            <SheetHeader className="border-b border-border bg-gradient-to-br from-icon-bg/50 to-background px-5 pb-4 pt-5">
              <SheetTitle className="flex items-center gap-2 text-left text-foreground">
                <Image src="/assets/Logo(1).png" alt="" width={32} height={32} className="h-8 w-auto" />
                <div>
                  <span className="font-bold">SwiftCare</span>
                  <p className="text-xs font-normal text-muted-foreground">Menu</p>
                </div>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-0.5 p-3">
              {isDoctor
                ? DOCTOR_NAV_LINKS.map(({ href, label, match }) => (
                    <NavLink
                      key={href}
                      href={href}
                      label={label}
                      isActive={match(pathname)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-3 py-3"
                    />
                  ))
                : NAV_LINKS.map(({ href, label, match }) => (
                    <NavLink
                      key={href}
                      href={href}
                      label={label}
                      isActive={match(pathname)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-3 py-3"
                    />
                  ))}
            </nav>

            <div className="border-t border-border p-4">
              {isPatient ? (
                <div className="flex flex-col gap-2">
                  <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage
                        src={resolvePatientImage(user.avatar)}
                        onError={onPatientImageError}
                      />
                      <AvatarFallback className="bg-icon-bg text-sm font-bold text-primary">
                        {patientInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-primary">Patient</p>
                    </div>
                  </div>
                  {PATIENT_MENU_LINKS.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="mb-1 w-full justify-start rounded-xl">
                        <item.icon className="mr-2 h-4 w-4 text-primary" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : isDoctor ? (
                <div className="flex flex-col gap-2">
                  <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage
                        src={resolveDoctorImage(user.avatar)}
                        onError={onDoctorImageError}
                      />
                      <AvatarFallback className="bg-icon-bg text-sm font-bold text-primary">
                        {doctorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">Dr {user.name}</p>
                      <p className="text-xs text-primary">Doctor</p>
                    </div>
                  </div>
                  {DOCTOR_MENU_LINKS.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="mb-1 w-full justify-start rounded-xl">
                        <item.icon className="mr-2 h-4 w-4 text-primary" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : isAuthenticated ? (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">Register</Button>
                  </Link>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

export default Header
