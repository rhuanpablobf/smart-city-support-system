
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload, PostgresChangesFilter } from '@supabase/supabase-js';

type SubscriptionCallback = (payload: RealtimePostgresChangesPayload<any>) => void;
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/**
 * Helper function to create a properly typed Postgres changes channel
 */
function createPostgresChannel(channelId: string): RealtimeChannel<'postgres_changes'> {
  return supabase.channel(channelId) as RealtimeChannel<'postgres_changes'>;
}

class RealtimeService {
  private channels: Record<string, RealtimeChannel> = {};
  
  /**
   * Subscribe to real-time updates for a specific table
   */
  subscribeToTable(
    table: string, 
    event: EventType = '*', 
    callback: SubscriptionCallback
  ): string {
    const channelId = `${table}-${event}-${Date.now()}`;
    
    // Create the channel with the correct typing for Postgres changes
    const channel = createPostgresChannel(channelId);
    
    // Configure the listener for Postgres changes with the proper syntax and typing
    channel
      .on(
        'postgres_changes',
        {
          event, 
          schema: 'public',
          table
        } as PostgresChangesFilter,
        callback
      )
      .subscribe((status) => {
        console.log(`Realtime subscription to ${table} (${event}): ${status}`);
      });
    
    // Store the channel reference for future management
    this.channels[channelId] = channel;
    
    return channelId;
  }
  
  /**
   * Subscribe to multiple tables at once
   */
  subscribeToTables(
    tables: string[],
    event: EventType = '*',
    callback: SubscriptionCallback
  ): string[] {
    return tables.map(table => this.subscribeToTable(table, event, callback));
  }
  
  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelId: string): void {
    if (this.channels[channelId]) {
      supabase.removeChannel(this.channels[channelId]);
      delete this.channels[channelId];
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
