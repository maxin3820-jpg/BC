import React, { useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Packs from './pages/Packs'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminLayout from './pages/Admin/AdminLayout'
import Dashboard from './pages/Admin/Dashboard'
import AdminCourses from './pages/Admin/AdminCourses'
import AdminPacks from './pages/Admin/AdminPacks'
import AdminStudents from './pages/Admin/AdminStudents'
import AdminMessages from './pages/Admin/AdminMessages'
import AdminAnalytics from './pages/Admin/AdminAnalytics'
import AdminSettings from './pages/Admin/AdminSettings'

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
      {!isAdminRoute && <Navbar />}
      <main className={isAdminRoute ? '' : 'main-content'}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin login — redirect to dashboard if already logged in */}
          <Route
            path="/admin/login"
            element={isAdmin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLogin={handleLogin} />}
          />

          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={
              <RequireAdmin isAdmin={isAdmin}>
                <AdminLayout onLogout={handleLogout} />
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
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
