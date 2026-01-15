import "../../styles/EditHostelModal.css";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function EditTenantModal({ isOpen, onClose, tenantDetails, onSuccess }) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    user_type: "tenant",
    is_active: true
  });

  console.log("TenantDetails: fdhjdf: " + tenantDetails)

  const userTypes = [
    { value: "tenant", label: "Tenant" },
    { value: "landlord", label: "Landlord" }
  ];

  useEffect(() => {
    if (!isOpen || !tenantDetails) return;

    const fetchTenant = async () => {
      setIsLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", tenantDetails)
        .single();

      if (error) {
        console.error(error);
        setError("Failed to load tenant details");
      } else {
        const names = data.full_name?.split(" ") || [];

        setFormData({
          first_name: names[0] || "",
          last_name: names.slice(1).join(" ") || "",
          email: data.email || "",
          phone: data.phone || "",
          user_type: data.user_type || "tenant",
          is_active: data.is_active ?? true
        });

        setTenant(data);
      }

      setIsLoading(false);
    };

    fetchTenant();
  }, [isOpen, tenantDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (!tenant || !tenant.id) {
      setError("No tenant selected for editing");
      setIsLoading(false);
      return;
    }

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError("First and last name are required");
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const updatedTenant = {
        full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        email: formData.email,
        phone: formData.phone || null,
        user_type: formData.user_type,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("users")
        .update(updatedTenant)
        .eq("id", tenant.id)
        .select();

      if (error) throw error;

      setSuccess("Tenant updated successfully!");
      if (onSuccess) onSuccess(data[0]);

      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update tenant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">
            <h2>Edit Tenant</h2>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>

        {error && <div className="alert alert-error"><p>{error}</p></div>}
        {success && <div className="alert alert-success"><p>{success}</p></div>}

        {isLoading ? (
          <p>Loading tenant data...</p>
        ) : (
          <form onSubmit={handleSubmit} className="edit-hostel-form">
            <div className="form-section">
              <h3 className="form-section-title">Basic Information</h3>

              <div className="form-row">
                <div className="form-column">
                  <label className="form-label required">First Name</label>
                  <input
                    name="first_name"
                    placeholder="e.g., John"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-column">
                  <label className="form-label required">Last Name</label>
                  <input
                    name="last_name"
                    placeholder="e.g., Doe"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field-full">
                  <label className="form-label required">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="e.g., john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-column">
                  <label className="form-label">Phone Number</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="e.g., +265 999 999 999"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-column">
                  <label className="form-label required">User Type</label>
                  <select
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleInputChange}
                    required
                  >
                    {userTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field-full">
                  <label className="form-label">Account Status</label>
                  <div className="status-toggle">
                    <button
                      type="button"
                      className={`status-btn ${formData.is_active ? "active" : ""}`}
                      onClick={() => setFormData(prev => ({ ...prev, is_active: true }))}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      className={`status-btn ${!formData.is_active ? "inactive" : ""}`}
                      onClick={() => setFormData(prev => ({ ...prev, is_active: false }))}
                    >
                      Inactive
                    </button>
                  </div>
                  <p className="form-hint">Set tenant account as active or inactive</p>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Tenant"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
