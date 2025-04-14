
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Define uma tipagem mais precisa para o payload baseado no que o Supabase retorna
type PostgresChangesPayload = RealtimePostgresChangesPayload<{
  [key: string]: any;
}> & {
  // Adicionamos um campo eventType para compatibilidade
  eventType?: string;
  table?: string;
};

type SubscriptionCallback = (payload: PostgresChangesPayload) => void;
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

class RealtimeService {
  private channels: Record<string, RealtimeChannel> = {};
  
  /**
   * Inscreve-se em atualizações em tempo real para uma tabela específica
   */
  subscribeToTable(
    table: string, 
    event: EventType = '*', 
    callback: SubscriptionCallback
  ): string[] {
    const channelId = `${table}-${event}-${Date.now()}`;
    
    console.log(`Setting up realtime subscription for ${table} (${event})`);
    
    try {
      // Cria o canal com a sintaxe correta para o Supabase v2
      const channel = supabase.channel(channelId);
      
      // Inscreve-se nas mudanças do postgres com a sintaxe API correta
      // Use type assertion para evitar o erro de tipo
      channel
        .on(
          'postgres_changes' as any,
          { 
            event, 
            schema: 'public',
            table
          },
          (payload) => {
            console.log(`Realtime update for ${table} (${event}):`, payload.eventType || event);
            
            // Converte o payload para nosso formato esperado
            const processedPayload: PostgresChangesPayload = {
              ...payload,
              eventType: payload.eventType || event,
              table
            };
            
            callback(processedPayload);
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription to ${table} (${event}): ${status}`);
        });
      
      // Armazena a referência do canal para gerenciamento futuro
      this.channels[channelId] = channel;
    } catch (error) {
      console.error(`Error setting up realtime subscription for ${table}:`, error);
    }
    
    return [channelId];
  }
  
  /**
   * Inscreve-se em múltiplas tabelas de uma só vez
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
   * Cancela a inscrição de um canal específico
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
   * Cancela a inscrição de múltiplos canais
   */
  unsubscribeAll(channelIds: string[]): void {
    channelIds.forEach(id => this.unsubscribe(id));
  }
  
  /**
   * Fecha todos os canais ativos
   */
  closeAll(): void {
    Object.keys(this.channels).forEach(id => this.unsubscribe(id));
  }
}

export const realtimeService = new RealtimeService();
