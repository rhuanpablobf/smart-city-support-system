
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type SubscriptionCallback = (payload: RealtimePostgresChangesPayload<any>) => void;
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
  ): string {
    const channelId = `${table}-${event}-${Date.now()}`;
    
    // First create the channel
    const channel = supabase.channel(channelId);
    
    // Then configure the channel to listen for postgres changes
    // This is the correct order to avoid TypeScript errors
    channel.on(
      'postgres_changes',
      {
        event, 
        schema: 'public',
        table
      },
      callback
    );
    
    // Finally subscribe to the channel
    channel.subscribe();
    
    // Store the channel reference for later unsubscription
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
