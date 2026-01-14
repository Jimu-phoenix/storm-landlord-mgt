import React, { useState } from "react";
import { 
    Search, 
    Lock, Mail,
    Phone, 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2, 
    Users,
    UserCheck,
    Clock

} from "lucide-react";
import "../styles/Tenants.css";

export default function Tenants() {
  const [tenants] = useState([
    {
      id: 1,
      initials: "CB",
      name: "Chisomo Banda",
      email: "chisomo@example.com",
      property: "Sunrise Hostel",
      paymentStatus: "Paid",
      lastPayment: "Jan 10, 2026",
      contact: "+265 991 234 567",
      room: "Room 204"
    },
    {
      id: 2,
      initials: "MP",
      name: "Mphatso Phiri",
      email: "mphatso@example.com",
      property: "Sunrise Hostel",
      paymentStatus: "Pending",
      lastPayment: "Dec 15, 2025",
      contact: "+265 995 876 543",
      room: "Room 105"
    },
    {
      id: 3,
      initials: "TM",
      name: "Thokozani Mbewe",
      email: "thokozani@example.com",
      property: "Greenview House",
      paymentStatus: "Paid",
      lastPayment: "Jan 5, 2026",
      contact: "+265 888 456 789",
      room: "Unit B"
    },
    {
      id: 4,
      initials: "KN",
      name: "Kondwani Nyirenda",
      email: "kondwani@example.com",
      property: "Kamuzu Hostel",
      paymentStatus: "Overdue",
      lastPayment: "Nov 20, 2025",
      contact: "+265 999 123 456",
      room: "Room 101"
    },
    {
      id: 5,
      initials: "PK",
      name: "Pempero Kachingwe",
      email: "pempero@example.com",
      property: "Kamuzu Hostel",
      paymentStatus: "Paid",
      lastPayment: "Jan 8, 2026",
      contact: "+265 991 789 012",
      room: "Room 203"
    },
    {
      id: 6,
      initials: "AM",
      name: "Alice Mwale",
      email: "alice@example.com",
      property: "Lake View Apartments",
      paymentStatus: "Paid",
      lastPayment: "Jan 12, 2026",
      contact: "+265 992 345 678",
      room: "Unit A"
    },
    {
      id: 7,
      initials: "JM",
      name: "James Moyo",
      email: "james@example.com",
      property: "Blantyre House",
      paymentStatus: "Pending",
      lastPayment: "Jan 3, 2026",
      contact: "+265 993 456 789",
      room: "Main House"
    }
  ]);

  return (
    <div className="tenants-container">
      {/* Header */}
      <header className="tenants-header">
        <div>
          <h1>Tenants</h1>
          <p className="tenants-subtitle">Manage tenant information and status</p>
        </div>
        <button className="add-tenant-btn">
          + Add Tenant
        </button>
      </header>      
      <div className="tenant-stats-section">
        <div className="tenant-stat-grid">
         
            <div className="tenant-stat-card">
                <div className="tenant-stat-header">
                <span>Total Tenants</span>
                <div className="tenant-stat-icon">
                    <Users size={20} />
                </div>
                    <h2>8</h2>
                </div>
            </div>

            <div className="tenant-stat-card">
                <div className="tenant-stat-header">
                <span>Active Tenants</span>
                <div className="tenant-stat-icon">
                    <UserCheck size={20} />
                </div>
                    <h2>10</h2>
                </div>
            </div>

            <div className="tenant-stat-card">
                <div className="tenant-stat-header">
                <span>Pending Approval</span>
                <div className="tenant-stat-icon">
                    <Clock size={20} />
                </div>
                    <h2>3</h2>
                </div>
            </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="tenants-controls">
        <div className="tenant-search-container">
          <Search size={18} className="tenant-search-icon" />
          <input
            type="text"
            placeholder="Search tenants..."
            className="tenant-search-input"
          />
        </div>
        <div className="tenant-filter-actions">
          <button className="tenant-filter-btn">
            Filter
          </button>
          <button className="tenant-export-btn">
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="tenants-table-container">
        <div className="tenant-table-responsive">
          <table className="tenants-table">
            <thead>
              <tr>
                <th className="tenant-col">TENANT</th>
                <th>PROPERTY</th>
                <th>PAYMENT STATUS</th>
                <th>LAST PAYMENT</th>
                <th>CONTACT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="tenant-row">
                  <td className="tenant-cell">
                    <div className="tenant-info">
                      <div className="tenant-avatar">
                        {tenant.initials}
                      </div>
                      <div>
                        <strong>{tenant.name}</strong>
                        <div className="tenant-email">
                          <Mail size={12} />
                          <span>{tenant.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="tenant-property-info">
                      <span className="tenant-property-name">{tenant.property}</span>
                      <span className="tenant-room">{tenant.room}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`tenant-payment-status ${tenant.paymentStatus.toLowerCase()}`}>
                      {tenant.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className="tenant-last-payment">{tenant.lastPayment}</span>
                  </td>
                  <td>
                    <div className="tenant-contact">
                      <Phone size={14} />
                      <span>{tenant.contact}</span>
                    </div>
                  </td>
                  <td>
                    <div className="tenant-action-buttons">
                      <button className="tenant-action-btn" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button className="tenant-action-btn" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="tenant-action-btn" title="Lock/Unlock">
                        <Lock size={16} />
                      </button>
                      <button className="tenant-action-btn" title="More Options">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="tenant-table-footer">
          <div className="tenant-showing-text">
            Showing {tenants.length} of {tenants.length} tenants
          </div>
          <div className="tenant-pagination">
            <button className="tenant-pagination-btn" disabled>
              Previous
            </button>
            <button className="tenant-pagination-btn active">1</button>
            <button className="tenant-pagination-btn">2</button>
            <button className="tenant-pagination-btn">3</button>
            <button className="tenant-pagination-btn">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}