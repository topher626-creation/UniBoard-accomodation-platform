import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { NotificationContainer } from "./components/NotificationContainer.tsx";
import { useAuthStore } from "./stores/authStore.ts";

// Pages
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const CreateProperty = lazy(() => import("./pages/CreateProperty"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const LandlordDashboard = lazy(() => import("./pages/LandlordDashboard"));

function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ErrorBoundary>
      <div className="d-flex flex-column min-vh-100">
        <NotificationContainer />
        <Navbar />

        <main className="flex-grow-1 ub-navbar-offset">
          <Suspense
            fallback={
              <div className="text-center py-5 mt-5">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted">Loading page...</div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/properties" element={<Home />} />

              <Route
                path="/create-listing"
                element={
                  user && (user.role === "landlord" || user.role === "admin")
                    ? <CreateProperty />
                    : <Navigate to="/login" replace />
                }
              />

              <Route
                path="/landlord"
                element={
                  user && (user.role === "landlord" || user.role === "admin")
                    ? <LandlordDashboard />
                    : <Navigate to="/login" replace />
                }
              />

              <Route
                path="/admin"
                element={
                  user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" replace />
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
