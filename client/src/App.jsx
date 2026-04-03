import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Index from './pages'
import AppLayout from './components/AppLayout'
import SafeJourney from './pages/SafeJourney'
import SOSPage from './pages/SOSPage'
import InnerCirclePage from './pages/InnerCirclePage'
import HeatmapPage from './pages/HeatmapPage'
import EvidencePage from './pages/EvidencePage'
import DisguiseMode from './pages/DisguiseMode'
import SettingsPage from './pages/SettingsPage'
import CommunityPage from './pages/CommunityPage'
import SahayakPage from './pages/SahayakPage'
import GuptPage from './pages/GuptPage'
import { Navigate } from 'react-router-dom'

import Auth from './pages/Auth'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path='/' element={<Index />} />
          <Route path="/safe-journey" element={<SafeJourney />} />
          <Route path="/sos" element={<SOSPage />} />
          <Route path="/inner-circle" element={<InnerCirclePage />} />
          <Route path="/heatmap" element={<HeatmapPage />} />
          <Route path="/evidence" element={<EvidencePage />} />
          <Route path="/disguise" element={<DisguiseMode />} />
          <Route path="/sahayak" element={<SahayakPage />} />
          <Route path="/gupt" element={<GuptPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/community" element={<CommunityPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App