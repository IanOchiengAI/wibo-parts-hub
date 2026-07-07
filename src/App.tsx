import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { VehicleProvider } from "@/context/VehicleContext";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index";
import AdminRoute from "./components/AdminRoute";
import AppErrorBoundary from "./components/AppErrorBoundary";
import LoadingPage from "./components/LoadingPage";
import VehicleSyncBridge from "./components/VehicleSyncBridge";

const queryClient = new QueryClient();
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Track = lazy(() => import("./pages/Track"));
const Garage = lazy(() => import("./pages/Garage"));
const Orders = lazy(() => import("./pages/Orders"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Mechanics = lazy(() => import("./pages/Mechanics"));
const Trade = lazy(() => import("./pages/Trade"));

import { WelcomeTour } from "./components/WelcomeTour";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <VehicleProvider>
        <CartProvider>
          <WelcomeTour />
          <VehicleSyncBridge />
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppErrorBoundary>
                <Suspense fallback={<LoadingPage />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/search" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/track" element={<Track />} />
                    <Route path="/garage" element={<Garage />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/mechanics" element={<Mechanics />} />
                    <Route path="/trade" element={<Trade />} />
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AppErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </VehicleProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
