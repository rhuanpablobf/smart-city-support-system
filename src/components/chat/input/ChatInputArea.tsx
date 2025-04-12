
import React, { useState, useRef } from 'react';
import { Conversation } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send, Smile, Loader2 } from 'lucide-react';

interface ChatInputAreaProps {
  conversation: Conversation;
  loading: boolean;
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
}

const ChatInputArea = ({ conversation, loading, onSendMessage }: ChatInputAreaProps) => {
  const [messageText, setMessageText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    onSendMessage(messageText);
    setMessageText('');
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In a real app, you would upload the file and send it
      onSendMessage(`Arquivo enviado: ${files[0].name}`);
    }
  };

  return (
    <div className="bg-white border-t p-3">
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          disabled={loading || conversation.status === 'closed'}
          onClick={handleFileUpload}
          className="h-9 w-9"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          disabled={loading || conversation.status === 'closed'}
          className="h-9 w-9"
        >
          <Smile className="h-5 w-5" />
        </Button>
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={loading || conversation.status === 'closed'}
          className="flex-1 h-9"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={loading || !messageText.trim() || conversation.status === 'closed'}
          className="bg-chatbot-primary hover:bg-chatbot-dark h-9 w-9"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </form>
    </div>
  );
};

export default ChatInputArea;
