
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8080';

const categories = [
  'Maintenance',
  'Electrical',
  'Plumbing',
  'Cleanliness',
  'Food',
  'Water Supply',
  'Wi-Fi',
  'Room Facilities',
  'Security',
  'Other',
];

function StudentComplaintsPage({ studentId }) {
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState('Maintenance');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadComplaints = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_URL}/complaints/student/${studentId}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Unable to load complaints.');
      }

      const data = await response.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [studentId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!studentId) {
      setError('Student details are not available.');
      return;
    }

    if (!description.trim()) {
      setError('Please enter your complaint description.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setMessage('');

      const response = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          category,
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to submit complaint. Please try again.');
      }

      setDescription('');
      setMessage('Your complaint has been submitted successfully.');
      await loadComplaints();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'resolved';
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'REJECTED':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <h2>Complaints</h2>
          <p>Report hostel problems and track their progress.</p>
        </div>
      </div>

      <div className="complaint-form-card">
        <h3>Submit a New Complaint</h3>

        <form onSubmit={handleSubmit}>
          <label htmlFor="complaint-category">Complaint Category</label>

          <select
            id="complaint-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label htmlFor="complaint-description">
            Describe Your Problem
          </label>

          <textarea
            id="complaint-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain the problem you are facing..."
            rows={5}
            maxLength={2000}
            required
          />

          <p className="complaint-character-count">
            {description.length}/2000 characters
          </p>

          <button type="submit" disabled={submitting || !studentId}>
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>

        {message && <p className="complaint-success">{message}</p>}
        {error && <p className="complaint-error" role="alert">{error}</p>}
      </div>

      <div className="complaint-list-section">
        <div className="complaint-list-heading">
          <div>
            <h3>My Complaints</h3>
            <p>View the complaints you have submitted.</p>
          </div>

          <button type="button" onClick={loadComplaints}>
            Refresh
          </button>
        </div>

        {loading && <p>Loading your complaints...</p>}

        {!loading && complaints.length === 0 && (
          <div className="complaint-empty">
            <h3>No Complaints Yet</h3>
            <p>Your submitted complaints will appear here.</p>
          </div>
        )}

        {!loading && complaints.map((complaint) => (
          <article className="complaint-card" key={complaint.id}>
            <div className="complaint-card-top">
              <div>
                <h4>{complaint.category}</h4>
                <span>Complaint #{complaint.id}</span>
              </div>

              <span className={`complaint-status ${getStatusClass(complaint.status)}`}>
                {(complaint.status || 'PENDING').replace('_', ' ')}
              </span>
            </div>

            <p>{complaint.description}</p>

            <div className="complaint-card-bottom">
              <span>
                Priority: <strong>{complaint.priority || 'MEDIUM'}</strong>
              </span>

              <span>
                {complaint.createdAt
                  ? new Date(complaint.createdAt).toLocaleString()
                  : 'Date unavailable'}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default StudentComplaintsPage;

