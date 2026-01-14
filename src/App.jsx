import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing'
import Login from './pages/Login'
import BusinessOverview from "./components/BusinessOverview";
import Payments from './components/Payment'
import Hostels from './components/Hostels'
import Tenants from './components/Ternants'
import SignUp from './pages/SignUp'
import SignUpStorm from './pages/SignUp'


function App() {


  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing />}/>
      <Route path='/login' element={<Login />}/>
      <Route path='/signup' element={<SignUpStorm />}/>
      <Route path="/dashboard" element={<BusinessOverview />} />
      <Route path="/hostels-list" element={<Hostels />} />
      <Route path="/tenant-details" element={<Tenants />} />
       <Route path="/payments" element={<Payments />} />
      <Route path="*" element={<h2>Page not found</h2>} />
    </Routes>
    </BrowserRouter>
  )
}


export default App
