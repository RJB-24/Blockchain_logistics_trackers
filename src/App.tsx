
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ManagerDashboard from "./pages/manager/Dashboard";
import DriverDashboard from "./pages/driver/Dashboard";
import CustomerDashboard from "./pages/customer/Dashboard";
import ShipmentDetails from "./pages/shared/ShipmentDetails";
import UserManagement from "./pages/manager/UserManagement";
import AISuggestions from "./pages/manager/AISuggestions";
import WeatherAnalytics from "./pages/manager/WeatherAnalytics";
import ReviewsManagement from "./pages/manager/ReviewsManagement";
import CreateShipment from "./pages/manager/CreateShipment";
import AnalyticsDashboard from "./pages/manager/AnalyticsDashboard";
import RouteOptimization from "./pages/driver/RouteOptimization";
import SmartNavigation from "./pages/driver/SmartNavigation";
import AIChat from "./pages/driver/AIChat";
import DeliveryUpdates from "./pages/driver/DeliveryUpdates";
import TrackShipment from "./pages/customer/TrackShipment";
import CarbonReport from "./pages/customer/CarbonReport";
import LeaveReview from "./pages/customer/LeaveReview";

const queryClient = new QueryClient();

// Private route component that also checks user role
const PrivateRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[]
}) => {
  const { user, loading, userRole } = useAuth();
  
  // If still loading auth state, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-eco-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified and user doesn't have the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole || '')) {
    // Redirect based on user role
    if (userRole === 'manager') {
      return <Navigate to="/manager" replace />;
    } else if (userRole === 'driver') {
      return <Navigate to="/driver" replace />;
    } else if (userRole === 'customer') {
      return <Navigate to="/customer" replace />;
    } else {
      // Role not determined yet or other error
      return <Navigate to="/" replace />;
    }
  }
  
  // If authenticated and has correct role, render the protected component
  return <>{children}</>;
};

const AppRoutes = () => {
  const { userRole } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={
          userRole ? (
            userRole === 'manager' ? (
              <Navigate to="/manager" replace />
            ) : userRole === 'driver' ? (
              <Navigate to="/driver" replace />
            ) : (
              <Navigate to="/customer" replace />
            )
          ) : (
            <Index />
          )
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Manager routes */}
      <Route 
        path="/manager" 
        element={
          <PrivateRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/manager/users" 
        element={
          <PrivateRoute allowedRoles={['manager']}>
            <UserManagement />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/manager/ai-suggestions" 
        element={
          <PrivateRoute allowedRoles={['manager']}>
            <AISuggestions />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/manager/weather" 
        element={
          <PrivateRoute allowedRoles={['manager']}>
            <WeatherAnalytics />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/manager/reviews" 
        element={
          <PrivateRoute allowedRoles={['manager']}>
            <ReviewsManagement />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/manager/create-shipment" 
        element={
          <PrivateRoute allowedRoles={['manager']}>
            <CreateShipment />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/manager/analytics" 
        element={
          <PrivateRoute allowedRoles={['manager']}>
            <AnalyticsDashboard />
          </PrivateRoute>
        } 
      />
      
      {/* Driver routes */}
      <Route 
        path="/driver" 
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <DriverDashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/driver/route" 
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <RouteOptimization />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/driver/smart-navigation" 
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <SmartNavigation />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/driver/ai-chat" 
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <AIChat />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/driver/delivery" 
        element={
          <PrivateRoute allowedRoles={['driver']}>
            <DeliveryUpdates />
          </PrivateRoute>
        } 
      />
      
      {/* Customer routes */}
      <Route 
        path="/customer" 
        element={
          <PrivateRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/customer/track" 
        element={
          <PrivateRoute allowedRoles={['customer']}>
            <TrackShipment />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/customer/carbon" 
        element={
          <PrivateRoute allowedRoles={['customer']}>
            <CarbonReport />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/customer/review/:shipmentId" 
        element={
          <PrivateRoute allowedRoles={['customer']}>
            <LeaveReview />
          </PrivateRoute>
        } 
      />
      
      {/* Shared routes */}
      <Route 
        path="/shipment/:id" 
        element={
          <PrivateRoute>
            <ShipmentDetails />
          </PrivateRoute>
        } 
      />
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
