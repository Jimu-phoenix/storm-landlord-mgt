import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/SupabaseClient';
import { DollarSign, Calendar, Home, Receipt, AlertCircle } from 'lucide-react';
import '../styles/PaymentHistory.css';

export default function PaymentHistory() {
    const { user, isLoaded } = useUser();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isLoaded && user) {
            fetchPaymentHistory();
        }
    }, [isLoaded, user]);

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('income')
                .select(`
                    *,
                    hostel:hostel_details(name, address, city)
                `)
                .eq('tenant_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setPayments(data || []);
        } catch (err) {
            console.error('Error fetching payment history:', err);
            setError('Failed to load payment history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateTotal = () => {
        return payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    };

    if (loading) {
        return (
            <div className="payment-history-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading payment history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-history-container">
                <div className="error-state">
                    <AlertCircle size={48} />
                    <p>{error}</p>
                    <button className="retry-btn" onClick={fetchPaymentHistory}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-history-container">
            <div className="payment-history-header">
                <div className="header-content">
                    <Receipt size={32} />
                    <div>
                        <h1>Payment History</h1>
                        <p>View all your rental payment transactions</p>
                    </div>
                </div>
                {payments.length > 0 && (
                    <div className="total-summary">
                        <span className="total-label">Total Paid</span>
                        <span className="total-amount">MWK {calculateTotal().toLocaleString()}</span>
                    </div>
                )}
            </div>

            {payments.length === 0 ? (
                <div className="no-payments">
                    <Receipt size={64} />
                    <h2>No Payment History</h2>
                    <p>You haven't made any payments yet. Once you make your first payment, it will appear here.</p>
                </div>
            ) : (
                <div className="payments-list">
                    {payments.map((payment) => (
                        <div key={payment.id} className="payment-card">
                            <div className="payment-icon">
                                <DollarSign size={24} />
                            </div>
                            
                            <div className="payment-details">
                                <div className="payment-main">
                                    <div className="payment-hostel">
                                        <Home size={18} />
                                        <div>
                                            <h3>{payment.hostel?.name || 'Unknown Hostel'}</h3>
                                            <p className="hostel-location">
                                                {payment.hostel?.address}, {payment.hostel?.city}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="payment-amount">
                                        <span className="amount-label">Amount</span>
                                        <span className="amount-value">MWK {Number(payment.amount).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="payment-meta">
                                    <div className="meta-item">
                                        <Calendar size={16} />
                                        <span>{formatDate(payment.created_at)}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="time-badge">{formatTime(payment.created_at)}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="payment-id">ID: #{payment.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}