import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, GuestRoute, PremiumRoute } from './routes/ProtectedRoute'

// Auth pages
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Layout
import DashboardLayout from './components/layout/DashboardLayout'

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage'

// Resume
import MyResumesPage  from './pages/resume/MyResumesPage'
import ResumeEditorPage from './pages/resume/ResumeEditorPage'
import PublicGalleryPage from './pages/resume/PublicGalleryPage'

// Templates
import TemplatesPage from './pages/templates/TemplatesPage'

// AI
import AiToolsPage from './pages/ai/AiToolsPage'
import AiHistoryPage from './pages/ai/AiHistoryPage'

// Export
import ExportPage from './pages/export/ExportPage'

// Profile
import ProfilePage  from './pages/profile/ProfilePage'
import UpgradePage  from './pages/profile/UpgradePage'

export default function App() {
  return (
    <Routes>
      {/* Guest-only routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Public */}
      <Route path="/gallery" element={<PublicGalleryPage />} />

      {/* Protected routes with sidebar layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"         element={<DashboardPage />} />
          <Route path="/resumes"           element={<MyResumesPage />} />
          <Route path="/resumes/:id/edit"  element={<ResumeEditorPage />} />
          <Route path="/templates"         element={<TemplatesPage />} />
          <Route path="/ai"                element={<AiToolsPage />} />
          <Route path="/ai/history"        element={<AiHistoryPage />} />
          <Route path="/export"            element={<ExportPage />} />
          <Route path="/profile"           element={<ProfilePage />} />
          <Route path="/upgrade"           element={<UpgradePage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
