
import { useEffect, useState } from 'react';

const API = 'http://localhost:8080';

export default function MessFeedbackPage({ role }) {
  const [feedback, setFeedback] = useState([]);
  const [mealType, setMealType] = useState('Breakfast');
  const [rating, setRating] = useState('5');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isStudent = role === 'STUDENT';
  const endpoint = isStudent
    ? '/mess-feedback/my'
    : role === 'ADMIN'
      ? '/mess-feedback/admin'
      : '/mess-feedback/warden';

  async function loadFeedback() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API}${endpoint}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Unable to load feedback.');
      }

      setFeedback(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedback();
  }, [endpoint]);

  async function submitFeedback(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API}/mess-feedback`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mealType,
          rating: Number(rating),
          comments
        })
      });

      if (!response.ok) {
        throw new Error('Unable to submit feedback.');
      }

      setMessage('Your feedback was submitted successfully!');
      setComments('');
      setRating('5');
      await loadFeedback();
    } catch (err) {
      setError(err.message);
    }
  }

  const averageRating = feedback.length
    ? (
        feedback.reduce((sum, item) => sum + item.rating, 0) /
        feedback.length
      ).toFixed(1)
    : '0.0';

  if (loading) {
    return <div className="section">Loading mess feedback...</div>;
  }

  return (
    <div className="section">
      <div className="section-heading">
        <div>
          <h2>Mess Food Feedback</h2>
          <p>
            {isStudent
              ? 'Share your experience about hostel food'
              : 'View student feedback about hostel food'}
          </p>
        </div>
      </div>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!isStudent && (
        <div className="stat-card">
          <h3>Average Food Rating</h3>
          <p>{averageRating} / 5 ⭐</p>
          <small>{feedback.length} feedback records</small>
        </div>
      )}

      {isStudent && (
        <div className="section">
          <h3>Submit Food Feedback</h3>

          <form onSubmit={submitFeedback}>
            <div className="form-group">
              <label>Select Meal</label>
              <select
                value={mealType}
                onChange={event => setMealType(event.target.value)}
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Snacks</option>
                <option>Dinner</option>
              </select>
            </div>

            <div className="form-group">
              <label>Food Rating</label>
              <select
                value={rating}
                onChange={event => setRating(event.target.value)}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Very Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Comments</label>
              <textarea
                value={comments}
                onChange={event => setComments(event.target.value)}
                placeholder="Write your feedback about the food..."
                maxLength={1000}
                rows={4}
              />
            </div>

            <button type="submit">Submit Feedback</button>
          </form>
        </div>
      )}

      <div className="section">
        <h3>{isStudent ? 'My Feedback History' : 'Student Feedback Records'}</h3>

        {feedback.length === 0 ? (
          <p>No feedback records available yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {!isStudent && <th>Student</th>}
                  <th>Meal</th>
                  <th>Rating</th>
                  <th>Comments</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {feedback.map(item => (
                  <tr key={item.id}>
                    {!isStudent && (
                      <td>
                        {item.student?.name || `Student #${item.student?.id || '-'}`}
                      </td>
                    )}
                    <td>{item.mealType}</td>
                    <td>{item.rating} / 5 ⭐</td>
                    <td>{item.comments || '-'}</td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
