
import { useEffect, useState } from "react";
import "./OutpassPage.css";

const API_URL = "http://localhost:8080";
const STUDENT_ID = 2;

function OutpassPage() {
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    outpassType: "LOCAL",
    destination: "",
    reason: "",
    departureTime: "",
    expectedReturnTime: "",
  });

  // Fetch student's outpass history
  const fetchOutpasses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/outpasses/student/${STUDENT_ID}`
      );

      if (!response.ok) {
        throw new Error("Unable to load outpass history.");
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
    fetchOutpasses();
  }, []);

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit a new outpass request
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      new Date(formData.expectedReturnTime) <=
      new Date(formData.departureTime)
    ) {
      setError("Return time must be after departure time.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/outpasses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          studentId: STUDENT_ID,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit request.");
      }

      setMessage("Outpass request submitted successfully!");

      setFormData({
        outpassType: "LOCAL",
        destination: "",
        reason: "",
        departureTime: "",
        expectedReturnTime: "",
      });

      await fetchOutpasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Format date and time
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Not recorded";

    return new Date(dateTime).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Display status with a matching color
  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "approved";
      case "REJECTED":
        return "rejected";
      case "OUT":
        return "out";
      case "RETURNED":
        return "returned";
      default:
        return "pending";
    }
  };

  return (
    <div className="outpass-page">
      <div className="outpass-header">
        <div>
          <h1>Digital Outpass</h1>
          <p>Apply for hostel leave and track your requests.</p>
        </div>

        <div className="outpass-student-badge">
          Student ID: {STUDENT_ID}
        </div>
      </div>

      {message && (
        <div className="outpass-message success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="outpass-message error-message">
          {error}
        </div>
      )}

      <div className="outpass-layout">
        {/* Application Form */}
        <section className="outpass-card">
          <h2>Apply for Outpass</h2>
          <p className="outpass-description">
            Fill in the details below to submit your leave request.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="outpass-form-group">
              <label htmlFor="outpassType">Outpass Type</label>

              <select
                id="outpassType"
                name="outpassType"
                value={formData.outpassType}
                onChange={handleChange}
                required
              >
                <option value="LOCAL">Local Outpass</option>
                <option value="HOME">Home Outpass</option>
              </select>
            </div>

            <div className="outpass-form-group">
              <label htmlFor="destination">Destination</label>

              <input
                id="destination"
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Enter your destination"
                required
              />
            </div>

            <div className="outpass-form-group">
              <label htmlFor="reason">Reason for Leave</label>

              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Explain the reason for your leave"
                rows="4"
                required
              />
            </div>

            <div className="outpass-form-group">
              <label htmlFor="departureTime">
                Departure Date and Time
              </label>

              <input
                id="departureTime"
                type="datetime-local"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="outpass-form-group">
              <label htmlFor="expectedReturnTime">
                Expected Return Date and Time
              </label>

              <input
                id="expectedReturnTime"
                type="datetime-local"
                name="expectedReturnTime"
                value={formData.expectedReturnTime}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="outpass-submit-button"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Outpass Request"}
            </button>
          </form>
        </section>

        {/* Outpass History */}
        <section className="outpass-card">
          <div className="outpass-history-header">
            <div>
              <h2>My Outpass History</h2>
              <p className="outpass-description">
                View your previous and current requests.
              </p>
            </div>

            <button
              className="outpass-refresh-button"
              onClick={fetchOutpasses}
              type="button"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading outpass history...</p>
          ) : outpasses.length === 0 ? (
            <div className="outpass-empty">
              <h3>No requests found</h3>
              <p>Your outpass requests will appear here.</p>
            </div>
          ) : (
            <div className="outpass-list">
              {outpasses.map((outpass) => (
                <article
                  className="outpass-record"
                  key={outpass.id}
                >
                  <div className="outpass-record-header">
                    <h3>Outpass #{outpass.id}</h3>

                    <span
                      className={`outpass-status ${getStatusClass(
                        outpass.status
                      )}`}
                    >
                      {outpass.status}
                    </span>
                  </div>

                  <div className="outpass-record-details">
                    <p>
                      <strong>Type:</strong>{" "}
                      {outpass.outpassType}
                    </p>

                    <p>
                      <strong>Destination:</strong>{" "}
                      {outpass.destination}
                    </p>

                    <p>
                      <strong>Reason:</strong>{" "}
                      {outpass.reason}
                    </p>

                    <p>
                      <strong>Departure:</strong>{" "}
                      {formatDateTime(outpass.departureTime)}
                    </p>

                    <p>
                      <strong>Expected Return:</strong>{" "}
                      {formatDateTime(
                        outpass.expectedReturnTime
                      )}
                    </p>

                    {outpass.actualExitTime && (
                      <p>
                        <strong>Actual Exit:</strong>{" "}
                        {formatDateTime(
                          outpass.actualExitTime
                        )}
                      </p>
                    )}

                    {outpass.actualReturnTime && (
                      <p>
                        <strong>Actual Return:</strong>{" "}
                        {formatDateTime(
                          outpass.actualReturnTime
                        )}
                      </p>
                    )}
                  </div>

                  {outpass.status === "APPROVED" &&
                    outpass.barcode && (
                      <div className="outpass-barcode-box">
                        <strong>Approved Barcode ID</strong>
                        <code>{outpass.barcode}</code>
                        <p>
                          Show this ID to security when
                          leaving the hostel.
                        </p>
                      </div>
                    )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default OutpassPage;