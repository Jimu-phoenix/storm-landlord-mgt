import { Wifi, WifiOff, CloudOff, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useOffline } from './OfflineContext';
import './OfflineControls.css';

export function OfflineIndicator() {
  const { isOfflineMode, isOnline, pendingSyncCount } = useOffline();

  if (!isOfflineMode && isOnline) return null;

  return (
    <div className={`offline-indicator ${!isOnline ? 'offline' : 'syncing'}`}>
      {!isOnline ? (
        <>
          <WifiOff size={16} />
          <span>Offline</span>
        </>
      ) : isOfflineMode ? (
        <>
          <CloudOff size={16} />
          <span>Offline Mode</span>
        </>
      ) : null}
      
      {pendingSyncCount > 0 && (
        <span className="pending-badge">{pendingSyncCount} pending</span>
      )}
    </div>
  );
}

export function OfflineToggle() {
  const {
    isOfflineMode,
    isOnline,
    isSyncing,
    lastSyncTime,
    syncError,
    enableOfflineMode,
    disableOfflineMode,
    manualSync,
    clearSyncError
  } = useOffline();

  const handleToggle = async () => {
    if (isOfflineMode) {
      await disableOfflineMode();
    } else {
      await enableOfflineMode();
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diff = now - lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="offline-toggle-container">
      <div className="offline-header">
        <h3>Offline Mode</h3>
        <div className="offline-status">
          {isOnline ? (
            <span className="status-online">
              <Wifi size={14} /> Online
            </span>
          ) : (
            <span className="status-offline">
              <WifiOff size={14} /> Offline
            </span>
          )}
        </div>
      </div>

      {syncError && (
        <div className="sync-error">
          <AlertCircle size={16} />
          <span>{syncError}</span>
          <button onClick={clearSyncError} className="error-close">×</button>
        </div>
      )}

      <div className="offline-info">
        <p>
          {isOfflineMode
            ? 'Your data is stored locally. Changes will sync when you go online.'
            : 'Enable offline mode to access your data without internet.'}
        </p>
      </div>

      <div className="offline-actions">
        <button
          onClick={handleToggle}
          disabled={isSyncing || (!isOnline && !isOfflineMode)}
          className={`offline-btn ${isOfflineMode ? 'btn-secondary' : 'btn-primary'}`}
        >
          {isSyncing ? (
            <>
              <RefreshCw size={16} className="spinning" />
              Syncing...
            </>
          ) : isOfflineMode ? (
            <>
              <CloudOff size={16} />
              Disable Offline Mode
            </>
          ) : (
            <>
              <Wifi size={16} />
              Enable Offline Mode
            </>
          )}
        </button>

        {isOfflineMode && isOnline && (
          <button
            onClick={manualSync}
            disabled={isSyncing}
            className="sync-btn"
          >
            <RefreshCw size={16} className={isSyncing ? 'spinning' : ''} />
            Sync Now
          </button>
        )}
      </div>

      {isOfflineMode && (
        <div className="sync-info">
          <Clock size={14} />
          <span>Last synced: {formatLastSync()}</span>
        </div>
      )}
    </div>
  );
}

export function PaymentSimulator({ tenantId, bookingId, amount }) {
  const { recordOfflinePayment, isOfflineMode } = useOffline();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const simulatePayment = async () => {
    setIsProcessing(true);
    setSuccess(false);

    try {
      await recordOfflinePayment({
        tenant_id: tenantId,
        booking_id: bookingId,
        amount: amount,
        payment_method: 'simulation',
        payment_date: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Payment simulation failed:', error);
      alert('Failed to record payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOfflineMode) return null;

  return (
    <div className="payment-simulator">
      <div className="simulator-header">
        <h4>Payment Simulator</h4>
        <span className="simulator-badge">Offline Mode</span>
      </div>
      
      <p className="simulator-info">
        Simulate a payment that will be synced when you're back online.
      </p>

      <button
        onClick={simulatePayment}
        disabled={isProcessing || success}
        className="simulate-btn"
      >
        {isProcessing ? (
          <>
            <RefreshCw size={16} className="spinning" />
            Processing...
          </>
        ) : success ? (
          <>
            <CheckCircle size={16} />
            Payment Recorded
          </>
        ) : (
          <>Record Payment (MWK {amount?.toLocaleString()})</>
        )}
      </button>

      {success && (
        <div className="success-message">
          Payment recorded offline. It will sync automatically when online.
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';