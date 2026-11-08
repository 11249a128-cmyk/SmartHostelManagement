import { useEffect, useState } from 'react'

import './App.css'

import OutpassPage from "./OutpassPage";

import WardenOutpassPage from "./WardenOutpassPage";

import SecurityOutpassPage from "./SecurityOutpassPage";

import LoginPage from "./LoginPage";

import AdminOutpassPage from "./AdminOutpassPage";

import AdminStudentsPage from "./AdminStudentsPage";
 
import AdminRoomsPage from "./AdminRoomsPage";

import StudentComplaintsPage from './StudentComplaintsPage';

import AdminComplaintsPage from './AdminComplaintsPage.jsx';

import ChatbotPage from './ChatbotPage';

import VisitorPage from './VisitorPage';

import NoticePage from './NoticePage';

import StudentFeesPage from './StudentFeesPage';

import AdminFeesPage from './AdminFeesPage';

import MessFeedbackPage from './MessFeedbackPage';

function App() {

  const [student, setStudent] = useState(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [currentPage, setCurrentPage] = useState('dashboard')

  const [authUser, setAuthUser] = useState(null)

  const [authChecking, setAuthChecking] = useState(true)

  const [adminStats, setAdminStats] = useState(null)
  const [adminStatsLoading, setAdminStatsLoading] = useState(false)
  const [adminStatsError, setAdminStatsError] = useState('')



  useEffect(() => {

    let active = true



    fetch('http://localhost:8080/auth/me', { credentials: 'include' })

      .then((response) => {

        if (!response.ok) throw new Error('Not signed in')

        return response.json()

      })

      .then((data) => {

        if (!active) return

        setAuthUser(data)

        if (data.role === 'WARDEN') setCurrentPage('warden-outpasses')

        else if (data.role === 'SECURITY') setCurrentPage('security-outpasses')

        else if (data.role === 'ADMIN') setCurrentPage('admin-home')

        else setCurrentPage('dashboard')

      })

      .catch(() => {

        if (active) setAuthUser(null)

      })

      .finally(() => {

        if (active) setAuthChecking(false)

      })



    return () => { active = false }

  }, [])



  // Load the signed-in student's own dashboard record.
  useEffect(() => {
    if (!authUser || authUser.role !== 'STUDENT') {
      setLoading(false);
      return;
    }

    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setStudent(null);

    const studentId = authUser.studentId ?? authUser.student_id;

    if (!studentId) {
      setError('This student login is not linked to a student record. Please ask the administrator to link the student account.');
      setLoading(false);
      return () => {
        active = false;
        controller.abort();
      };
    }

    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    fetch(`http://localhost:8080/students/${studentId}/dashboard`, {
      credentials: 'include',
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text().catch(() => '');
          throw new Error(message || `Unable to load student details (HTTP ${response.status}).`);
        }
        return response.json();
      })
      .then((data) => {
        if (active) setStudent(data);
      })
      .catch((err) => {
        if (!active) return;
        if (err.name === 'AbortError') {
          setError('Student dashboard request timed out. Please check that the backend is running and try again.');
        } else {
          setError(err.message || 'Unable to load student details.');
        }
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [authUser]);



useEffect(() => {
  if (!authUser || authUser.role !== 'ADMIN') return;

  let active = true;
  setAdminStatsLoading(true);
  setAdminStatsError('');

  const loadStats = async () => {
    try {
      const endpoints = [
        '/students',
        '/rooms',
        '/beds',
        '/outpasses',
        '/complaints',
        '/fees/admin',
        '/mess-feedback/admin'
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint =>
          fetch(`http://localhost:8080${endpoint}`, {
            credentials: 'include'
          })
        )
      );

      const failedResponse = responses.find(response => !response.ok);

      if (failedResponse) {
        throw new Error('One or more analytics APIs could not be loaded.');
      }

      const [
        students,
        rooms,
        beds,
        outpasses,
        complaints,
        fees,
        feedback
      ] = await Promise.all(
        responses.map(response => response.json())
      );

      const datasets = [
        students, rooms, beds, outpasses,
        complaints, fees, feedback
      ];

      if (!datasets.every(Array.isArray)) {
        throw new Error('The server returned unexpected analytics data.');
      }

      if (active) {
        const totalPaid = fees
          .filter(fee => fee.paymentStatus === 'PAID')
          .reduce((sum, fee) => sum + Number(fee.amount || 0), 0);

        const totalPending = fees
          .filter(fee => fee.paymentStatus === 'UNPAID')
          .reduce((sum, fee) => sum + Number(fee.amount || 0), 0);

        const averageRating = feedback.length
          ? feedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) / feedback.length
          : 0;

        setAdminStats({
          students: students.length,
          rooms: rooms.length,
          beds: beds.length,
          occupiedBeds: beds.filter(bed => bed.status === 'OCCUPIED').length,
          availableBeds: beds.filter(bed => bed.status === 'AVAILABLE').length,

          outpasses: outpasses.length,
          pendingOutpasses: outpasses.filter(item => item.status === 'PENDING').length,
          outsideOutpasses: outpasses.filter(item => item.status === 'OUT').length,
          returnedOutpasses: outpasses.filter(item => item.status === 'RETURNED').length,

          complaints: complaints.length,
          pendingComplaints: complaints.filter(item => item.status === 'PENDING').length,
          inProgressComplaints: complaints.filter(item => item.status === 'IN_PROGRESS').length,
          resolvedComplaints: complaints.filter(item => item.status === 'RESOLVED').length,
          rejectedComplaints: complaints.filter(item => item.status === 'REJECTED').length,

          totalFees: fees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0),
          totalPaid,
          totalPending,

          feedbackCount: feedback.length,
          averageRating: averageRating.toFixed(1)
        });
      }
    } catch (err) {
      if (active) {
        setAdminStatsError(
          err.message || 'Unable to load analytics statistics.'
        );
      }
    } finally {
      if (active) setAdminStatsLoading(false);
    }
  };

  loadStats();

  return () => {
    active = false;
  };
}, [authUser]);

  

  const openPage = (page) => {

    setCurrentPage(page)

    window.scrollTo({ top: 0, behavior: 'smooth' })

  }



  
const handleLogin = async (user) => {
  try {
    const response = await fetch('http://localhost:8080/auth/me', {
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Unable to verify login session.')
    }

    const sessionUser = await response.json()

    setAuthUser(sessionUser)
    setError('')

    if (sessionUser.role === 'WARDEN') {
      setCurrentPage('warden-outpasses')
    } else if (sessionUser.role === 'SECURITY') {
      setCurrentPage('security-outpasses')
    } else if (sessionUser.role === 'ADMIN') {
      setCurrentPage('admin-home')
    } else {
      setCurrentPage('dashboard')
    }
  } catch (err) {
    setError(err.message || 'Login verification failed.')
  }
}




  const handleLogout = async () => {

    try {

      await fetch('http://localhost:8080/auth/logout', {

        method: 'POST',

        credentials: 'include',

      })

    } catch (err) {

      console.error('Logout request failed.', err)

    } finally {

      setAuthUser(null)

      setStudent(null)

      setError('')

      setCurrentPage('dashboard')

    }

  }



  if (authChecking) {

    return (

      <div className="loading-screen">

        <div className="loader"></div>

        <p>Checking login session...</p>

      </div>

    )

  }



  if (!authUser) return <LoginPage onLogin={handleLogin} />



  if (authUser.role === 'STUDENT' && loading) {

    return (

      <div className="loading-screen">

        <div className="loader"></div>

        <p>Loading your dashboard...</p>

      </div>

    )

  }



  if (authUser.role === 'STUDENT' && error) {

    return (

      <div className="error-screen">

        <h2>Unable to load dashboard</h2>

        <p>{error}</p>

        <p>Please check whether the Spring Boot backend is running.</p>

        <button onClick={handleLogout}>Sign out</button>

      </div>

    )

  }



  return (

    <div className="dashboard">



      {/* Sidebar */}

      <aside className="sidebar">



        <div className="brand">

          <div className="brand-icon">H</div>



          <div>

            <h2>HostelHub</h2>

            <span>Student Portal</span>

          </div>

        </div>



        <div className="menu-label">MAIN MENU</div>

        <div style={{ padding: '0 18px 16px', color: '#cbd5e1', fontSize: '12px' }}>

          Signed in as <strong>{authUser.username}</strong> ({authUser.role})

        </div>



        <nav className="sidebar-menu">



          {/* Administrator menu */}
          {authUser.role === 'ADMIN' && (
            <>
              <button
                className={`menu-item ${currentPage === 'admin-home' ? 'active' : ''}`}
                onClick={() => openPage('admin-home')}
              >
                <span>⚙</span> Admin Dashboard
              </button>

              <button
                className={`menu-item ${currentPage === 'admin-outpasses' ? 'active' : ''}`}
                onClick={() => openPage('admin-outpasses')}
              >
                <span>↗</span> Outpass Management
              </button>

              <button
                className={`menu-item ${currentPage === 'admin-students' ? 'active' : ''}`}
                onClick={() => openPage('admin-students')}
              >
                <span>♙</span> Student Management
              </button>
              <button
                className={`menu-item ${currentPage === 'admin-rooms' ? 'active' : ''}`}
                onClick={() => openPage('admin-rooms')}
              >
                <span>▦</span> Room & Bed Management
              </button>

<button
  className={`menu-item ${currentPage === 'admin-notices' ? 'active' : ''}`}
  onClick={() => openPage('admin-notices')}
>
  <span>♧</span> Notices & Announcements
</button>

<button
  className={`menu-item ${currentPage === 'warden-mess-feedback' ? 'active' : ''}`}
  onClick={() => openPage('warden-mess-feedback')}
>
  <span>⭐</span> Mess Food Feedback
</button>

<button
  className={`menu-item ${currentPage === 'admin-fees' ? 'active' : ''}`}
  onClick={() => openPage('admin-fees')}
>
  <span>₹</span> Fee Management
</button>

<button
  className={`menu-item ${currentPage === 'admin-mess-feedback' ? 'active' : ''}`}
  onClick={() => openPage('admin-mess-feedback')}
>
  <span>⭐</span> Mess Food Feedback
</button> 

            </>
          )}



          {/* Dashboard */}

          {authUser.role === 'STUDENT' && (

          <>

          <button

            className={`menu-item ${

              currentPage === 'dashboard' ? 'active' : ''

            }`}

            onClick={() => openPage('dashboard')}

          >

            <span>▦</span> Dashboard

          </button>



          {/* My Room */}

          <button

            className={`menu-item ${

              currentPage === 'room' ? 'active' : ''

            }`}

            onClick={() => openPage('room')}

          >

            <span>▣</span> My Room

          </button>



          {/* Outpass */}

          <button

            className={`menu-item ${

              currentPage === 'outpass' ? 'active' : ''

            }`}

            onClick={() => openPage('outpass')}

          >

            <span>↗</span> Outpass

          </button>



          {/* Complaints */}

          <button

            className={`menu-item ${

              currentPage === 'complaints' ? 'active' : ''

            }`}

            onClick={() => openPage('complaints')}

          >

            <span>☷</span> Complaints

          </button>



          {/* Notices */}

          <button

            className={`menu-item ${

              currentPage === 'notices' ? 'active' : ''

            }`}

            onClick={() => openPage('notices')}

          >

            <span>♧</span> Notices

          </button>



          {/* Fees */}

          <button

            className={`menu-item ${

              currentPage === 'fees' ? 'active' : ''

            }`}

            onClick={() => openPage('fees')}

          >

            <span>₹</span> Fee Status

          </button>

<button
  className={`menu-item ${currentPage === 'mess-feedback' ? 'active' : ''}`}
  onClick={() => openPage('mess-feedback')}
>
  <span>⭐</span> Mess Food Feedback
</button>

          <button
            className={`menu-item ${currentPage === 'chatbot' ? 'active' : ''}`}
            onClick={() => openPage('chatbot')}
          >
            <span>🤖</span> AI Hostel Assistant
          </button>



          </>

          )}



          {/* Warden Outpasses */}

          {authUser.role === 'WARDEN' && (

          <button

            className={`menu-item ${

              currentPage === 'warden-outpasses' ? 'active' : ''

            }`}

            onClick={() => openPage('warden-outpasses')}

          >

            <span>🛡</span> Warden Outpasses

          </button>



          )}


                    {/* Warden Visitor Management */}

          {authUser.role === 'WARDEN' && (

            <button

              className={`menu-item ${
                currentPage === 'warden-visitors' ? 'active' : ''
              }`}

              onClick={() => openPage('warden-visitors')}

            >

              <span>👥</span> Visitor Management

            </button>

          )}


{authUser.role === 'WARDEN' && (
  <button
    className={`menu-item ${
      currentPage === 'warden-notices' ? 'active' : ''
    }`}
    onClick={() => openPage('warden-notices')}
  >
    <span>♧</span> Notices & Announcements
  </button>
)}

{currentPage === 'warden-mess-feedback' && authUser.role === 'WARDEN' && (
  <MessFeedbackPage role={authUser.role} />
)}

          {/* Security Verification */}

          {authUser.role === 'SECURITY' && (

          <button

            className={`menu-item ${

              currentPage === 'security-outpasses' ? 'active' : ''

            }`}

            onClick={() => openPage('security-outpasses')}

          >

            <span>🔐</span> Security Verification

          </button>



          )}



        </nav>



        <div className="sidebar-bottom">



          <button className="menu-item" onClick={handleLogout} style={{ margin: '0 12px 12px', width: 'calc(100% - 24px)' }}>

            <span>↪</span> Sign out

          </button>



          <div className="help-card">

            <div className="help-icon">?</div>

            <h3>Need Help?</h3>

            <p>Contact your hostel warden for assistance.</p>

          </div>



          <div className="portal-version">

            HostelHub v1.0

          </div>



        </div>

      </aside>



      {/* Main Content */}

      <main className="main-content">



        {/* ADMIN HOME */}
        {currentPage === 'admin-home' && authUser.role === 'ADMIN' && (
          <section className="section">
            <div className="section-heading">
              <div>
                <h2>Administrator Dashboard</h2>
                <p>Welcome, {authUser.username}. Here is the current hostel overview.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAdminStats(null)
                    setAdminStatsError('')
                    setAdminStatsLoading(true)
                    // Changing the authUser object triggers a fresh statistics request.
                    setAuthUser({ ...authUser })
                  }}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Refresh data
                </button>
                <span className="status-badge success">ADMIN</span>
              </div>
            </div>

            {adminStatsLoading && <p role="status">Loading live dashboard statistics…</p>}
            {adminStatsError && (
              <div role="alert" style={{ margin: '16px 0', padding: '12px', borderRadius: '8px', background: '#fff1f2', color: '#9f1239' }}>
                {adminStatsError} Check that the backend is running, then refresh.
              </div>
            )}

            {adminStats && (
              <>
                <div className="overview-grid">
                  <div className="overview-card">
                    <div className="card-icon purple">♙</div>
                    <p>Total Students</p>
                    <h3>{adminStats.students}</h3>
                    <span>Records currently in the database</span>
                  </div>
                  <div className="overview-card">
                    <div className="card-icon blue">▣</div>
                    <p>Total Rooms</p>
                    <h3>{adminStats.rooms}</h3>
                    <span>Registered hostel rooms</span>
                  </div>
                  <div className="overview-card">
                    <div className="card-icon green">▤</div>
                    <p>Bed Occupancy</p>
                    <h3>{adminStats.occupiedBeds} / {adminStats.beds}</h3>
                    <span>{adminStats.availableBeds} available bed(s)</span>
                  </div>
                  <div className="overview-card">
                    <div className="card-icon orange">↗</div>
                    <p>Total Outpasses</p>
                    <h3>{adminStats.outpasses}</h3>
                    <span>{adminStats.pendingOutpasses} pending · {adminStats.outsideOutpasses} currently OUT</span>
                  </div>
                </div>


<div style={{ marginTop: '24px' }}>
  <h3>Hostel Analytics & Reports</h3>

  <div className="overview-grid">
    <div className="overview-card">
      <p>Total Complaints</p>
      <h3>{adminStats.complaints}</h3>
      <span>
        {adminStats.pendingComplaints} Pending ·{' '}
        {adminStats.inProgressComplaints} In Progress
      </span>
    </div>

    <div className="overview-card">
      <p>Resolved Complaints</p>
      <h3>{adminStats.resolvedComplaints}</h3>
      <span>{adminStats.rejectedComplaints} Rejected</span>
    </div>

    <div className="overview-card">
      <p>Total Fee Amount</p>
      <h3>₹{adminStats.totalFees.toLocaleString('en-IN')}</h3>
      <span>All student fee records</span>
    </div>

    <div className="overview-card">
      <p>Fees Collected</p>
      <h3>₹{adminStats.totalPaid.toLocaleString('en-IN')}</h3>
      <span>
        Pending: ₹{adminStats.totalPending.toLocaleString('en-IN')}
      </span>
    </div>

    <div className="overview-card">
      <p>Average Mess Rating</p>
      <h3>{adminStats.averageRating} / 5 ⭐</h3>
      <span>{adminStats.feedbackCount} feedback records</span>
    </div>
  </div>
</div>


                <div style={{ marginTop: '24px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff' }}>
                  <h3 style={{ marginTop: 0 }}>Outpass Summary</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                    <p><strong>{adminStats.pendingOutpasses}</strong> Pending</p>
                    <p><strong>{adminStats.outsideOutpasses}</strong> Currently outside</p>
                    <p><strong>{adminStats.returnedOutpasses}</strong> Returned</p>
                  </div>
                </div>
              </>
            )}

            <p style={{ marginTop: '24px', color: '#64748b' }}>
              Statistics are fetched from the backend when the admin dashboard loads. This is still a prototype using test data; enforce server-side role authorization before production use.
            </p>
          </section>
        )}

        
{authUser.role === 'ADMIN' && currentPage === 'admin-home' && adminStats && (
  <div style={{
  marginTop: '24px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '20px'
}}>

  {/* BED OCCUPANCY CHART */}
  <div className="overview-card">
    <h3>Bed Occupancy</h3>
    <p>{adminStats.occupiedBeds} occupied out of {adminStats.beds} beds</p>
    <div style={{ background: '#e2e8f0', height: '14px', borderRadius: '10px' }}>
      <div style={{
        width: `${adminStats.beds ? adminStats.occupiedBeds / adminStats.beds * 100 : 0}%`,
        height: '14px',
        background: '#16a34a',
        borderRadius: '10px'
      }} />
    </div>
    <p>{adminStats.availableBeds} beds available</p>
  </div>

  {/* COMPLAINT STATUS CHART */}
  <div className="overview-card">
    <h3>Complaint Status</h3>
    {[
      { label: 'Pending', value: adminStats.pendingComplaints, color: '#f59e0b' },
      { label: 'In Progress', value: adminStats.inProgressComplaints, color: '#3b82f6' },
      { label: 'Resolved', value: adminStats.resolvedComplaints, color: '#16a34a' },
      { label: 'Rejected', value: adminStats.rejectedComplaints, color: '#ef4444' }
    ].map(item => (
      <div key={item.label} style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
        <div style={{ background: '#e2e8f0', height: '10px', borderRadius: '10px' }}>
          <div style={{
            width: `${adminStats.complaints ? item.value / adminStats.complaints * 100 : 0}%`,
            height: '10px',
            background: item.color,
            borderRadius: '10px'
          }} />
        </div>
      </div>
    ))}
  </div>

  {/* FEE COLLECTION CHART */}
  <div className="overview-card">
    <h3>Fee Collection</h3>
    <p>Collected: ₹{adminStats.totalPaid.toLocaleString('en-IN')}</p>
    <div style={{ background: '#e2e8f0', height: '14px', borderRadius: '10px' }}>
      <div style={{
        width: `${adminStats.totalFees ? adminStats.totalPaid / adminStats.totalFees * 100 : 0}%`,
        height: '14px',
        background: '#16a34a',
        borderRadius: '10px'
      }} />
    </div>
    <p>Pending: ₹{adminStats.totalPending.toLocaleString('en-IN')}</p>
  </div>

  {/* MESS RATING CHART */}
  <div className="overview-card">
    <h3>Mess Food Rating</h3>
    <h2>{adminStats.averageRating} / 5 ⭐</h2>
    <div style={{ background: '#e2e8f0', height: '14px', borderRadius: '10px' }}>
      <div style={{
        width: `${Number(adminStats.averageRating) / 5 * 100}%`,
        height: '14px',
        background: '#f59e0b',
        borderRadius: '10px'
      }} />
    </div>
    <p>{adminStats.feedbackCount} student feedback records</p>
  </div>

</div>
)}


        {/* STUDENT OUTPASS PAGE */}
        {currentPage === 'outpass' && authUser.role === 'STUDENT' && (
          <OutpassPage />
        )}

       {/* ADMIN OUTPASS MANAGEMENT */}
{currentPage === 'admin-outpasses' && authUser.role === 'ADMIN' && (
  <AdminOutpassPage />
)}

{/* ADMIN STUDENT MANAGEMENT */}
{currentPage === 'admin-students' && authUser.role === 'ADMIN' && (
  <AdminStudentsPage />
)}

{/* ADMIN ROOM AND BED MANAGEMENT */}
{currentPage === 'admin-rooms' && authUser.role === 'ADMIN' && (
  <AdminRoomsPage />
)}

{/* ADMIN COMPLAINT MANAGEMENT */}
{currentPage === 'admin-complaints' && authUser.role === 'ADMIN' && (
  <AdminComplaintsPage />
)}

{/* WARDEN VISITOR MANAGEMENT */}
{currentPage === 'warden-visitors' && authUser.role === 'WARDEN' && (
  <VisitorPage />
)}

{/* ADMIN NOTICES */}
{currentPage === 'admin-notices' && authUser.role === 'ADMIN' && (
  <NoticePage role={authUser.role} username={authUser.username} />
)}

{currentPage === 'admin-fees' && authUser.role === 'ADMIN' && (
  <AdminFeesPage />
)}

{currentPage === 'admin-mess-feedback' && authUser.role === 'ADMIN' && (
  <MessFeedbackPage role={authUser.role} />
)}

{/* WARDEN NOTICES */}
{currentPage === 'warden-notices' && authUser.role === 'WARDEN' && (
  <NoticePage role={authUser.role} username={authUser.username} />
)}

<button
  className={`menu-item ${currentPage === 'admin-complaints' ? 'active' : ''}`}
  onClick={() => openPage('admin-complaints')}
>
  <span>☷</span> Complaint Management
</button>

        {/* WARDEN OUTPASS PAGE */}

        {currentPage === 'warden-outpasses' && authUser.role === 'WARDEN' && (

          <WardenOutpassPage />

        )}



        {/* SECURITY OUTPASS PAGE */}

        {currentPage === 'security-outpasses' && authUser.role === 'SECURITY' && (

          <SecurityOutpassPage />

        )}



        {/* DASHBOARD PAGE */}

        {currentPage === 'dashboard' && authUser.role === 'STUDENT' && (

          <>

            {/* Top Bar */}

            <header className="topbar">



              <div>

                <p className="breadcrumb">

                  Student Portal / Dashboard

                </p>



                <h1>Student Dashboard</h1>

              </div>

             <div className="topbar-right">

  <button
    className="notification-button"
    aria-label="Notifications"
  >
    ♧  ♧
  <span className="notification-dot"></span>
</button>

<div className="profile">

  <div className="avatar">
    {student?.name
      ? student.name.charAt(0).toUpperCase()
      : 'S'}
  </div>

  <div className="profile-info">
    <strong>{student?.name || 'Loading...'}</strong>
    <span>Student</span>
  </div>

</div>


                 

              </div>

            </header>



            {/* Welcome Section */}

            <section className="welcome-section">

<div>

  <p className="welcome-label">
    WELCOME BACK
  </p>

  <h2>
    Hello, {student?.name
      ? student.name.split(' ')[0]
      : 'Student'}! 👋
  </h2>

  <p>
    Here's an overview of your hostel information.
  </p>

</div>

              <div className="welcome-decoration">

                🏠

              </div>



            </section>



            {/* Student Information */}

            <section className="section">



              <div className="section-heading">



                <div>

                  <h2>My Profile</h2>



                  <p>

                    Your registered student information

                  </p>

                </div>



                <span className="status-badge success">

                  Active Student

                </span>

</div>

<div className="profile-card">

  <div className="large-avatar">
    {student?.name
      ? student.name.charAt(0).toUpperCase()
      : 'S'}
  </div>

  <div className="student-details">

    <h3>{student?.name || 'Loading...'}</h3>

    <p className="student-id">
      Student ID: {student?.studentId || 'Loading...'}
    </p>
    
                  <div className="details-grid">



                    <div>

                      <span>Department</span>

                      <strong>{student?.department || 'Not available'}</strong>

                    </div>



                    <div>

                      <span>Academic Year</span>

                      <strong>

                        Year {student?.year || 'Not available'}

                      </strong>

                    </div>



                    <div>

                      <span>Email Address</span>

                      <strong>{student?.email || 'Not available'}</strong>

                    </div>



                    <div>

                      <span>Phone Number</span>

                      <strong>{student?.phone || 'Not available'}</strong>

                    </div>



                  </div>



                </div>



              </div>



            </section>



            {/* Overview Cards */}

            <section className="section">



              <div className="section-heading">



                <div>

                  <h2>Hostel Overview</h2>



                  <p>

                    Your current accommodation details

                  </p>

                </div>



              </div>



              <div className="overview-grid">



                <div className="overview-card">



                  <div className="card-icon purple">

                    ⌂

                  </div>



                  <p>Hostel</p>



                  <h3>

                    {student?.hostelName || 'Not Assigned'}

                  </h3>



                  <span>

                    Hostel accommodation

                  </span>



                </div>



                <div className="overview-card">



                  <div className="card-icon blue">

                    ▣

                  </div>



                  <p>Room Number</p>



                  <h3>

                    {student?.roomNumber || 'Not Assigned'}

                  </h3>



                  <span>

                    {student?.floor
  ? `Floor ${student.floor}`
  : 'No room allocated'}

                  </span>



                </div>



                <div className="overview-card">



                  <div className="card-icon green">

                    ▤

                  </div>



                  <p>Bed Number</p>



                  <h3>

                    {student?.bedNumber || 'Not Assigned'}

                  </h3>



                  <span>

                    Current bed allocation

                  </span>



                </div>



                <div className="overview-card">



                  <div className="card-icon orange">

                    ●

                  </div>



                  <p>Bed Status</p>



                  <h3>

                    {student?.bedStatus
  ? student.bedStatus.replace('_', ' ')
  : 'UNKNOWN'}

                  </h3>



                  <span>

                    {student?.bedStatus === 'OCCUPIED'
  ? 'Bed assigned successfully'
  : 'Awaiting bed allocation'}

                  </span>



                </div>



              </div>



            </section>



            {/* Quick Actions */}

            <section className="section">



              <div className="section-heading">



                <div>

                  <h2>Quick Actions</h2>



                  <p>

                    Access your hostel services

                  </p>

                </div>



              </div>



              <div className="actions-grid">



                <button

                  className="action-card"

                  onClick={() => openPage('outpass')}

                >



                  <div className="action-icon purple">

                    ↗

                  </div>



                  <div>

                    <h3>Apply for Outpass</h3>



                    <p>

                      Submit a leave request

                    </p>

                  </div>



                  <span className="action-arrow">

                    →

                  </span>



                </button>



                <button

                  className="action-card"

                  onClick={() => openPage('complaints')}

                >



                  <div className="action-icon orange">

                    ☷

                  </div>



                  <div>

                    <h3>Raise Complaint</h3>



                    <p>

                      Report a hostel issue

                    </p>

                  </div>



                  <span className="action-arrow">

                    →

                  </span>



                </button>



                <button

                  className="action-card"

                  onClick={() => openPage('notices')}

                >



                  <div className="action-icon blue">

                    ♧

                  </div>



                  <div>

                    <h3>View Notices</h3>



                    <p>

                      Read hostel announcements

                    </p>

                  </div>



                  <span className="action-arrow">

                    →

                  </span>



                </button>



                <button

                  className="action-card"

                  onClick={() => openPage('fees')}

                >



                  <div className="action-icon green">

                    ₹

                  </div>



                  <div>

                    <h3>Fee Details</h3>



                    <p>

                      Check payment information

                    </p>

                  </div>



                  <span className="action-arrow">

                    →

                  </span>



                </button>



              </div>



            </section>



            {/* More Services */}

            <section className="section">



              <div className="section-heading">



                <div>

                  <h2>More Services</h2>



                  <p>

                    Additional features will be connected

                    as we build the modules.

                  </p>

                </div>



              </div>



              <div className="coming-soon-card">



                <div className="coming-soon-icon">

                  ✨

                </div>



                <div>



                  <h3>

                    Your hostel, all in one place

                  </h3>



                  <p>

                    Outpass tracking, complaints, notices,

                    fee records and AI assistance will be

                    available here as their modules are completed.

                  </p>



                </div>



                <span className="coming-soon-badge">

                  In Development

                </span>



              </div>



            </section>



            <footer className="footer">



              <p>

                © 2026 HostelHub. Smart Hostel Management System.

              </p>



              <p>

                Designed for a better hostel experience.

              </p>



            </footer>

          </>

        )}



        {/* ROOM PAGE */}

        {currentPage === 'room' && authUser.role === 'STUDENT' && (

          <div className="section">



            <div className="section-heading">



              <div>

                <h2>My Room</h2>

                <p>Your current room and bed information</p>

              </div>



            </div>



            <div className="profile-card">



              <div className="large-avatar">

                🏠

              </div>



              <div className="student-details">



                <h3>

                  Room {student?.roomNumber || 'Not Assigned'}

                </h3>



                <p className="student-id">

                  {student?.hostelName || 'Hostel not assigned'}

                </p>



                <div className="details-grid">



                  <div>

                    <span>Floor</span>



                    <strong>

                      {student?.floor || 'Not Assigned'}

                    </strong>

                  </div>



                  <div>

                    <span>Bed</span>



                    <strong>

                      {student?.bedNumber || 'Not Assigned'}

                    </strong>

                  </div>



                  <div>

                    <span>Bed Status</span>



                    <strong>

                      {student?.bedStatus || 'Unknown'}

                    </strong>

                  </div>



                  <div>

                    <span>Student</span>



                    <strong>

                      {student?.name || 'Not available'}

                    </strong>

                  </div>



                </div>



              </div>



            </div>



          </div>

        )}


{/* STUDENT COMPLAINTS PAGE */}
{currentPage === 'complaints' && authUser?.role === 'STUDENT' && (
  <StudentComplaintsPage studentId={student?.studentId} />
)}
        



        {/* HOSTELHUB AI ASSISTANT */}
        {currentPage === 'chatbot' && authUser.role === 'STUDENT' && (
          <ChatbotPage student={student} />
        )}

        
{/* STUDENT NOTICES PAGE */}
{currentPage === 'notices' && authUser.role === 'STUDENT' && (
  <NoticePage role={authUser.role} username={authUser.username} />
)}


        {/* FEES PAGE */}

        {currentPage === 'fees' && authUser.role === 'STUDENT' && (
  <StudentFeesPage />
)}

{currentPage === 'mess-feedback' && authUser.role === 'STUDENT' && (
  <MessFeedbackPage role={authUser.role} />
)}

      </main>

    </div>

  )

}



export default App