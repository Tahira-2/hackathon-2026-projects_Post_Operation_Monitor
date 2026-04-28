import { useEffect, useMemo, useState } from 'react'
import { Save, X, Upload, BadgeInfo, CalendarDays, Mail, Shield } from 'lucide-react'

import { getCurrentProfile, updateCurrentProfile } from '../api/authApi'

const USERNAME_KEY = 'devcare_username'
const AVATAR_URL_KEY = 'devcare_avatar_url'

function ProfileSettingsDrawer({ open, onClose, onProfileUpdated }) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState({
    type: '',
    message: '',
  })
  const [previewUrl, setPreviewUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [form, setForm] = useState({
    bio: '',
  })
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    role: '',
    joined_at: '',
  })

  const fallbackInitial = useMemo(() => {
    const username = localStorage.getItem(USERNAME_KEY) || 'User'
    return username.charAt(0).toUpperCase()
  }, [])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    let active = true

    async function loadProfile() {
      setLoading(true)
      setStatus({ type: '', message: '' })

      try {
        const profile = await getCurrentProfile()
        if (!active) return

        setProfile({
          username: profile.username || '',
          email: profile.email || '',
          role: profile.role || '',
          joined_at: profile.joined_at || '',
        })
        setForm({
          bio: profile.bio || '',
        })
        const avatarUrl = profile.avatar_url || localStorage.getItem(AVATAR_URL_KEY) || ''
        setPreviewUrl(avatarUrl)
        setAvatarFile(null)
      } catch (loadError) {
        if (active) {
          setStatus({
            type: 'error',
            message: loadError?.message || 'Unable to load profile settings.',
          })
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function fileToOptimizedBlob(file) {
    const bitmap = await createImageBitmap(file)
    const maxSize = 512
    const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1)
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Unable to process image.')
    }

    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
            return
          }
          reject(new Error('Failed to convert image to blob.'))
        },
        'image/jpeg',
        0.85,
      )
    })
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setStatus({
        type: 'error',
        message: 'Upload failed: please choose a valid image file.',
      })
      return
    }

    setStatus({ type: '', message: '' })

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    try {
      const avatarBlob = await fileToOptimizedBlob(file)
      const optimizedFile = new File([avatarBlob], `${file.name.split('.').slice(0, -1).join('.') || 'avatar'}.jpg`, {
        type: 'image/jpeg',
      })

      setAvatarFile(optimizedFile)
      setPreviewUrl(URL.createObjectURL(optimizedFile))
    } catch {
      setStatus({
        type: 'error',
        message: 'Upload failed: unable to process this image. Please try another one.',
      })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setStatus({ type: '', message: '' })

    try {
      const payload = new FormData()
      payload.append('bio', form.bio)
      if (avatarFile) {
        payload.append('avatar', avatarFile)
      }

      const updatedProfile = await updateCurrentProfile(payload)
      localStorage.setItem(USERNAME_KEY, updatedProfile.username)
      if (updatedProfile.avatar_url) {
        localStorage.setItem(AVATAR_URL_KEY, updatedProfile.avatar_url)
      }
      onProfileUpdated?.(updatedProfile)
      setStatus({
        type: 'success',
        message: 'Profile updated successfully.',
      })
      setAvatarFile(null)
      setPreviewUrl(updatedProfile.avatar_url || '')
    } catch (submitError) {
      setStatus({
        type: 'error',
        message: submitError?.message || 'Update failed. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return null
  }

  const displayName = profile.username || localStorage.getItem(USERNAME_KEY) || 'User'
  const memberSince = profile.joined_at ? new Date(profile.joined_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Recently'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
      <button
        type="button"
        aria-label="Close profile settings"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Profile Settings
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--color-secondary)]">
              Manage your profile
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--color-border)] p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <form className="flex-1 overflow-y-auto px-6 py-6" onSubmit={handleSubmit}>
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">
              Loading your profile...
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-3xl bg-[var(--color-primary-soft)] ring-4 ring-white shadow-sm">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-black text-[var(--color-primary)]">
                        {fallbackInitial}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Profile picture
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      Keep your workspace easy to recognize when doctors and patients review sessions.
                    </p>
                    <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white transition hover:opacity-95">
                      <Upload size={16} />
                      Upload photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-light)]">
                    <BadgeInfo size={14} />
                    Account
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-secondary)] truncate">
                    {displayName}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-light)]">
                    <Mail size={14} />
                    Email
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-secondary)] truncate">
                    {profile.email || 'Not set'}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-light)]">
                    <CalendarDays size={14} />
                    Member since
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-secondary)]">
                    {memberSince}
                  </p>
                </div>
              </section>

              <section>
                <label className="mb-2 block text-sm font-semibold text-[var(--color-secondary)]">
                  Bio and recovery note
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={updateField}
                  rows="4"
                  className="auth-input min-h-28 resize-none"
                  placeholder="Add a short note about your recovery goal, preferred therapy focus, or anything your care team should know..."
                />
              </section>

              <section className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4 text-sm text-[var(--color-text-muted)]">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-[var(--color-secondary)]">
                    <Shield size={16} className="text-[var(--color-primary)]" />
                    Role
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-secondary)]">
                    {`${profile.role || 'patient'}`.charAt(0).toUpperCase() + `${profile.role || 'patient'}`.slice(1)}
                  </p>
                </div>
              </section>

              {status.message && (
                <p
                  className={
                    status.type === 'success'
                      ? 'auth-message auth-message-success'
                      : 'auth-message auth-message-error'
                  }
                >
                  {status.message}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-bold text-[var(--color-secondary)] transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary inline-flex items-center gap-2 px-5 py-3"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}
        </form>
      </aside>
    </div>
  )
}

export default ProfileSettingsDrawer