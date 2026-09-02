import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import apiClient from './services/api';

import HomePage from './pages/HomePage'
import AuthPage from './Pages/AuthPage';
import DashBoard from './pages/Dashboard';
import PatientProfile from './pages/PatientProfile';
import Patients from './pages/Patients';
import AgendaPage from './pages/AgendaPage';
import TeamPage from './pages/TeamPage';
import RegisterPatient from './pages/RegisterPatient';
import AdminPage from './pages/AdminPage';
import Loading from './components/Loading';


function App() {
const { user ,initUserSession } = useAuthStore();  
const [isLoading, setIsLoading] = useState(true);
  
useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const me = response.data;
      if (me?.user) {
        await initUserSession(me.user);
      }
    } catch (error) {
      console.error("No active session :", error);
    } finally {
      setIsLoading(false);
    }
  };

  checkAuth();
}, [initUserSession]);

  if (isLoading) {
    return <Loading />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            !user ? (
              <AuthPage />
            ) : user.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />


        <Route 
          path="/dashboard" 
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : user.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <DashBoard />
            )
          }
        >

          <Route index element={<Navigate to="home" replace />} />
          <Route path='home' element={<HomePage />} />
          <Route path="patient/:id" element={<PatientProfile/>} />
          <Route path="patients" element={<Patients />} />
          <Route path="addpatient" element={<RegisterPatient />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="agenda" element={<AgendaPage />} />
        </Route>

        <Route 
          path="/admin" 
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : user.role !== 'admin' ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AdminPage />
            )
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;