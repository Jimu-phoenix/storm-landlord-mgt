import React, { useState } from "react";
import { Menu, Search, Bell, Sun, Moon, LogOut } from "lucide-react";
import { UserButton, useUser, useClerk } from "@clerk/clerk-react";

export default function Navbar({
  title,
  isDarkMode,
  setIsDarkMode,
  setIsMobileMenuOpen,
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const username = user?.fullName || 
                   user?.username || 
                   user?.firstName || 
                   user?.primaryEmailAddress?.emailAddress?.split("@")[0] || 
                   "unknown";

  const handleLogout = async () => {
    try {
      await signOut();
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleLogoutMenu = () => {
    setShowLogoutMenu(!showLogoutMenu);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-profile-area')) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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

          <div className="user-profile-area">
            <div 
              className="user-profile" 
              onClick={toggleLogoutMenu}
              style={{ cursor: "pointer" }}
            >
              <div className="user-info">
                <p className="user-name">{username}</p>
                <p className="user-role">Landlord</p>
              </div>
              
              {/* Hidden UserButton - just for auth state */}
              <div style={{ position: "relative", width: "40px", height: "40px" }}>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: {
                        width: "40px",
                        height: "40px"
                      },
                      userButtonTrigger: {
                        opacity: "0",
                        position: "absolute",
                        width: "40px",
                        height: "40px",
                        cursor: "pointer",
                        zIndex: "10"
                      }
                    }
                  }}
                />
                {/* Custom clickable avatar overlay */}
                <div 
                  className="custom-avatar-overlay"
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    zIndex: "5"
                  }}
                />
              </div>
            </div>
            
            {/* Logout Dropdown Menu */}
            {showLogoutMenu && (
              <div className="logout-dropdown">
                <button 
                  className="logout-menu-item"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}