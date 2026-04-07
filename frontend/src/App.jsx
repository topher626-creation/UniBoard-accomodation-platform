import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { NotificationContainer } from "./components/NotificationContainer.tsx";
import { useAuthStore } from "./stores/authStore.ts";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const CreateProperty = lazy(() => import("./pages/CreateProperty"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MyBookings = lazy(() => import("./pages/MyBookings"));

function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NotificationContainer />
        <Navbar />

        <Suspense fallback={<div className="text-center py-16 text-gray-600">Loading page...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/create-listing"
              element={
                user && (user.role === "landlord" || user.role === "admin") ? (
                  <CreateProperty />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route
              path="/admin"
              element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" replace />}
            />
            <Route
              path="/my-bookings"
              element={user ? <MyBookings /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </Suspense>

      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;