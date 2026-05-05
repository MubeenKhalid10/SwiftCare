export async function GET(request: Request) {
  const url = new URL(request.url)
  const lng = Number(url.searchParams.get('lng'))
  const lat = Number(url.searchParams.get('lat'))
  const label = url.searchParams.get('label') || 'Clinic location'

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return new Response('Invalid coordinates', { status: 400 })
  }

  const safeLabel = label.replace(/[<>&"']/g, '')

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeLabel}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <style>
      html, body, #map { height: 100%; margin: 0; }
      body { overflow: hidden; background: #f8fafc; }
      .clinic-marker {
        position: relative;
        width: 22px;
        height: 22px;
        background: #ef4444;
        border: 3px solid #fff;
        border-radius: 50% 50% 50% 0;
        box-shadow: 0 10px 20px rgba(239, 68, 68, 0.35);
        transform: rotate(-45deg);
      }
      .clinic-marker::after {
        content: '';
        position: absolute;
        inset: 50% auto auto 50%;
        width: 8px;
        height: 8px;
        border-radius: 9999px;
        background: #fff;
        transform: translate(-50%, -50%);
      }
      .clinic-popup {
        font: 600 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      }
      .map-badge {
        position: absolute;
        left: 12px;
        top: 12px;
        z-index: 500;
        background: rgba(15, 23, 42, 0.9);
        color: #fff;
        padding: 8px 10px;
        border-radius: 9999px;
        font: 600 12px/1 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        letter-spacing: 0.02em;
        pointer-events: none;
      }
    </style>
  </head>
  <body>
    <div class="map-badge">Drag or scroll to zoom</div>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script>
      const map = L.map('map', { scrollWheelZoom: true }).setView([${lat}, ${lng}], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const marker = L.marker([${lat}, ${lng}], {
        icon: L.divIcon({
          className: 'clinic-marker-wrapper',
          html: '<div class="clinic-marker"></div>',
          iconSize: [22, 22],
          iconAnchor: [11, 22],
        }),
      }).addTo(map);

      marker.bindPopup('<div class="clinic-popup">${safeLabel}<br/><span style="color:#64748b;font-weight:500;">${lat.toFixed(6)}, ${lng.toFixed(6)}</span></div>').openPopup();
    </script>
  </body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
