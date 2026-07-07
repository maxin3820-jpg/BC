import React, { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
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
import AdminStudents from './pages/Admin/AdminStudents'
import AdminMessages from './pages/Admin/AdminMessages'
import AdminAnalytics from './pages/Admin/AdminAnalytics'
import AdminSettings from './pages/Admin/AdminSettings'

function App() {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('birsil_admin') === 'true')
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="app">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <main className={isAdminRoute ? '' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/admin/login" element={<AdminLogin onLogin={() => setIsAdmin(true)} />} />
          <Route path="/admin/*" element={
            isAdmin
              ? <AdminLayout onLogout={() => setIsAdmin(false)} />
              : <AdminLogin onLogin={() => setIsAdmin(true)} />
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<AdminCourses />} />
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
