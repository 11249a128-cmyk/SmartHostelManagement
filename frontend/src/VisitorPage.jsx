
import { useCallback, useEffect, useMemo, useState } from 'react'

const API = 'http://localhost:8080'

function getToday() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentTime() {
  const date = new Date()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function VisitorPage() {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    visitorName: '',
    phone: '',
    studentVisited: '',
    relationship: '',
    visitDate: getToday(),
    visitTime: getCurrentTime()
  })

  const loadVisitors = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API}/visitors`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Unable to load visitor records.')
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Invalid visitor data received.')
      }

      setVisitors(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVisitors()
  }, [loadVisitors])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  const addVisitor = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`${API}/visitors`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (!response.ok) {
        throw new Error('Unable to save visitor record.')
      }

      setForm({
        visitorName: '',
        phone: '',
        studentVisited: '',
        relationship: '',
        visitDate: getToday(),
        visitTime: getCurrentTime()
      })

      await loadVisitors()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteVisitor = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this visitor record?'
    )

    if (!confirmed) return

    setError('')

    try {
      const response = await fetch(`${API}/visitors/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Unable to delete visitor record.')
      }

      await loadVisitors()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredVisitors = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (!query) return visitors

    return visitors.filter(visitor =>
      [
        visitor.visitorName,
        visitor.phone,
        visitor.studentVisited,
        visitor.relationship
      ].some(value =>
        String(value || '').toLowerCase().includes(query)
      )
    )
  }, [visitors, search])

  return (
    <section className="section">

      <div className="section-heading">
        <div>
          <h2>Visitor Management</h2>
          <p>Maintain and view hostel visitor records.</p>
        </div>

        <button onClick={loadVisitors} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}

      <div className="overview-grid">
        <div className="overview-card">
          <p>Total Visitor Records</p>
          <h3>{visitors.length}</h3>
        </div>
      </div>

      <div className="profile-card" style={{ display: 'block', padding: '20px' }}>
        <h3>Add Visitor Record</h3>
        <p>Enter the details of the visitor meeting a hostel student.</p>

        <form onSubmit={addVisitor}>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginTop: '16px'
          }}>

            <div>
              <label>Visitor Name</label>
              <input
                name="visitorName"
                value={form.visitorName}
                onChange={handleChange}
                placeholder="Enter visitor name"
                required
              />
            </div>

            <div>
              <label>Phone Number</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label>Student Visited</label>
              <input
                name="studentVisited"
                value={form.studentVisited}
                onChange={handleChange}
                placeholder="Enter student name"
                required
              />
            </div>

            <div>
              <label>Relationship</label>
              <select
                name="relationship"
                value={form.relationship}
                onChange={handleChange}
                required
              >
                <option value="">Select relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label>Visit Date</label>
              <input
                type="date"
                name="visitDate"
                value={form.visitDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Visit Time</label>
              <input
                type="time"
                name="visitTime"
                value={form.visitTime}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={saving}
            style={{ marginTop: '20px' }}
          >
            {saving ? 'Saving...' : 'Add Visitor Record'}
          </button>

        </form>
      </div>

      <div style={{ marginTop: '25px' }}>

        <div className="section-heading">
          <div>
            <h3>Visitor Records</h3>
            <p>View and search previously recorded visitors.</p>
          </div>
        </div>

        <input
          type="text"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search by visitor, phone or student name..."
          style={{ width: '100%', marginBottom: '16px' }}
        />

        {loading && <p>Loading visitor records...</p>}

        {!loading && filteredVisitors.length === 0 && (
          <div className="coming-soon-card">
            <h3>No Visitor Records Found</h3>
            <p>Add a visitor record using the form above.</p>
          </div>
        )}

        {!loading && filteredVisitors.map(visitor => (
          <div
            key={visitor.id}
            className="profile-card"
            style={{
              display: 'block',
              padding: '20px',
              marginTop: '16px'
            }}
          >
            <div className="section-heading">
              <div>
                <h3>
                  {visitor.visitorName}
                </h3>
                <p>
                  Visiting: {visitor.studentVisited}
                </p>
              </div>

              <span className="status-badge">
                Visitor #{visitor.id}
              </span>
            </div>

            <p><strong>Phone:</strong> {visitor.phone}</p>
            <p><strong>Relationship:</strong> {visitor.relationship}</p>
            <p><strong>Visit Date:</strong> {visitor.visitDate}</p>
            <p><strong>Visit Time:</strong> {visitor.visitTime}</p>

            <button
              type="button"
              onClick={() => deleteVisitor(visitor.id)}
              style={{ marginTop: '10px' }}
            >
              Delete Record
            </button>
          </div>
        ))}

      </div>

    </section>
  )
}

export default VisitorPage

