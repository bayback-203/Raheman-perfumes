const DEFAULT_TARGET_BYTES = 4.5 * 1024 * 1024
const MAX_DIMENSION = 3840

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality)
  })
}

/**
 * Downscale and compress large image files in the browser so uploads stay
 * well below reverse-proxy body limits (e.g. Nginx's default 1 MB limit)
 * while staying crisp for storefront banners and product galleries.
 */
export async function optimizeImageForUpload(file, { maxBytes = DEFAULT_TARGET_BYTES } = {}) {
  if (!file || typeof document === 'undefined') return file
  if (!String(file.type || '').startsWith('image/')) return file
  if (file.size <= maxBytes) return file

  try {
    const img = await loadImage(file)
    const srcWidth = img.naturalWidth || img.width
    const srcHeight = img.naturalHeight || img.height
    if (!srcWidth || !srcHeight) return file

    let maxDim = MAX_DIMENSION
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    const mimeCandidates = ['image/webp', 'image/jpeg']
    const qualitySteps = [0.94, 0.88, 0.8, 0.72]
    let bestBlob = null
    let bestMime = 'image/webp'

    for (let pass = 0; pass < 3; pass += 1) {
      const scale = Math.min(1, maxDim / Math.max(srcWidth, srcHeight))
      canvas.width = Math.max(1, Math.round(srcWidth * scale))
      canvas.height = Math.max(1, Math.round(srcHeight * scale))
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      for (const mime of mimeCandidates) {
        for (const quality of qualitySteps) {
          const blob = await canvasToBlob(canvas, mime, quality)
          if (!blob || blob.size === 0) continue
          if (!bestBlob || blob.size < bestBlob.size) {
            bestBlob = blob
            bestMime = blob.type || mime
          }
          if (blob.size <= maxBytes) {
            const stem = String(file.name || 'image').replace(/\.[^.]+$/, '')
            const ext = bestMime === 'image/jpeg' ? 'jpg' : 'webp'
            return new File([blob], `${stem}.${ext}`, { type: bestMime })
          }
        }
      }

      maxDim = Math.round(maxDim * 0.72)
    }

    if (bestBlob && bestBlob.size < file.size) {
      const stem = String(file.name || 'image').replace(/\.[^.]+$/, '')
      const ext = bestMime === 'image/jpeg' ? 'jpg' : 'webp'
      return new File([bestBlob], `${stem}.${ext}`, { type: bestMime })
    }
    return file
  } catch {
    return file
  }
}

export default optimizeImageForUpload
