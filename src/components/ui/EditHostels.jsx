import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";
import "../../styles/EditHostelModal.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function EditHostelModal({ isOpen, onClose, hostel, onSuccess }) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    plot_number: "",
    property_type: "hostel",
    total_units: 1,
    available_units: 1,
    price_per_unit: "",
    amenities: [],
    rules: [],
    images: [],
    is_active: true
  });

  // Populate form when hostel prop changes
  useEffect(() => {
    if (hostel) {
      setFormData({
        name: hostel.name || "",
        description: hostel.description || "",
        address: hostel.address || "",
        city: hostel.city || "",
        state: hostel.state || "",
        plot_number: hostel.plot_number || "",
        property_type: hostel.property_type || "hostel",
        total_units: hostel.total_units || 1,
        available_units: hostel.available_units || 1,
        price_per_unit: hostel.price_per_unit || "",
        amenities: hostel.amenities || [],
        rules: hostel.rules || [],
        images: hostel.images || [],
        is_active: hostel.is_active !== undefined ? hostel.is_active : true
      });
    }
  }, [hostel]);

  const amenitiesOptions = [
    { id: "WiFi", label: "WiFi" },
    { id: "Water", label: "Water 24/7" },
    { id: "Security", label: "Security" },
    { id: "Parking", label: "Parking" },
    { id: "Gym", label: "Gym" },
    { id: "CCTV", label: "CCTV" },
    { id: "Generator", label: "Generator" },
    { id: "Laundry", label: "Laundry" },
    { id: "TV Lounge", label: "TV Lounge" },
    { id: "Cafeteria", label: "Cafeteria" }
  ];

  const rulesOptions = [
    "No smoking",
    "No overnight guests",
    "No pets allowed",
    "Quiet hours: 10PM-6AM",
    "Monthly rent in advance",
    "Students only",
    "No loud music",
    "Deposit: 2 months rent",
    "Minimum stay: 3 months",
    "No visitors after 10PM"
  ];

  const malawiCities = [
    "Blantyre", "Lilongwe", "Mzuzu", "Zomba",
    "Kasungu", "Mangochi", "Salima", "Karonga",
    "Mulanje", "Balaka"
  ];

  const propertyTypes = [
    { value: "hostel", label: "Hostel" },
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "House" },
    { value: "room", label: "Room" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name, value) => {
    const num = parseInt(value) || 0;
    
    if (name === "total_units") {
      setFormData(prev => ({
        ...prev,
        total_units: num,
        available_units: Math.min(prev.available_units, num)
      }));
    } else if (name === "available_units") {
      setFormData(prev => ({
        ...prev,
        available_units: Math.min(num, prev.total_units)
      }));
    }
  };

  const toggleAmenity = (id) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id]
    }));
  };

  const toggleRule = (rule) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.includes(rule)
        ? prev.rules.filter(r => r !== rule)
        : [...prev.rules, rule]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // VALIDATION
    if (!user) {
      setError("You must be logged in");
      setIsLoading(false);
      return;
    }

    if (!hostel || !hostel.id) {
      setError("No hostel selected for editing");
      setIsLoading(false);
      return;
    }

    if (formData.available_units > formData.total_units) {
      setError("Available rooms cannot be greater than total rooms");
      setIsLoading(false);
      return;
    }

    if (formData.total_units <= 0) {
      setError("Total rooms must be greater than 0");
      setIsLoading(false);
      return;
    }

    if (formData.available_units < 0) {
      setError("Available rooms cannot be negative");
      setIsLoading(false);
      return;
    }

    if (!formData.price_per_unit || parseFloat(formData.price_per_unit) <= 0) {
      setError("Price must be greater than 0");
      setIsLoading(false);
      return;
    }

    try {
      // Convert arrays to null if empty
      const amenities = formData.amenities.length > 0 ? formData.amenities : null;
      const rules = formData.rules.length > 0 ? formData.rules : null;
      const images = formData.images.length > 0 ? formData.images : null;

      const updatedHostel = {
        name: formData.name,
        description: formData.description || null,
        address: formData.address,
        city: formData.city,
        state: formData.state || null,
        plot_number: formData.plot_number || null,
        property_type: formData.property_type,
        total_units: formData.total_units,
        available_units: formData.available_units,
        price_per_unit: parseFloat(formData.price_per_unit),
        amenities: amenities,
        rules: rules,
        images: images,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      console.log("Updating hostel with ID:", hostel.id);
      console.log("Update data:", updatedHostel);

      const { data, error } = await supabase
        .from("hostel_details")
        .update(updatedHostel)
        .eq("id", hostel.id)
        .eq("landlord_id", user.id) // Security: only update if user owns it
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setSuccess("Hostel updated successfully!");
      
      // Notify parent component
      if (onSuccess) {
        onSuccess(data[0]);
      }
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error updating hostel:", err);
      setError(err.message || "Failed to update hostel. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h2>Edit Hostel</h2>
            {hostel && <p className="modal-subtitle">ID: {hostel.id}</p>}
          </div>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <p>{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="edit-hostel-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3 className="form-section-title">Basic Information</h3>
            
            {/* Row 1: Name and City side by side */}
            <div className="form-row">
              <div className="form-column">
                <label className="form-label required" htmlFor="name">Hostel Name</label>
                <input
                  id="name"
                  name="name"
                  placeholder="e.g., Kameza Prime Hostel"
                  onChange={handleInputChange}
                  value={formData.name}
                  required
                />
              </div>
              
              <div className="form-column">
                <label className="form-label required" htmlFor="city">City</label>
                <select
                  id="city"
                  name="city"
                  onChange={handleInputChange}
                  value={formData.city}
                  required
                >
                  <option value="">Select City</option>
                  {malawiCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Row 2: Full width address */}
            <div className="form-row">
              <div className="form-field-full">
                <label className="form-label required" htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  placeholder="e.g., Near Kameza Roundabout"
                  onChange={handleInputChange}
                  value={formData.address}
                  required
                />
              </div>
            </div>
            
            {/* Row 3: Property Type, Region, and Plot Number */}
            <div className="form-row">
              <div className="form-column">
                <label className="form-label required" htmlFor="property_type">Property Type</label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  required
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-column">
                <label className="form-label" htmlFor="state">Region</label>
                <input
                  id="state"
                  name="state"
                  placeholder="e.g., Southern Region"
                  onChange={handleInputChange}
                  value={formData.state}
                />
              </div>
              
              <div className="form-column">
                <label className="form-label" htmlFor="plot_number">Plot Number</label>
                <input
                  id="plot_number"
                  name="plot_number"
                  placeholder="e.g., PLOT/BT/245"
                  onChange={handleInputChange}
                  value={formData.plot_number}
                />
              </div>
            </div>
            
            {/* Row 4: Full width description */}
            <div className="form-row">
              <div className="form-field-full">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your hostel facilities, location advantages, etc."
                  onChange={handleInputChange}
                  value={formData.description}
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="form-section">
            <h3 className="form-section-title">Room Information</h3>
            
            {/* Row: Three columns for room info */}
            <div className="form-row">
              <div className="form-field-third">
                <label className="form-label required" htmlFor="total_units">Total Rooms</label>
                <input
                  id="total_units"
                  type="number"
                  min="1"
                  value={formData.total_units}
                  onChange={e => handleNumberChange("total_units", e.target.value)}
                  placeholder="10"
                  required
                />
                <p className="form-hint">Minimum: 1 room</p>
              </div>
              
              <div className="form-field-third">
                <label className="form-label required" htmlFor="available_units">Available Rooms</label>
                <input
                  id="available_units"
                  type="number"
                  min="0"
                  max={formData.total_units}
                  value={formData.available_units}
                  onChange={e => handleNumberChange("available_units", e.target.value)}
                  placeholder="5"
                  required
                />
                <p className="form-hint">Available ≤ Total rooms</p>
                {formData.available_units > formData.total_units && (
                  <p className="error-message">Error: Available rooms cannot exceed total rooms</p>
                )}
              </div>
              
              <div className="form-field-third">
                <label className="form-label required" htmlFor="price_per_unit">Monthly Rent (MWK)</label>
                <div className="input-with-icon">
                  <span className="currency-icon">MWK</span>
                  <input
                    id="price_per_unit"
                    name="price_per_unit"
                    type="number"
                    placeholder="75000"
                    onChange={handleInputChange}
                    value={formData.price_per_unit}
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                <p className="form-hint">Monthly rent per room</p>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="form-row">
              <div className="form-field-full">
                <label className="form-label" htmlFor="is_active">Status</label>
                <div className="status-toggle">
                  <button
                    type="button"
                    className={`status-btn ${formData.is_active ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, is_active: true }))}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    className={`status-btn ${!formData.is_active ? 'inactive' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, is_active: false }))}
                  >
                    Inactive
                  </button>
                </div>
                <p className="form-hint">Set hostel as active or inactive</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="form-section">
            <h3 className="form-section-title">Amenities</h3>
            <p className="form-section-subtitle">Select amenities available at your hostel</p>
            <div className="amenities-grid">
              {amenitiesOptions.map(a => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => toggleAmenity(a.id)}
                  className={`amenity-btn ${formData.amenities.includes(a.id) ? "selected" : ""}`}
                >
                  {a.label}
                  {formData.amenities.includes(a.id) && (
                    <span className="checkmark">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="form-section">
            <h3 className="form-section-title">House Rules</h3>
            <p className="form-section-subtitle">Select rules that apply to your hostel</p>
            <div className="rules-grid">
              {rulesOptions.map(rule => (
                <div key={rule} className="rule-item">
                  <input
                    type="checkbox"
                    id={`rule-${rule}`}
                    checked={formData.rules.includes(rule)}
                    onChange={() => toggleRule(rule)}
                  />
                  <label htmlFor={`rule-${rule}`}>{rule}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
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
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Hostel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}