
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface QAItem {
  id: string;
  question: string;
  answer: string;
  service_id: string;
  created_at: string;
  updated_at: string;
  has_image: boolean;
  image_url: string;
  has_link: boolean;
  link_url: string;
  link_text: string;
  category_id?: string; // Make this optional since it might not exist in all records
}

interface Category {
  id: string;
  name: string;
}

interface ServiceInfo {
  name: string;
  department?: {
    name: string;
  };
}

export const useFAQData = (conversationId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [qaItems, setQAItems] = useState<QAItem[]>([]);
  const [allQAItems, setAllQAItems] = useState<QAItem[]>([]);
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Primeiro, obter o service_id da conversa
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select('service_id')
          .eq('id', conversationId)
          .single();

        if (conversationError) throw conversationError;

        const serviceId = conversationData?.service_id;
        if (!serviceId) {
          throw new Error("Service ID não encontrado para esta conversa");
        }

        // Buscar informações do serviço
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('name, departments(name)')
          .eq('id', serviceId)
          .single();

        if (serviceError) throw serviceError;
        setServiceInfo(serviceData);

        // Buscar perguntas e respostas para este serviço
        const { data: qaData, error: qaError } = await supabase
          .from('qa_items')
          .select('*')
          .eq('service_id', serviceId);

        if (qaError) throw qaError;
        setAllQAItems(qaData || []);
        setQAItems(qaData || []);

        // Buscar categorias relacionadas a este serviço
        const { data: categoryData, error: categoryError } = await supabase
          .from('qa_categories')
          .select('id, name')
          .eq('service_id', serviceId);

        if (categoryError) throw categoryError;
        setCategories(categoryData || []);

      } catch (error) {
        console.error('Erro ao carregar dados de FAQ:', error);
        toast({
          title: "Erro ao carregar FAQ",
          description: "Não foi possível carregar as perguntas frequentes.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [conversationId, toast]);

  // Filtrar QA items com base na busca e categoria
  useEffect(() => {
    if (!allQAItems.length) return;

    let filtered = [...allQAItems];

    // Aplicar filtro de busca
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(lowerCaseQuery) || 
        item.answer.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Aplicar filtro de categoria
    if (selectedCategory) {
      filtered = filtered.filter(item => 
        item.category_id === selectedCategory
      );
    }

    setQAItems(filtered);
  }, [searchQuery, selectedCategory, allQAItems]);

  return {
    loading,
    qaItems,
    serviceInfo,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories
  };
};
