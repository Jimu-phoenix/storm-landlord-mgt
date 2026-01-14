import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../styles/frame.css";

export default function Frame() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const location = useLocation();

  const titles = {
  "/landlord-dashboard": "Dashboard",
  "/landlord-dashboard/hostels": "Hostels",
  "/landlord-dashboard/tenants": "Tenants",
  "/landlord-dashboard/payments": "Payments",
  "/landlord-dashboard/paybills": "PayBills",
};


  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="dashboard-wrapper"
      data-theme={isDarkMode ? "dark" : "light"}
    >
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <main
        className={`main-viewport ${
          sidebarCollapsed ? "ml-collapsed" : "ml-expanded"
        }`}
      >
        <Navbar
          title={titles[location.pathname] || "Dashboard"}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
