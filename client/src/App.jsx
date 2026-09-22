import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { PageLoader } from "@/components/Spinner"
import ProtectedRoute from "@/components/ProtectedRoute"

import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import Dashboard from "@/pages/Dashboard"
import CoursePlayer from "@/pages/CoursePlayer"
import Quiz from "@/pages/Quiz"
import CertificatePage from "@/pages/CertificatePage"
import VerifyCertificate from "@/pages/VerifyCertificate"
import MyCertificates from "@/pages/MyCertificates"

import AdminLayout from "@/pages/admin/AdminLayout"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminCourses from "@/pages/admin/AdminCourses"
import CourseEditor from "@/pages/admin/CourseEditor"
import AdminSubmissions from "@/pages/admin/AdminSubmissions"
import AdminStudents from "@/pages/admin/AdminStudents"

export default function App() {
  const { loading } = useAuth()
  if (loading) return <PageLoader />

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/verify/:serial" element={<VerifyCertificate />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/:slug"
            element={
              <ProtectedRoute>
                <CoursePlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/:slug/quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/:slug/certificate"
            element={
              <ProtectedRoute>
                <CertificatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-certificates"
            element={
              <ProtectedRoute>
                <MyCertificates />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/new" element={<CourseEditor />} />
            <Route path="courses/:id" element={<CourseEditor />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="students" element={<AdminStudents />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
