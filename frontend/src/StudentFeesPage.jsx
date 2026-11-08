
import { useEffect, useState } from 'react';

const API = 'http://localhost:8080';

export default function StudentFeesPage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/fees/my`, {
      credentials: 'include'
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error('Unable to load your fee records.');
        }
        return response.json();
      })
      .then(data => setFees(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = fees.reduce(
    (sum, fee) => sum + Number(fee.amount || 0), 0
  );

  const paid = fees
    .filter(fee => fee.paymentStatus === 'PAID')
    .reduce((sum, fee) => sum + Number(fee.amount || 0), 0);

  const pending = total - paid;

  if (loading) {
    return <div className="section">Loading fee details...</div>;
  }

  return (
    <div className="section">
      <div className="section-heading">
        <div>
          <h2>Fee Status</h2>
          <p>View your hostel fee information</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Fees</h3>
          <p>₹{total.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <h3>Paid Amount</h3>
          <p>₹{paid.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <h3>Pending Amount</h3>
          <p>₹{pending.toFixed(2)}</p>
        </div>
      </div>

      <div className="section">
        <h3>My Fee Records</h3>

        {fees.length === 0 ? (
          <p>No fee records are available yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {fees.map(fee => (
                  <tr key={fee.id}>
                    <td>{fee.feeType}</td>
                    <td>₹{Number(fee.amount).toFixed(2)}</td>
                    <td>{fee.dueDate || 'Not set'}</td>
                    <td>
                      <strong>{fee.paymentStatus}</strong>
                    </td>
                    <td>{fee.description || '-'}</td>
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
