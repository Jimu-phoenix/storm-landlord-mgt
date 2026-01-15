import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import '../styles/Cross.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function Cross() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState('select-type');
  const [userType, setUserType] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkExistingUser = async () => {
      if (!isLoaded) return;
      
      if (!user) {
        navigate('/sign-in');
        return;
      }

      try {
        const { data: existingUser, error: queryError } = await supabase
          .from('users')
          .select('id, user_type')
          .eq('id', user.id)
          .maybeSingle();

        if (queryError) {
          console.error('Error checking user:', queryError);
        }

        if (existingUser) {
          navigate(existingUser.user_type === 'tenant' ? '/tenantdash' : 'landlord-dashboard');
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error('Error checking existing user:', err);
        setChecking(false);
      }
    };

    checkExistingUser();
  }, [user, isLoaded, navigate]);

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    if (type === 'tenant') {
      handleTenantSignup();
    } else {
      setStep('landlord-details');
    }
  };

  const handleTenantSignup = async () => {
    setLoading(true);
    setError('');

    try {
      const userData = {
        id: user.id,
        clerk_user_id: user.id,
        email: user.emailAddresses[0].emailAddress,
        full_name: user.fullName || `${user.firstName} ${user.lastName}`,
        phone: user.phoneNumbers[0]?.phoneNumber || null,
        user_type: 'tenant',
      };

      const { data, error: insertError } = await supabase
        .from('users')
        .insert([userData])
        .select();

      if (insertError) throw insertError;

      navigate('/tenantdash');
    } catch (err) {
      console.error('Error creating tenant:', err);
      setError(err.message || 'Failed to create tenant account');
      setLoading(false);
    }
  };

  const handleLandlordSignup = async (e) => {
    e.preventDefault();

    if (!nationalId.trim()) {
      setError('Please enter your National ID number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        id: user.id,
        clerk_user_id: user.id,
        email: user.emailAddresses[0].emailAddress,
        full_name: user.fullName || `${user.firstName} ${user.lastName}`,
        phone: user.phoneNumbers[0]?.phoneNumber || null,
        user_type: 'landlord',
      };

      const { data: userResult, error: userError } = await supabase
        .from('users')
        .insert([userData])
        .select();

      if (userError) throw userError;

      const landlordData = {
        nat_id: nationalId,
        landlord_id: user.id
      };

      const { data: landlordResult, error: landlordError } = await supabase
        .from('landlord')
        .insert([landlordData])
        .select();

      if (landlordError) throw landlordError;

      navigate('/landlord-dashboard');
    } catch (err) {
      console.error('Error creating landlord:', err);
      setError(err.message || 'Failed to create landlord account');
      setLoading(false);
    }
  };

  if (!isLoaded || checking) {
    return (
      <div className="cross-container">
        <div className="cross-card">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'select-type') {
    return (
      <div className="cross-container">
        <div className="cross-card">
          <div className="cross-header">
            <h1 className="cross-title">Welcome to Our Platform</h1>
            <p className="cross-subtitle">Let's get you started. What are you here for?</p>
          </div>

          <div className="user-type-grid">
            <button
              onClick={() => handleUserTypeSelection('tenant')}
              disabled={loading}
              className="user-type-card tenant-card"
            >
              <div className="card-content">
                <div className="icon-circle tenant-icon">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="card-title">I'm a Tenant</h3>
                <p className="card-description">Looking for a hostel or property to rent</p>
              </div>
            </button>

            <button
              onClick={() => handleUserTypeSelection('landlord')}
              disabled={loading}
              className="user-type-card landlord-card"
            >
              <div className="card-content">
                <div className="icon-circle landlord-icon">
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="card-title">I'm a Landlord</h3>
                <p className="card-description">I have properties to list and manage</p>
              </div>
            </button>
          </div>

          {error && (
            <div className="error-message">
              <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="error-text">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'landlord-details') {
    return (
      <div className="cross-container landlord-bg">
        <div className="cross-form-card">
          <div className="form-header-section">
            <button onClick={() => setStep('select-type')} className="back-button">
              <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="form-title">Landlord Verification</h2>
            <p className="form-subtitle">Please provide your National ID number for verification</p>
          </div>

          <form onSubmit={handleLandlordSignup} className="landlord-form">
            <div className="form-field">
              <label htmlFor="nationalId" className="field-label">
                National ID Number
              </label>
              <input
                type="text"
                id="nationalId"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="Enter your National ID"
                className="field-input"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="error-message">
                <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="error-text">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || !nationalId.trim()} className="submit-button">
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Continue
                  <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="security-note">
            Your information is secure and will only be used for verification purposes
          </p>
        </div>
      </div>
    );
  }

  return null;
}