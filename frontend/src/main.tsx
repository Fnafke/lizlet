import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import LoginPage from './Pages/LoginPage'
import SignupPage from './Pages/SignupPage'
import NotFoundPage from './Pages/NotFoundPage'
import HomePage from './Pages/HomePage'
import { RequireAuth } from './components/context/RequireAuth'
import { ThemeProvider } from './components/theme/ThemeProvider'
import { SidebarProvider } from './components/ui/sidebar'
import { TooltipProvider } from './components/ui/tooltip'
import { AuthProvider } from './components/context/AuthProvider'
import StudySetsPage from './Pages/StudySetPages/StudySetsPage'
import StudySetFormPage from './Pages/StudySetPages/StudySetFormPage'
import StudySetDetailPage from './Pages/StudySetPages/StudySetDetailPage'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/study-sets" element={<StudySetsPage />} />
        <Route path="/study-sets/new" element={<StudySetFormPage />} />
        <Route path="/study-sets/:setId" element={<StudySetDetailPage />} />
        <Route path="/study-sets/:setId/edit" element={<StudySetFormPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </>
  )
)

createRoot(document.getElementById('root')!).render(
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <SidebarProvider>
        <TooltipProvider>
          <AuthProvider>
            <StrictMode>
              <RouterProvider router={router} />
            </StrictMode>
          </AuthProvider>
        </TooltipProvider>
      </SidebarProvider>
    </ThemeProvider>
)
