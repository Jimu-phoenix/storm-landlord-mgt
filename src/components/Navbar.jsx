import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  CheckCircle, 
  XCircle,
  User,
  Home,
  Clock,
  DollarSign
} from "lucide-react";
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "booking_request",
      title: "New Booking Request",
      message: "John Doe wants to book a room at Sunrise Hostel",
      time: "10 min ago",
      read: false,
      tenantId: "user_123",
      hostelId: "hostel_456",
      roomNumber: "204",
      monthlyRent: 85000
    },
    {
      id: 2,
      type: "payment_received",
      title: "Payment Received",
      message: "MWK 85,000 received from Alice Mwale",
      time: "2 hours ago",
      read: false,
      tenantId: "user_456",
      hostelId: "hostel_789",
      amount: 85000
    },
    {
      id: 3,
      type: "payment_reminder",
      title: "Payment Due",
      message: "Robert Kambiri's rent is due tomorrow",
      time: "1 day ago",
      read: true,
      tenantId: "user_789",
      hostelId: "hostel_456",
      dueDate: "2024-01-20",
      amount: 65000
    },
    {
      id: 4,
      type: "maintenance_request",
      title: "Maintenance Request",
      message: "Water leak reported in Room 105 at Greenview Hostel",
      time: "2 days ago",
      read: true,
      tenantId: "user_234",
      hostelId: "hostel_789",
      issue: "Water leak",
      roomNumber: "105"
    }
  ]);

  const username = user?.fullName || 
                   user?.username || 
                   user?.firstName || 
                   user?.primaryEmailAddress?.emailAddress?.split("@")[0] || 
                   "unknown";

  const notificationsRef = useRef(null);
  const logoutRef = useRef(null);

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
    setShowNotifications(false); // Close notifications if open
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowLogoutMenu(false); // Close logout menu if open
    
    // Mark all as read when opening
    if (!showNotifications) {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    }
  };

  const handleConfirmBooking = (notificationId) => {
    console.log(`Confirming booking for notification ${notificationId}`);
    // In a real app, you would make an API call here
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    
    // Show success message or update UI
    alert("Booking confirmed successfully!");
  };

  const handleRejectBooking = (notificationId) => {
    console.log(`Rejecting booking for notification ${notificationId}`);
    // In a real app, you would make an API call here
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    
    // Show rejection message
    alert("Booking request rejected.");
  };

  const handleViewAllNotifications = () => {
    console.log("View all notifications");
    // Navigate to notifications page or show all
    setShowNotifications(false);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking_request":
        return <User size={16} className="notification-icon booking" />;
      case "payment_received":
        return <DollarSign size={16} className="notification-icon payment" />;
      case "payment_reminder":
        return <Clock size={16} className="notification-icon reminder" />;
      case "maintenance_request":
        return <Home size={16} className="notification-icon maintenance" />;
      default:
        return <Bell size={16} className="notification-icon default" />;
    }
  };

  const getNotificationActions = (type) => {
    if (type === "booking_request") {
      return (
        <div className="notification-actions">
          <button 
            className="notification-btn confirm"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmBooking(e.currentTarget.dataset.id);
            }}
            data-id={type}
          >
            <CheckCircle size={14} />
            Confirm
          </button>
          <button 
            className="notification-btn reject"
            onClick={(e) => {
              e.stopPropagation();
              handleRejectBooking(e.currentTarget.dataset.id);
            }}
            data-id={type}
          >
            <XCircle size={14} />
            Reject
          </button>
        </div>
      );
    }
    return null;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target) &&
          !event.target.closest('.notification-btn')) {
        setShowNotifications(false);
      }
      if (logoutRef.current && !logoutRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

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

          <div className="notification-container" ref={notificationsRef}>
            <button 
              className="icon-btn notification-btn-trigger"
              onClick={toggleNotifications}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <div className="notifications-actions">
                    {notifications.length > 0 && (
                      <button 
                        className="notifications-clear"
                        onClick={handleClearAllNotifications}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="notifications-empty">
                      <Bell size={32} />
                      <p>No notifications</p>
                      <small>All caught up!</small>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      >
                        <div className="notification-icon-wrapper">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">
                            <strong>{notification.title}</strong>
                            {!notification.read && <span className="notification-unread-dot" />}
                          </div>
                          <p className="notification-message">{notification.message}</p>
                          <div className="notification-footer">
                            <span className="notification-time">{notification.time}</span>
                            {getNotificationActions(notification.type)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="notifications-footer">
                    <button 
                      className="notifications-view-all"
                      onClick={handleViewAllNotifications}
                    >
                      View All Notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="divider" />

          <div className="user-profile-area" ref={logoutRef}>
            <div 
              className="user-profile" 
              onClick={toggleLogoutMenu}
              style={{ cursor: "pointer" }}
            >
              <div className="user-info">
                <p className="user-name">{username}</p>
                <p className="user-role">Landlord</p>
              </div>
              
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