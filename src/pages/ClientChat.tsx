
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Send, User, Loader2, ArrowLeft, Smile, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Componente de mensagem
interface MessageProps {
  content: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

const Message = ({ content, sender, timestamp }: MessageProps) => {
  const isBot = sender === 'bot';
  
  return (
    <div className={cn(
      "flex items-end gap-2 max-w-[80%] mb-4",
      isBot ? "mr-auto" : "ml-auto"
    )}>
      {isBot && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-purple-100 text-purple-800">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "rounded-lg p-3 text-sm",
        isBot ? "bg-gray-100 text-gray-800" : "bg-blue-500 text-white"
      )}>
        <div>{content}</div>
        <div className="text-xs mt-1 opacity-70">
          {format(timestamp, 'p', { locale: ptBR })}
        </div>
      </div>
    </div>
  );
};

const ClientChat = () => {
  // Estados
  const [step, setStep] = useState<'initial' | 'cpf' | 'department' | 'service' | 'chat'>('initial');
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [userCpf, setUserCpf] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Rolar para a última mensagem quando novas mensagens são adicionadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Carregar departamentos disponíveis
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setDepartments(data || []);
      } catch (error) {
        console.error("Erro ao carregar departamentos:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os departamentos. Tente novamente.",
          variant: "destructive"
        });
      }
    };
    
    fetchDepartments();
  }, [toast]);
  
  // Carregar serviços quando um departamento é selecionado
  useEffect(() => {
    const fetchServices = async () => {
      if (!departmentId) return;
      
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('department_id', departmentId)
          .order('name');
          
        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os serviços. Tente novamente.",
          variant: "destructive"
        });
      }
    };
    
    fetchServices();
  }, [departmentId, toast]);
  
  // Iniciar conversa com o sistema
  const startConversation = async () => {
    try {
      setLoading(true);
      
      // Criar nova conversa no banco de dados
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_cpf: userCpf,
          department_id: departmentId,
          service_id: serviceId,
          status: 'bot'
        })
        .select()
        .single();
        
      if (convError) throw convError;
      
      setConversationId(conversation.id);
      
      // Adicionar primeira mensagem do bot
      const welcomeMessage = `Olá! Bem-vindo ao sistema de atendimento da Prefeitura. Como posso ajudar com o serviço selecionado?`;
      
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          content: welcomeMessage,
          sender_id: 'system',
          sender_type: 'bot'
        })
        .select()
        .single();
        
      if (msgError) throw msgError;
      
      // Adicionar à lista local de mensagens
      setMessages([
        {
          content: welcomeMessage,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
      
      setStep('chat');
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error);
      toast({
        title: "Erro ao iniciar conversa",
        description: "Não foi possível iniciar a conversa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Enviar mensagem
  const sendMessage = async () => {
    if (!messageInput.trim() || !conversationId) return;
    
    try {
      setLoading(true);
      
      const content = messageInput.trim();
      setMessageInput('');
      
      // Adicionar mensagem à lista local imediatamente
      setMessages(prev => [
        ...prev, 
        {
          content,
          sender: 'user',
          timestamp: new Date()
        }
      ]);
      
      // Enviar mensagem para o banco de dados
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          sender_id: userCpf,
          sender_type: 'user'
        })
        .select()
        .single();
        
      if (msgError) throw msgError;
      
      // Simular resposta do bot (em um sistema real, isso seria processado pelo backend)
      setTimeout(async () => {
        const botResponse = "Obrigado pela sua mensagem. Um atendente está analisando sua solicitação e em breve irá atendê-lo.";
        
        // Armazenar resposta do bot no banco de dados
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            content: botResponse,
            sender_id: 'system',
            sender_type: 'bot'
          });
          
        // Adicionar resposta do bot à lista local
        setMessages(prev => [
          ...prev,
          {
            content: botResponse,
            sender: 'bot',
            timestamp: new Date()
          }
        ]);
        
        // Mudar status da conversa para "aguardando atendente"
        await supabase
          .from('conversations')
          .update({
            status: 'waiting'
          })
          .eq('id', conversationId);
          
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  
  // Validação do CPF
  const isValidCPF = (cpf: string) => {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return cpfRegex.test(cpf);
  };
  
  // Iniciar o processo de atendimento
  const handleStart = () => {
    setStep('cpf');
    setMessages([
      {
        content: "Olá! Para iniciarmos o atendimento, por favor, informe seu CPF no formato 000.000.000-00",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };
  
  // Processar CPF e avançar
  const handleCPFSubmit = () => {
    if (!isValidCPF(userCpf)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, digite um CPF válido no formato 000.000.000-00",
        variant: "destructive"
      });
      return;
    }
    
    setStep('department');
    setMessages(prev => [
      ...prev,
      {
        content: userCpf,
        sender: 'user',
        timestamp: new Date()
      },
      {
        content: "Obrigado! Agora, selecione o departamento para o seu atendimento:",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };
  
  // Processar departamento e avançar
  const handleDepartmentSelect = (value: string) => {
    setDepartmentId(value);
    
    const selectedDept = departments.find(d => d.id === value);
    
    setStep('service');
    setMessages(prev => [
      ...prev,
      {
        content: `Departamento: ${selectedDept?.name}`,
        sender: 'user',
        timestamp: new Date()
      },
      {
        content: "Ótimo! Agora, selecione o serviço desejado:",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };
  
  // Processar serviço e iniciar conversa
  const handleServiceSelect = (value: string) => {
    setServiceId(value);
    
    const selectedService = services.find(s => s.id === value);
    
    setMessages(prev => [
      ...prev,
      {
        content: `Serviço: ${selectedService?.name}`,
        sender: 'user',
        timestamp: new Date()
      }
    ]);
    
    // Iniciar conversa no banco de dados
    startConversation();
  };
  
  // Lidar com o envio de formulários
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (step) {
      case 'cpf':
        handleCPFSubmit();
        break;
      case 'chat':
        sendMessage();
        break;
    }
  };
  
  // Renderizar a interface de acordo com o passo atual
  const renderStepContent = () => {
    switch (step) {
      case 'initial':
        return (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <h2 className="text-2xl font-bold">Bem-vindo ao Atendimento</h2>
            <p className="text-center text-gray-600">
              Converse com nossos atendentes para resolver suas dúvidas e solicitações.
            </p>
            <Button 
              onClick={handleStart} 
              size="lg" 
              className="mt-4"
            >
              Iniciar Atendimento
            </Button>
          </div>
        );
        
      case 'cpf':
      case 'chat':
        return (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  content={message.content}
                  sender={message.sender}
                  timestamp={message.timestamp}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <CardFooter className="border-t p-4">
              <form onSubmit={handleFormSubmit} className="flex w-full gap-2">
                {step === 'cpf' ? (
                  <>
                    <Input
                      value={userCpf}
                      onChange={(e) => setUserCpf(e.target.value)}
                      placeholder="Digite seu CPF (000.000.000-00)"
                      className="flex-1"
                      disabled={loading}
                    />
                    <Button 
                      type="submit" 
                      disabled={loading || !userCpf}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Avançar"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      disabled={loading}
                      className="h-9 w-9"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      disabled={loading}
                      className="h-9 w-9"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="flex-1"
                      disabled={loading}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={loading || !messageInput.trim()}
                      className="bg-blue-500 hover:bg-blue-600 h-9 w-9"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </>
                )}
              </form>
            </CardFooter>
          </>
        );
        
      case 'department':
        return (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  content={message.content}
                  sender={message.sender}
                  timestamp={message.timestamp}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <CardFooter className="border-t p-4">
              <div className="w-full">
                <Select onValueChange={handleDepartmentSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardFooter>
          </>
        );
        
      case 'service':
        return (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  content={message.content}
                  sender={message.sender}
                  timestamp={message.timestamp}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <CardFooter className="border-t p-4">
              <div className="w-full">
                <Select onValueChange={handleServiceSelect} disabled={loading || services.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loading ? "Carregando serviços..." : 
                      services.length === 0 ? "Nenhum serviço disponível" : 
                      "Selecione o serviço"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loading && <p className="text-xs mt-1 text-center">Preparando seu atendimento...</p>}
              </div>
            </CardFooter>
          </>
        );
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center">
            {step !== 'initial' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 h-8 w-8"
                onClick={() => {
                  if (step === 'cpf') {
                    setStep('initial');
                    setMessages([]);
                  }
                }}
                disabled={step !== 'cpf'}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <CardTitle>Atendimento ao Cidadão</CardTitle>
              <CardDescription>Prefeitura Municipal</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        {renderStepContent()}
      </Card>
    </div>
  );
};

export default ClientChat;
