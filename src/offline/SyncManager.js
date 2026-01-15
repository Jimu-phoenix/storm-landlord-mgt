import { db, SYNC_STATUS } from './db';

export const syncManager = {
  async downloadTenantData(clerkUserId, supabase) {
    const now = new Date().toISOString();
    
    try {
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (tenantError) throw tenantError;

      await db.tenants.put({
        ...tenant,
        synced_at: now
      });

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms(*),
          hostel:hostels(*)
        `)
        .eq('tenant_id', tenant.id);

      if (!bookingsError && bookings) {
        for (const booking of bookings) {
          await db.bookings.put({
            ...booking,
            synced_at: now
          });

          if (booking.room) {
            await db.rooms.put({
              ...booking.room,
              synced_at: now
            });
          }

          if (booking.hostel) {
            await db.hostels.put({
              ...booking.hostel,
              synced_at: now
            });
          }
        }
      }

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!paymentsError && payments) {
        for (const payment of payments) {
          await db.payments.put({
            ...payment,
            sync_status: SYNC_STATUS.SYNCED,
            synced_at: now
          });
        }
      }

      return { success: true, message: 'Data synced successfully' };
    } catch (error) {
      console.error('Download sync error:', error);
      return { success: false, error: error.message };
    }
  },

  async uploadPendingChanges(clerkUserId, supabase) {
    const results = {
      payments: { success: 0, failed: 0 },
      errors: []
    };

    try {
      const pendingPayments = await db.payments
        .where('sync_status')
        .equals(SYNC_STATUS.PENDING)
        .toArray();

      for (const payment of pendingPayments) {
        try {
          const { data, error } = await supabase
            .from('payments')
            .insert({
              booking_id: payment.booking_id,
              tenant_id: payment.tenant_id,
              amount: payment.amount,
              payment_method: payment.payment_method,
              payment_date: payment.payment_date,
              reference_number: payment.reference_number,
              status: 'pending'
            })
            .select()
            .single();

          if (error) throw error;

          await db.payments.update(payment.localId, {
            id: data.id,
            sync_status: SYNC_STATUS.SYNCED,
            synced_at: new Date().toISOString()
          });

          results.payments.success++;
        } catch (error) {
          console.error(`Failed to sync payment ${payment.localId}:`, error);
          
          await db.payments.update(payment.localId, {
            sync_status: SYNC_STATUS.FAILED,
            sync_error: error.message
          });

          results.payments.failed++;
          results.errors.push({
            type: 'payment',
            id: payment.localId,
            error: error.message
          });
        }
      }

      const queueItems = await db.syncQueue
        .where('synced')
        .equals(0)
        .toArray();

      for (const item of queueItems) {
        try {
          switch (item.action) {
            case 'update':
              await supabase
                .from(item.entity_type)
                .update(item.data)
                .eq('id', item.entity_id);
              break;
            case 'delete':
              await supabase
                .from(item.entity_type)
                .delete()
                .eq('id', item.entity_id);
              break;
          }

          await db.syncQueue.update(item.id, { synced: 1 });
        } catch (error) {
          console.error(`Failed to sync queue item ${item.id}:`, error);
          results.errors.push({
            type: 'queue',
            id: item.id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Upload sync error:', error);
      return { ...results, generalError: error.message };
    }
  },

  async fullSync(clerkUserId, supabase) {
    const uploadResults = await this.uploadPendingChanges(clerkUserId, supabase);
    const downloadResults = await this.downloadTenantData(clerkUserId, supabase);
    
    return {
      upload: uploadResults,
      download: downloadResults,
      success: downloadResults.success && uploadResults.payments.failed === 0
    };
  },

  async getPendingSyncCount() {
    const pendingPayments = await db.payments
      .where('sync_status')
      .equals(SYNC_STATUS.PENDING)
      .count();

    const pendingQueue = await db.syncQueue
      .where('synced')
      .equals(0)
      .count();

    return pendingPayments + pendingQueue;
  },

  async getOfflinePayments(tenantId) {
    return await db.payments
      .where('tenant_id')
      .equals(tenantId)
      .toArray();
  },

  async getCurrentBooking(tenantId) {
    const bookings = await db.bookings
      .where('tenant_id')
      .equals(tenantId)
      .and(booking => booking.status === 'active' || booking.status === 'confirmed')
      .toArray();

    return bookings[0] || null;
  }
};