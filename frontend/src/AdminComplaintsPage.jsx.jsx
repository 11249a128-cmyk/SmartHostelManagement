
import { useCallback, useEffect, useState } from 'react'

const API = 'http://localhost:8080'

function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)
  const [statuses, setStatuses] = useState({})

  const loadComplaints = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API}/complaints`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Unable to load complaints.')
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Invalid complaints data received.')
      }

      setComplaints(data)
      setStatuses(
        Object.fromEntries(
          data.map(item => [item.id, item.status || 'PENDING'])
        )
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadComplaints()
  }, [loadComplaints])

  const updateStatus = async (id) => {
    setUpdating(id)
    setError('')

    try {
      const response = await fetch(`${API}/complaints/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: statuses[id]
        })
      })

      if (!response.ok) {
        throw new Error('Unable to update complaint status.')
      }

      await loadComplaints()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const count = (status) =>
    complaints.filter(item => item.status === status).length

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <h2>Complaint Management</h2>
          <p>Review and manage student complaints.</p>
        </div>

        <button onClick={loadComplaints} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}

      <div className="overview-grid">
        <div className="overview-card">
          <p>Total Complaints</p>
          <h3>{complaints.length}</h3>
        </div>

        <div className="overview-card">
          <p>Pending</p>
          <h3>{count('PENDING')}</h3>
        </div>

        <div className="overview-card">
          <p>In Progress</p>
          <h3>{count('IN_PROGRESS')}</h3>
        </div>

        <div className="overview-card">
          <p>Resolved</p>
          <h3>{count('RESOLVED')}</h3>
        </div>
      </div>

      {loading && <p>Loading complaints...</p>}

      {!loading && complaints.length === 0 && (
        <div className="coming-soon-card">
          <h3>No Complaints Yet</h3>
          <p>Student complaints will appear here.</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {complaints.map(complaint => {
          const student = complaint.student || {}

          return (
            <div
              key={complaint.id}
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
                    Complaint #{complaint.id} - {complaint.category}
                  </h3>

                  <p>
                    {student.name || 'Unknown Student'}
                    {student.department
                      ? ` | ${student.department}`
                      : ''}
                    {student.roomNumber
                      ? ` | Room ${student.roomNumber}`
                      : ''}
                  </p>
                </div>

                <span className="status-badge">
                  {complaint.status}
                </span>
              </div>

              <p>{complaint.description}</p>

              <p>
                Priority: <strong>{complaint.priority}</strong>
              </p>

              <p>
                Student ID: {student.id ?? 'Not available'}
              </p>

              <p>
                Submitted: {complaint.createdAt
                  ? new Date(complaint.createdAt).toLocaleString()
                  : 'Not available'}
              </p>

              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <select
                  value={statuses[complaint.id] || 'PENDING'}
                  onChange={event =>
                    setStatuses(previous => ({
                      ...previous,
                      [complaint.id]: event.target.value
                    }))
                  }
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>

                <button
                  onClick={() => updateStatus(complaint.id)}
                  disabled={updating === complaint.id}
                >
                  {updating === complaint.id
                    ? 'Saving...'
                    : 'Save Status'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default AdminComplaintsPage
