
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientChat = () => {
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Carrega departamentos quando o componente monta
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*');

        if (error) throw error;
        setDepartments(data || []);
      } catch (error) {
        console.error("Erro ao carregar departamentos:", error);
        toast({
          title: "Erro ao carregar departamentos",
          description: "Não foi possível carregar os departamentos.",
          variant: "destructive",
        });
      }
    };

    fetchDepartments();
  }, [toast]);

  // Quando o departamento muda, atualiza os serviços disponíveis
  useEffect(() => {
    if (selectedDepartment) {
      const fetchServicesForDepartment = async () => {
        try {
          const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('department_id', selectedDepartment);

          if (error) throw error;
          setServices(data || []);
        } catch (error) {
          console.error("Erro ao carregar serviços:", error);
          toast({
            title: "Erro ao carregar serviços",
            description: "Não foi possível carregar os serviços para este departamento.",
            variant: "destructive",
          });
        }
      };

      fetchServicesForDepartment();
    } else {
      setServices([]);
    }
  }, [selectedDepartment, toast]);

  // Função para formatar CPF
  const formatCPF = (value) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    // Limita a 14 caracteres (XXX.XXX.XXX-XX)
    if (formatted.length <= 14) {
      setCpf(formatted);
    }
  };

  // Function to start a new conversation
  const startConversation = async () => {
    if (!selectedDepartment || !selectedService || !cpf) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos para iniciar o atendimento.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Generate a random user ID for anonymous users
      const userId = crypto.randomUUID();
      
      // Create a new conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_cpf: cpf,
          user_id: userId,
          department_id: selectedDepartment,
          service_id: selectedService,
          status: 'bot'
        })
        .select()
        .single();

      if (error) {
        console.error("Detalhes do erro:", error);
        throw error;
      }
      
      console.log("Conversa criada com sucesso:", conversation);
      
      // Redirect to the chat page with the new conversation ID
      navigate(`/chat?conversationId=${conversation.id}`);
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error);
      toast({
        title: "Erro ao iniciar conversa",
        description: "Não foi possível iniciar a conversa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">Iniciar Atendimento</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="relative">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    className="peer mt-1 w-full rounded-md border border-gray-200 px-5 py-3 text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-blue-300"
                    value={cpf}
                    onChange={handleCPFChange}
                    maxLength={14}
                  />
                </div>
                <div className="relative">
                  <Label htmlFor="department">Departamento</Label>
                  <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                    <SelectTrigger className="mt-1 w-full rounded-md border border-gray-200 px-5 py-3 text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-blue-300">
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Label htmlFor="service">Serviço</Label>
                  <Select onValueChange={setSelectedService} value={selectedService} disabled={!selectedDepartment || services.length === 0}>
                    <SelectTrigger className="mt-1 w-full rounded-md border border-gray-200 px-5 py-3 text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-blue-300">
                      <SelectValue placeholder={!selectedDepartment ? "Selecione um departamento primeiro" : "Selecione um serviço"} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDepartment && services.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Nenhum serviço disponível para este departamento.
                    </p>
                  )}
                </div>
                <div className="relative">
                  <Button
                    disabled={loading || !selectedDepartment || !selectedService || !cpf}
                    className="bg-blue-500 text-white rounded-md px-5 py-3 w-full disabled:bg-gray-400"
                    onClick={startConversation}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando...
                      </>
                    ) : (
                      "Iniciar Conversa"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientChat;
