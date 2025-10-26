import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Profiles from "./pages/Profiles";
import ProfileDetail from "./pages/ProfileDetail";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Training from "./pages/Training";
import CertificationCatalog from "./pages/CertificationCatalog";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Profile from "./pages/Profile";
import Skills from "./pages/Skills";
import Certifications from "./pages/Certifications";
import CompanyCreate from "./pages/CompanyCreate";
import ClientCreate from "./pages/ClientCreate";
import Placements from "./pages/Placements";
import JobCreate from "./pages/JobCreate";
import Community from "./pages/Community";
import ROICalculator from "./pages/ROICalculator";
import Partnerships from "./pages/Partnerships";
import CareerAssistant from "./pages/CareerAssistant";
import BugReport from "./pages/BugReport";
import StaffFunnel from "./pages/StaffFunnel";
import UserManagement from "./pages/admin/UserManagement";
import RoleManagement from "./pages/admin/RoleManagement";
import JobModeration from "./pages/admin/JobModeration";
import PodManagement from "./pages/admin/PodManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/profiles" element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
              <Route path="/profiles/:id" element={<ProtectedRoute><ProfileDetail /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
              <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
              <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
              <Route path="/certifications-catalog" element={<ProtectedRoute><CertificationCatalog /></ProtectedRoute>} />
              <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
              {/* <Route path="/pricing" element={<Pricing />} /> */}
              <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
              <Route path="/certifications" element={<ProtectedRoute><Certifications /></ProtectedRoute>} />
              <Route path="/company/create" element={<ProtectedRoute><CompanyCreate /></ProtectedRoute>} />
              <Route path="/clients/create" element={<ProtectedRoute><ClientCreate /></ProtectedRoute>} />
              <Route path="/placements" element={<ProtectedRoute><Placements /></ProtectedRoute>} />
              <Route path="/jobs/create" element={<ProtectedRoute><JobCreate /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
              {/* <Route path="/roi-calculator" element={<ROICalculator />} /> */}
              <Route path="/partnerships" element={<ProtectedRoute><Partnerships /></ProtectedRoute>} />
              <Route path="/career-assistant" element={<ProtectedRoute><CareerAssistant /></ProtectedRoute>} />
              <Route path="/bug-report" element={<ProtectedRoute><BugReport /></ProtectedRoute>} />
              <Route path="/staff/funnel" element={<ProtectedRoute><StaffFunnel /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
              <Route path="/admin/jobs" element={<ProtectedRoute><JobModeration /></ProtectedRoute>} />
              <Route path="/admin/pods" element={<ProtectedRoute><PodManagement /></ProtectedRoute>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
