import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing'
import { Navigate } from 'react-router-dom'
import Login from './pages/Login'
import BusinessOverview from "./components/BusinessOverview";
import SignUp from './pages/SignUp'
import SignUpStorm from './pages/SignUp'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import TenantDashboard from './pages/TenantDashboard'
import Cross from './pages/Cross'


function ProtectedRoute({children}){
  return(
    <>
    
    <SignedIn>
      {children}
    </SignedIn>

    <SignedOut>
      <Navigate to={'/login'} replace/>
    </SignedOut>

    </>
  )
}

function App() {


  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing />}/>
      <Route path='/cross' element={
        <ProtectedRoute>
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
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <BusinessOverview />
        </ProtectedRoute>
      } />
      <Route path="/tenantdash" element={<TenantDashboard />} />
      <Route path="*" element={<h2>Page not found</h2>} />
    </Routes>
    </BrowserRouter>
  )
}


export default App
