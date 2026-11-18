import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/layout/RouteGuards'

// Cada página se carga bajo demanda (code splitting).
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const NotebookPage = lazy(() => import('@/pages/NotebookPage'))
const LearningFormPage = lazy(() => import('@/pages/LearningFormPage'))
const LearningDetailPage = lazy(() => import('@/pages/LearningDetailPage'))
const LibraryPage = lazy(() => import('@/pages/LibraryPage'))
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'))
const CalendarPage = lazy(() => import('@/pages/CalendarPage'))
const GoalsPage = lazy(() => import('@/pages/GoalsPage'))
const StatsPage = lazy(() => import('@/pages/StatsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

/** Solo define las rutas: la lógica vive en páginas, hooks y servicios. */
export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="cuaderno" element={<NotebookPage />} />
          <Route path="cuaderno/nuevo" element={<LearningFormPage />} />
          <Route path="cuaderno/:id" element={<LearningDetailPage />} />
          <Route path="cuaderno/:id/editar" element={<LearningFormPage />} />
          <Route path="biblioteca" element={<LibraryPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="calendario" element={<CalendarPage />} />
          <Route path="objetivos" element={<GoalsPage />} />
          <Route path="estadisticas" element={<StatsPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="inicio" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
