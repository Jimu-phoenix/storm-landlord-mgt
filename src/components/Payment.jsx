import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";
import {
  Search,
  Download,
  Filter,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Banknote,
  CreditCard,
  Landmark,
  Loader2
} from "lucide-react";
import "../styles/Payments.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function Payments() {
  const { user, isLoaded } = useUser();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalPayments: 0,
    receivedAmount: 0,
    receivedCount: 0,
    overdueAmount: 0,
    overdueCount: 0
  });

  useEffect(() => {
    const fetchPayments = async () => {
      if (!isLoaded || !user) return;

      setLoading(true);
      setError(null);

      try {
        // First, fetch tenants who have made payments (income) to this landlord
        // We need to get all income records, then get tenant details for those records
        const { data: incomeData, error: incomeError } = await supabase
          .from("income")
          .select(`
            id,
            amount,
            created_at,
            tenant_id,
            property_id,
            hostel_details (
              id,
              name,
              price_per_unit
            )
          `)
          .eq("landlord_id", user.id)
          .order("created_at", { ascending: false });

        if (incomeError) throw incomeError;

        // Extract unique tenant IDs from income records
        const tenantIds = [...new Set(incomeData?.map(inc => inc.tenant_id).filter(id => id) || [])];
        
        // Fetch tenant details
        let tenantMap = {};
        if (tenantIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, full_name, email")
            .in("id", tenantIds);

          if (usersError) throw usersError;

          tenantMap = usersData?.reduce((acc, userData) => {
            acc[userData.id] = {
              name: userData.full_name,
              email: userData.email
            };
            return acc;
          }, {}) || {};
        }

        // Transform income data into payments format
        const formattedPayments = incomeData?.map(income => {
          const tenantInfo = tenantMap[income.tenant_id] || { name: "Unknown Tenant", email: "" };
          const propertyName = income.hostel_details?.name || "Unknown Property";
          const propertyPrice = income.hostel_details?.price_per_unit || 0;
          const paymentDate = new Date(income.created_at);
          const today = new Date();
          
          // Calculate due date (typically 1 month from payment date)
          const dueDate = new Date(paymentDate);
          dueDate.setMonth(dueDate.getMonth() + 1);

          // Determine payment method based on amount or other criteria
          const getPaymentMethod = (amount) => {
            if (amount === propertyPrice) return "Full Rent";
            if (amount > propertyPrice) return "Advance Payment";
            if (amount < propertyPrice) return "Partial Payment";
            return "Rent Payment";
          };

          return {
            id: income.id,
            tenantId: income.tenant_id,
            tenant: tenantInfo.name,
            tenantEmail: tenantInfo.email,
            property: propertyName,
            amount: `MWK ${Number(income.amount || 0).toLocaleString()}`,
            dueDate: dueDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\//g, '/'),
            paidDate: paymentDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\//g, '/'),
            method: getPaymentMethod(Number(income.amount || 0)),
            status: "paid",
            icon: <Landmark size={16} />,
            rawAmount: Number(income.amount || 0),
            propertyPrice: propertyPrice,
            paymentType: income.amount === propertyPrice ? "full" : "partial"
          };
        }) || [];

        setPayments(formattedPayments);

        // Calculate statistics
        const totalPayments = formattedPayments.length;
        const totalAmount = formattedPayments.reduce((sum, p) => sum + p.rawAmount, 0);
        const receivedAmount = totalAmount;
        const receivedCount = totalPayments;

        // Calculate overdue (if any income records have due dates in the past but no payment)
        const today = new Date();
        const overduePayments = formattedPayments.filter(p => {
          const dueDate = new Date(p.dueDate);
          return dueDate < today;
        });
        const overdueAmount = overduePayments.reduce((sum, p) => sum + p.rawAmount, 0);

        setStats({
          totalAmount: `MWK ${totalAmount.toLocaleString()}`,
          totalPayments: totalPayments,
          receivedAmount: `MWK ${receivedAmount.toLocaleString()}`,
          receivedCount: receivedCount,
          overdueAmount: `MWK ${overdueAmount.toLocaleString()}`,
          overdueCount: overduePayments.length
        });

      } catch (err) {
        console.error("Error fetching payments:", err);
        setError(err.message || "Failed to fetch payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, isLoaded]);

  // Function to export payments to CSV
  const exportToCSV = () => {
    const headers = ["Tenant", "Property", "Amount", "Due Date", "Paid Date", "Method", "Status"];
    const csvData = payments.map(p => [
      p.tenant,
      p.property,
      p.amount.replace("MWK ", ""),
      p.dueDate,
      p.paidDate,
      p.method,
      p.status
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="payments-container">
        <header className="payments-header">
          <div>
            <h1>Payments</h1>
            <p className="payments-subtitle">Track and manage rent payments</p>
          </div>
        </header>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Loader2 className="spinner" size={32} />
          <p style={{ marginLeft: '1rem' }}>Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payments-container">
        <header className="payments-header">
          <div>
            <h1>Payments</h1>
            <p className="payments-subtitle">Track and manage rent payments</p>
          </div>
        </header>
        <div style={{ padding: '2rem', color: 'var(--error-color)' }}>
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-container">
      <header className="payments-header">
        <div>
          <h1>Payments</h1>
          <p className="payments-subtitle">Track and manage rent payments from tenants</p>
        </div>
        <div className="payments-actions">
          
          <button className="record-payment-btn" onClick={()=>window.location.href = "/landlord-dashboard/paybills"}>
            <CreditCard size={20}/> Pay Bills
          </button>
        </div>
      </header>

      <section className="payments-stats-section">
        <div className="payment-stats-grid">
          <div className="payment-stat-card">
            <div className="payment-stat-header">
              <span>Total Revenue</span>
              <div className="payment-stat-icon">
                <DollarSign size={20} />
              </div>
            </div>
            <h2>{stats.totalAmount}</h2>
            <p className="payment-stat-subtext">From {stats.totalPayments} payments</p>
          </div>

          <div className="payment-stat-card">
            <div className="payment-stat-header">
              <span>Received</span>
              <div className="payment-stat-icon">
                <CheckCircle size={20} />
              </div>
            </div>
            <h2>{stats.receivedAmount}</h2>
            <p className="payment-stat-subtext">{stats.receivedCount} successful payments</p>
          </div>

          <div className="payment-stat-card">
            <div className="payment-stat-header">
              <span>Overdue</span>
              <div className="payment-stat-icon">
                <AlertCircle size={20} />
              </div>
            </div>
            <h2>{stats.overdueAmount}</h2>
            <p className="payment-stat-subtext">{stats.overdueCount} overdue payments</p>
          </div>
        </div>
      </section>

      <section className="payments-history-section">
        <div className="section-header">
          <h3>Payment History</h3>
          <div className="history-actions">
            <div className="date-filter">
              <Calendar size={16} />
              <select className="date-select">
                <option>All Time</option>
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
              </select>
            </div>
          </div>
        </div>

        <div className="payments-controls">
          <div className="payment-search-container">
            <Search size={18} className="payment-search-icon" />
            <input
              type="text"
              placeholder="Search by tenant or property..."
              className="payment-search-input"
            />
          </div>
          <div className="payment-filter-actions">
            <button className="payment-filter-btn">
              <Filter size={16} />
              Filter
            </button>
            <button className="payment-export-btn" onClick={exportToCSV}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        {payments.length === 0 ? (
          <div className="no-payments-container">
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-color)' }}>
              <Banknote size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No payment records found.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Income from tenants will appear here once payments are recorded.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="payments-table-container">
              <div className="payment-table-responsive">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th className="tenant-col">TENANT</th>
                      <th>PROPERTY</th>
                      <th>AMOUNT</th>
                      <th>DUE DATE</th>
                      <th>PAID DATE</th>
                      <th>METHOD</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="payment-row">
                        <td className="payment-tenant-cell">
                          <div className="payment-tenant-info">
                            <div className="payment-tenant-avatar">
                              {payment.tenant.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="payment-tenant-details">
                              <span className="payment-tenant-name">{payment.tenant}</span>
                              <span className="payment-tenant-email">{payment.tenantEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="payment-property">{payment.property}</span>
                        </td>
                        <td>
                          <span className="payment-amount">{payment.amount}</span>
                          {payment.paymentType === "partial" && (
                            <span className="payment-partial-badge">Partial</span>
                          )}
                        </td>
                        <td>
                          <span className="payment-due-date">{payment.dueDate}</span>
                        </td>
                        <td>
                          <span className="payment-paid-date">
                            {payment.paidDate}
                          </span>
                        </td>
                        <td>
                          <div className="payment-method">
                            {payment.icon}
                            <span>{payment.method}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`payment-status ${payment.status}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="payment-table-footer">
                <div className="payment-showing-text">
                  Showing {payments.length} of {payments.length} payments
                </div>
                <div className="payment-pagination">
                  <button className="payment-pagination-btn" disabled>
                    Previous
                  </button>
                  <button className="payment-pagination-btn active">1</button>
                  <button className="payment-pagination-btn">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}