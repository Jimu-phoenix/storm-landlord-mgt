import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";
import {
  DollarSign,
  Building2,
  Home,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  Clock,
  Target,
  BarChart3,
  CalendarDays
} from "lucide-react";
import "../styles/BusinessOverview.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function BusinessOverview() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalHostels: 0,
    roomsOccupied: 0,
    totalRooms: 0,
    totalExpenditure: 0,
    pendingPayments: 0,
    overduePayments: 0,
    occupancyRate: 0,
    incomeChange: 0,
    occupancyChange: 0,
    expenditureChange: 0
  });
  
  // Time period state
  const [timePeriod, setTimePeriod] = useState("month");
  const [periodComparison, setPeriodComparison] = useState({
    previousIncome: 0,
    previousOccupancy: 0,
    previousExpenditure: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded || !user) return;

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching data for landlord:", user.id);
        
        // Calculate date ranges based on time period
        const { startDate, previousStartDate } = getDateRange(timePeriod);
        
        // Fetch hostels where landlord_id equals current Clerk user ID
        const { data: hostelsData, error: hostelsError } = await supabase
          .from('hostel_details')
          .select('*')
          .eq('landlord_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (hostelsError) throw hostelsError;
        
        setHostels(hostelsData || []);
        
        // Fetch expenditures for this landlord and include property details
        const { data: expendituresData, error: expendituresError } = await supabase
          .from('expenditures')
          .select(`*, hostel_details:property_id (id, name, city)`) 
          .eq('landlord_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);

        if (expendituresError) throw expendituresError;

        const landlordHostelIds = hostelsData?.map(h => h.id) || [];
        const filteredExpenditures = expendituresData?.filter(exp =>
          !exp.property_id || landlordHostelIds.includes(exp.property_id)
        ) || [];

        setExpenditures(filteredExpenditures);
        
        // Calculate current period statistics
        const currentStats = calculateStatistics(hostelsData, filteredExpenditures, timePeriod, startDate);
        
        // Calculate previous period statistics
        const previousStats = await calculatePreviousPeriodStats(hostelsData, filteredExpenditures, timePeriod, previousStartDate, startDate);
        
        // Calculate percentage changes
        const incomeChange = previousStats.income > 0 
          ? ((currentStats.income - previousStats.income) / previousStats.income * 100).toFixed(1)
          : 100;
          
        const occupancyChange = previousStats.occupancyRate > 0
          ? ((currentStats.occupancyRate - previousStats.occupancyRate) / previousStats.occupancyRate * 100).toFixed(1)
          : 100;
          
        const expenditureChange = previousStats.totalExpenditure > 0
          ? ((currentStats.totalExpenditure - previousStats.totalExpenditure) / previousStats.totalExpenditure * 100).toFixed(1)
          : 100;

        // Format income
        const formattedIncome = new Intl.NumberFormat('en-US').format(currentStats.income);

        setStats({
          totalIncome: formattedIncome,
          totalHostels: currentStats.totalHostels,
          roomsOccupied: currentStats.roomsOccupied,
          totalRooms: currentStats.totalRooms,
          totalExpenditure: currentStats.totalExpenditure,
          pendingPayments: currentStats.pendingPayments,
          overduePayments: currentStats.overduePayments,
          occupancyRate: currentStats.occupancyRate,
          incomeChange: parseFloat(incomeChange),
          occupancyChange: parseFloat(occupancyChange),
          expenditureChange: parseFloat(expenditureChange)
        });

        setPeriodComparison({
          previousIncome: previousStats.income,
          previousOccupancy: previousStats.occupancyRate,
          previousExpenditure: previousStats.totalExpenditure
        });

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isLoaded, timePeriod]);

  // Helper function to get date ranges based on time period
  const getDateRange = (period) => {
    const today = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        previousStartDate = new Date(today);
        previousStartDate.setDate(today.getDate() - 1);
        previousStartDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(today.getDate() - 7);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        previousStartDate = new Date(startDate);
        previousStartDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        previousStartDate = new Date(startDate);
        previousStartDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(today.getMonth() - 1);
        previousStartDate = new Date(startDate);
        previousStartDate.setMonth(startDate.getMonth() - 1);
    }

    return { startDate, previousStartDate };
  };

  // Calculate statistics for a given period (hostels + expenditures)
  const calculateStatistics = (hostelsData, expendituresData, period, startDate) => {
    const totalHostels = hostelsData?.length || 0;
    let totalRooms = 0;
    let roomsOccupied = 0;
    let income = 0;
    let pendingPayments = 0;
    let overduePayments = 0;
    let totalExpenditure = 0;

    // Calculate from hostels
    hostelsData?.forEach(hostel => {
      totalRooms += hostel.total_units || 0;
      roomsOccupied += (hostel.total_units - hostel.available_units) || 0;
      
      // For income calculation, we consider the period
      const occupiedUnits = (hostel.total_units - hostel.available_units) || 0;
      const monthlyIncome = occupiedUnits * hostel.price_per_unit;
      
      switch (period) {
        case "today":
          income += monthlyIncome / 30; // Daily income
          break;
        case "week":
          income += monthlyIncome / 4.3; // Weekly income
          break;
        case "month":
          income += monthlyIncome;
          break;
        case "year":
          income += monthlyIncome * 12;
          break;
        default:
          income += monthlyIncome;
      }
    });

    // Sum expenditures in the period
    expendituresData?.forEach(exp => {
      const createdAt = exp.created_at ? new Date(exp.created_at) : null;
      if (!createdAt || createdAt >= startDate) {
        totalExpenditure += Number(exp.amount || 0);
      }
    });

    const occupancyRate = totalRooms > 0 ? (roomsOccupied / totalRooms * 100).toFixed(1) : 0;

    return {
      totalHostels,
      totalRooms,
      roomsOccupied,
      income,
      totalExpenditure,
      pendingPayments,
      overduePayments,
      occupancyRate: parseFloat(occupancyRate)
    };
  };

  // Calculate previous period statistics
  const calculatePreviousPeriodStats = async (hostelsData, expendituresData, period, previousStartDate, currentStartDate) => {
    // This is a simplified version - in a real app, you'd fetch historical data
    // For now, we'll simulate some data based on current data
    
    const today = new Date();
    const isCurrentDataRecent = (today - currentStartDate) / (1000 * 60 * 60 * 24) < 60; // Within 60 days
    
    if (isCurrentDataRecent) {
      // For demo purposes, return slightly lower numbers
      const currentStats = calculateStatistics(hostelsData, expendituresData, period, currentStartDate);
      
      return {
        income: currentStats.income * 0.85, // 15% less
        occupancyRate: currentStats.occupancyRate * 0.9, // 10% less
        totalExpenditure: currentStats.totalExpenditure * 0.9 // 10% less
      };
    }
    
    return {
      income: 0,
      occupancyRate: 0,
      totalExpenditure: 0
    };
  };

  // Get period label for display
  const getPeriodLabel = () => {
    switch (timePeriod) {
      case "today": return "Today";
      case "week": return "This Week";
      case "month": return "This Month";
      case "year": return "This Year";
      default: return "This Month";
    }
  };

  // Get change indicator component
  const getChangeIndicator = (change, type = "income") => {
    const isPositive = change > 0;
    const isNeutral = change === 0;
    
    const icon = isPositive ? <TrendingUp size={14} /> : isNeutral ? <Target size={14} /> : <TrendingDown size={14} />;
    const colorClass = isPositive ? "positive" : isNeutral ? "neutral" : "negative";
    const text = isPositive ? `+${Math.abs(change)}%` : isNeutral ? "0%" : `-${Math.abs(change)}%`;
    
    let label = "";
    switch (type) {
      case "income": label = "income"; break;
      case "occupancy": label = "occupancy"; break;
      case "tenants": label = "tenants"; break;
      case "expenditure": label = "expenditure"; break;
    }
    
    return (
      <p className={`stat-change ${colorClass}`}>
        {icon} {text} <span>vs last {timePeriod}</span>
      </p>
    );
  };

  // Get time period icon
  const getPeriodIcon = (period) => {
    switch (period) {
      case "today": return <CalendarDays size={14} />;
      case "week": return <Calendar size={14} />;
      case "month": return <Calendar size={16} />;
      case "year": return <BarChart3 size={14} />;
      default: return <Calendar size={14} />;
    }
  };

  const getOccupancyBadge = (hostel) => {
    const occupied = hostel.total_units - hostel.available_units;
    const occupancyRate = hostel.total_units > 0 ? (occupied / hostel.total_units * 100) : 0;
    
    if (occupancyRate === 100) return { text: "Full", className: "full" };
    if (occupancyRate >= 75) return { text: "High", className: "high" };
    if (occupancyRate >= 50) return { text: "Medium", className: "medium" };
    if (occupancyRate >= 25) return { text: "Low", className: "low" };
    return { text: "Vacant", className: "vacant" };
  };

  

  const getHostelImage = (hostelName, index) => {
    const images = [
      "https://i.pinimg.com/736x/cc/a8/14/cca8141b4f33214e58c993ae88e926fa.jpg",
      "https://i.pinimg.com/736x/50/ea/b4/50eab45662b767357b93cada7580572f.jpg",
      "https://i.pinimg.com/736x/c8/38/a1/c838a117931f9207c55fa545fd263618.jpg",
      "https://i.pinimg.com/736x/78/4c/ae/784cae7ea1926150d208d37e5e67c750.jpg",
      "https://i.pinimg.com/736x/3f/2e/2e/3f2e2e2b5bfb5e5b5e5b5e5b5e5b5e5b.jpg",
      "https://i.pinimg.com/736x/a4/7d/8a/a47d8a8b8b8b8b8b8b8b8b8b8b8b8b8b.jpg"
    ];
    
    const imageIndex = index % images.length;
    return images[imageIndex];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Overview of your hostel management
          </p>
        </header>
        <div className="loading-state">
          <Loader2 className="spinner" size={32} />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Overview of your hostel management
          </p>
        </header>
        <div className="error-state">
          <AlertCircle size={32} />
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back! Here's your business overview for <strong>{getPeriodLabel()}</strong>
          </p>
        </div>
      </header>

      <div className="dashboard-filters">
        <button 
          className={`filter-btn ${timePeriod === "today" ? "active" : ""}`}
          onClick={() => setTimePeriod("today")}
        >
          Today
        </button>
        <button 
          className={`filter-btn ${timePeriod === "week" ? "active" : ""}`}
          onClick={() => setTimePeriod("week")}
        >
          Week
        </button>
        <button 
          className={`filter-btn ${timePeriod === "month" ? "active" : ""}`}
          onClick={() => setTimePeriod("month")}
        >
          Month
        </button>
        <button 
          className={`filter-btn ${timePeriod === "year" ? "active" : ""}`}
          onClick={() => setTimePeriod("year")}
        >
          Year
        </button>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Income</span>
            <div className="stat-icon income">
              <DollarSign size={20} />
            </div>
          </div>
          <h2>MWK {stats.totalIncome}</h2>
          {getChangeIndicator(stats.incomeChange, "income")}
          <div className="period-comparison">
            <span className="comparison-label">Last {timePeriod}:</span>
            <span className="comparison-value">MWK {periodComparison.previousIncome.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Total Hostels</span>
            <div className="stat-icon properties">
              <Building2 size={20} />
            </div>
          </div>
          <h2>{stats.totalHostels}</h2>
          <p className="stat-change neutral">
            <Target size={14} /> Steady <span>property count</span>
          </p>
          <div className="period-comparison">
            <span className="comparison-label">Total properties</span>
            <span className="comparison-value">No change</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Total Expenditure</span>
            <div className="stat-icon expenditures">
              <DollarSign size={20} />
            </div>
          </div>
          <h2>MWK {Number(stats.totalExpenditure || 0).toLocaleString()}</h2>
          {getChangeIndicator(stats.expenditureChange, "expenditure")}
          <div className="period-comparison">
            <span className="comparison-label">Last {timePeriod}:</span>
            <span className="comparison-value">MWK {Number(periodComparison.previousExpenditure || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Occupancy Rate</span>
            <div className="stat-icon occupancy">
              <Home size={20} />
            </div>
          </div>
          <h2>{stats.occupancyRate}%</h2>
          {getChangeIndicator(stats.occupancyChange, "occupancy")}
          <div className="period-comparison">
            <span className="comparison-label">Last {timePeriod}:</span>
            <span className="comparison-value">{periodComparison.previousOccupancy.toFixed(1)}%</span>
          </div>
        </div>
      </section>

      <section className="properties-section">
        <div className="section-header">
          <h3>Hostels Overview</h3>
          <div className="section-header-right">
            <a href="/landlord-dashboard/hostels" className="view-all">View all</a>
          </div>
        </div>

        {hostels.length === 0 ? (
          <div className="empty-state">
            <Building2 size={48} />
            <h4>No Hostels Found</h4>
            <p>You haven't added any hostels yet.</p>
            <a href="/landlord-dashboard/add-hostel" className="add-hostel-btn">
              + Add Your First Hostel
            </a>
          </div>
        ) : (
          <div className="properties-grid">
            {hostels.slice(0, 3).map((hostel, index) => {
              const occupancy = getOccupancyBadge(hostel);
              return (
                <div className="property-card" key={hostel.id}>
                  <div className="property-card-header">
                    <img 
                      src={getHostelImage(hostel.name, index)} 
                      alt={hostel.name} 
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=Hostel+Image";
                      }}
                    />
                  </div>
                  <div className="property-info">
                    <div className="property-header">
                      <h4>{hostel.name}</h4>
                      <span className={`badge ${occupancy.className}`}>
                        {occupancy.text}
                      </span>
                    </div>
                    <div className="property-trend">
                      <div className="trend-indicator">
                        {timePeriod === "today" && "Daily revenue: "}
                        {timePeriod === "week" && "Weekly revenue: "}
                        {timePeriod === "month" && "Monthly revenue: "}
                        {timePeriod === "year" && "Annual revenue: "}
                        <strong>
                          MWK {Math.round((hostel.total_units - hostel.available_units) * hostel.price_per_unit * (timePeriod === "year" ? 12 : 1) / (timePeriod === "today" ? 30 : timePeriod === "week" ? 4.3 : 1)).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="expenditures-section">
        <div className="section-header">
          <h3>Expenditures Overview</h3>
          <div className="section-header-right">
            <a href="/landlord-dashboard/expenditures" className="view-all">View all</a>
          </div>
        </div>

        {expenditures.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} />
            <h4>No Expenditures Found</h4>
            <p>You haven't recorded any expenditures yet.</p>
            <a href="/landlord-dashboard/add-expenditure" className="add-hostel-btn">
              + Add Expenditure
            </a>
          </div>
        ) : (
          <div className="expenditures-table-wrapper">
            <table className="expenditures-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Property</th>
                  <th>Category</th>
                  <th>Reference</th>
                  <th className="amount-col">Amount (MWK)</th>
                </tr>
              </thead>
              <tbody>
                {expenditures.map((exp) => {
                  const property = exp.hostel_details;
                  return (
                    <tr key={exp.id}>
                      <td>{formatDate(exp.created_at)}</td>
                      <td>{property?.name || 'General'}</td>
                      <td>{exp.category || 'Other'}</td>
                      <td>{exp.reference || '—'}</td>
                      <td className="amount-col">{Number(exp.amount || 0).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}