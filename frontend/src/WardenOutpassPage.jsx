import { useEffect, useState } from "react";
import "./WardenOutpassPage.css";

const API_URL = "http://localhost:8080";

function WardenOutpassPage() {
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPendingOutpasses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/warden/outpasses/pending`
      );

      if (!response.ok) {
        throw new Error("Failed to load pending outpasses.");
      }

      const data = await response.json();
      setOutpasses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingOutpasses();
  }, []);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/warden/outpasses/${id}/approve`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to approve outpass.");
      }

      const approvedOutpass = await response.json();

      setMessage(
        `Outpass #${approvedOutpass.id} approved successfully. Barcode generated.`
      );

      await loadPendingOutpasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this outpass?"
    );

    if (!confirmReject) {
      return;
    }

    try {
      setProcessingId(id);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/warden/outpasses/${id}/reject`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to reject outpass.");
      }

      const rejectedOutpass = await response.json();

      setMessage(
        `Outpass #${rejectedOutpass.id} rejected successfully.`
      );

      await loadPendingOutpasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="warden-outpass-page">
      <div className="warden-page-header">
        <div>
          <p className="page-label">WARDEN PANEL</p>
          <h1>Outpass Requests</h1>
          <p>
            Review and manage student outpass requests.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadPendingOutpasses}
        >
          ↻ Refresh
        </button>
      </div>

      {message && (
        <div className="success-message">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}

      <div className="summary-card">
        <div className="summary-icon">📋</div>
        <div>
          <span>Pending Requests</span>
          <strong>{outpasses.length}</strong>
        </div>
      </div>

      {loading ? (
        <div className="empty-card">
          Loading outpass requests...
        </div>
      ) : outpasses.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon">✓</div>
          <h2>No Pending Outpasses</h2>
          <p>
            There are currently no student outpass requests
            waiting for approval.
          </p>
        </div>
      ) : (
        <div className="outpass-list">
          {outpasses.map((outpass) => (
            <div className="warden-outpass-card" key={outpass.id}>
              <div className="card-top">
                <div>
                  <span className="outpass-number">
                    Outpass #{outpass.id}
                  </span>

                  <span className="pending-badge">
                    PENDING
                  </span>
                </div>

                <span className="outpass-type">
                  {outpass.outpassType}
                </span>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span>Student ID</span>
                  <strong>{outpass.studentId}</strong>
                </div>

                <div className="detail-item">
                  <span>Destination</span>
                  <strong>{outpass.destination}</strong>
                </div>

                <div className="detail-item">
                  <span>Reason</span>
                  <strong>{outpass.reason}</strong>
                </div>

                <div className="detail-item">
                  <span>Departure</span>
                  <strong>
                    {formatDateTime(outpass.departureTime)}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Expected Return</span>
                  <strong>
                    {formatDateTime(outpass.expectedReturnTime)}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Applied On</span>
                  <strong>
                    {formatDateTime(outpass.createdAt)}
                  </strong>
                </div>
              </div>

              <div className="action-section">
                <button
                  className="approve-button"
                  onClick={() => handleApprove(outpass.id)}
                  disabled={processingId === outpass.id}
                >
                  {processingId === outpass.id
                    ? "Processing..."
                    : "✓ Approve"}
                </button>

                <button
                  className="reject-button"
                  onClick={() => handleReject(outpass.id)}
                  disabled={processingId === outpass.id}
                >
                  {processingId === outpass.id
                    ? "Processing..."
                    : "✕ Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WardenOutpassPage;