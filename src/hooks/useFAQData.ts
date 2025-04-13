
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  has_link: boolean;
  link_url?: string;
  link_text?: string;
  has_image: boolean;
  image_url?: string;
  category_id?: string;
}

export interface ServiceInfo {
  name: string;
  department: string;
}

export interface Category {
  id: string;
  name: string;
}

export const useFAQData = (conversationId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  // Fetch FAQ data
  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!conversationId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch conversation details
        const { data: conversation, error: conversationError } = await supabase
          .from('conversations')
          .select(`
            service_id,
            department_id,
            services(name),
            departments(name)
          `)
          .eq('id', conversationId)
          .single();

        if (conversationError) {
          throw conversationError;
        }

        if (conversation && conversation.service_id) {
          setServiceInfo({
            name: conversation.services?.name || 'Serviço',
            department: conversation.departments?.name || 'Departamento'
          });

          // Fetch QA items for the service
          const { data: qaData, error: qaError } = await supabase
            .from('qa_items')
            .select('*')
            .eq('service_id', conversation.service_id);

          if (qaError) {
            throw qaError;
          }

          console.log("QA items carregados:", qaData?.length || 0);
          setQaItems(qaData || []);

          // Extract unique categories from QA items (if they have category_id)
          // In a real implementation, you would have a separate categories table
          // This is a simplified version for demo purposes
          const uniqueCategories = [...new Set(
            (qaData || [])
              .filter(item => item.category_id)
              .map(item => item.category_id)
          )];
          
          // For this demo, we'll create category names based on IDs
          // In a real app, you would fetch this from the database
          setCategories(
            uniqueCategories.map(id => ({
              id: id || '',
              name: `Categoria ${id?.substring(0, 5)}` || 'Sem categoria'
            }))
          );
        }
      } catch (error) {
        console.error("Erro ao carregar perguntas frequentes:", error);
        toast({
          title: "Erro ao carregar informações",
          description: "Não foi possível carregar as perguntas frequentes. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversationDetails();
  }, [conversationId, toast]);

  // Filter QA items based on search query and selected category
  const filteredQAItems = useMemo(() => {
    return qaItems.filter(item => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = selectedCategory === null || item.category_id === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [qaItems, searchQuery, selectedCategory]);

  return { 
    loading, 
    qaItems: filteredQAItems,
    serviceInfo,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories
  };
};
