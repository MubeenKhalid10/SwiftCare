import { LogoLoader } from '@/components/ui/logo-loader'

export default function RouteLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LogoLoader size={32} />
    </div>
  )
}
