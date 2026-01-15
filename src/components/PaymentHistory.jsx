import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../../supabaseClient';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import '../styles/PaymentHistory.css';

export default function PaymentHistory() {
  const { user } = useUser();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenancy, setTenancy] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: tenancyData, error: tenancyError } = await supabase
        .from('tenancies')
        .select('id, property_id, hostel:hostel_details(name)')
        .eq('tenant_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (tenancyError && tenancyError.code !== 'PGRST116') {
        throw tenancyError;
      }

      if (!tenancyData) {
        setPayments([]);
        setLoading(false);
        return;
      }

      setTenancy(tenancyData);

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('tenancy_id', tenancyData.id)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      setPayments(paymentsData || []);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="status-icon success" />;
      case 'pending':
        return <Clock size={20} className="status-icon warning" />;
      case 'failed':
        return <XCircle size={20} className="status-icon error" />;
      default:
        return <Clock size={20} className="status-icon" />;
    }
  };

  const calculateTotal = () => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  if (loading) {
    return (
      <div className="payment-history">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchPaymentHistory} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tenancy) {
    return (
      <div className="payment-history">
        <div className="no-data">
          <CreditCard size={48} />
          <h3>No Active Tenancy</h3>
          <p>You don't have an active tenancy. Payment history will appear here once you have an active rental.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history">
      <div className="history-header">
        <div>
          <h2>Payment History</h2>
          <p className="hostel-name">{tenancy.hostel?.name}</p>
        </div>
        <div className="summary-stats">
          <div className="stat-card">
            <span className="stat-label">Total Paid</span>
            <span className="stat-value">MWK {calculateTotal().toLocaleString()}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Payments</span>
            <span className="stat-value">{payments.filter(p => p.status === 'completed').length}</span>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="no-payments">
          <CreditCard size={48} />
          <h3>No Payments Yet</h3>
          <p>Your payment history will appear here after you make your first payment.</p>
        </div>
      ) : (
        <div className="payments-list">
          {payments.map((payment) => (
            <div key={payment.id} className={`payment-card ${payment.status}`}>
              <div className="payment-header">
                <div className="payment-info">
                  {getStatusIcon(payment.status)}
                  <div>
                    <h4>Payment #{payment.id}</h4>
                    <p className="transaction-id">
                      Transaction: {payment.transaction_id || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="payment-amount">
                  <span className="amount">MWK {parseFloat(payment.amount).toLocaleString()}</span>
                  <span className={`status-badge ${payment.status}`}>
                    {payment.status}
                  </span>
                </div>
              </div>

              <div className="payment-details">
                <div className="detail-item">
                  <Calendar size={16} />
                  <div>
                    <span className="detail-label">Payment Date</span>
                    <span className="detail-value">
                      {new Date(payment.payment_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <Calendar size={16} />
                  <div>
                    <span className="detail-label">Period</span>
                    <span className="detail-value">
                      {new Date(payment.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' - '}
                      {new Date(payment.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <CreditCard size={16} />
                  <div>
                    <span className="detail-label">Payment Method</span>
                    <span className="detail-value">
                      {payment.payment_method?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {payment.receipt_url && (
                <div className="payment-actions">
                  <a 
                    href={payment.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="receipt-link"
                  >
                    <Download size={16} />
                    Download Receipt
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}