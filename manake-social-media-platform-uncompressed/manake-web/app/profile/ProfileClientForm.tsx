'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MemberProfile } from '../../src/lib/auth-session'

type ProfileClientFormProps = {
  user: MemberProfile
}

const employmentOptions = [
  '',
  'Student',
  'Employed full-time',
  'Employed part-time',
  'Self-employed',
  'Volunteer',
  'Unemployed - seeking',
  'Unemployed - not seeking',
  'Retired',
  'Prefer not to say',
]

const MAX_IMAGE_BYTES = 700 * 1024
const MAX_IMAGE_SOURCE_BYTES = 6 * 1024 * 1024
const MAX_IMAGE_DATA_URL_CHARS = 1_500_000
const MAX_VIDEO_BYTES = 2 * 1024 * 1024
const MAX_VIDEO_DATA_URL_CHARS = 2_900_000

function toList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Unable to read file.'))
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(objectUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to load image.'))
    image.src = objectUrl
  })
}

async function optimizeImageFile(file: File, maxWidth: number, maxHeight: number) {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight)
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Unable to prepare image.')
    }

    canvas.width = width
    canvas.height = height
    context.drawImage(image, 0, 0, width, height)

    return canvas.toDataURL('image/jpeg', file.size > MAX_IMAGE_BYTES ? 0.78 : 0.86)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function getVideoEmbedUrl(value: string) {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    const hostname = url.hostname.replace(/^www\./, '')

    if (hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]

      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const id = url.searchParams.get('v') || url.pathname.match(/\/(?:shorts|embed)\/([^/?#]+)/)?.[1]

      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (hostname === 'vimeo.com' || hostname === 'player.vimeo.com') {
      const id = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1]

      return id ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {
    return null
  }

  return null
}

function isPlayableVideoSource(value: string) {
  if (value.startsWith('data:video/')) {
    return true
  }

  try {
    return /\.(mp4|webm|ogg|mov)$/i.test(new URL(value).pathname)
  } catch {
    return false
  }
}

export default function ProfileClientForm({ user }: ProfileClientFormProps) {
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [headline, setHeadline] = useState(user.headline ?? '')
  const [bio, setBio] = useState(user.bio ?? '')
  const [location, setLocation] = useState(user.location ?? '')
  const [interests, setInterests] = useState(user.interests.join(', '))
  const [skills, setSkills] = useState(user.skills.join(', '))
  const [hobbies, setHobbies] = useState(user.hobbies.join(', '))
  const [education, setEducation] = useState(user.education ?? '')
  const [employmentStatus, setEmploymentStatus] = useState(user.employmentStatus ?? '')
  const [occupation, setOccupation] = useState(user.occupation ?? '')
  const [avatar, setAvatar] = useState(user.avatar ?? '')
  const [bannerImage, setBannerImage] = useState(user.bannerImage ?? '')
  const [videoIntroUrl, setVideoIntroUrl] = useState(user.videoIntroUrl ?? '')
  const [isMentor, setIsMentor] = useState(user.isMentor)
  const [mentorshipStyle, setMentorshipStyle] = useState(user.mentorshipStyle ?? '')
  const [yearsInRecovery, setYearsInRecovery] = useState(user.yearsInRecovery?.toString() ?? '')
  const [visibility, setVisibility] = useState(user.visibility || 'members')
  const [allowMessages, setAllowMessages] = useState(user.allowMessages || 'connections')
  const [allowMentorRequests, setAllowMentorRequests] = useState(user.allowMentorRequests)
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
    options: {
      label: string
      maxWidth: number
      maxHeight: number
    },
  ) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }

    if (file.size > MAX_IMAGE_SOURCE_BYTES) {
      setError(`Please choose a ${options.label} smaller than 6MB, or paste a hosted image URL instead.`)
      return
    }

    try {
      const dataUrl = await optimizeImageFile(file, options.maxWidth, options.maxHeight)

      if (dataUrl.length > MAX_IMAGE_DATA_URL_CHARS) {
        setError(`Please choose a smaller ${options.label}, or paste a hosted image URL instead.`)
        return
      }

      setter(dataUrl)
      setError(null)
    } catch {
      setError(`Unable to prepare the chosen ${options.label}.`)
    }
  }

  async function handleVideoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError('Please choose a video file.')
      return
    }

    if (file.size > MAX_VIDEO_BYTES) {
      setError('Please choose an intro video smaller than 2MB, or paste a hosted video URL instead.')
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)

      if (dataUrl.length > MAX_VIDEO_DATA_URL_CHARS) {
        setError('Please choose a smaller intro video, or paste a hosted video URL instead.')
        return
      }

      setVideoIntroUrl(dataUrl)
      setError(null)
    } catch {
      setError('Unable to read the chosen intro video.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        phone,
        headline,
        bio,
        location,
        interests: toList(interests),
        skills: toList(skills),
        hobbies: toList(hobbies),
        education,
        employmentStatus,
        occupation,
        avatar,
        bannerImage,
        videoIntroUrl,
        isMentor,
        mentorshipStyle,
        yearsInRecovery,
        visibility,
        allowMessages,
        allowMentorRequests,
        emailNotifications,
      }),
    }).catch(() => null)

    if (!response) {
      setError('Unable to reach the profile service. Please try again.')
      setIsSubmitting(false)
      return
    }

    const result = await response.json().catch(() => ({ success: false, error: 'Unable to parse response.' }))

    if (!response.ok || !result.success) {
      setError(result.error ?? 'Unable to save your profile.')
      setIsSubmitting(false)
      return
    }

    setSuccess('Profile saved.')
    setIsSubmitting(false)
    router.refresh()
  }

  const videoEmbedUrl = getVideoEmbedUrl(videoIntroUrl)
  const playableVideoSource = isPlayableVideoSource(videoIntroUrl)

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-form-grid">
        <label>
          <span>Full name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>

        <label>
          <span>Phone</span>
          <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" />
        </label>

        <label className="profile-form-wide">
          <span>Profile headline</span>
          <input
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            placeholder="Peer member, family supporter, volunteer, mentor..."
          />
        </label>

        <label className="profile-form-wide">
          <span>Why I am signing up</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            placeholder="Share what kind of support, connection, or purpose brought you here."
          />
        </label>

        <label>
          <span>Location</span>
          <input value={location} onChange={(event) => setLocation(event.target.value)} autoComplete="address-level2" />
        </label>

        <label>
          <span>Days or years in recovery</span>
          <input
            value={yearsInRecovery}
            onChange={(event) => setYearsInRecovery(event.target.value)}
            min="0"
            max="80"
            type="number"
          />
        </label>

        <label className="profile-form-wide">
          <span>Support interests</span>
          <input
            value={interests}
            onChange={(event) => setInterests(event.target.value)}
            placeholder="mentorship, counselling, family support"
          />
        </label>

        <label className="profile-form-wide">
          <span>Strengths I can share</span>
          <input
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            placeholder="listening, lived experience, facilitation"
          />
        </label>

        <label className="profile-form-wide">
          <span>Hobbies and interests</span>
          <input
            value={hobbies}
            onChange={(event) => setHobbies(event.target.value)}
            placeholder="reading, football, music, gardening"
          />
        </label>

        <label className="profile-form-wide">
          <span>Education</span>
          <input
            value={education}
            onChange={(event) => setEducation(event.target.value)}
            placeholder="University of Zimbabwe — BSc Social Work"
          />
        </label>

        <label>
          <span>Employment status</span>
          <select value={employmentStatus} onChange={(event) => setEmploymentStatus(event.target.value)}>
            {employmentOptions.map((option) => (
              <option key={option || 'none'} value={option}>
                {option || 'Select status'}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Occupation or role</span>
          <input
            value={occupation}
            onChange={(event) => setOccupation(event.target.value)}
            placeholder="Counsellor, student, peer mentor"
          />
        </label>

        <label>
          <span>Profile visibility</span>
          <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
            <option value="members">Members only</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>

        <label>
          <span>Messages</span>
          <select value={allowMessages} onChange={(event) => setAllowMessages(event.target.value)}>
            <option value="connections">Connections only</option>
            <option value="everyone">Everyone</option>
            <option value="none">No messages</option>
          </select>
        </label>
      </div>

      <div className="profile-media">
        <div className="profile-media-card">
          <div className="profile-media-preview profile-media-preview-avatar">
            {avatar ? (
              <img src={avatar} alt="Profile photo preview" />
            ) : (
              <span aria-hidden="true">{(name || user.name || '?').slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="profile-media-fields">
            <strong>Profile photo</strong>
            <p>Paste a hosted image URL or upload a small image (under 700KB).</p>
            <input
              value={avatar}
              onChange={(event) => setAvatar(event.target.value)}
              placeholder="https://... or uploaded image data"
              type="text"
            />
            <div className="profile-media-actions">
              <label className="button button-secondary button-small">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageUpload(event, setAvatar, {
                    label: 'profile photo',
                    maxWidth: 700,
                    maxHeight: 700,
                  })}
                  hidden
                />
              </label>
              {avatar ? (
                <button className="button button-secondary button-small" type="button" onClick={() => setAvatar('')}>
                  Remove photo
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="profile-media-card">
          <div className="profile-media-preview profile-media-preview-banner">
            {bannerImage ? <img src={bannerImage} alt="Profile banner preview" /> : <span aria-hidden="true">Banner</span>}
          </div>
          <div className="profile-media-fields">
            <strong>Banner image</strong>
            <p>Optional banner that appears at the top of your member profile.</p>
            <input
              value={bannerImage}
              onChange={(event) => setBannerImage(event.target.value)}
              placeholder="https://... or uploaded image data"
              type="text"
            />
            <div className="profile-media-actions">
              <label className="button button-secondary button-small">
                Upload banner
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageUpload(event, setBannerImage, {
                    label: 'banner image',
                    maxWidth: 1600,
                    maxHeight: 720,
                  })}
                  hidden
                />
              </label>
              {bannerImage ? (
                <button className="button button-secondary button-small" type="button" onClick={() => setBannerImage('')}>
                  Remove banner
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="profile-media-card">
          <div className="profile-media-preview profile-media-preview-video">
            {videoIntroUrl && videoEmbedUrl ? (
              <iframe
                src={videoEmbedUrl}
                title="Introduction video preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : videoIntroUrl && playableVideoSource ? (
              <video src={videoIntroUrl} controls preload="metadata" />
            ) : videoIntroUrl ? (
              <a className="profile-video-link" href={videoIntroUrl} target="_blank" rel="noreferrer">
                Open video link
              </a>
            ) : (
              <span aria-hidden="true">Intro video</span>
            )}
          </div>
          <div className="profile-media-fields">
            <strong>Introduction video</strong>
            <p>Paste a hosted video URL (YouTube, Vimeo, MP4) so members can hear your story.</p>
            <input
              value={videoIntroUrl}
              onChange={(event) => setVideoIntroUrl(event.target.value)}
              placeholder="https://youtu.be/... or upload a short MP4/WebM"
              type="text"
            />
            <div className="profile-media-actions">
              <label className="button button-secondary button-small">
                Upload video
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleVideoUpload}
                  hidden
                />
              </label>
              {videoIntroUrl ? (
                <button
                  className="button button-secondary button-small"
                  type="button"
                  onClick={() => setVideoIntroUrl('')}
                >
                  Remove video
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-switches">
        <label className="profile-switch">
          <input checked={isMentor} onChange={(event) => setIsMentor(event.target.checked)} type="checkbox" />
          <span>I am open to mentoring or peer support</span>
        </label>

        {isMentor ? (
          <label className="profile-form-wide">
            <span>Mentorship style</span>
            <input
              value={mentorshipStyle}
              onChange={(event) => setMentorshipStyle(event.target.value)}
              placeholder="weekly check-ins, family encouragement, practical goal setting"
            />
          </label>
        ) : null}

        <label className="profile-switch">
          <input
            checked={allowMentorRequests}
            onChange={(event) => setAllowMentorRequests(event.target.checked)}
            type="checkbox"
          />
          <span>Allow mentor requests</span>
        </label>

        <label className="profile-switch">
          <input
            checked={emailNotifications}
            onChange={(event) => setEmailNotifications(event.target.checked)}
            type="checkbox"
          />
          <span>Email me important updates</span>
        </label>
      </div>

      <div className="profile-form-actions">
        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving…' : 'Save profile'}
        </button>
        <a className="button button-secondary" href="/dashboard">
          Dashboard
        </a>
      </div>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {success ? <p className="form-success" role="status">{success}</p> : null}
    </form>
  )
}
