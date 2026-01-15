import React from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/landlord-dashboard" },
  { label: "Hostels", icon: Building2, path: "/landlord-dashboard/hostels" },
  { label: "Payments", icon: Wallet, path: "/landlord-dashboard/payments" },
  { label: "PayBills", icon: CreditCard, path: "/landlord-dashboard/paybills" },
];

const SidebarItem = ({ icon: Icon, label, collapsed, path }) => (
  <NavLink
    to={path}
    className={({ isActive }) =>
      `sidebar-item ${
        isActive ? "sidebar-item-active" : "sidebar-item-inactive"
      }`
    }
  >
    <div className="icon-container">
      <Icon size={20} />
    </div>
    {!collapsed && <span className="sidebar-label">{label}</span>}
  </NavLink>
);

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed }) {
  return (
    <aside
      className={`desktop-sidebar ${
        sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
      }`}
    >
      <div className="sidebar-logo-area">
        <div className="logo-container">
          <div className="logo-icon">
            <Activity size={18} />
          </div>
          {!sidebarCollapsed && <span className="logo-text">SmartLord</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            collapsed={sidebarCollapsed}
            path={item.path}
          />
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="sidebar-item sidebar-item-inactive"
        >
          <div className="icon-container">
            {sidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </div>
          {!sidebarCollapsed && (
            <span className="sidebar-label">Collapse View</span>
          )}
        </button>
      </div>
    </aside>
  );
}
