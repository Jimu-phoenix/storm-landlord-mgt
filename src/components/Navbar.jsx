import React from "react";
import { Menu, Search, Bell, Sun, Moon } from "lucide-react";

export default function Navbar({
  title,
  isDarkMode,
  setIsDarkMode,
  setIsMobileMenuOpen,
}) {
  return (
    <header className="main-header">
      <div className="header-left">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="visible-mobile-flex theme-toggle"
        >
          <Menu size={24} />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search anything..."
            className="search-input"
          />
        </div>

        <div className="action-group">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="theme-toggle"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className="icon-btn">
            <Bell size={20} />
            <span className="notification-dot" />
          </button>

          <div className="divider" />

          <button className="user-profile">
            <div className="user-info">
              <p className="user-name">Mwiza</p>
              <p className="user-role">Landlord</p>
            </div>
            <img
              className="avatar"
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
              alt="avatar"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
