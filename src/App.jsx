import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Frame from "./components/Frame";
import BusinessOverview from "./components/BusinessOverview";
import Payments from "./components/Payment";
import Hostels from "./components/Hostels";
import Tenants from "./components/Tenants";
import PayBills from "./components/PayBills";
import TenantDashboard from "./pages/TenantDashboard";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to={"/login"} />
      </SignedOut>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/landlord-dashboard"
          element={
            <ProtectedRoute>
              <Frame />
            </ProtectedRoute>
          }
        >
          <Route index element={<BusinessOverview />} />
          <Route path="hostels" element={<Hostels />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="payments" element={<Payments />} />
          <Route path="paybills" element={<PayBills />} />
        </Route>

        <Route path="/tenantdash" element={<TenantDashboard />} />

        <Route path="*" element={<h2>Page not found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
