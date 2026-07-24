import React, { useState, lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import AnnouncementBanner from './components/AnnouncementBanner/AnnouncementBanner'

// Public pages — eager loaded (needed immediately)
import Home from './pages/Home'
import Courses from './pages/Courses'
import FreeCourses from './pages/FreeCourses'
import Packs from './pages/Packs'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// Admin pages — lazy loaded (only loaded when admin visits)
const AdminLogin    = lazy(() => import('./pages/Admin/AdminLogin'))
const AdminLayout   = lazy(() => import('./pages/Admin/AdminLayout'))
const Dashboard     = lazy(() => import('./pages/Admin/Dashboard'))
const AdminCourses  = lazy(() => import('./pages/Admin/AdminCourses'))
const AdminPacks    = lazy(() => import('./pages/Admin/AdminPacks'))
const AdminStudents = lazy(() => import('./pages/Admin/AdminStudents'))
const AdminMessages = lazy(() => import('./pages/Admin/AdminMessages'))
const AdminAnalytics= lazy(() => import('./pages/Admin/AdminAnalytics'))
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'))
const AdminFAQs     = lazy(() => import('./pages/Admin/AdminFAQs'))
const AdminTemplates= lazy(() => import('./pages/Admin/AdminTemplates'))
const AdminReorder  = lazy(() => import('./pages/Admin/AdminReorder'))

const AdminFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#44445A', fontSize: '0.875rem' }}>
    Loading...
  </div>
)

// Wraps admin child routes — redirects to login if not authenticated
const RequireAdmin = ({ isAdmin, children }) => {
  if (!isAdmin) return <Navigate to="/admin/login" replace />
  return children
}

function App() {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('birsil_admin') === 'true')
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  const handleLogin = () => setIsAdmin(true)
  const handleLogout = () => setIsAdmin(false)

  return (
    <div className="app">
      <ScrollToTop />
      {!isAdminRoute && <AnnouncementBanner />}
      {!isAdminRoute && <Navbar />}
      <main className={isAdminRoute ? '' : 'main-content'}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/free-courses" element={<FreeCourses />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin login — redirect to dashboard if already logged in */}
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<AdminFallback />}>
                {isAdmin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLogin={handleLogin} />}
              </Suspense>
            }
          />

          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={
              <RequireAdmin isAdmin={isAdmin}>
                <Suspense fallback={<AdminFallback />}>
                  <AdminLayout onLogout={handleLogout} />
                </Suspense>
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="packs" element={<AdminPacks />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="faqs" element={<AdminFAQs />} />
            <Route path="templates" element={<AdminTemplates />} />
            <Route path="reorder" element={<AdminReorder />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
