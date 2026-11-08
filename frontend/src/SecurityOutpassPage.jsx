
import { useState } from "react";
import "./SecurityOutpassPage.css";

const API_URL = "http://localhost:8080";

async function readResponse(response) {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || text || "Verification failed."
    );
  }

  return data;
}

function SecurityOutpassPage() {
  const [barcode, setBarcode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyExit = async () => {
    if (!barcode.trim()) {
      setError("Please enter or scan a barcode.");
      setMessage("");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/security/outpasses/exit/${encodeURIComponent(
          barcode.trim()
        )}`,
        { method: "PUT", credentials: "include" }
      );

      const data = await readResponse(response);

      setMessage(
        `✓ Exit verified successfully. Outpass #${data.id ?? barcode.trim()} is now OUT.`
      );
      setBarcode("");
    } catch (err) {
      setError(err.message || "Unable to verify exit.");
    } finally {
      setLoading(false);
    }
  };

  const verifyReturn = async () => {
    if (!barcode.trim()) {
      setError("Please enter or scan a barcode.");
      setMessage("");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/security/outpasses/return/${encodeURIComponent(
          barcode.trim()
        )}`,
        { method: "PUT", credentials: "include" }
      );

      const data = await readResponse(response);

      setMessage(
        `✓ Return verified successfully. Outpass #${data.id ?? barcode.trim()} is now RETURNED.`
      );
      setBarcode("");
    } catch (err) {
      setError(err.message || "Unable to verify return.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-page">
      <div className="security-header">
        <div>
          <h1>Security Dashboard</h1>
          <p>Verify student outpass entry and exit</p>
        </div>

        <div className="security-badge">🛡️ Security</div>
      </div>

      <div className="security-content">
        <div className="security-card">
          <div className="card-icon">▣</div>

          <h2>Outpass Verification</h2>

          <p className="card-description">
            Enter the student's one-time barcode generated after warden
            approval.
          </p>

          <label htmlFor="barcode">Barcode / Outpass ID</label>

          <input
            id="barcode"
            type="text"
            placeholder="Enter or scan barcode"
            value={barcode}
            onChange={(e) => {
              setBarcode(e.target.value);
              setMessage("");
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                verifyExit();
              }
            }}
          />

          <div className="verification-buttons">
            <button
              className="exit-button"
              onClick={verifyExit}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Exit"}
            </button>

            <button
              className="return-button"
              onClick={verifyReturn}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Return"}
            </button>
          </div>

          {message && <div className="success-message">{message}</div>}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="security-info-card">
          <h2>How It Works</h2>

          <div className="workflow-step">
            <div className="step-number">1</div>
            <div>
              <h3>Warden Approval</h3>
              <p>
                Student applies for an outpass and the warden approves it.
              </p>
            </div>
          </div>

          <div className="workflow-line"></div>

          <div className="workflow-step">
            <div className="step-number">2</div>
            <div>
              <h3>Exit Verification</h3>
              <p>
                Security enters or scans the approved barcode. The status
                changes to OUT.
              </p>
            </div>
          </div>

          <div className="workflow-line"></div>

          <div className="workflow-step">
            <div className="step-number">3</div>
            <div>
              <h3>Return Verification</h3>
              <p>
                Security verifies the same barcode when the student returns.
                The status changes to RETURNED.
              </p>
            </div>
          </div>

          <div className="workflow-line"></div>

          <div className="workflow-step">
            <div className="step-number">✓</div>
            <div>
              <h3>One-Time Use</h3>
              <p>
                A returned outpass cannot be reused for another trip.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityOutpassPage;
