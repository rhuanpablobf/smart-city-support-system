
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFAQData } from '@/hooks/useFAQData';
import { useAgentTransfer } from '@/hooks/useAgentTransfer';
import LoadingState from '@/components/faq/LoadingState';
import ErrorState from '@/components/faq/ErrorState';
import EmptyState from '@/components/faq/EmptyState';
import QAList from '@/components/faq/QAList';
import FAQHeader from '@/components/faq/FAQHeader';
import AgentTransferButton from '@/components/faq/AgentTransferButton';
import SearchBar from '@/components/faq/SearchBar';
import CategoryFilter from '@/components/faq/CategoryFilter';

const FAQ = () => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  
  // Usar hooks personalizados para gerenciar o estado e as chamadas de API
  const { 
    loading, 
    qaItems,
    error,
    serviceInfo,
    searchTerm,
    handleSearchChange,
    categories,
    selectedCategory,
    handleCategoryChange
  } = useFAQData(conversationId);
  
  const { transferLoading, transferToAgent } = useAgentTransfer(conversationId);

  // Renderizar estado de carregamento
  if (loading) {
    return <LoadingState />;
  }

  // Renderizar erro quando não tem ID de conversa
  if (!conversationId) {
    return (
      <ErrorState 
        message="Conversa não encontrada" 
        buttonText="Voltar ao Início" 
        onClick={() => window.location.href = "/"} 
      />
    );
  }

  // Renderizar erro quando ocorre outro erro
  if (error) {
    return (
      <ErrorState 
        message={error} 
        buttonText="Voltar ao Início" 
        onClick={() => window.location.href = "/"} 
      />
    );
  }

  // Renderizar estado vazio quando não tem perguntas
  if (qaItems.length === 0) {
    return <EmptyState onAgentTransfer={transferToAgent} />;
  }

  // Renderizar a lista de perguntas frequentes com os novos componentes
  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Cabeçalho */}
        <FAQHeader serviceInfo={serviceInfo} />

        {/* Barra de pesquisa */}
        <SearchBar 
          searchQuery={searchTerm} 
          onSearchChange={handleSearchChange} 
        />

        {/* Filtro de categorias (se houver categorias) */}
        {categories.length > 0 && (
          <CategoryFilter 
            categories={categories} 
            selectedCategory={selectedCategory} 
            onCategoryChange={handleCategoryChange} 
          />
        )}

        {/* Contador de resultados */}
        <div className="text-sm text-gray-500 mb-4">
          {qaItems.length} {qaItems.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </div>

        {/* Lista de perguntas e respostas */}
        <QAList items={qaItems} />

        {/* Botão para transferência para atendente */}
        <AgentTransferButton 
          loading={transferLoading}
          onClick={transferToAgent}
        />
      </div>
    </div>
  );
};

export default FAQ;
