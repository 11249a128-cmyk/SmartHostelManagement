
import { useEffect, useMemo, useState } from "react";
import "./AdminOutpassPage.css";

const API_URL = "http://localhost:8080";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

export default function AdminOutpassPage() {
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadOutpasses() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/outpasses`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from server.");
        }

        setOutpasses(data);
      } catch (err) {
        setError(err.message || "Could not load outpasses.");
      } finally {
        setLoading(false);
      }
    }

    loadOutpasses();
  }, []);

  const counts = useMemo(() => {
    const result = {
      TOTAL: outpasses.length,
      PENDING: 0,
      APPROVED: 0,
      OUT: 0,
      RETURNED: 0,
      REJECTED: 0,
    };

    outpasses.forEach((item) => {
      const status = String(item.status || "").toUpperCase();

      if (result[status] !== undefined) {
        result[status]++;
      }
    });

    return result;
  }, [outpasses]);

  const filteredOutpasses = useMemo(() => {
    return outpasses.filter((item) => {
      const status = String(item.status || "").toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      const searchText = [
        item.id,
        item.studentId,
        item.destination,
        item.reason,
        item.outpassType,
        item.status,
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchText.includes(search.toLowerCase());
    });
  }, [outpasses, search, statusFilter]);

  return (
    <section className="section admin-outpass-page">
      <div className="section-heading">
        <div>
          <h2>Outpass Management</h2>
          <p>Administrator overview of hostel outpasses.</p>
        </div>
        <span className="status-badge success">ADMIN</span>
      </div>

      <div className="admin-outpass-stats">
        {[
          ["Total Outpasses", counts.TOTAL],
          ["Pending", counts.PENDING],
          ["Currently OUT", counts.OUT],
          ["Returned", counts.RETURNED],
        ].map(([label, value]) => (
          <div className="admin-outpass-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-outpass-toolbar">
        <input
          type="text"
          placeholder="Search by ID, student, destination..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="OUT">Out</option>
          <option value="RETURNED">Returned</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading && <p>Loading outpasses...</p>}

      {error && (
        <div className="admin-outpass-error">
          Could not load outpasses: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="admin-outpass-table-wrap">
          <table className="admin-outpass-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student ID</th>
                <th>Type</th>
                <th>Destination</th>
                <th>Reason</th>
                <th>Departure</th>
                <th>Expected Return</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredOutpasses.map((item) => (
                <tr key={item.id}>
                  <td>{item.id ?? "—"}</td>
                  <td>{item.studentId ?? "—"}</td>
                  <td>{item.outpassType ?? "—"}</td>
                  <td>{item.destination ?? "—"}</td>
                  <td>{item.reason ?? "—"}</td>
                  <td>{formatDate(item.departureTime)}</td>
                  <td>{formatDate(item.expectedReturnTime)}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>
                    <span
                      className={`admin-outpass-status ${String(
                        item.status || "unknown"
                      ).toLowerCase()}`}
                    >
                      {item.status || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredOutpasses.length === 0 && (
                <tr>
                  <td colSpan="9" className="admin-outpass-empty">
                    No matching outpasses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="admin-outpass-note">
        This is a read-only administrator view. Warden approval and rejection
        are handled through the Warden account.
      </p>
    </section>
  );
}
