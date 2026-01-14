import React from "react";
import {
  DollarSign,
  Building2,
  Home,
  TrendingUp,
} from "lucide-react";
import "../styles/BusinessOverview.css";

export default function BusinessOverview() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">
          Overview of your hostel management
        </p>
      </header>

      <div className="dashboard-filters">
        <button className="filter-btn">Today</button>
        <button className="filter-btn">Week</button>
        <button className="filter-btn active">Month</button>
        <button className="filter-btn">Year</button>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Income</span>
            <div className="stat-icon">
              <DollarSign size={20} />
            </div>
          </div>
          <h2>MWK 555k</h2>
          <p className="stat-change positive">
            <TrendingUp size={14} /> +12.5% <span>vs last period</span>
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Total Hostels</span>
            <div className="stat-icon">
              <Building2 size={20} />
            </div>
          </div>
          <h2>3</h2>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Rooms Occupied</span>
            <div className="stat-icon">
              <Home size={20} />
            </div>
          </div>
          <h2>8 / 12</h2>
          <p className="stat-change positive">
            <TrendingUp size={14} /> +5.2% <span>vs last period</span>
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Occupancy Rate</span>
            <div className="stat-icon">
              <TrendingUp size={20} />
            </div>
          </div>
          <h2>67%</h2>
          <p className="stat-change positive">
            <TrendingUp size={14} /> +3.1% <span>vs last period</span>
          </p>
        </div>
      </section>

      <section className="properties-section">
        <div className="section-header">
          <h3>Hostels Overview</h3>
          <a href="#" className="view-all">View all</a>
        </div>

        <div className="properties-grid">
          <div className="property-card">
            <img src="https://i.pinimg.com/736x/cc/a8/14/cca8141b4f33214e58c993ae88e926fa.jpg" alt="Sunrise Hostel" />
            <div className="property-info">
              <h4>Sunrise Hostel</h4>
              <span className="badge rented">Full</span>
            </div>
          </div>

          <div className="property-card">
            <img src="https://i.pinimg.com/736x/50/ea/b4/50eab45662b767357b93cada7580572f.jpg" alt="Greenview Hostel" />
            <div className="property-info">
              <h4>Greenview Hostel</h4>
              <span className="badge rented">Partial</span>
            </div>
          </div>

          <div className="property-card">
            <img src="https://i.pinimg.com/736x/c8/38/a1/c838a117931f9207c55fa545fd263618.jpg" alt="Mandala Hostel" />
            <div className="property-info">
              <h4>Mandala Hostel</h4>
              <span className="badge rented">Full</span>
            </div>
          </div>
        </div>
      </section>

      <section className="tenants-section">
        <div className="section-header">
          <h3>Students Overview</h3>
          <a href="#" className="view-all">View all</a>
        </div>

        <div className="tenants-grid">
          <div className="tenant-card">
            <div className="tenant-avatar">
              <span>JS</span>
            </div>
            <div className="tenant-info">
              <h4>John Smith</h4>
              <p className="tenant-property">Sunrise Hostel • Room 204</p>
              <div className="tenant-status">
                <span className="status-dot active"></span>
                <span className="status-text">Paid</span>
                <span className="tenant-amount">MWK 85k</span>
              </div>
            </div>
          </div>

          <div className="tenant-card">
            <div className="tenant-avatar">
              <span>MJ</span>
            </div>
            <div className="tenant-info">
              <h4>Mary Johnson</h4>
              <p className="tenant-property">Greenview Hostel • Unit B</p>
              <div className="tenant-status">
                <span className="status-dot pending"></span>
                <span className="status-text">Pending</span>
                <span className="tenant-amount">MWK 120k</span>
              </div>
            </div>
          </div>

          <div className="tenant-card">
            <div className="tenant-avatar">
              <span>RK</span>
            </div>
            <div className="tenant-info">
              <h4>Robert Kambiri</h4>
              <p className="tenant-property">Mandala Hostel • Room 101</p>
              <div className="tenant-status">
                <span className="status-dot overdue"></span>
                <span className="status-text">Overdue</span>
                <span className="tenant-amount">MWK 65k</span>
              </div>
            </div>
          </div>

          <div className="tenant-card">
            <div className="tenant-avatar">
              <span>AM</span>
            </div>
            <div className="tenant-info">
              <h4>Alice Mwale</h4>
              <p className="tenant-property">Sunrise Hostel • Room 105</p>
              <div className="tenant-status">
                <span className="status-dot active"></span>
                <span className="status-text">Paid</span>
                <span className="tenant-amount">MWK 85k</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
