
import { useEffect, useMemo, useState } from "react";
import "./AdminStudentsPage.css";

const API_URL = "http://localhost:8080";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [year, setYear] = useState("ALL");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/students`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected student data received.");
      }

      setStudents(data);
    } catch (err) {
      setError(err.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const departments = useMemo(
    () => [...new Set(students.map((s) => s.department).filter(Boolean))],
    [students]
  );

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const text = [
        student.id,
        student.name,
        student.email,
        student.phone,
        student.department,
        student.roomNumber,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesDepartment =
        department === "ALL" || student.department === department;
      const matchesYear = year === "ALL" || String(student.year) === year;

      return matchesSearch && matchesDepartment && matchesYear;
    });
  }, [students, search, department, year]);

  return (
    <section className="section admin-students-page">
      <div className="section-heading">
        <div>
          <h2>Student Management</h2>
          <p>View and search registered hostel students.</p>
        </div>

        <span className="status-badge success">ADMIN</span>
      </div>

      <div className="admin-student-stats">
        <div className="admin-student-stat">
          <span>Total Students</span>
          <strong>{students.length}</strong>
        </div>

        <div className="admin-student-stat">
          <span>Departments</span>
          <strong>{departments.length}</strong>
        </div>

        <div className="admin-student-stat">
          <span>Showing Results</span>
          <strong>{filteredStudents.length}</strong>
        </div>
      </div>

      <div className="admin-student-toolbar">
        <input
          type="text"
          placeholder="Search name, ID, email, phone or room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="ALL">All Departments</option>
          {departments.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="ALL">All Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>

        <button type="button" onClick={loadStudents}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading student records...</p>}

      {error && (
        <div className="admin-student-error">
          {error}
          <button type="button" onClick={loadStudents}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="admin-student-table-wrap">
          <table className="admin-student-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Room</th>
                <th>Year</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>#{student.id}</td>
                  <td>
                    <strong>{student.name || "—"}</strong>
                  </td>
                  <td>
                    <span className="admin-student-department">
                      {student.department || "—"}
                    </span>
                  </td>
                  <td>{student.email || "—"}</td>
                  <td>{student.phone || "—"}</td>
                  <td>{student.roomNumber || "Not allocated"}</td>
                  <td>{student.year || "—"}</td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-student-empty">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="admin-student-note">
        Administrator view of student records. This page does not modify
        student information.
      </p>
    </section>
  );
}

