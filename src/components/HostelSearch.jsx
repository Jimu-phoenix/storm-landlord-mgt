import { Search, Filter, MapPin, Bed, DollarSign, Navigation } from 'lucide-react';
import { useState } from 'react';
import '../styles/HostelSearch.css';

export default function HostelSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    beds: '',
    maxPrice: '',
    maxDistance: '',
    availableOnly: true
  });

  const availableHostels = [
    {
      id: 1,
      name: 'Sunrise Hostel',
      location: 'Blantyre City Center',
      distance: '2.5 km',
      price: 'MWK 45,000/month',
      beds: 2,
      amenities: ['WiFi', 'Water', 'Security'],
      available: true
    },
    {
      id: 2,
      name: 'Campus View Lodge',
      location: 'Near Polytechnic',
      distance: '0.8 km',
      price: 'MWK 35,000/month',
      beds: 4,
      amenities: ['WiFi', 'Shared Kitchen'],
      available: true
    },
    {
      id: 3,
      name: 'Green Valley Residence',
      location: 'Limbe',
      distance: '5.2 km',
      price: 'MWK 50,000/month',
      beds: 2,
      amenities: ['WiFi', 'Water', 'Security', 'Parking'],
      available: false
    },
    {
      id: 4,
      name: 'Student Haven',
      location: 'Chichiri',
      distance: '3.7 km',
      price: 'MWK 40,000/month',
      beds: 3,
      amenities: ['WiFi', 'Water'],
      available: true
    },
    {
      id: 5,
      name: 'Modern Living Hostel',
      location: 'Blantyre City Center',
      distance: '2.1 km',
      price: 'MWK 55,000/month',
      beds: 2,
      amenities: ['WiFi', 'Water', 'Security', 'Laundry'],
      available: true
    },
    {
      id: 6,
      name: 'Comfort Zone',
      location: 'Limbe',
      distance: '4.9 km',
      price: 'MWK 38,000/month',
      beds: 3,
      amenities: ['WiFi', 'Shared Kitchen', 'Security'],
      available: true
    }
  ];

  const locations = [...new Set(availableHostels.map(hostel => hostel.location))];
  const bedOptions = [...new Set(availableHostels.map(hostel => hostel.beds))].sort((a, b) => a - b);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      beds: '',
      maxPrice: '',
      maxDistance: '',
      availableOnly: true
    });
    setSearchTerm('');
  };

  const filteredHostels = availableHostels.filter(hostel => {
    // Text search
    const matchesSearch = searchTerm === '' || 
      hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Location filter
    const matchesLocation = !filters.location || hostel.location === filters.location;

    // Beds filter
    const matchesBeds = !filters.beds || hostel.beds === parseInt(filters.beds);

    // Price filter
    const matchesPrice = !filters.maxPrice || 
      parseInt(hostel.price.replace(/[^0-9]/g, '')) <= parseInt(filters.maxPrice);

    // Distance filter
    const matchesDistance = !filters.maxDistance || 
      parseFloat(hostel.distance) <= parseFloat(filters.maxDistance);

    // Availability filter
    const matchesAvailability = !filters.availableOnly || hostel.available;

    return matchesSearch && matchesLocation && matchesBeds && 
           matchesPrice && matchesDistance && matchesAvailability;
  });

  const HostelCard = ({ hostel }) => (
    <div className="hostel-card">
      <div className="hostel-card-header">
        <h3>{hostel.name}</h3>
        <span className={`availability-badge ${hostel.available ? 'available' : 'unavailable'}`}>
          {hostel.available ? 'Available' : 'Occupied'}
        </span>
      </div>

      <div className="hostel-details">
        <div className="detail-row">
          <MapPin size={16} />
          <span>{hostel.location}</span>
        </div>
        
        <div className="detail-row">
          <Navigation size={16} />
          <span>{hostel.distance} from campus</span>
        </div>

        <div className="detail-row">
          <Bed size={16} />
          <span>{hostel.beds} {hostel.beds === 1 ? 'bed' : 'beds'}</span>
        </div>

        <div className="detail-row">
          <DollarSign size={16} />
          <span>{hostel.price}</span>
        </div>
      </div>

      <div className="amenities">
        {hostel.amenities.map((amenity, index) => (
          <span key={index} className="amenity-tag">{amenity}</span>
        ))}
      </div>

      <button 
        className={`view-details-btn ${!hostel.available ? 'disabled' : ''}`}
        disabled={!hostel.available}
      >
        {hostel.available ? 'View Details & Apply' : 'Currently Occupied'}
      </button>
    </div>
  );

  return (
    <div className="hostel-search-container">
      <div className="search-header">
        <h1>Find Your Perfect Hostel</h1>
        <p>Browse available hostels near campus with detailed filters</p>
      </div>

      <div className="search-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search hostels by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
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
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="beds">Number of Beds</label>
            <select
              id="beds"
              value={filters.beds}
              onChange={(e) => handleFilterChange('beds', e.target.value)}
            >
              <option value="">Any</option>
              {bedOptions.map(beds => (
                <option key={beds} value={beds}>{beds} {beds === 1 ? 'bed' : 'beds'}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="maxPrice">Max Price (MWK)</label>
            <select
              id="maxPrice"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            >
              <option value="">Any Price</option>
              <option value="35000">MWK 35,000</option>
              <option value="40000">MWK 40,000</option>
              <option value="45000">MWK 45,000</option>
              <option value="50000">MWK 50,000</option>
              <option value="55000">MWK 55,000</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="maxDistance">Max Distance from Campus</label>
            <select
              id="maxDistance"
              value={filters.maxDistance}
              onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
            >
              <option value="">Any Distance</option>
              <option value="1">Within 1 km</option>
              <option value="2">Within 2 km</option>
              <option value="3">Within 3 km</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
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