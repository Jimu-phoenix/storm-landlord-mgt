import React, { useState } from "react";
import { Search, FileText, Trash2, MoreVertical, Building2 } from "lucide-react";
import "../styles/HostelComponent.css";

export default function Hostels() {
  const [hostels] = useState([
    {
      id: 1,
      name: "Sunrise Hostel",
      address: "Plot 47/234",
      type: "Hostel",
      location: "Area 47, Lilongwe",
      status: "Rented",
      tenants: 12,
      rent: "MWK 150.000",
      rooms: 24,
      occupancy: "50%"
    },
    {
      id: 2,
      name: "Kamuzu Hostel",
      address: "Plot CC/089",
      type: "Hostel",
      location: "City Centre",
      status: "Rented",
      tenants: 15,
      rent: "MWK 180.000",
      rooms: 30,
      occupancy: "50%"
    },
    {
      id: 3,
      name: "Mzuzu Student Lodge",
      address: "Plot MZ/112",
      type: "Hostel",
      location: "Mzuzu University Area",
      status: "Vacant",
      tenants: 0,
      rent: "MWK 120.000",
      rooms: 20,
      occupancy: "0%"
    },
    {
      id: 4,
      name: "Poly Hostel",
      address: "Plot PL/045",
      type: "Hostel",
      location: "Polytechnic Area",
      status: "Rented",
      tenants: 8,
      rent: "MWK 95.000",
      rooms: 16,
      occupancy: "50%"
    },
    {
      id: 5,
      name: "College Inn",
      address: "Plot CI/112",
      type: "Hostel",
      location: "College Campus",
      status: "Rented",
      tenants: 10,
      rent: "MWK 110.000",
      rooms: 20,
      occupancy: "50%"
    },
    {
      id: 6,
      name: "Student Haven",
      address: "Plot SH/078",
      type: "Hostel",
      location: "University Road",
      status: "Vacant",
      tenants: 0,
      rent: "MWK 135.000",
      rooms: 25,
      occupancy: "0%"
    }
  ]);

  return (
    <div className="hostels-container">
      {/* Header */}
      <header className="hostels-header">
        <div>
          <h1>Hostels</h1>
          <p className="hostels-subtitle">Manage all your hostel properties</p>
        </div>
        <button className="add-hostel-btn">
          + Add Hostel
        </button>
      </header>

      {/* Search and Filters */}
      <div className="hostels-controls">
        <div className="hostel-search-container">
          <Search size={18} className="hostel-search-icon" />
          <input
            type="text"
            placeholder="Search hostels..."
            className="hostel-search-input"
          />
        </div>
        <div className="hostel-filter-actions">
          <button className="hostel-filter-btn">
            Filter
          </button>
          <button className="hostel-export-btn">
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="hostels-table-container">
        <div className="hostel-table-responsive">
          <table className="hostels-table">
            <thead>
              <tr>
                <th className="hostel-col">HOSTEL</th>
                <th>TYPE</th>
                <th>LOCATION</th>
                <th>STATUS</th>
                <th>ROOMS</th>
                <th>TENANTS</th>
                <th>RENT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((hostel) => (
                <tr key={hostel.id} className="hostel-row">
                  <td className="hostel-cell">
                    <div className="hostel-info">
                      <div className="hostel-icon">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <strong>{hostel.name}</strong>
                        <p className="hostel-address">{hostel.address}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="hostel-type">{hostel.type}</span>
                  </td>
                  <td>
                    <span className="hostel-location">{hostel.location}</span>
                  </td>
                  <td>
                    <span className={`hostel-status-badge ${hostel.status.toLowerCase()}`}>
                      {hostel.status}
                    </span>
                  </td>
                  <td>
                    <span className="hostel-rooms">{hostel.rooms}</span>
                  </td>
                  <td>
                    <div className="hostel-tenant-info">
                      <span className="hostel-tenant-count">{hostel.tenants}</span>
                      <span className="hostel-occupancy">({hostel.occupancy})</span>
                    </div>
                  </td>
                  <td>
                    <span className="hostel-rent-amount">{hostel.rent}</span>
                  </td>
                  <td>
                    <div className="hostel-action-buttons">
                      <button className="hostel-action-btn" title="View Details">
                        <FileText size={16} />
                      </button>
                      <button className="hostel-action-btn" title="Delete">
                        <Trash2 size={16} />
                      </button>
                      <button className="hostel-action-btn" title="More Options">
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
        <div className="hostel-table-footer">
          <div className="hostel-showing-text">
            Showing {hostels.length} of {hostels.length} hostels
          </div>
          <div className="hostel-pagination">
            <button className="hostel-pagination-btn" disabled>
              Previous
            </button>
            <button className="hostel-pagination-btn active">1</button>
            <button className="hostel-pagination-btn">2</button>
            <button className="hostel-pagination-btn">3</button>
            <button className="hostel-pagination-btn">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}