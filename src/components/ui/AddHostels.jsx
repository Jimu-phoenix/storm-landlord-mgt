
import "../../styles/AddHostelModal.css"; 
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function AddHostelModal({ isOpen, onClose, onSuccess }) {
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
    images: [], // optional, will default if empty
    is_active: true
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name, value) => {
    const num = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [name]: num,
      ...(name === "total_units" && prev.available_units > num
        ? { available_units: num }
        : {})
    }));
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

    if (!user) {
      setError("You must be logged in");
      setIsLoading(false);
      return;
    }

    try {
      // Auto-generate latitude/longitude (for now dummy values, could integrate a geocoding API)
      const latitude = -15.0000 + Math.random(); // small random offset for demo
      const longitude = 35.0000 + Math.random();

      // If images not provided, set default placeholder
      const images = formData.images.length ? formData.images : ["default_hostel.jpg"];

      const newHostel = {
        landlord_id: user.id,
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        plot_number: formData.plot_number,
        latitude,
        longitude,
        property_type: formData.property_type,
        total_units: formData.total_units,
        available_units: formData.available_units,
        price_per_unit: Number(formData.price_per_unit),
        amenities: formData.amenities,
        rules: formData.rules,
        images,
        is_active: formData.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("properties")
        .insert([newHostel])
        .select();

      if (error) throw error;

      setSuccess("Hostel added successfully!");
      onSuccess?.(data[0]);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add New Hostel</h2>
          <button onClick={onClose} className="modal-close-btn">✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="add-hostel-form">

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
  
  {/* Row 3: Region and Plot Number side by side */}
  <div className="form-row">
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

<div className="form-section">
  <h3 className="form-section-title">Room Information</h3>
  
  {/* Row 1: Three columns for room info */}
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
                </div>
                
                <div className="form-field-third">
                <label className="form-label required" htmlFor="price_per_unit">Monthly Rent (MWK)</label>
                <div className="input-with-icon">
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
            </div>

          <div className="form-section">
            <h3>Amenities</h3>
            <div className="amenities-grid">
              {amenitiesOptions.map(a => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => toggleAmenity(a.id)}
                  className={`amenity-btn ${formData.amenities.includes(a.id) ? "selected" : ""}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>House Rules</h3>
            {rulesOptions.map(rule => (
              <label key={rule} className="rule-item">
                <input
                  type="checkbox"
                  checked={formData.rules.includes(rule)}
                  onChange={() => toggleRule(rule)}
                />
                {rule}
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Add Hostel"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
