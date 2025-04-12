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

  useEffect(() => {
    // Fetch departments
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*');

        if (error) throw error;
        setDepartments(data);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar departamentos",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    // Fetch services
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*');

        if (error) throw error;
        setServices(data);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar serviços",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchDepartments();
    fetchServices();
  }, [toast]);

  // Function to start a new conversation
  const startConversation = async (departmentId: string, serviceId: string, cpf: string) => {
    setLoading(true);
    try {
      // Generate a random user ID if the user is not logged in
      const userId = crypto.randomUUID();
      
      // Create a new conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_cpf: cpf,
          user_id: userId, // Add user_id field
          department_id: departmentId,
          service_id: serviceId,
          status: 'bot'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Redirect to the chat page with the new conversation ID
      navigate(`/chat?conversationId=${conversation.id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao iniciar conversa",
        description: error.message,
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
                    onChange={(e) => setCpf(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Label htmlFor="department">Departamento</Label>
                  <Select onValueChange={setSelectedDepartment}>
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
                  <Select onValueChange={setSelectedService}>
                    <SelectTrigger className="mt-1 w-full rounded-md border border-gray-200 px-5 py-3 text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-blue-300">
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Button
                    disabled={loading || !selectedDepartment || !selectedService || !cpf}
                    className="bg-blue-500 text-white rounded-md px-5 py-3 w-full disabled:bg-gray-400"
                    onClick={() => startConversation(selectedDepartment, selectedService, cpf)}
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
