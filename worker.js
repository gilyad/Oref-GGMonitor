// Cloudflare Worker: CORS proxy for oref.org.il alerts
// Deploy on workers.cloudflare.com (free, no domain needed)

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders()
    })
  }

  const url = new URL(request.url)

  // /alerts → proxy to oref live alerts
  if (url.pathname === '/alerts') {
    try {
      const orefUrl = 'https://www.oref.org.il/WarningMessages/alert/alerts.json'
      const res = await fetch(orefUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://www.oref.org.il/',
          'Accept': 'application/json'
        }
      })
      const body = await res.text()
      const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
      Object.assign(headers, getCorsHeaders())
      return new Response(body, { status: res.status, headers })
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502,
        headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
      })
    }
  }

  // Default: info page
  return new Response('Oref Alerts Proxy — GET /alerts', {
    headers: { ...getCorsHeaders(), 'Content-Type': 'text/plain' }
  })
}

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  }
}
