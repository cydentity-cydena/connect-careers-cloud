import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import Specializations from "./pages/Specializations";
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
import Integrations from "./pages/Integrations";
import SkillsAssessment from "./pages/SkillsAssessment";
import PartnerAnalytics from "./pages/admin/PartnerAnalytics";
import AssessmentReview from "./pages/admin/AssessmentReview";
import CandidatePDF from "./pages/marketing/CandidatePDF";
import EmployerPDF from "./pages/marketing/EmployerPDF";
import RecruiterPDF from "./pages/marketing/RecruiterPDF";
import PartnersPDF from "./pages/marketing/PartnersPDF";
import LinkedInAd from "./pages/marketing/LinkedInAd";
import JobsLinkedIn from "./pages/marketing/JobsLinkedIn";

import HRReady from "./pages/HRReady";
import RoleManagement from "./pages/admin/RoleManagement";
import JobModeration from "./pages/admin/JobModeration";
import PodManagement from "./pages/admin/PodManagement";
import VerificationReview from "./pages/admin/VerificationReview";
import AllowedSignups from "./pages/admin/AllowedSignups";
import CTFManagement from "./pages/admin/CTFManagement";
import LearningPathsManagement from "./pages/admin/LearningPathsManagement";
import PartnerCommunitiesManagement from "./pages/admin/PartnerCommunitiesManagement";
import SubscriptionOverrides from "./pages/admin/SubscriptionOverrides";
import CourseManagement from "./pages/admin/CourseManagement";
import NotFound from "./pages/NotFound";
import Messages from "./pages/Messages";
import EmployerPitchDeck from "./pages/EmployerPitchDeck";
import InvestorPitchDeck from "./pages/InvestorPitchDeck";
import Founding20 from "./pages/Founding20";
import AcceptInvitation from "./pages/AcceptInvitation";
import MFA from "./pages/MFA";
import SecuritySettings from "./pages/SecuritySettings";
import VerifyEmail from "./pages/VerifyEmail";
import Unsubscribe from "./pages/Unsubscribe";
import CTF from "./pages/CTF";
import CTFEvent from "./pages/CTFEvent";
import BrandingPack from "./pages/BrandingPack";
import LearningPaths from "./pages/LearningPaths";
import TrainingPartners from "./pages/TrainingPartners";
import Marketplace from "./pages/Marketplace";
import MarketplaceDocs from "./pages/MarketplaceDocs";
import WhyCydena from "./pages/WhyCydena";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";

import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isPDFPage = location.pathname.startsWith('/marketing/');
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/dashboard/unsubscribe" element={<Unsubscribe />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profiles" element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
          <Route path="/profiles/:id" element={<ProtectedRoute><ProfileDetail /></ProtectedRoute>} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
          <Route path="/certifications-catalog" element={<ProtectedRoute><CertificationCatalog /></ProtectedRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/security-settings" element={<SecuritySettings />} />
          <Route path="/security" element={<SecuritySettings />} />
          <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
          <Route path="/specializations" element={<ProtectedRoute><Specializations /></ProtectedRoute>} />
          <Route path="/certifications" element={<ProtectedRoute><Certifications /></ProtectedRoute>} />
          <Route path="/skills-assessment" element={<ProtectedRoute><SkillsAssessment /></ProtectedRoute>} />
          <Route path="/company/create" element={<ProtectedRoute><CompanyCreate /></ProtectedRoute>} />
          <Route path="/clients/create" element={<ProtectedRoute><ClientCreate /></ProtectedRoute>} />
          <Route path="/placements" element={<ProtectedRoute><Placements /></ProtectedRoute>} />
          <Route path="/jobs/create" element={<ProtectedRoute><JobCreate /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/ctf" element={<CTF />} />
          <Route path="/ctf/events/:slug" element={<CTFEvent />} />
          {/* <Route path="/roi-calculator" element={<ROICalculator />} /> */}
          <Route path="/partnerships" element={<ProtectedRoute><Partnerships /></ProtectedRoute>} />
          <Route path="/career-assistant" element={<ProtectedRoute><CareerAssistant /></ProtectedRoute>} />
          <Route path="/bug-report" element={<ProtectedRoute><BugReport /></ProtectedRoute>} />
          <Route path="/staff/funnel" element={<ProtectedRoute><StaffFunnel /></ProtectedRoute>} />
          <Route path="/hr-ready" element={<ProtectedRoute><HRReady /></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/accept-invitation" element={<ProtectedRoute><AcceptInvitation /></ProtectedRoute>} />
          <Route path="/mfa" element={<MFA />} />
          
          {/* Admin Routes */}
          <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/roles" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute><JobModeration /></ProtectedRoute>} />
          <Route path="/admin/pods" element={<ProtectedRoute><PodManagement /></ProtectedRoute>} />
          <Route path="/admin/verification-review" element={<ProtectedRoute><VerificationReview /></ProtectedRoute>} />
          <Route path="/admin/allowed-signups" element={<ProtectedRoute><AllowedSignups /></ProtectedRoute>} />
          <Route path="/admin/partner-analytics" element={<ProtectedRoute><PartnerAnalytics /></ProtectedRoute>} />
          <Route path="/admin/assessment-review" element={<ProtectedRoute><AssessmentReview /></ProtectedRoute>} />
          <Route path="/admin/ctf" element={<ProtectedRoute><CTFManagement /></ProtectedRoute>} />
          <Route path="/admin/learning-paths" element={<ProtectedRoute><LearningPathsManagement /></ProtectedRoute>} />
          <Route path="/admin/partner-communities" element={<ProtectedRoute><PartnerCommunitiesManagement /></ProtectedRoute>} />
          <Route path="/admin/subscription-overrides" element={<ProtectedRoute><SubscriptionOverrides /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute><CourseManagement /></ProtectedRoute>} />
          
          {/* Standalone Presentations */}
          <Route path="/employer-pitch-deck" element={<EmployerPitchDeck />} />
          <Route path="/investor-pitch-deck" element={<InvestorPitchDeck />} />
          
          {/* Marketing PDFs */}
          <Route path="/marketing/candidates" element={<CandidatePDF />} />
          <Route path="/marketing/employers" element={<EmployerPDF />} />
          <Route path="/marketing/recruiters" element={<RecruiterPDF />} />
          <Route path="/marketing/partners" element={<PartnersPDF />} />
          <Route path="/linkedin-ad" element={<LinkedInAd />} />
          <Route path="/marketing/jobs-linkedin" element={<JobsLinkedIn />} />
          
          {/* Lead Generation */}
          <Route path="/Early-Access-200" element={<Founding20 />} />
          
          {/* Branding */}
          <Route path="/branding" element={<BrandingPack />} />
          
          {/* Learning */}
          <Route path="/learning-paths" element={<ProtectedRoute><LearningPaths /></ProtectedRoute>} />
          <Route path="/learning-paths/:pathId" element={<ProtectedRoute><LearningPaths /></ProtectedRoute>} />
          <Route path="/training-partners" element={<TrainingPartners />} />
          
          {/* Courses */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          
          {/* Marketplace */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/docs" element={<MarketplaceDocs />} />
          <Route path="/why-cydena" element={<WhyCydena />} />
          
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isPDFPage && <Footer />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
