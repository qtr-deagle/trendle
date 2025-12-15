import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ViewProvider } from "@/contexts/ViewContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import DashboardPage from "./pages/DashboardPage";
import Landing from "./pages/Landing";
import LandingExplore from "./pages/LandingExplore";
import LandingCommunities from "./pages/LandingCommunities";
import Profile from "./pages/Profile";
import PostDetail from "./pages/PostDetail";
import CommunityDetail from "./pages/CommunityDetail";
import CreateCommunity from "./pages/CreateCommunity";
import CreatePost from "./pages/CreatePost";
import UserSearch from "./pages/UserSearch";
import Messaging from "./pages/Messaging";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminUserMessaging from "./pages/admin/AdminUserMessaging";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminTags from "./pages/admin/AdminTags";
import AdminLogs from "./pages/admin/AdminLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DashboardRoutes = () => (
  <ViewProvider>
    <DashboardPage />
  </ViewProvider>
);

// Protected routes that require authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Admin routes that require admin authentication
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdminAuthenticated, adminLoading } = useAdmin();

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

// Landing routes for unauthenticated users
const LandingRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard/home" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => (
  <Routes>
    {/* Auth Routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route
      path="/onboarding"
      element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      }
    />

    {/* Home/Landing Routes */}
    <Route
      path="/"
      element={
        <LandingRoute>
          <Landing />
        </LandingRoute>
      }
    />

    {/* Trending/Index Page */}
    <Route path="/home" element={<Index />} />
    <Route
      path="/explore"
      element={
        <LandingRoute>
          <LandingExplore />
        </LandingRoute>
      }
    />
    <Route
      path="/communities"
      element={
        <LandingRoute>
          <LandingCommunities />
        </LandingRoute>
      }
    />

    {/* Dashboard Routes (Protected) */}
    <Route
      path="/dashboard/home"
      element={
        <ProtectedRoute>
          <DashboardRoutes />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/explore"
      element={
        <ProtectedRoute>
          <DashboardRoutes />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/communities"
      element={
        <ProtectedRoute>
          <DashboardRoutes />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/inbox"
      element={
        <ProtectedRoute>
          <DashboardRoutes />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/account"
      element={
        <ProtectedRoute>
          <DashboardRoutes />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/settings"
      element={
        <ProtectedRoute>
          <DashboardRoutes />
        </ProtectedRoute>
      }
    />

    {/* Other Protected Routes */}
    <Route
      path="/create"
      element={
        <ProtectedRoute>
          <CreatePost />
        </ProtectedRoute>
      }
    />
    <Route
      path="/search"
      element={
        <ProtectedRoute>
          <UserSearch />
        </ProtectedRoute>
      }
    />
    <Route
      path="/messages"
      element={
        <ProtectedRoute>
          <Messaging />
        </ProtectedRoute>
      }
    />
    <Route
      path="/post/:id"
      element={
        <ProtectedRoute>
          <PostDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile/:username"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
    <Route
      path="/communities/create"
      element={
        <ProtectedRoute>
          <CreateCommunity />
        </ProtectedRoute>
      }
    />
    <Route
      path="/communities/:handle"
      element={
        <ProtectedRoute>
          <CommunityDetail />
        </ProtectedRoute>
      }
    />

    {/* Admin Routes */}
    <Route path="/admin" element={<AdminLogin />} />
    <Route
      path="/admin/dashboard"
      element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/users"
      element={
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/reports"
      element={
        <AdminRoute>
          <AdminReports />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/messages"
      element={
        <AdminRoute>
          <AdminMessages />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/message-users"
      element={
        <AdminRoute>
          <AdminUserMessaging />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/categories"
      element={
        <AdminRoute>
          <AdminCategories />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/tags"
      element={
        <AdminRoute>
          <AdminTags />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/logs"
      element={
        <AdminRoute>
          <AdminLogs />
        </AdminRoute>
      }
    />

    {/* Fallback */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ViewProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </ViewProvider>
        </TooltipProvider>
      </AdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
