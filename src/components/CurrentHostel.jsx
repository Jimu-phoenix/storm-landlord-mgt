import { AlertCircle, Search, CheckCircle, Home, X } from "lucide-react";
import '../styles/CurrentHostel.css';
import { supabase } from "../../supabaseClient";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";

export default function CurrentHostel({onSearch}) {
    const { user, isLoaded } = useUser();
    const [application, setApplication] = useState(null);
    const [hostel, setHostel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentData, setPaymentData] = useState({
        transaction_id: ''
    });
    const [processing, setProcessing] = useState(false);
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && user) {
            fetchApplicationData();
        }
    }, [isLoaded, user]);

    const handleSearch = ()=>{
        if(onSearch){
            onSearch();
        }
    }

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

    const fetchApplicationData = async () => {
        try {
            setLoading(true);

            const { data: applicationData, error: appError } = await supabase
                .from('tenant_applications')
                .select(`
                    *,
                    hostel:hostel_details(*)
                `)
                .eq('tenant_id', user.id)
                .eq('status', 'approved')
                .maybeSingle();

            if (appError && appError.code !== 'PGRST116') throw appError;

            if (applicationData) {
                setApplication(applicationData);
                setHostel(applicationData.hostel);
            } else {
                setApplication(null);
                setHostel(null);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            showModal('error', 'Error', 'Failed to load hostel information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const { error: incomeError } = await supabase
                .from('income')
                .insert({
                    tenant_id: user.id,
                    landlord_id: hostel.landlord_id,
                    property_id: application.property_id,
                    amount: hostel.price_per_unit
                });

            if (incomeError) throw incomeError;

            const { error: updateError } = await supabase
                .from('tenant_applications')
                .update({ paid: true })
                .eq('id', application.id);

            if (updateError) throw updateError;

            showModal('success', 'Payment Successful!', 'Your payment has been processed successfully. Thank you!');
            setShowPaymentForm(false);
            setPaymentData({ transaction_id: '' });
            fetchApplicationData();

        } catch (error) {
            console.error('Payment error:', error);
            showModal('error', 'Payment Failed', 'Unable to process your payment. Please try again or contact support.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!application || !hostel) {
        return (
            <div className="no-hostel">
                <Home size={64} />
                <h1>You are currently not residing in any hostel</h1>
                <button className="btn" onClick={() => handleSearch()}>
                    <Search size={20} /> Search For Hostel
                </button>
            </div>
        );
    }

    return (
        <div className="hostelInfo">
            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                type={modal.type}
                title={modal.title}
                message={modal.message}
            />

            <div className="top">
                <h1>{hostel.name}</h1>
                <p>{hostel.address}, {hostel.city}</p>
            </div>

            <div className="payment">
                {application.paid ? (
                    <div className="paid">
                        <CheckCircle />
                        <p>Paid</p>
                    </div>
                ) : (
                    <div className="unpaid">
                        <AlertCircle />
                        <p>Not Paid</p>
                    </div>
                )}
            </div>

            <div className="date">
                <p>Monthly Rent: <span>MWK {hostel.price_per_unit?.toLocaleString()}</span></p>
                <p>Applied: <span>{new Date(application.application_date).toLocaleDateString()}</span></p>
            </div>

            {!application.paid && (
                <div className="payment-action">
                    <button 
                        className="pay-btn" 
                        onClick={() => setShowPaymentForm(true)}
                    >
                        Pay Now
                    </button>
                </div>
            )}

            {showPaymentForm && (
                <div className="payment-modal">
                    <div className="payment-form">
                        <div className="form-header">
                            <h3>Payment Details</h3>
                            <button 
                                className="close-btn" 
                                onClick={() => setShowPaymentForm(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handlePayment}>
                            <div className="form-group">
                                <label>Amount</label>
                                <input 
                                    type="text" 
                                    value={`MWK ${hostel.price_per_unit?.toLocaleString()}`}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mobile / Account Number </label>
                                <input 
                                    type="text"
                                    placeholder="eg. +265xxx, Auto detect..."
                                    value={paymentData.transaction_id}
                                    onChange={(e) => setPaymentData({
                                        ...paymentData, 
                                        transaction_id: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => setShowPaymentForm(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="submit-btn"
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Complete Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <hr />

            <div className="contact">
                <h2>Contact Landlord</h2>
                <a href={`mailto:?subject=Regarding ${hostel.name}`}>
                    Email Landlord
                </a>
                <a href={`tel:`}>
                    Call Landlord
                </a>
            </div>
        </div>
    );
}