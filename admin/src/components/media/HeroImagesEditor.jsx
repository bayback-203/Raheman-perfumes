import { useRef, useState } from 'react'
import cn from '@/lib/cn'
import { resolveImageUrl } from '@/lib/api'
import { Icon } from '@/components/ui/Icon'
import { Button, IconButton } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Form'
import { adminApi } from '@/services/adminApi'

const ALLOWED_HERO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_HERO_BYTES = 5 * 1024 * 1024
const MAX_HERO_IMAGES = 3

/**
 * Reusable Hero Banner Images manager (supports up to 3 slides).
 * Supports uploading new images, replacing any existing slot, reordering,
 * pasting an image URL, and deleting slides.
 */
export function HeroImagesEditor({ heroImages = [], onChange, disabled = false }) {
  const addInputRef = useRef(null)
  const replaceInputRef = useRef(null)
  const replaceIndexRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const [verifyingUrl, setVerifyingUrl] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [showUrlForm, setShowUrlForm] = useState(false)
  const [brokenSlides, setBrokenSlides] = useState({})

  const images = Array.isArray(heroImages) ? heroImages.slice(0, MAX_HERO_IMAGES) : []
  const room = Math.max(0, MAX_HERO_IMAGES - images.length)

  const validateFiles = (files) => {
    const valid = []
    for (const file of files) {
      if (!ALLOWED_HERO_TYPES.includes(file.type)) {
        setError(`${file.name} is not a supported image. Use JPEG, PNG, WebP or AVIF.`)
        continue
      }
      if (file.size > MAX_HERO_BYTES) {
        setError(`${file.name} exceeds the 5 MB upload limit.`)
        continue
      }
      valid.push(file)
    }
    return valid
  }

  const handleAddFiles = async (fileList) => {
    if (disabled || uploading) return
    const incoming = Array.from(fileList ?? [])
    if (!incoming.length) return
    setError('')

    if (room === 0) {
      setError(`Maximum ${MAX_HERO_IMAGES} hero images allowed. Replace or remove one first.`)
      return
    }

    const valid = validateFiles(incoming.slice(0, room))
    if (!valid.length) return

    setUploading(true)
    try {
      const uploaded = await adminApi.uploadMedia(valid, { ownerType: 'content', alt: 'Homepage hero banner' })
      const urls = uploaded.map((item) => item?.url).filter(Boolean)
      if (!urls.length) {
        setError('Upload succeeded, but no image URL was returned.')
        return
      }
      const next = [...images]
      for (const url of urls) {
        if (!next.includes(url) && next.length < MAX_HERO_IMAGES) next.push(url)
      }
      onChange(next)
    } catch (err) {
      setError(err?.message || 'Could not upload hero image. Check server connection.')
    } finally {
      setUploading(false)
      if (addInputRef.current) addInputRef.current.value = ''
    }
  }

  const triggerReplace = (index) => {
    if (disabled || uploading) return
    replaceIndexRef.current = index
    replaceInputRef.current?.click()
  }

  const handleReplaceFile = async (fileList) => {
    const file = fileList?.[0]
    const targetIndex = replaceIndexRef.current
    replaceIndexRef.current = null
    if (!file || targetIndex === null || targetIndex < 0 || targetIndex >= images.length) return

    setError('')
    const [valid] = validateFiles([file])
    if (!valid) {
      if (replaceInputRef.current) replaceInputRef.current.value = ''
      return
    }

    setUploading(true)
    try {
      const uploaded = await adminApi.uploadMedia([valid], { ownerType: 'content', alt: `Hero banner slide ${targetIndex + 1}` })
      const url = uploaded?.[0]?.url
      if (!url) {
        setError('Upload succeeded, but no image URL was returned.')
        return
      }
      const next = [...images]
      next[targetIndex] = url
      onChange(next)
    } catch (err) {
      setError(err?.message || 'Could not replace hero image.')
    } finally {
      setUploading(false)
      if (replaceInputRef.current) replaceInputRef.current.value = ''
    }
  }

  const normalizePastedUrl = (raw) => {
    let clean = String(raw || '').trim().replace(/^['"]|['"]$/g, '')
    if (!clean) return ''
    try {
      if (/google\.[a-z.]+\/imgres/i.test(clean)) {
        const parsed = new URL(clean)
        const direct = parsed.searchParams.get('imgurl')
        if (direct) clean = direct
      }
    } catch {
      // ignore URL parse error and proceed with trimmed string
    }
    if (!/^https?:\/\//i.test(clean) && !clean.startsWith('/') && !clean.startsWith('data:image/')) {
      clean = `https://${clean}`
    }
    return clean
  }

  const probeImageUrl = (src) =>
    new Promise((resolve) => {
      const img = new Image()
      let settled = false
      const finish = (ok) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(ok)
      }
      const timer = setTimeout(() => finish(false), 8000)
      img.referrerPolicy = 'no-referrer'
      img.onload = () => finish(true)
      img.onerror = () => finish(false)
      img.src = resolveImageUrl(src)
    })

  const addByUrl = async () => {
    const clean = normalizePastedUrl(urlInput)
    if (!clean || verifyingUrl) return
    setError('')
    if (images.length >= MAX_HERO_IMAGES) {
      setError(`Maximum ${MAX_HERO_IMAGES} hero images allowed.`)
      return
    }
    if (images.includes(clean)) {
      setError('This image URL is already added.')
      return
    }

    setVerifyingUrl(true)
    const ok = await probeImageUrl(clean)
    setVerifyingUrl(false)

    if (!ok) {
      setError(
        'Could not load an image from that link. Make sure it is a direct image URL (right-click the image → Copy image address), or upload the image file instead.',
      )
      return
    }

    onChange([...images, clean])
    setUrlInput('')
    setShowUrlForm(false)
  }

  const move = (index, delta) => {
    const nextIndex = index + delta
    if (nextIndex < 0 || nextIndex >= images.length) return
    const copy = [...images]
    const [item] = copy.splice(index, 1)
    copy.splice(nextIndex, 0, item)
    onChange(copy)
  }

  const remove = (index) => {
    onChange(images.filter((_, idx) => idx !== index))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-body-sm text-ink-muted">
        <p>
          Upload up to <strong>3</strong> hero images. With 2 or 3 images saved, the storefront automatically transitions between them every 8–9 seconds. Leaving this empty uses the default studio hero banner.
        </p>
        <Chip tone={images.length > 0 ? 'gold' : 'muted'}>
          {images.length === 0 ? 'Using default banner' : `${images.length} / ${MAX_HERO_IMAGES} custom ${images.length === 1 ? 'image' : 'images'}`}
        </Chip>
      </div>

      {/* Hidden inputs for add and replace */}
      <input
        ref={addInputRef}
        type="file"
        accept={ALLOWED_HERO_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(e) => handleAddFiles(e.target.files)}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept={ALLOWED_HERO_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleReplaceFile(e.target.files)}
      />

      {/* Active hero slides */}
      {images.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-brand-paper shadow-sm"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-low">
                {brokenSlides[url] ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-4 text-center text-ink-muted">
                    <Icon name="alert-circle" className="h-5 w-5 text-error" />
                    <span className="text-label-sm font-medium text-error">Image failed to load</span>
                    <span className="text-[11px]">Click Replace to upload a file or paste a direct image URL</span>
                  </div>
                ) : (
                  <img
                    src={resolveImageUrl(url)}
                    alt={`Hero slide ${index + 1}`}
                    referrerPolicy="no-referrer"
                    onError={() => setBrokenSlides((prev) => ({ ...prev, [url]: true }))}
                    onLoad={() =>
                      setBrokenSlides((prev) => {
                        if (!prev[url]) return prev
                        const next = { ...prev }
                        delete next[url]
                        return next
                      })
                    }
                    className="h-full w-full object-cover"
                  />
                )}
                <span className="absolute left-2 top-2 rounded bg-shell-obsidian/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-ivory">
                  Slide {index + 1}
                </span>
              </div>

              {!disabled && (
                <div className="flex items-center justify-between gap-2 border-t border-outline-variant/60 bg-white px-2.5 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon="upload"
                    disabled={uploading}
                    onClick={() => triggerReplace(index)}
                  >
                    Replace
                  </Button>
                  <div className="flex items-center gap-0.5">
                    <IconButton
                      icon="chevron-left"
                      label="Move earlier"
                      disabled={uploading || index === 0}
                      onClick={() => move(index, -1)}
                    />
                    <IconButton
                      icon="chevron-right"
                      label="Move later"
                      disabled={uploading || index === images.length - 1}
                      onClick={() => move(index, 1)}
                    />
                    <IconButton
                      icon="trash"
                      tone="danger"
                      label={`Remove slide ${index + 1}`}
                      disabled={uploading}
                      onClick={() => remove(index)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload / drop area when slots remain */}
      {!disabled && room > 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleAddFiles(e.dataTransfer?.files)
          }}
          className={cn(
            'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
            dragging ? 'border-brand-gold bg-brand-gold/10' : 'border-outline-variant bg-surface-low/40 hover:border-brand-gold/70',
          )}
        >
          <Icon name="image" className="h-6 w-6 text-ink-muted" />
          <p className="mt-2 text-body-sm font-medium text-ink">
            {uploading
              ? 'Uploading hero image…'
              : images.length === 0
                ? 'Upload hero banner image (up to 3)'
                : `Add ${room} more hero ${room === 1 ? 'image' : 'images'}`}
          </p>
          <p className="mt-0.5 text-label-sm text-ink-muted">
            Wide landscape recommended (e.g. 1376×768 or 1600×900) · JPEG, PNG, WebP or AVIF · max 5 MB
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="upload"
              loading={uploading}
              disabled={uploading}
              onClick={() => addInputRef.current?.click()}
            >
              Choose image{room > 1 ? 's' : ''}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => setShowUrlForm((v) => !v)}
            >
              {showUrlForm ? 'Cancel link' : 'Or paste image URL'}
            </Button>
          </div>
        </div>
      )}

      {!disabled && showUrlForm && room > 0 && (
        <div className="flex flex-col gap-2 rounded border border-outline-variant/70 bg-surface-low/40 p-3 sm:flex-row sm:items-end">
          <Input
            label="Direct Image URL"
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addByUrl()
              }
            }}
            containerClassName="flex-1"
          />
          <Button variant="gold" size="sm" loading={verifyingUrl} onClick={addByUrl} disabled={!urlInput.trim() || verifyingUrl}>
            {verifyingUrl ? 'Checking…' : 'Add URL'}
          </Button>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-body-sm text-error">
          <Icon name="alert-circle" className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

export default HeroImagesEditor
