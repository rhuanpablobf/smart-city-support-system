
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { QAItem } from '@/types';

// Export these interfaces for components to use
export interface ServiceInfo {
  id: string;
  name: string;
  department: string;
}

export interface Category {
  id: string;
  name: string;
}

export const useFAQData = (serviceId: string | null, conversationId: string | null) => {
  const [qaItems, setQAItems] = useState<QAItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  // Load FAQ items for a specific service
  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) {
        // If we don't have a serviceId, try to get it from the conversation
        if (conversationId) {
          try {
            const { data: conversationData, error: conversationError } = await supabase
              .from('conversations')
              .select(`
                service_id,
                services(
                  id,
                  name,
                  departments(name)
                )
              `)
              .eq('id', conversationId)
              .single();

            if (conversationError) throw conversationError;

            if (conversationData && conversationData.service_id) {
              loadFAQItems(conversationData.service_id);
              
              // Set service info
              if (conversationData.services) {
                setServiceInfo({
                  id: conversationData.services.id,
                  name: conversationData.services.name,
                  department: conversationData.services.departments?.name || 'Desconhecido'
                });
              }
            } else {
              setError('Não foi possível encontrar o serviço para este atendimento.');
              setLoading(false);
            }
          } catch (error) {
            console.error('Error fetching conversation data:', error);
            setError('Erro ao carregar dados da conversa.');
            setLoading(false);
          }
        } else {
          setLoading(false);
          setError('Nenhum serviço ou conversa especificado.');
        }
        return;
      }

      loadFAQItems(serviceId);
      
      // Load service info directly if we have serviceId
      try {
        const { data, error } = await supabase
          .from('services')
          .select(`
            id,
            name,
            departments(name)
          `)
          .eq('id', serviceId)
          .single();

        if (error) throw error;
        
        if (data) {
          setServiceInfo({
            id: data.id,
            name: data.name,
            department: data.departments?.name || 'Desconhecido'
          });
        }
      } catch (error) {
        console.error('Error loading service info:', error);
      }
    };

    fetchData();
  }, [serviceId, conversationId]);

  // Example hardcoded categories since qa_categories doesn't exist in the database
  useEffect(() => {
    // Let's provide some default categories
    const defaultCategories: Category[] = [
      { id: 'general', name: 'Geral' },
      { id: 'services', name: 'Serviços' },
      { id: 'documents', name: 'Documentos' },
      { id: 'schedule', name: 'Agendamentos' }
    ];
    
    setCategories(defaultCategories);
  }, []);

  // Filter QA items when search or category changes
  useEffect(() => {
    if (qaItems.length === 0) {
      setFilteredItems([]);
      return;
    }

    let results = [...qaItems];
    
    // Apply category filter if selected
    if (selectedCategory) {
      // This is a simplified example without actual category data
      // In a real implementation, QA items would have a category field
      results = results.filter(item => 
        // Simulate category filtering based on question content
        item.question.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    // Apply search filter if search term exists
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      results = results.filter(item =>
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term)
      );
    }
    
    setFilteredItems(results);
  }, [qaItems, searchTerm, selectedCategory]);

  const loadFAQItems = async (serviceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('qa_items')
        .select('*')
        .eq('service_id', serviceId);
        
      if (error) throw error;
      
      setQAItems(data || []);
      setFilteredItems(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading FAQ items:', error);
      setError('Erro ao carregar perguntas frequentes.');
      setLoading(false);
    }
  };

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  return {
    qaItems: filteredItems,
    loading,
    error,
    serviceInfo,
    searchTerm,
    handleSearchChange,
    categories,
    selectedCategory,
    handleCategoryChange
  };
};
