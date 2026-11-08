
import { useEffect, useState } from 'react';

const API = 'http://localhost:8080';

export default function AdminFeesPage() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    studentId: '',
    feeType: 'Hostel Fee',
    amount: '',
    dueDate: '',
    description: ''
  });

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [studentResponse, feeResponse] = await Promise.all([
        fetch(`${API}/students`, { credentials: 'include' }),
        fetch(`${API}/fees/admin`, { credentials: 'include' })
      ]);

      if (!studentResponse.ok || !feeResponse.ok) {
        throw new Error('Unable to load students or fee records.');
      }

      const studentData = await studentResponse.json();
      const feeData = await feeResponse.json();

      setStudents(studentData);
      setFees(feeData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function addFee(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API}/fees`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student: { id: Number(form.studentId) },
          feeType: form.feeType,
          amount: Number(form.amount),
          dueDate: form.dueDate || null,
          description: form.description,
          paymentStatus: 'UNPAID'
        })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Could not add fee record.');
      }

      setMessage('Fee record added successfully!');

      setForm({
        studentId: '',
        feeType: 'Hostel Fee',
        amount: '',
        dueDate: '',
        description: ''
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(id, paymentStatus) {
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API}/fees/${id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus })
      });

      if (!response.ok) {
        throw new Error('Unable to update payment status.');
      }

      setMessage('Payment status updated successfully!');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="section">Loading fee management...</div>;
  }

  return (
    <div className="section">
      <div className="section-heading">
        <div>
          <h2>Fee Management</h2>
          <p>Add and manage student hostel fee records</p>
        </div>
      </div>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="section">
        <h3>Add Student Fee</h3>

        <form onSubmit={addFee}>
          <div className="form-group">
            <label>Select Student</label>
            <select
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              required
            >
              <option value="">Choose a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} (ID: {student.id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fee Type</label>
            <select
              name="feeType"
              value={form.feeType}
              onChange={handleChange}
              required
            >
              <option>Hostel Fee</option>
              <option>Mess Fee</option>
              <option>Maintenance Fee</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter fee details"
            />
          </div>

          <button type="submit">Add Fee Record</button>
        </form>
      </div>

      <div className="section">
        <h3>All Fee Records ({fees.length})</h3>

        {fees.length === 0 ? (
          <p>No fee records added yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {fees.map(fee => (
                  <tr key={fee.id}>
                    <td>
                      {fee.student?.name || `Student #${fee.student?.id || '-'}`}
                    </td>
                    <td>{fee.feeType}</td>
                    <td>₹{Number(fee.amount).toFixed(2)}</td>
                    <td>{fee.dueDate || '-'}</td>
                    <td><strong>{fee.paymentStatus}</strong></td>
                    <td>
                      <select
                        value={fee.paymentStatus}
                        onChange={event =>
                          updateStatus(fee.id, event.target.value)
                        }
                      >
                        <option value="UNPAID">UNPAID</option>
                        <option value="PAID">PAID</option>
                      </select>
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
