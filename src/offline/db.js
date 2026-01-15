import Dexie from 'dexie';

export const db = new Dexie('PropertyHubOfflineDB');

db.version(1).stores({
  tenants: 'id, clerk_user_id, synced_at',
  hostels: 'id, landlord_id, synced_at',
  rooms: 'id, hostel_id, synced_at',
  bookings: 'id, tenant_id, room_id, status, synced_at',
  payments: '++localId, id, booking_id, tenant_id, status, sync_status, created_at, synced_at',
  landlords: 'id, clerk_user_id, synced_at',
  syncQueue: '++id, entity_type, entity_id, action, data, created_at, synced'
});

export const SYNC_STATUS = {
  SYNCED: 'synced',
  PENDING: 'pending_sync',
  FAILED: 'failed_sync',
  CONFLICT: 'conflict'
};

export const clearOfflineData = async () => {
  await db.tenants.clear();
  await db.hostels.clear();
  await db.rooms.clear();
  await db.bookings.clear();
  await db.payments.clear();
  await db.landlords.clear();
  await db.syncQueue.clear();
};

export const getLastSyncTime = async (table) => {
  const records = await db[table].toArray();
  if (records.length === 0) return null;
  
  const sortedRecords = records.sort((a, b) => 
    new Date(b.synced_at) - new Date(a.synced_at)
  );
  
  return sortedRecords[0]?.synced_at;
};