import React, { useState } from "react";
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
  Landmark
} from "lucide-react";import "../styles/Payments.css";

export default function Payments() {
  const [payments] = useState([
    {
      id: 1,
      tenant: "John Smith",
      property: "Sunset Apartments",
      amount: "$1,200",
      dueDate: "01/01/2026",
      paidDate: "28/12/2025",
      method: "Bank Transfer",
      status: "paid",
      icon: <Landmark size={16} />
    },
    {
      id: 2,
      tenant: "Sarah Johnson",
      property: "Sunset Apartments",
      amount: "$1,200",
      dueDate: "01/01/2026",
      paidDate: "05/01/2026",
      method: "Credit Card",
      status: "paid",
      icon: <CreditCard size={16} />
    },
    {
      id: 3,
      tenant: "Michael Brown",
      property: "Riverside Complex",
      amount: "$950",
      dueDate: "01/01/2026",
      paidDate: "-",
      method: "-",
      status: "overdue",
      icon: <AlertCircle size={16} />
    },
    {
      id: 4,
      tenant: "Emily Davis",
      property: "Park View Residences",
      amount: "$1,500",
      dueDate: "01/01/2026",
      paidDate: "10/01/2026",
      method: "Bank Transfer",
      status: "paid",
      icon: <Landmark size={16} />
    },
    {
      id: 5,
      tenant: "David Wilson",
      property: "Park View Residences",
      amount: "$1,500",
      dueDate: "01/01/2026",
      paidDate: "-",
      method: "-",
      status: "pending",
      icon: <Clock size={16} />
    }
  ]);

  const totalAmount = "$7,550";
  const totalPayments = payments.length;
  const receivedAmount = "$5,100";
  const receivedCount = payments.filter(p => p.status === "paid").length;
  const overdueAmount = "$950";
  const overdueCount = payments.filter(p => p.status === "overdue").length;

  return (
    <div className="payments-container">
      <header className="payments-header">
        <div>
          <h1>Payments</h1>
          <p className="payments-subtitle">Track and manage rent payments</p>
        </div>
        <div className="payments-actions">
          <button className="record-payment-btn">
            + Record Payment
          </button>
          <button className="record-payment-btn" onClick={()=>window.location.href = "/makepayments"}>
            <CreditCard size={20}/> Make Payments
          </button>
        </div>
      </header>

      <section className="payments-stats-section">
        <div className="payment-stats-grid">
          <div className="payment-stat-card">
            <div className="payment-stat-header">
              <span>Total Amount</span>
              <div className="payment-stat-icon">
                <DollarSign size={20} />
              </div>
            </div>
            <h2>{totalAmount}</h2>
            <p className="payment-stat-subtext">{totalPayments} payments</p>
          </div>

          <div className="payment-stat-card">
            <div className="payment-stat-header">
              <span>Received</span>
              <div className="payment-stat-icon">
                <CheckCircle size={20} />
              </div>
            </div>
            <h2>{receivedAmount}</h2>
            <p className="payment-stat-subtext">{receivedCount} payments</p>
          </div>

          <div className="payment-stat-card">
            <div className="payment-stat-header">
              <span>Overdue</span>
              <div className="payment-stat-icon">
                <AlertCircle size={20} />
              </div>
            </div>
            <h2>{overdueAmount}</h2>
            <p className="payment-stat-subtext">{overdueCount} payments</p>
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
                <option>January 2026</option>
                <option>December 2025</option>
                <option>November 2025</option>
              </select>
            </div>
          </div>
        </div>

        <div className="payments-controls">
          <div className="payment-search-container">
            <Search size={18} className="payment-search-icon" />
            <input
              type="text"
              placeholder="Search payments..."
              className="payment-search-input"
            />
          </div>
          <div className="payment-filter-actions">
            <button className="payment-filter-btn">
              <Filter size={16} />
              Filter
            </button>
            <button className="payment-export-btn">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
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
                        <span className="payment-tenant-name">{payment.tenant}</span>
                      </div>
                    </td>
                    <td>
                      <span className="payment-property">{payment.property}</span>
                    </td>
                    <td>
                      <span className="payment-amount">{payment.amount}</span>
                    </td>
                    <td>
                      <span className="payment-due-date">{payment.dueDate}</span>
                    </td>
                    <td>
                      <span className={`payment-paid-date ${payment.paidDate === '-' ? 'not-paid' : ''}`}>
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
              <button className="payment-pagination-btn">2</button>
              <button className="payment-pagination-btn">3</button>
              <button className="payment-pagination-btn">
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}