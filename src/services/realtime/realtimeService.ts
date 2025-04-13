
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Define a more accurate type for the payload based on what Supabase actually returns
type PostgresChangesPayload = RealtimePostgresChangesPayload<{
  [key: string]: any;
}>;

type SubscriptionCallback = (payload: PostgresChangesPayload) => void;
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

class RealtimeService {
  private channels: Record<string, RealtimeChannel> = {};
  
  /**
   * Subscribe to real-time updates for a specific table
   */
  subscribeToTable(
    table: string, 
    event: EventType = '*', 
    callback: SubscriptionCallback
  ): string[] {
    const channelId = `${table}-${event}-${Date.now()}`;
    
    console.log(`Setting up realtime subscription for ${table} (${event})`);
    
    try {
      // Create the channel with the correct syntax for Supabase v2
      const channel = supabase.channel(channelId);
      
      // Subscribe to postgres changes with the correct API syntax
      // We need to use "as any" here because the TypeScript definitions for Supabase
      // don't perfectly match the actual API capabilities for realtime subscriptions
      channel
        .on(
          'postgres_changes' as any,
          { 
            event, 
            schema: 'public',
            table
          },
          (payload: PostgresChangesPayload) => {
            console.log(`Realtime update for ${table} (${event}):`, payload.eventType);
            callback(payload);
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription to ${table} (${event}): ${status}`);
        });
      
      // Store the channel reference for future management
      this.channels[channelId] = channel;
    } catch (error) {
      console.error(`Error setting up realtime subscription for ${table}:`, error);
    }
    
    return [channelId];
  }
  
  /**
   * Subscribe to multiple tables at once
   */
  subscribeToTables(
    tables: string[],
    event: EventType = '*',
    callback: SubscriptionCallback
  ): string[] {
    const ids: string[] = [];
    
    try {
      tables.forEach(table => {
        const tableIds = this.subscribeToTable(table, event, callback);
        ids.push(...tableIds);
      });
    } catch (error) {
      console.error("Error subscribing to tables:", error);
    }
    
    return ids;
  }
  
  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelId: string): void {
    if (this.channels[channelId]) {
      try {
        console.log(`Unsubscribing from channel: ${channelId}`);
        supabase.removeChannel(this.channels[channelId]);
        delete this.channels[channelId];
      } catch (error) {
        console.error(`Error unsubscribing from channel ${channelId}:`, error);
      }
    }
  }
  
  /**
   * Unsubscribe from multiple channels
   */
  unsubscribeAll(channelIds: string[]): void {
    channelIds.forEach(id => this.unsubscribe(id));
  }
  
  /**
   * Close all active channels
   */
  closeAll(): void {
    Object.keys(this.channels).forEach(id => this.unsubscribe(id));
  }
}

export const realtimeService = new RealtimeService();
