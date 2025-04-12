
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import AgentDashboard from "./pages/AgentDashboard";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ChatbotConfig from "./pages/ChatbotConfig";
import ProfileSettings from "./pages/ProfileSettings";
import UsersManagement from "./pages/UsersManagement";
import Reports from "./pages/Reports";
import { createDemoUsers } from "./utils/seedDemoUsers";

const queryClient = new QueryClient();

// Create demo users in development mode
if (import.meta.env.DEV) {
  createDemoUsers().catch(console.error);
}

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/" element={<Index />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/agent" replace />} />
                
                <Route
                  path="agent"
                  element={
                    <ProtectedRoute requiredRole="agent">
                      <AgentDashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="chatbot"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ChatbotConfig />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <UsersManagement />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="profile"
                  element={
                    <ProfileSettings />
                  }
                />
                
                <Route
                  path="settings"
                  element={
                    <ProfileSettings />
                  }
                />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
