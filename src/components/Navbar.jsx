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
  DollarSign,
  AlertCircle,
  Check,
  X,
  FileText
} from "lucide-react";
import { UserButton, useUser, useClerk } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const username = user?.fullName || 
                   user?.username || 
                   user?.firstName || 
                   user?.primaryEmailAddress?.emailAddress?.split("@")[0] || 
                   "unknown";

  const notificationsRef = useRef(null);
  const logoutRef = useRef(null);

  const fetchApplicationNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      console.log("🔄 Fetching notifications for user:", user.id);
      

      const { data: applications, error } = await supabase
        .from('tenant_applications')
        .select(`
          *,
          users:tenant_id (
            id,
            full_name,
            email
          ),
          hostel_details:property_id (
            id,
            name,
            landlord_id
          )
        `)
        .neq('status', 'approved')  
        .neq('status', 'rejected')   
        .order('application_date', { ascending: false });

      console.log("📊 Database query result:", { 
        applicationsCount: applications?.length || 0,
        error: error?.message || 'No error'
      });
      
      if (error) {
        console.error("❌ Database error:", error);
        throw error;
      }

      applications?.forEach((app, index) => {
        console.log(`  App ${index + 1}:`, {
          id: app.id,
          status: app.status,
          tenantName: app.users?.full_name,
          hostelName: app.hostel_details?.name,
          landlordId: app.hostel_details?.landlord_id,
          matchesCurrentUser: app.hostel_details?.landlord_id === user.id
        });
      });

      const landlordApplications = applications?.filter(app => {
        const matches = app.hostel_details?.landlord_id === user.id;
        console.log(`  🔍 App ${app.id}: landlord ${app.hostel_details?.landlord_id} matches ${user.id}? ${matches}`);
        return matches;
      }) || [];

      console.log("🎯 After landlord filter:", {
        totalApplications: applications?.length || 0,
        landlordApplications: landlordApplications.length,
        landlordId: user.id,
        filteredApplications: landlordApplications.map(app => ({
          id: app.id,
          hostel: app.hostel_details?.name,
          tenant: app.users?.full_name,
          status: app.status
        }))
      });

      const applicationNotifications = landlordApplications.map(app => {
        const title = app.status === 'pending' 
          ? "New Tenant Application" 
          : app.status === 'withdrawn' 
            ? "Application Withdrawn" 
            : "Application Update";
        
        return {
          id: app.id,
          type: "tenant_application",
          title: title,
          message: `${app.users?.full_name || 'A user'} applied for ${app.hostel_details?.name || 'a hostel'}`,
          time: formatTimeAgo(app.application_date),
          read: false,
          applicationData: app,
          tenantId: app.tenant_id,
          propertyId: app.property_id,
          tenantName: app.users?.full_name,
          hostelName: app.hostel_details?.name,
          applicationDate: app.application_date,
          hasPaid: app.paid,
          status: app.status 
        };
      });

      console.log("🔔 Final notifications to display:", {
        count: applicationNotifications.length,
        notifications: applicationNotifications.map(n => ({
          id: n.id,
          title: n.title,
          status: n.status,
          message: n.message
        }))
      });

      setNotifications(applicationNotifications);

    } catch (err) {
      console.error("❌ Error in fetchApplicationNotifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications on component mount and when user changes
  useEffect(() => {
    console.log("🔄 Navbar useEffect triggered");
    fetchApplicationNotifications();
  }, [user]);

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

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
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowLogoutMenu(false);
    
    if (!showNotifications) {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    }
  };

  const handleApproveApplication = async (applicationId) => {
    try {
      console.log("✅ Approving application:", applicationId);
      
      // Update application status to 'approved'
      const { error } = await supabase
        .from('tenant_applications')
        .update({ status: 'approved' })
        .eq('id', applicationId);

      if (error) throw error;

      // Remove the notification from the list
      setNotifications(prev => prev.filter(notif => notif.id !== applicationId));

      // Show success message
      alert("Application approved successfully!");
      
      console.log("✅ Application approved:", applicationId);

    } catch (err) {
      console.error("❌ Error approving application:", err);
      alert("Failed to approve application. Please try again.");
    }
  };

  // Handle rejecting a tenant application
  const handleRejectApplication = async (applicationId) => {
    try {
      console.log("❌ Rejecting application:", applicationId);
      
      // Update application status to 'rejected'
      const { error } = await supabase
        .from('tenant_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(notif => notif.id !== applicationId));

      alert("Application rejected successfully!");
      
      console.log("❌ Application rejected:", applicationId);

    } catch (err) {
      console.error("❌ Error rejecting application:", err);
      alert("Failed to reject application. Please try again.");
    }
  };

  const handleViewAllNotifications = () => {
    console.log("View all notifications");
    setShowNotifications(false);
  };

  const handleClearAllNotifications = async () => {
    try {
      console.log("🧹 Clearing all notifications");
      
      const applicationIds = notifications
        .filter(notif => notif.type === "tenant_application")
        .map(notif => notif.id);

      console.log("📝 Application IDs to withdraw:", applicationIds);

      if (applicationIds.length > 0) {
        const { error } = await supabase
          .from('tenant_applications')
          .update({ status: 'withdrawn' })
          .in('id', applicationIds);

        if (error) throw error;
      }

      setNotifications([]);
      setShowNotifications(false);

      alert("All notifications cleared!");

    } catch (err) {
      console.error("❌ Error clearing notifications:", err);
      alert("Failed to clear notifications. Please try again.");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "tenant_application":
        return <User size={16} className="notification-icon application" />;
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

  const getNotificationActions = (type, notificationId, hasPaid, status) => {
    if (type === "tenant_application" && status === 'pending') {
      return (
        <div className="notification-actions">
          <button 
            className="notification-btn approve"
            onClick={(e) => {
              e.stopPropagation();
              handleApproveApplication(notificationId);
            }}
          >
            <Check size={14} />
            Approve
          </button>
          <button 
            className="notification-btn reject"
            onClick={(e) => {
              e.stopPropagation();
              handleRejectApplication(notificationId);
            }}
          >
            <X size={14} />
            Reject
          </button>
        </div>
      );
    }
    return null;
  };

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

  const pendingNotificationsCount = notifications.filter(n => 
    n.type === "tenant_application" && n.status === 'pending'
  ).length;

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
              disabled={loading}
            >
              <Bell size={20} />
              {pendingNotificationsCount > 0 && (
                <span className="notification-badge">{pendingNotificationsCount}</span>
              )}
              {loading && <span className="notification-loading"></span>}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>
                    Notifications ({notifications.length})
                    <span className="status-badge">
                      {pendingNotificationsCount} pending
                    </span>
                  </h3>
                  <div className="notifications-actions">
                    {notifications.length > 0 && (
                      <>
                        <button 
                          className="notifications-clear"
                          onClick={handleClearAllNotifications}
                        >
                          Clear All
                        </button>
                        <button 
                          className="notifications-refresh"
                          onClick={fetchApplicationNotifications}
                        >
                          Refresh
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="notifications-list">
                  {loading ? (
                    <div className="notifications-loading">
                      <div className="spinner"></div>
                      <p>Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="notifications-empty">
                      <Bell size={32} />
                      <p>No notifications</p>
                      <small>All caught up!</small>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'} status-${notification.status}`}
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
                            {getNotificationActions(
                              notification.type, 
                              notification.id, 
                              notification.hasPaid,
                              notification.status
                            )}
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
                      View All Applications
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