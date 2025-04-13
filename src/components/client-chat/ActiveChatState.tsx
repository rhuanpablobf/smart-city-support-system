
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/types';
import { realtimeService } from '@/services/realtime/realtimeService';

interface ActiveChatStateProps {
  conversationId: string;
}

const ActiveChatState: React.FC<ActiveChatStateProps> = ({ conversationId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Função para rolar automaticamente para a mensagem mais recente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carregar mensagens iniciais
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: true });

        if (error) throw error;
        
        // Mapear os dados da API para o formato ChatMessage
        const formattedMessages: ChatMessage[] = data.map(msg => ({
          id: msg.id,
          content: msg.content,
          type: msg.sender_type, // Converter sender_type para type 
          sender_id: msg.sender_id,
          timestamp: msg.timestamp,
          conversation_id: msg.conversation_id,
          read: msg.read,
        }));
        
        setMessages(formattedMessages);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    };

    fetchMessages();

    // Configurar inscrição em tempo real para novas mensagens
    const channelIds: string[] = realtimeService.subscribeToTable('messages', 'INSERT', (payload) => {
      if (payload.new && payload.new.conversation_id === conversationId) {
        const newMsg: ChatMessage = {
          id: payload.new.id,
          content: payload.new.content,
          type: payload.new.sender_type, // Converter sender_type para type
          sender_id: payload.new.sender_id,
          timestamp: payload.new.timestamp,
          conversation_id: payload.new.conversation_id,
          read: payload.new.read,
        };
        
        setMessages(prev => [...prev, newMsg]);
        setTimeout(scrollToBottom, 100);
      }
    });

    return () => {
      if (channelIds.length > 0) {
        realtimeService.unsubscribeAll(channelIds);
      }
    };
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            content: newMessage,
            sender_type: 'user',
            sender_id: 'client', // Poderia ser o ID do usuário se autenticado
            timestamp: new Date().toISOString(),
          }
        ]);

      if (error) throw error;
      
      setNewMessage('');
      // O scroll acontecerá quando recebermos a mensagem via realtime 
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-chatbot-bg">
      {/* Área de mensagens */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[80%] ${
                message.type === 'user'
                  ? 'ml-auto bg-chatbot-message-sent rounded-t-lg rounded-bl-lg'
                  : 'mr-auto bg-chatbot-message-received rounded-t-lg rounded-br-lg'
              } p-3 shadow-sm`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 my-8">
            Inicie a conversa enviando uma mensagem.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Entrada de mensagem */}
      <div className="p-4 bg-white border-t flex items-end gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          className="flex-1 resize-none"
          disabled={loading}
        />
        <Button 
          size="icon" 
          onClick={handleSendMessage} 
          disabled={!newMessage.trim() || loading}
          className="bg-chatbot-primary hover:bg-chatbot-dark"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ActiveChatState;
