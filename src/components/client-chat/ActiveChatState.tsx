
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { realtimeService } from '@/services/realtime/realtimeService';

interface ActiveChatStateProps {
  conversation: any;
}

const ActiveChatState: React.FC<ActiveChatStateProps> = ({ conversation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscriptionIds, setSubscriptionIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('timestamp', { ascending: true });
          
        if (error) throw error;
        
        // Convert sender_type to type for each message to match ChatMessage interface
        const formattedMessages: ChatMessage[] = (data || []).map(message => ({
          ...message,
          type: message.sender_type // Map sender_type to type
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Erro ao carregar mensagens",
          description: "Não foi possível carregar as mensagens anteriores.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (conversation?.id) {
      fetchMessages();
    }
  }, [conversation?.id, toast]);

  // Setup real-time updates
  useEffect(() => {
    if (!conversation?.id) return;

    const ids = realtimeService.subscribeToTable(
      'messages', 
      'INSERT', 
      (payload) => {
        if (payload.new && payload.new.conversation_id === conversation.id) {
          // Convert sender_type to type for new messages
          const newMessage = {
            ...payload.new,
            type: payload.new.sender_type
          } as ChatMessage;
          
          setMessages(prevMessages => [...prevMessages, newMessage]);
        }
      }
    );

    setSubscriptionIds(ids ? [ids] : []);

    return () => {
      if (subscriptionIds.length > 0) {
        realtimeService.unsubscribeAll(subscriptionIds);
      }
    };
  }, [conversation?.id]);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversation?.id) return;

    setLoading(true);
    try {
      // Send message to the database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          content: messageText,
          sender_id: conversation.id, // Using conversation id as user id for now
          sender_type: 'user'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Clear input
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center border-b">
        <MessageCircle className="h-5 w-5 text-green-500 mr-3" />
        <div>
          <h2 className="font-medium text-gray-900">Atendimento em andamento</h2>
          <p className="text-sm text-gray-500">
            {conversation?.departments?.name} - {conversation?.services?.name}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-chatbot-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user' 
                    ? 'bg-blue-100 text-gray-800' 
                    : message.type === 'bot' 
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-green-100 text-gray-800'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div className="text-xs mt-1 opacity-70">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-3">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            disabled={loading}
            onClick={handleFileUpload}
            className="h-9 w-9"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            className="flex-1 h-9"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !messageText.trim()}
            className="bg-chatbot-primary hover:bg-chatbot-dark h-9 w-9"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ActiveChatState;
