
import { supabase } from '@/integrations/supabase/client';

interface PayloadEvent {
  schema: string;
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  new: any;
  old: any;
}

type EventCallback = (payload: PayloadEvent) => void;

export const realtimeService = {
  /**
   * Subscribe to changes on specific tables
   * @param tables Array of table names to subscribe to
   * @param event Type of event to subscribe to ('INSERT', 'UPDATE', 'DELETE', '*')
   * @param callback Function to call when event happens
   * @returns Array of channel IDs to be used for unsubscribing
   */
  subscribeToTables: (
    tables: string[],
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: EventCallback
  ): string[] => {
    const channelIds: string[] = [];

    tables.forEach((tableName) => {
      const channel = supabase
        .channel(`table:${tableName}`)
        .on(
          'postgres_changes',
          {
            event: event,
            schema: 'public',
            table: tableName
          },
          (payload) => {
            console.log(`Realtime update for ${tableName}:`, payload);
            callback(payload as unknown as PayloadEvent);
          }
        )
        .subscribe();

      channelIds.push(channel.topic);
    });

    return channelIds;
  },

  /**
   * Unsubscribe from all channels
   * @param channelIds Array of channel IDs to unsubscribe from
   */
  unsubscribeAll: (channelIds: string[]) => {
    channelIds.forEach((id) => {
      supabase.removeChannel(
        supabase.getChannels().find((c) => c.topic === id)!
      );
    });
  }
};
