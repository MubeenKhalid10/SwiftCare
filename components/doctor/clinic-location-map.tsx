'use client'

import { Card } from '@/components/ui/card'
import { buildClinicMapEmbedUrl, buildExternalMapsUrl, buildMapboxStaticMapUrl } from '@/lib/location'

interface ClinicLocationMapProps {
  label?: string
  coordinates?: [number, number] | null
}

export function ClinicLocationMap({ label, coordinates }: ClinicLocationMapProps) {
  const embedUrl = buildClinicMapEmbedUrl(coordinates || null, label)
  const mapUrl = buildMapboxStaticMapUrl(coordinates || null)
  const externalMapsUrl = buildExternalMapsUrl(coordinates || null, label)

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={label || 'Doctor clinic location map'}
          className="h-72 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : mapUrl ? (
        <img
          src={mapUrl}
          alt={label || 'Doctor clinic location map'}
          className="h-72 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-72 w-full flex items-center justify-center bg-gradient-to-br from-icon-bg via-background to-icon-bg/50 text-center px-6">
          <div className="max-w-sm space-y-2">
            <p className="text-sm font-semibold text-slate-900">Map preview unavailable</p>
            <p className="text-sm text-slate-600">
              Configure a public Mapbox token in the frontend env to render the clinic map.
              If coordinates are missing, the location text will still be shown.
            </p>
          </div>
        </div>
      )}

      {externalMapsUrl ? (
        <div className="border-t border-slate-200 bg-card p-4">
          <a
            href={externalMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
          >
            Open in Google Maps
          </a>
        </div>
      ) : null}
    </Card>
  )
}