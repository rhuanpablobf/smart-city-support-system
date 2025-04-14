import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/types';
import { realtimeService } from '@/services/realtime/realtimeService';
import { useToast } from '@/components/ui/use-toast';

interface ActiveChatStateProps {
  conversationId: string;
}

const ActiveChatState: React.FC<ActiveChatStateProps> = ({ conversationId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Função para rolar automaticamente para a mensagem mais recente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carregar mensagens iniciais
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
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
        toast({
          title: "Erro ao carregar mensagens",
          description: "Não foi possível carregar o histórico de mensagens",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Configurar inscrição em tempo real para novas mensagens
    const subscriptionIds = realtimeService.subscribeToTable('messages', 'INSERT', (payload) => {
      // Check if payload has the new property and it matches our conversation_id
      if (payload.new && 
          'conversation_id' in payload.new && 
          payload.new.conversation_id === conversationId) {
        
        const newMsg: ChatMessage = {
          id: payload.new.id as string,
          content: payload.new.content as string,
          type: payload.new.sender_type as "bot" | "agent" | "user", 
          sender_id: payload.new.sender_id as string,
          timestamp: payload.new.timestamp as string,
          conversation_id: payload.new.conversation_id as string,
          read: payload.new.read as boolean,
        };
        
        // Se a mensagem é de um agente, mostrar indicador de digitação
        if (newMsg.type === 'agent') {
          setIsTyping(false);
        }
        
        setMessages(prev => [...prev, newMsg]);
        setTimeout(scrollToBottom, 100);
      }
    });
    
    // Inscrição para atualizações de conversa (quando um agente aceita o atendimento)
    const conversationSubscriptionIds = realtimeService.subscribeToTable('conversations', 'UPDATE', (payload) => {
      if (payload.new && 
          'id' in payload.new && 
          payload.new.id === conversationId &&
          'status' in payload.new &&
          payload.new.status === 'active') {
            
        // Se o agente aceitou o atendimento, exibir mensagem
        toast({
          title: "Atendimento iniciado!",
          description: "Um agente está atendendo você agora.",
        });
        
        // Adicionar mensagem de sistema
        const systemMsg: ChatMessage = {
          id: `system-${Date.now()}`,
          content: "Um agente iniciou o atendimento. Aguarde a resposta.",
          type: "bot",
          sender_id: "system",
          timestamp: new Date().toISOString(),
          conversation_id: conversationId,
          read: false,
        };
        
        setMessages(prev => [...prev, systemMsg]);
        setTimeout(scrollToBottom, 100);
      }
    });

    return () => {
      // Garantir que estamos desinscrever corretamente
      realtimeService.unsubscribeAll([...subscriptionIds, ...conversationSubscriptionIds]);
    };
  }, [conversationId, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      // Mostrar indicador de digitação para agente
      if (messages.some(m => m.type === 'agent')) {
        setIsTyping(true);
      }
      
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            content: newMessage,
            sender_type: 'user',
            sender_id: 'client',
            timestamp: new Date().toISOString(),
          }
        ]);

      if (error) throw error;
      
      setNewMessage('');
      // O scroll acontecerá quando recebermos a mensagem via realtime 
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
      setIsTyping(false);
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
              {message.type !== 'user' && (
                <p className="text-xs text-gray-500 mb-1">
                  {message.type === 'agent' ? 'Atendente' : 'Sistema'}
                </p>
              )}
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
        
        {isTyping && (
          <div className="mr-auto bg-chatbot-message-received rounded-lg p-3 max-w-[80%]">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
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
