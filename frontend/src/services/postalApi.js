/**
 * India Post area / PIN-code lookups, against the Postal Indexes API.
 *
 * This is the *live* half of the address experience: districts are bundled
 * (`data/indiaDistricts.js`) so they always work, while area names and their
 * PIN codes come from here. Every function resolves to an empty array on any
 * failure — timeout, offline, blocked network, malformed payload — because the
 * forms treat a missing suggestion list as "type it yourself", never as an
 * error. A shopper on a bad connection loses the autofill, not the checkout.
 *
 * Results are cached in-memory per session: the same district is picked from
 * the Area box many times across cart, checkout and the account page.
 */

const BASE = 'https://api.pine-labs.com/postal'
const TIMEOUT_MS = 6000

/** @type {Map<string, Promise<object[]> | object[]>} */
const cache = new Map()

async function getJson(path) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${BASE}${path}`, { signal: controller.signal })
    if (!response.ok) return []
    const payload = await response.json()
    return Array.isArray(payload?.data) ? payload.data : []
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

function cached(key, loader) {
  if (!cache.has(key)) {
    // Remember the promise, so parallel callers share one request; the
    // resolved value (always an array, never a rejection) replaces it.
    const pending = loader().then((rows) => {
      cache.set(key, rows)
      return rows
    })
    cache.set(key, pending)
  }
  return Promise.resolve(cache.get(key))
}

/**
 * Areas (localities / talukas) of a district with their PIN codes.
 * @returns {Promise<Array<{ name: string, pinCode: string }>>}
 */
export function areasOfDistrict(district) {
  const key = `place:${district}`
  const clean = String(district ?? '').trim()
  if (!clean) return Promise.resolve([])
  return cached(key, async () => {
    const rows = await getJson(`/in/district/${encodeURIComponent(clean)}/place?limit=500`)
    return rows
      .filter((row) => row?.name && row?.pin_code)
      .map((row) => ({ name: String(row.name), pinCode: String(row.pin_code) }))
  })
}

/**
 * What a PIN code covers: its area names, district and state.
 * @returns {Promise<{ pinCode: string, areas: string[], district: string, state: string } | null>}
 */
export function pincodeDetails(pincode) {
  const clean = String(pincode ?? '').trim()
  if (!/^\d{6}$/.test(clean)) return Promise.resolve(null)
  const key = `pin:${clean}`
  return cached(key, async () => {
    const rows = await getJson(`/in/pincode/${clean}`)
    if (!rows.length) return null
    return {
      pinCode: clean,
      areas: rows.map((row) => String(row.name ?? '')).filter(Boolean),
      district: String(rows[0]?.district ?? ''),
      state: String(rows[0]?.region ?? ''),
    }
  })
}

export default { areasOfDistrict, pincodeDetails }
