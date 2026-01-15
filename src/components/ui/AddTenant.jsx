import "../../styles/AddTenantModal.css";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";
import { Search, UserPlus, Home, X, Check, AlertCircle, MapPin, Users, DollarSign } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY  
);

// New component for hostel selection modal
function HostelSelectionModal({ isOpen, onClose, tenant, onAssignToHostel, landlordId }) {
  const [hostels, setHostels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedHostel, setSelectedHostel] = useState(null);

  useEffect(() => {
    const fetchHostels = async () => {
      if (!landlordId || !isOpen) return;
      
      setIsLoading(true);
      setError("");
      
      try {
        // Fetch hostels owned by this landlord
        const { data, error: supabaseError } = await supabase
          .from('hostel_details')
          .select('*')
          .eq('landlord_id', landlordId)
          .eq('is_active', true)
          .order('name', { ascending: true });
        
        if (supabaseError) {
          throw supabaseError;
        }
        
        setHostels(data || []);
        
        if (data && data.length === 0) {
          setError("No hostels found for this landlord. Please create a hostel first.");
        }
      } catch (err) {
        console.error("Error fetching hostels:", err);
        setError(err.message || "Failed to fetch hostels");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, [landlordId, isOpen]);

  const handleAssign = () => {
    if (!selectedHostel) {
      setError("Please select a hostel first");
      return;
    }
    
    onAssignToHostel(tenant, selectedHostel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Assign Tenant to Hostel</h2>
          <button onClick={onClose} className="modal-close-btn">✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="hostel-selection-form">
          <div className="form-section">
            <h3 className="form-section-title">Select Hostel for {tenant?.full_name}</h3>
            <p className="form-section-subtitle">
              Choose which hostel to assign this tenant to
            </p>
            
            {isLoading ? (
              <div className="loading-message">
                <p>Loading hostels...</p>
              </div>
            ) : hostels.length > 0 ? (
              <div className="hostels-list">
                {hostels.map((hostel) => (
                  <div 
                    key={hostel.id}
                    className={`hostel-card ${selectedHostel?.id === hostel.id ? 'selected' : ''}`}
                    onClick={() => setSelectedHostel(hostel)}
                  >
                    <div className="hostel-card-header">
                      <div className="hostel-avatar">
                        <Home size={20} />
                      </div>
                      <div className="hostel-info">
                        <h4>{hostel.name}</h4>
                        <div className="hostel-location">
                          <MapPin size={12} />
                          <span>{hostel.city}, {hostel.address}</span>
                        </div>
                      </div>
                      <div className="hostel-selection-indicator">
                        {selectedHostel?.id === hostel.id && <Check size={20} />}
                      </div>
                    </div>
                    
                    <div className="hostel-stats">
                      <div className="hostel-stat">
                        <Users size={14} />
                        <span>{hostel.available_units} / {hostel.total_units} rooms available</span>
                      </div>
                      <div className="hostel-stat">
                        <DollarSign size={14} />
                        <span>MWK {hostel.price_per_unit?.toLocaleString()} per month</span>
                      </div>
                    </div>
                    
                    {selectedHostel?.id === hostel.id && (
                      <div className="hostel-selected-details">
                        <p><strong>Property Type:</strong> {hostel.property_type}</p>
                        {hostel.description && (
                          <p><strong>Description:</strong> {hostel.description.substring(0, 100)}...</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-hostels-message">
                <AlertCircle size={32} />
                <h4>No Hostels Available</h4>
                <p>You need to create at least one hostel before assigning tenants.</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleAssign}
              className="btn btn-primary" 
              disabled={!selectedHostel || hostels.length === 0}
            >
              <UserPlus size={16} />
              Assign to Selected Hostel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main AddTenantsModal component
export default function AddTenantsModal({ isOpen, onClose, onSuccess }) {
  const { user: currentUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Hostel selection modal state
  const [showHostelModal, setShowHostelModal] = useState(false);

  // User type filter
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  
  const userTypeOptions = [
    { value: "all", label: "All Users" },
    { value: "tenant", label: "Tenants" },
    { value: "landlord", label: "Landlords" },
    { value: "admin", label: "Admins" }
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear results if search is empty
    if (!value.trim()) {
      setSearchResults([]);
      setSelectedUser(null);
      return;
    }
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchUsers(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  // Search for users in database
  const searchUsers = async (query) => {
    if (!query.trim()) return;
    
    setSearchLoading(true);
    setError("");
    
    try {
      let supabaseQuery = supabase
        .from('users')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(10);
      
      // Apply user type filter if not "all"
      if (userTypeFilter !== "all") {
        supabaseQuery = supabaseQuery.eq('user_type', userTypeFilter);
      }
      
      const { data, error: supabaseError } = await supabaseQuery;
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      setSearchResults(data || []);
      
      if (data && data.length === 0) {
        setError("No users found matching your search");
      } else {
        setError("");
      }
    } catch (err) {
      console.error("Error searching users:", err);
      setError(err.message || "Failed to search users");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm("");
    setSearchResults([]);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchTerm("");
    setSearchResults([]);
    setError("");
  };

  // Handle opening hostel selection modal
  const handleAddToTenant = () => {
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }
    
    // Show hostel selection modal
    setShowHostelModal(true);
  };

  // Handle assigning tenant to hostel
  const handleAssignToHostel = async (tenant, hostel) => {
    setIsLoading(true);
    setError("");
    
    try {
      // Here you would insert into a tenant_properties or tenant_hostels table
      // For example:
      // const { data, error } = await supabase
      //   .from('tenant_properties')
      //   .insert({
      //     user_id: tenant.id,
      //     property_id: hostel.id,
      //     assigned_at: new Date().toISOString(),
      //     assigned_by: currentUser.id
      //   });
      
      // For now, simulate the assignment
      const assignmentData = {
        tenant,
        hostel,
        assignedAt: new Date().toISOString(),
        assignedBy: currentUser?.id
      };
      
      console.log("Assigning tenant to hostel:", assignmentData);
      
      // Call onSuccess with both tenant and hostel info
      onSuccess?.(assignmentData);
      setSuccess(`${tenant.full_name} has been assigned to ${hostel.name} successfully!`);
      
      // Reset and close after success
      setTimeout(() => {
        onClose();
        setSelectedUser(null);
        setSearchTerm("");
        setSearchResults([]);
        setSuccess("");
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      console.error("Error assigning tenant to hostel:", err);
      setError(err.message || "Failed to assign tenant to hostel");
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2>Add Existing User as Tenant</h2>
            <button onClick={onClose} className="modal-close-btn">✕</button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="add-tenant-form">
            <div className="form-section">
              <h3 className="form-section-title">Search for Existing User</h3>
              <p className="form-section-subtitle">
                Search for users by name, email, or phone number
              </p>
              
              {/* Search input */}
              <div className="form-row">
                <div className="form-field-full">
                  <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      className="search-input"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      disabled={!!selectedUser}
                    />
                    {searchLoading && (
                      <div className="search-loading">Searching...</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-field-full">
                  <label className="form-label" htmlFor="user_type_filter">Filter by User Type</label>
                  <select
                    id="user_type_filter"
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                    className="filter-select"
                  >
                    {userTypeOptions.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {selectedUser && (
                <div className="selected-user-card">
                  <div className="selected-user-header">
                    <h4>Selected User</h4>
                    <button 
                      onClick={handleClearSelection}
                      className="clear-selection-btn"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="selected-user-info">
                    <div className="user-avatar">
                      {selectedUser.full_name
                        .split(' ')
                        .map(word => word[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2)}
                    </div>
                    
                    <div className="user-details">
                      <h5>{selectedUser.full_name}</h5>
                      <div className="user-meta">
                        <div className="user-meta-item">
                          <span className="meta-label">Email:</span>
                          <span className="meta-value">{selectedUser.email}</span>
                        </div>
                        <div className="user-meta-item">
                          <span className="meta-label">Phone:</span>
                          <span className="meta-value">{selectedUser.phone || "N/A"}</span>
                        </div>
                        <div className="user-meta-item">
                          <span className="meta-label">User Type:</span>
                          <span className={`user-type-badge ${selectedUser.user_type}`}>
                            {selectedUser.user_type}
                          </span>
                        </div>
                        <div className="user-meta-item">
                          <span className="meta-label">Status:</span>
                          <span className={`status-badge ${selectedUser.is_active ? 'active' : 'inactive'}`}>
                            {selectedUser.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="user-meta-item">
                          <span className="meta-label">Joined:</span>
                          <span className="meta-value">{formatDate(selectedUser.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {searchResults.length > 0 && !selectedUser && (
                <div className="search-results-container">
                  <div className="search-results-header">
                    <h4>Search Results ({searchResults.length})</h4>
                  </div>
                  
                  <div className="search-results-list">
                    {searchResults.map((user) => (
                      <div 
                        key={user.id} 
                        className="search-result-item"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="result-avatar">
                          {user.full_name
                            .split(' ')
                            .map(word => word[0])
                            .join('')
                            .toUpperCase()
                            .substring(0, 2)}
                        </div>
                        
                        <div className="result-details">
                          <div className="result-name">
                            <strong>{user.full_name}</strong>
                            <span className={`result-user-type ${user.user_type}`}>
                              {user.user_type}
                            </span>
                          </div>
                          <div className="result-email">{user.email}</div>
                          <div className="result-meta">
                            <span className="result-phone">{user.phone || "No phone"}</span>
                            <span className="result-status">
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="result-action">
                          <Check size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {searchTerm && searchResults.length === 0 && !searchLoading && !selectedUser && (
                <div className="no-results-message">
                  <AlertCircle size={24} />
                  <p>No users found matching "{searchTerm}"</p>
                  <p className="hint">Try searching by name, email, or phone number</p>
                </div>
              )}
            </div>

            <div className="form-note">
              <p><strong>Note:</strong> This will add an existing system user as a tenant and assign them to one of your hostels.</p>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={onClose} 
                className="btn btn-secondary" 
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleAddToTenant}
                className="btn btn-primary" 
                disabled={!selectedUser || isLoading}
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Add to Tenant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hostel Selection Modal */}
      <HostelSelectionModal
        isOpen={showHostelModal}
        onClose={() => setShowHostelModal(false)}
        tenant={selectedUser}
        onAssignToHostel={handleAssignToHostel}
        landlordId={currentUser?.id}
      />
    </>
  );
}