import React, { useState, useEffect } from "react";
import { Search, FileText, Trash2, MoreVertical, Building2, SparklesIcon } from "lucide-react";
import { useUser } from '@clerk/clerk-react';
import AddHostelModal from "./ui/AddHostels";
import EditHostelModal from "./ui/EditHostels";
import "../styles/HostelComponent.css";
import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


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
  const [hostelToDelete, setHostelToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  const handleHostelAdded = (newHostel) => {
    console.log("New hostel added:", newHostel);
    fetchHostels();
  };

  const fetchHostels = async () => {
    console.log("fetchHostels function called");
    
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
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false }); 

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
        type: hostel.property_type || 'hostel', 
        address: hostel.address || 'No address',
        location: `${hostel.city}, ${hostel.state}` || 'Unknown location',
        status: hostel.is_active ? 'Active' : 'Inactive',
        rooms: hostel.total_units || 0,
        tenants: (hostel.total_units - hostel.available_units) || 0,
        occupancy: hostel.total_units > 0 ? 
          `${Math.round(((hostel.total_units - hostel.available_units) / hostel.total_units) * 100)}%` : '0%',
        rent: `MK ${parseFloat(hostel.price_per_unit || 0).toLocaleString()}`,
        available_units: hostel.available_units,
        total_units: hostel.total_units,
        originalData: hostel 
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

  useEffect(() => {
    fetchHostels();
  }, [user]);  

  const handleDeleteClick = (hostel) => {
    setHostelToDelete(hostel);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!hostelToDelete || !user) return;
    
    setIsDeleting(true);
    try {
      console.log("Deleting hostel with ID:", hostelToDelete.id);
      
      const { error } = await supabase
        .from('hostel_details')
        .delete()
        .eq('id', hostelToDelete.id)
        .eq('landlord_id', user.id); 

      if (error) throw error;

      console.log("Hostel deleted successfully");
      
      setHostels(prev => prev.filter(h => h.id !== hostelToDelete.id));
      
      setShowDeleteConfirm(false);
      setHostelToDelete(null);
      
    } catch (err) {
      console.error("Error deleting hostel:", err);
      setError("Failed to delete hostel: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setHostelToDelete(null);
  };

  const handleEditClick = (hostel) => {
    setEditingHostel(hostel.originalData || hostel);
    setIsEditModalOpen(true);
  };

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
          <button onClick={fetchHostels} className="retry-btn">
            Retry
          </button>
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
          <button 
            className="add-hostel-btn" 
            onClick={() => setIsAddHostelModalOpen(true)}
          >
            + Add Hostel
          </button>
        </header>
        
        <div className="empty-state">
          <Building2 size={48} className="empty-icon" />
          <h3>No Hostels Found</h3>
          <p>You haven't added any hostels yet.</p>
          <button 
            className="add-hostel-btn-primary"
            onClick={() => setIsAddHostelModalOpen(true)}
          >
            + Add Your First Hostel
          </button>
        </div>

        <AddHostelModal
          isOpen={isAddHostelModalOpen}
          onClose={() => setIsAddHostelModalOpen(false)}
          onSuccess={handleHostelAdded}
        />
      </div>
    );
  }

  const filteredHostels = hostels.filter((hostel) => {
  const query = searchTerm.toLowerCase();

  return (
    hostel.name.toLowerCase().includes(query) ||
    hostel.address.toLowerCase().includes(query) ||
    hostel.location.toLowerCase().includes(query)
  );
});

    const exportToPDF = () => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Hostels Report", 14, 20);
  
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text(`Generated by: ${user?.firstName || "User"}`, 14, 35);
  
  const tableColumn = [
    "Hostel Name",
    "Type",
    "Location",
    "Status",
    "Total Rooms",
    "Occupied",
    "Available",
    "Monthly Rent (MWK)"
  ];
  
  const tableRows = filteredHostels.map((hostel) => [
    hostel.name,
    hostel.type,
    hostel.location,
    hostel.status,
    hostel.total_units.toString(),
    hostel.tenants.toString(),
    hostel.available_units.toString(),
    hostel.rent.replace("MK ", "")
  ]);
  
  // Use autoTable function directly
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    styles: { 
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: { 
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 45 }
  });
  
  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 30,
      doc.internal.pageSize.getHeight() - 10
    );
  }
  
  doc.save(`hostels-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
  return (
    <div className="hostels-container">
      {showDeleteConfirm && hostelToDelete && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete Hostel</h3>
            <p>Are you sure you want to delete <strong>"{hostelToDelete.name}"</strong>?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button 
                onClick={cancelDelete} 
                className="delete-cancel-btn"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="delete-confirm-btn"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="debug-panel">
        <p><SparklesIcon size={15}/> Showing {hostels.length} hostels for {user?.firstName}</p>
      </div>

      <header className="hostels-header">
        <div>
          <h1>Hostels</h1>
          <p className="hostels-subtitle">Manage all your hostel properties</p>
        </div>
        <button 
          className="add-hostel-btn" 
          onClick={() => setIsAddHostelModalOpen(true)}
        >
          + Add Hostel
        </button>
      </header>

      <div className="hostels-controls">
        <div className="hostel-search-container">
          <input
            type="text"
            placeholder="Search hostels..."
            className="hostel-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        </div>
        <div className="hostel-filter-actions">
          <button className="hostel-export-btn"
            onClick={exportToPDF}
          >
            Export
          </button>
        </div>
      </div>

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
              {filteredHostels.map((hostel) => (
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
                      <button 
                        className="hostel-action-btn" 
                        title="View Details"
                        onClick={() => handleEditClick(hostel)}
                      >
                        <FileText size={16} />
                      </button>
                      <button 
                        className="hostel-action-btn delete-btn" 
                        title="Delete"
                        onClick={() => handleDeleteClick(hostel)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        className="hostel-action-btn" 
                        title="More Options"
                      >
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

      <EditHostelModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHostel(null);
        }}
        hostel={editingHostel}
        onSuccess={(updatedHostel) => {
          console.log("Hostel updated:", updatedHostel);
          fetchHostels(); 
        }}
      />
    </div>
  );
}