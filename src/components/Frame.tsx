import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Bell, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  Activity,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';
import '../styles/frame.css';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  active, 
  collapsed, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`sidebar-item ${active ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
  >
    <div className="icon-container">
      <Icon size={20} />
    </div>
    {!collapsed && <span className="sidebar-label">{label}</span>}
  </button>
);

export default function Frame() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleResize = () => {
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dashboard-wrapper" data-theme={isDarkMode ? 'dark' : 'light'}>
      
      {/* Sidebar - Desktop */}
      <aside 
        className={`desktop-sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
      >
        <div className="sidebar-logo-area">
          <div className="logo-container">
            <div className="logo-icon">
              <Activity size={18} />
            </div>
            {!sidebarCollapsed && (
              <span className="logo-text">ore</span>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              collapsed={sidebarCollapsed}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-item sidebar-item-inactive"
          >
            <div className="icon-container">
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </div>
            {!sidebarCollapsed && <span className="sidebar-label">Collapse View</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`main-viewport ${sidebarCollapsed ? 'ml-collapsed' : 'ml-expanded'}`}
      >
        {/* Header */}
        <header className="main-header">
          <div className="header-left">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="visible-mobile-flex theme-toggle"
            >
              <Menu size={24} />
            </button>
            <h1 className="header-title">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
          </div>

          <div className="header-right">
            <div className="search-bar">
              <Search size={18} style={{color: 'var(--text-muted)'}} />
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
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button className="icon-btn" title="Notifications">
                <Bell size={20} />
                <span className="notification-dot"></span>
              </button>
              
              <div className="divider"></div>
              
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

        {/* Add main content here */}

      </main>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-drawer animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-logo-area" style={{justifyContent: 'space-between'}}>
              <div className="logo-container">
                <div className="logo-icon">
                  <Activity size={18} />
                </div>
                <span className="logo-text">SmartLord</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="icon-btn">
                <X size={24} />
              </button>
            </div>
            
            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.id}
                  collapsed={false}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                />
              ))}
            </nav>

            <div className="mobile-footer">
              <div className="user-block">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="user" className="avatar" />
                <div>
                  <p className="user-name">Mwiza</p>
                  <p className="user-role">Mwiza@gmail.com</p>
                </div>
              </div>
              <button className="logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}