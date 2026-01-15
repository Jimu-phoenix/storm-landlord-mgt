import React, { useState, useEffect } from "react";
import { Search, FileText, Trash2, MoreVertical, Building2, SparklesIcon } from "lucide-react";
import { useUser } from '@clerk/clerk-react';
import AddHostelModal from "./ui/AddHostels";
import "../styles/HostelComponent.css";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 
);

export default function Hostels() {  
  const [hostels, setHostels] = useState([]);  
  const { user } = useUser();  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddHostelModalOpen, setIsAddHostelModalOpen] = useState(false);

   const handleHostelAdded = (newHostel) => {
    console.log("New hostel added:", newHostel);
    // Refresh your hostels list here
  };

  useEffect(() => {
    const getHostels = async () => {
      console.log("getHostels function called");
      
      if (!user) {
        console.log("No user found, skipping fetch");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching hostels for user ID:", user.id);
        
        const { data, error: supabaseError } = await supabase
          .from('hostel_details')  
          .select('*')
          .eq('landlord_id', user.id);  

        console.log("Supabase query executed");
        console.log("Data from Supabase:", data);
        console.log("Supabase error:", supabaseError);

        if (supabaseError) {
          console.error("Supabase error details:", supabaseError);
          throw supabaseError;
        }

        const formattedHostels = data?.map(hostel => ({
          id: hostel.id,
          name: hostel.name || 'Unnamed Hostel',
          type: hostel.hostel_type || 'hostel',
          address: hostel.address || 'No address',
          location: `${hostel.city}, ${hostel.state}` || 'Unknown location',
          status: hostel.is_active ? 'Active' : 'Inactive',
          rooms: hostel.total_units || 0,
          tenants: (hostel.total_units - hostel.available_units) || 0,
          occupancy: `${Math.round(((hostel.total_units - hostel.available_units) / hostel.total_units) * 100)}%` || '0%',
          rent: `MK ${parseFloat(hostel.price_per_unit || 0).toLocaleString()}`,
          available_units: hostel.available_units,
          total_units: hostel.total_units
        })) || [];

        console.log("Formatted hostels:", formattedHostels);
        setHostels(formattedHostels);

      } catch (err) {
        console.error("Error fetching hostels:", err);
        setError(err.message || "Failed to fetch hostels");
      } finally {
        setIsLoading(false);
        console.log("Loading finished");
      }
    };

    getHostels();
  }, [user]);  

  if (isLoading) {
    return (
      <div className="hostels-container">
        <div className="loading-message">
          <p>Loading hostels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hostels-container">
        <div className="error-message">
          <h2>Error Loading Hostels</h2>
          <p>{error}</p>
          <p>Debug Info:</p>
          <ul>
            <li>User ID: {user?.id || "No user"}</li>
            <li>Supabase URL configured: {import.meta.env.VITE_SUPABASE_URL ? "Yes" : "No"}</li>
            <li>Environment variables loaded: {import.meta.env.VITE_SUPABASE_ANON_KEY ? "Yes" : "No"}</li>
          </ul>
        </div>
      </div>
    );
  }

  if (hostels.length === 0) {
    return (
      <div className="hostels-container">
        <header className="hostels-header">
          <div>
            <h1>Hostels</h1>
            <p className="hostels-subtitle">Manage all your hostel properties</p>
          </div>
          <button className="add-hostel-btn" onClick={() => setIsAddHostelModalOpen(true)}>
            + Add Hostel
          </button>
        </header>
        
        <div className="empty-state">
          <Building2 size={48} className="empty-icon" />
          <h3>No Hostels Found</h3>
          <p>You haven't added any hostels yet.</p>
          <button className="add-hostel-btn">
            + Add Your First Hostel
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="hostels-container">
      <div className="debug-panel">
        <p><SparklesIcon size={15}/> Showing {hostels.length} hostels for {user?.firstName}</p>
      </div>

      <header className="hostels-header">
        <div>
          <h1>Hostels</h1>
          <p className="hostels-subtitle">Manage all your hostel properties</p>
        </div>
        <button className="add-hostel-btn" onClick={() => setIsAddHostelModalOpen(true)}>
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
                    <span className="hostel-rooms">{hostel.rooms} total</span>
                    <br />
                    <small>{hostel.available_units} available</small>
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

      <AddHostelModal
        isOpen={isAddHostelModalOpen}
        onClose={() => setIsAddHostelModalOpen(false)}
        onSuccess={handleHostelAdded}
      />

    </div>

    
  );
}