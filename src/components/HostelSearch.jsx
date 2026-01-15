import { Search, Filter, MapPin, Bed, DollarSign, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/SupabaseClient';
import Modal from './Modal';
import '../styles/HostelSearch.css';

export default function HostelSearch() {
  
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [appliedHostelId, setAppliedHostelId] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [filters, setFilters] = useState({
    location: '',
    beds: '',
    maxPrice: '',
    availableOnly: true
  });

  useEffect(() => {
    if (isLoaded && user) {
      checkExistingApplication();
      fetchHostels();
    }
  }, [isLoaded, user]);

  const showModal = (type, title, message) => {
    setModal({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const checkExistingApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('tenant_applications')
        .select('id, property_id, status')
        .eq('tenant_id', user.id)
        .in('status', ['pending', 'accepted'])
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking application:', error);
        return;
      }

      if (data) {
        setHasActiveApplication(true);
        setAppliedHostelId(data.property_id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchHostels = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('hostel_details')
        .select('*')
        .eq('is_active', true)
        .gt('available_units', 0);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }

      if (filters.location) {
        query = query.eq('city', filters.location);
      }

      if (filters.maxPrice) {
        query = query.lte('price_per_unit', parseFloat(filters.maxPrice));
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setHostels(data || []);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      showModal('error', 'Error', 'Failed to load hostels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (hostelId) => {
    if (!user) {
      showModal('warning', 'Authentication Required', 'Please sign in to apply for a hostel.');
      return;
    }

    if (hasActiveApplication) {
      showModal('warning', 'Active Application', 'You already have a pending or accepted application. You can only apply to one hostel at a time.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('tenant_applications')
        .insert({
          tenant_id: user.id,
          property_id: hostelId
        })
        .select()
        .single();

      if (error) throw error;

      showModal('success', 'Application Submitted!', 'Your application has been submitted successfully. Please wait for approval from the landlord.');
      setHasActiveApplication(true);
      setAppliedHostelId(hostelId);
      
    } catch (error) {
      console.error('Application error:', error);
      if (error.code === '23505') {
        showModal('error', 'Duplicate Application', 'You already have an active application for this hostel.');
      } else {
        showModal('error', 'Application Failed', 'Failed to submit application. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      beds: '',
      maxPrice: '',
      availableOnly: true
    });
    setSearchTerm('');
    fetchHostels();
  };

  const locations = [...new Set(hostels.map(hostel => hostel.city))];

  const filteredHostels = hostels.filter(hostel => {
    const matchesAvailability = !filters.availableOnly || hostel.available_units > 0;
    return matchesAvailability;
  });

  const HostelCard = ({ hostel }) => {
    const isThisHostelApplied = appliedHostelId === hostel.id;
    const isDisabled = hasActiveApplication && !isThisHostelApplied;

    return (
      <div className="hostel-card">
        <div className="hostel-card-header">
          <h3>{hostel.name}</h3>
          <span className={`availability-badge ${hostel.available_units > 0 ? 'available' : 'unavailable'}`}>
            {hostel.available_units > 0 ? `${hostel.available_units} Available` : 'Full'}
          </span>
        </div>

        <div className="hostel-details">
          <div className="detail-row">
            <MapPin size={16} />
            <span>{hostel.address}, {hostel.city}</span>
          </div>

          <div className="detail-row">
            <DollarSign size={16} />
            <span>MWK {hostel.price_per_unit?.toLocaleString()}/month</span>
          </div>

          <div className="detail-row">
            <Bed size={16} />
            <span>{hostel.total_units} total units</span>
          </div>
        </div>

        {hostel.amenities && hostel.amenities.length > 0 && (
          <div className="amenities">
            {hostel.amenities.slice(0, 4).map((amenity, index) => (
              <span key={index} className="amenity-tag">{amenity}</span>
            ))}
            {hostel.amenities.length > 4 && (
              <span className="amenity-tag">+{hostel.amenities.length - 4} more</span>
            )}
          </div>
        )}

        <button 
          className={`view-details-btn ${isDisabled ? 'disabled' : ''} ${isThisHostelApplied ? 'applied' : ''}`}
          onClick={() => handleApply(hostel.id)}
          disabled={isDisabled || hostel.available_units === 0 || isThisHostelApplied}
        >
          {isThisHostelApplied 
            ? 'Application Pending' 
            : isDisabled 
            ? 'Application in Progress' 
            : hostel.available_units === 0 
            ? 'Currently Full' 
            : 'View Details & Apply'}
        </button>
      </div>
    );
  };

  if (loading && hostels.length === 0) {
    return (
      <div className="hostel-search-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading hostels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hostel-search-container">
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      <div className="search-header">
        <h1>Find Your Perfect Hostel</h1>
        <p>Browse available hostels and submit your application</p>
      </div>

      <div className="search-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search hostels by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchHostels()}
            className="search-input"
          />
          <button className="search-btn-inline" onClick={fetchHostels}>
            Search
          </button>
        </div>

        <div className="filter-controls">
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <button 
            className="reset-filters-btn"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <select
              id="location"
              value={filters.location}
              onChange={(e) => {
                handleFilterChange('location', e.target.value);
                fetchHostels();
              }}
            >
              <option value="">All Locations</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="maxPrice">Max Price (MWK)</label>
            <select
              id="maxPrice"
              value={filters.maxPrice}
              onChange={(e) => {
                handleFilterChange('maxPrice', e.target.value);
                fetchHostels();
              }}
            >
              <option value="">Any Price</option>
              <option value="30000">MWK 30,000</option>
              <option value="40000">MWK 40,000</option>
              <option value="50000">MWK 50,000</option>
              <option value="60000">MWK 60,000</option>
              <option value="750000">MWK 75,000+</option>
            </select>
          </div>

          <div className="filter-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
              />
              <span>Show available only</span>
            </label>
          </div>
        </div>
      )}

      {hasActiveApplication && (
        <div className="application-notice">
          <p><AlertCircle /> You have an active application. You can only apply to one hostel at a time.</p>
        </div>
      )}

      <div className="results-summary">
        <p>
          Found <strong>{filteredHostels.length}</strong> 
          {filteredHostels.length === 1 ? ' hostel' : ' hostels'} 
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {filteredHostels.length > 0 ? (
        <div className="hostels-grid">
          {filteredHostels.map(hostel => (
            <HostelCard key={hostel.id} hostel={hostel} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>No hostels found matching your criteria. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}