import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Cross from "./pages/Cross";
import SignUpStorm from "./pages/SignUp";
import Frame from "./components/Frame";
import BusinessOverview from "./components/BusinessOverview";
import Payments from "./components/Payment";
import Hostels from "./components/Hostels";
import Tenants from "./components/Tenants";
import PayBills from "./components/PayBills";
import TenantDashboard from "./pages/TenantDashboard";
import { OfflineProvider } from './offline/OfflineContext'
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to={"/login"} replace/>
      </SignedOut>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path='/cross' element={
        <ProtectedRoute supabaseClient={supabase}>
          <Cross />
        </ProtectedRoute>
        }/>
      <Route path='/login' element={<>
      
      <SignedIn>
        <Navigate to={'/cross'} replace/>
      </SignedIn>
      <SignedOut>
        <Login />
      </SignedOut>

      </>}/>
      <Route path='/signup' element={<>
      
      <SignedIn>
        <Navigate to={'/cross'} replace/>
      </SignedIn>
      <SignedOut>
        <SignUpStorm />
      </SignedOut>

      </>}/>


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

        <Route path="/tenantdash" element={
          <OfflineProvider>
            <TenantDashboard />
          </OfflineProvider>} />

        <Route path="*" element={<h2>Page not found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
