
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
  ): string[] {
    const channelId = `${table}-${event}-${Date.now()}`;
    
    // Create the channel with the correct syntax for Supabase v2
    const channel = supabase.channel(channelId);
    
    // Use type assertion to fix the TypeScript error with postgres_changes
    // This is necessary because the TypeScript definitions in supabase-js don't fully
    // capture the runtime behavior of the Realtime API
    (channel as any)
      .on(
        'postgres_changes',
        {
          event, 
          schema: 'public',
          table
        },
        callback
      )
      .subscribe((status: string) => {
        console.log(`Realtime subscription to ${table} (${event}): ${status}`);
      });
    
    // Store the channel reference for future management
    this.channels[channelId] = channel;
    
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
    tables.forEach(table => {
      ids.push(...this.subscribeToTable(table, event, callback));
    });
    return ids;
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
