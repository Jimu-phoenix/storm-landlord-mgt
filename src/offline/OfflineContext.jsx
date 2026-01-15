import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { db, SYNC_STATUS, clearOfflineData } from './db';
import { syncManager } from './SyncManager.js';

const OfflineContext = createContext();

export function OfflineProvider({ children, supabaseClient }) {
  const { user, isLoaded } = useUser();
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const updatePendingCount = useCallback(async () => {
    if (isOfflineMode) {
      const count = await syncManager.getPendingSyncCount();
      setPendingSyncCount(count);
    } else {
      setPendingSyncCount(0);
    }
  }, [isOfflineMode]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (isOfflineMode && user) {
        await autoSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOfflineMode, user]);

  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  const enableOfflineMode = async () => {
    if (!user || !isOnline || !isLoaded) {
      setSyncError('Must be online and logged in to enable offline mode');
      return { success: false };
    }
    
    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await syncManager.downloadTenantData(user.id, supabaseClient);
      
      if (result.success) {
        setIsOfflineMode(true);
        setLastSyncTime(new Date());
        localStorage.setItem('offlineMode', 'true');
        localStorage.setItem('lastSync', new Date().toISOString());
        return { success: true };
      } else {
        setSyncError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Failed to enable offline mode:', error);
      setSyncError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  };

  const disableOfflineMode = async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      if (isOnline && user) {
        await syncManager.uploadPendingChanges(user.id, supabaseClient);
      }

      await clearOfflineData();
      setIsOfflineMode(false);
      setPendingSyncCount(0);
      localStorage.removeItem('offlineMode');
      localStorage.removeItem('lastSync');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to disable offline mode:', error);
      setSyncError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  };

  const autoSync = async () => {
    if (!user || !isOnline || isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await syncManager.fullSync(user.id, supabaseClient);
      
      if (result.success) {
        setLastSyncTime(new Date());
        localStorage.setItem('lastSync', new Date().toISOString());
        await updatePendingCount();
      } else {
        setSyncError('Some items failed to sync');
      }

      return result;
    } catch (error) {
      console.error('Auto sync failed:', error);
      setSyncError(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const manualSync = async () => {
    if (!isOnline) {
      setSyncError('Cannot sync while offline');
      return { success: false };
    }

    return await autoSync();
  };

  const recordOfflinePayment = async (paymentData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const localId = await db.payments.add({
        ...paymentData,
        sync_status: SYNC_STATUS.PENDING,
        created_at: new Date().toISOString(),
        synced_at: null,
        reference_number: `OFFLINE-${Date.now()}`
      });

      await updatePendingCount();

      return { success: true, localId };
    } catch (error) {
      console.error('Failed to record offline payment:', error);
      throw error;
    }
  };

  const getOfflineData = async (dataType, filters = {}) => {
    try {
      switch (dataType) {
        case 'booking':
          return await syncManager.getCurrentBooking(filters.tenantId);
        case 'payments':
          return await syncManager.getOfflinePayments(filters.tenantId);
        case 'hostel':
          const booking = await syncManager.getCurrentBooking(filters.tenantId);
          if (booking?.hostel) {
            return await db.hostels.get(booking.hostel.id);
          }
          return null;
        default:
          return null;
      }
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('offlineMode');
    const savedSync = localStorage.getItem('lastSync');
    
    if (savedMode === 'true') {
      setIsOfflineMode(true);
      if (savedSync) {
        setLastSyncTime(new Date(savedSync));
      }
    }
  }, []);

  const value = {
    isOfflineMode,
    isOnline,
    isSyncing,
    pendingSyncCount,
    lastSyncTime,
    syncError,
    enableOfflineMode,
    disableOfflineMode,
    manualSync,
    recordOfflinePayment,
    getOfflineData,
    clearSyncError: () => setSyncError(null)
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};