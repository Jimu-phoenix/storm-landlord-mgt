import { AlertCircle, Search, CheckCircleIcon } from "lucide-react";
import { useState, useEffect } from 'react';
import { useOffline } from '../offline/OfflineContext';
import { useUser } from '@clerk/clerk-react';
import { PaymentSimulator } from "../offline/OfflineControls";
import { supabase } from "../../supabaseClient";

export default function CurrentHostel() {
    const { user } = useUser();
    const { isOfflineMode, getOfflineData } = useOffline();
    const [currentHostelData, setCurrentHostelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            loadHostelData();
        }
    }, [user, isOfflineMode]);

    const loadHostelData = async () => {
        if (!user) {
            setCurrentHostelData(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            if (isOfflineMode) {
                const tenant = await getOfflineData('tenant', { clerkUserId: user.id });
                if (!tenant) {
                    setCurrentHostelData(null);
                    return;
                }

                const tenancy = await getOfflineData('tenancy', { tenantId: tenant.id });
                if (!tenancy) {
                    setCurrentHostelData(null);
                    return;
                }

                const hostel = await getOfflineData('hostel_details', { id: tenancy.property_id });
                const payments = await getOfflineData('payments', { tenancy_id: tenancy.id });
                const latestPayment = payments?.[0];

                setCurrentHostelData({
                    name: hostel?.name || 'Unknown Hostel',
                    paymentStatus: latestPayment?.status === 'completed',
                    currentPeriod: new Date(tenancy?.start_date).toLocaleDateString('en-GB', { 
                        month: 'long', 
                        year: 'numeric' 
                    }),
                    nextPaymentDue: tenancy?.end_date || new Date().toISOString(),
                    amount: `MWK ${tenancy?.monthly_rent?.toLocaleString() || '0'}`,
                    landlord: {
                        name: hostel?.landlord?.full_name || 'Unknown',
                        email: hostel?.landlord?.email || 'N/A',
                        phone: hostel?.landlord?.phone || 'N/A'
                    },
                    tenancyId: tenancy?.id,
                    tenantId: tenant.id
                });
            } else {
                // Get tenant from users table using Clerk user ID
                const { data: tenantData, error: tenantError } = await supabase
                    .from('users')
                    .select('id, full_name, email, phone')
                    .eq('clerk_user_id', user.id)
                    .maybeSingle(); // Use maybeSingle instead of single

                if (tenantError) {
                    console.error('Tenant query error:', tenantError);
                    setError('Failed to load user data');
                    setCurrentHostelData(null);
                    return;
                }

                if (!tenantData) {
                    console.log('No tenant found for Clerk user:', user.id);
                    setCurrentHostelData(null);
                    return;
                }

                console.log('Found tenant:', tenantData.id);

                // Get active tenancy - use .limit(1) instead of .single()
                const { data: tenancies, error: tenancyError } = await supabase
                    .from('tenancies')
                    .select('*')
                    .eq('tenant_id', tenantData.id)
                    .eq('status', 'active')
                    .limit(1);

                if (tenancyError) {
                    console.error('Tenancy query error:', tenancyError);
                    setError('Failed to load tenancy data');
                    setCurrentHostelData(null);
                    return;
                }

                if (!tenancies || tenancies.length === 0) {
                    console.log('No active tenancy found for tenant:', tenantData.id);
                    setCurrentHostelData(null);
                    return;
                }

                const tenancy = tenancies[0];
                console.log('Found tenancy for property:', tenancy.property_id);

                // Get hostel details
                const { data: hostel, error: hostelError } = await supabase
                    .from('hostel_details')
                    .select('*')
                    .eq('id', tenancy.property_id)
                    .maybeSingle();

                if (hostelError || !hostel) {
                    console.error('Hostel query error:', hostelError);
                    setError('Hostel not found');
                    setCurrentHostelData(null);
                    return;
                }

                // Get landlord details
                const { data: landlord, error: landlordError } = await supabase
                    .from('users')
                    .select('full_name, email, phone')
                    .eq('id', hostel.landlord_id)
                    .maybeSingle();

                // Get latest payment
                const { data: payments, error: paymentsError } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('tenancy_id', tenancy.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (paymentsError) {
                    console.error('Payments query error:', paymentsError);
                    // Continue without payment data
                }

                const latestPayment = payments?.[0];

                setCurrentHostelData({
                    name: hostel.name || 'Unknown Hostel',
                    paymentStatus: latestPayment?.status === 'completed',
                    currentPeriod: new Date(tenancy.start_date).toLocaleDateString('en-GB', { 
                        month: 'long', 
                        year: 'numeric' 
                    }),
                    nextPaymentDue: tenancy.end_date || new Date().toISOString(),
                    amount: `MWK ${tenancy.monthly_rent?.toLocaleString() || '0'}`,
                    landlord: {
                        name: landlord?.full_name || 'Unknown',
                        email: landlord?.email || 'N/A',
                        phone: landlord?.phone || 'N/A'
                    },
                    tenancyId: tenancy.id,
                    tenantId: tenantData.id
                });
            }
        } catch (error) {
            console.error('Error loading hostel data:', error);
            setError('An unexpected error occurred');
            setCurrentHostelData(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
                <p>Loading your hostel information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <AlertCircle size={48} />
                <h3>Error</h3>
                <p>{error}</p>
                <button className="btn" onClick={loadHostelData}>
                    Retry
                </button>
            </div>
        );
    }

    if (!currentHostelData) {
        return (
            <div className="no-hostel">
                <AlertCircle size={48} />
                <h1>You are currently not residing in any hostel</h1>
                <p className="subtitle">Search for available hostels to apply</p>
                <button className="btn">
                    <Search size={20} />
                    Search For Hostel
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="hostelInfo">
                <div className="top">
                    <h1>{currentHostelData.name}</h1>
                    <p className="subtitle">Your current accommodation</p>
                </div>
                <div className="payment">
                    {currentHostelData.paymentStatus ? (
                        <div className="paid">
                            <CheckCircleIcon />
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
                    <p>
                        Next Payment Due: 
                        <span>
                            {new Date(currentHostelData.nextPaymentDue).toLocaleDateString('en-GB')}
                        </span>
                    </p>
                    <p>
                        Amount: 
                        <span>{currentHostelData.amount}</span>
                    </p>
                </div>
                <hr />
                <div className="contact">
                    <h2>Contact Landlord</h2>
                    <a href={`mailto:${currentHostelData.landlord.email}`}>
                        {currentHostelData.landlord.email}
                    </a>
                    <a href={`tel:${currentHostelData.landlord.phone}`}>
                        {currentHostelData.landlord.phone}
                    </a>
                </div>
            </div>

            {isOfflineMode && (
                <PaymentSimulator
                    tenantId={currentHostelData.tenantId}
                    tenancyId={currentHostelData.tenancyId}
                    amount={parseInt(currentHostelData.amount.replace(/[^\d]/g, ''))}
                />
            )}
        </>
    );
}