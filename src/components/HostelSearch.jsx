import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../../supabaseClient';
import { Search, Filter, MapPin, Bed, DollarSign, CheckCircle, Clock } from 'lucide-react';
import '../styles/HostelSearch.css';

export default function HostelSearch() {
  const { user } = useUser();
  const [hostels, setHostels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [filters, setFilters] = useState({
    maxPrice: '',
    minBeds: '',
    location: '',
    availableOnly: true
  });

  useEffect(() => {
    if (user) {
      checkExistingApplication();
      fetchHostels();
    }
  }, [user]);

  const checkExistingApplication = async () => {
    const { data, error } = await supabase
      .from('tenancies')
      .select('id, application_status, status, property_id')
      .eq('tenant_id', user.id)
      .in('application_status', ['pending', 'accepted'])
      .maybeSingle();

    if (data) {
      setHasActiveApplication(true);
      setApplicationStatus(data);
    }
  };

  const fetchHostels = async () => {
    setLoading(true);
    let query = supabase
      .from('hostel_details')
      .select('*')
      .gt('available_units', 0);

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
    }

    if (filters.maxPrice) {
      query = query.lte('monthly_rent', parseFloat(filters.maxPrice));
    }

    if (filters.location) {
      query = query.ilike('city', `%${filters.location}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error) {
      setHostels(data || []);
    }
    setLoading(false);
  };

  const handleApply = async (hostelId) => {
    if (!user) return;

    setLoading(true);
    const { data: existingApp } = await supabase
      .from('tenancies')
      .select('id')
      .eq('tenant_id', user.id)
      .in('application_status', ['pending', 'accepted'])
      .maybeSingle();

    if (existingApp) {
      alert('You already have a pending or accepted application.');
      setLoading(false);
      return;
    }

    const hostel = hostels.find(h => h.id === hostelId);
    
    const { data, error } = await supabase
      .from('tenancies')
      .insert({
        property_id: hostelId,
        tenant_id: user.id,
        start_date: new Date().toISOString().split('T')[0],
        monthly_rent: hostel.price_per_unit,
        security_deposit: hostel.security_deposit || hostel.monthly_rent,
        status: 'pending',
        application_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Application error:', error);
      alert('Failed to submit application');
    } else {
      setHasActiveApplication(true);
      setApplicationStatus(data);
      alert('Application submitted successfully!');
    }
    setLoading(false);
  };

  const isApplyDisabled = (hostelId) => {
    if (!hasActiveApplication) return false;
    return applicationStatus?.property_id !== hostelId;
  };

  const getButtonText = (hostelId) => {
    if (!hasActiveApplication) return 'Apply Now';
    if (applicationStatus?.property_id === hostelId) {
      if (applicationStatus.application_status === 'pending') return 'Application Pending';
      if (applicationStatus.application_status === 'accepted') return 'Application Accepted';
    }
    return 'Application in Progress';
  };

  const filteredHostels = hostels;

  return (
    <div className="hostel-search">
      <div className="search-header">
        <h2>Find Your Perfect Accommodation</h2>
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchHostels()}
          />
          <button onClick={fetchHostels} className="search-btn">Search</button>
        </div>
      </div>

      {hasActiveApplication && (
        <div className="application-notice">
          <Clock size={20} />
          <span>
            You have an active application. You can only apply to one hostel at a time.
          </span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="hostels-grid">
          {filteredHostels.map((hostel) => (
            <div key={hostel.id} className="hostel-card">
              <div className="hostel-header">
                <h3>{hostel.name}</h3>
                <span className={`badge ${hostel.available_units > 0 ? 'available' : 'unavailable'}`}>
                  {hostel.available_units > 0 ? 'Available' : 'Full'}
                </span>
              </div>

              <div className="hostel-details">
                <div className="detail-item">
                  <MapPin size={16} />
                  <span>{hostel.address}, {hostel.city}</span>
                </div>
                <div className="detail-item">
                  <Bed size={16} />
                  <span>{hostel.available_units} units available</span>
                </div>
                <div className="detail-item">
                  <DollarSign size={16} />
                  <span>MWK {hostel.monthly_rent?.toLocaleString()}/month</span>
                </div>
              </div>

              {hostel.amenities && hostel.amenities.length > 0 && (
                <div className="amenities">
                  {hostel.amenities.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="amenity-tag">{amenity}</span>
                  ))}
                  {hostel.amenities.length > 3 && (
                    <span className="amenity-tag">+{hostel.amenities.length - 3} more</span>
                  )}
                </div>
              )}

              <button
                className={`apply-btn ${isApplyDisabled(hostel.id) ? 'disabled' : ''}`}
                onClick={() => handleApply(hostel.id)}
                disabled={isApplyDisabled(hostel.id) || hostel.available_units === 0}
              >
                {applicationStatus?.property_id === hostel.id && applicationStatus.application_status === 'accepted' && (
                  <CheckCircle size={18} />
                )}
                {getButtonText(hostel.id)}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredHostels.length === 0 && (
        <div className="no-results">
          <p>No hostels found matching your criteria</p>
        </div>
      )}
    </div>
  );
}