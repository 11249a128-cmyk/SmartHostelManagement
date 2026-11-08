
import { useEffect, useState } from 'react'

const API = 'http://localhost:8080'

function NoticePage({ role, username }) {
  const canManage = role === 'ADMIN' || role === 'WARDEN'

  const [notices, setNotices] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadNotices = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API}/notices`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Unable to load notices.')
      }

      const data = await response.json()
      setNotices(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotices()
  }, [])

  const handlePublish = async (event) => {
    event.preventDefault()

    if (!title.trim() && !description.trim() && !image) {
      setError('Enter notice text or select an image.')
      return
    }

    const formData = new FormData()

    formData.append('title', title)
    formData.append('description', description)
    formData.append('category', category)
    formData.append('createdBy', username || role)

    if (image) {
      formData.append('image', image)
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const response = await fetch(`${API}/notices`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.message || 'Unable to publish notice.')
      }

      setTitle('')
      setDescription('')
      setCategory('General')
      setImage(null)

      event.target.reset()

      setMessage('Announcement published successfully!')
      await loadNotices()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) {
      return
    }

    try {
      setError('')
      setMessage('')

      const response = await fetch(`${API}/notices/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Unable to delete notice.')
      }

      setMessage('Notice deleted successfully.')
      await loadNotices()
    } catch (err) {
      setError(err.message)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Date unavailable'

    return new Date(date).toLocaleString()
  }

  const styles = {
    card: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '18px'
    },
    field: {
      width: '100%',
      padding: '11px',
      marginTop: '7px',
      marginBottom: '15px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      boxSizing: 'border-box',
      fontSize: '14px'
    },
    button: {
      padding: '11px 18px',
      background: '#4f46e5',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  }

  return (
    <section className="section">

      <div className="section-heading">
        <div>
          <h2>Notices & Announcements</h2>
          <p>
            {canManage
              ? 'Publish and manage hostel announcements.'
              : 'View the latest hostel announcements.'}
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" style={{
          ...styles.card,
          color: '#b91c1c',
          background: '#fef2f2'
        }}>
          {error}
        </div>
      )}

      {message && (
        <div role="status" style={{
          ...styles.card,
          color: '#166534',
          background: '#f0fdf4'
        }}>
          {message}
        </div>
      )}

      {canManage && (
        <div style={styles.card}>
          <h3>Publish New Announcement</h3>

          <form onSubmit={handlePublish}>

            <label>
              Notice Title (optional for image-only notices)
            </label>
            <input
              style={styles.field}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              maxLength={200}
            />

            <label>Description</label>
            <textarea
              style={{ ...styles.field, minHeight: '110px' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write announcement details"
              maxLength={3000}
            />

            <label>Category</label>
            <select
              style={styles.field}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>General</option>
              <option>Events</option>
              <option>Holidays</option>
              <option>Mess</option>
              <option>Maintenance</option>
            </select>

            <label>Announcement Image (optional)</label>
            <input
              style={styles.field}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />

            <p style={{ color: '#64748b', fontSize: '13px' }}>
              Allowed formats: JPG, JPEG and PNG. You can publish
              text, an image, or both.
            </p>

            <button
              type="submit"
              style={styles.button}
              disabled={saving}
            >
              {saving ? 'Publishing...' : 'Publish Announcement'}
            </button>

          </form>
        </div>
      )}

      <div style={styles.card}>
        <h3>Published Announcements</h3>
        <p>Total Notices: {notices.length}</p>

        {loading ? (
          <p>Loading announcements...</p>
        ) : notices.length === 0 ? (
          <p>No announcements have been published yet.</p>
        ) : (
          notices.map((notice) => (
            <article
              key={notice.id}
              style={{
                borderTop: '1px solid #e2e8f0',
                padding: '20px 0'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <h3>{notice.title || 'Hostel Announcement'}</h3>

                <span style={{
                  background: '#eef2ff',
                  color: '#4338ca',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '12px'
                }}>
                  {notice.category || 'General'}
                </span>
              </div>

              {notice.description && (
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  {notice.description}
                </p>
              )}

              {notice.imagePath && (
                <div style={{ marginTop: '12px' }}>
                  <a
                    href={`${API}${notice.imagePath}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={`${API}${notice.imagePath}`}
                      alt={notice.title || 'Hostel announcement'}
                      style={{
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '450px',
                        objectFit: 'contain',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0'
                      }}
                    />
                  </a>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>
                    Select the image to view it larger.
                  </p>
                </div>
              )}

              <p style={{
                color: '#64748b',
                fontSize: '12px'
              }}>
                Published by: {notice.createdBy || 'Hostel Administration'}
                <br />
                {formatDate(notice.createdAt)}
              </p>

              {canManage && (
                <button
                  type="button"
                  onClick={() => handleDelete(notice.id)}
                  style={{
                    ...styles.button,
                    background: '#dc2626'
                  }}
                >
                  Delete Notice
                </button>
              )}
            </article>
          ))
        )}
      </div>

    </section>
  )
}

export default NoticePage
