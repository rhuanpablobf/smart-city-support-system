
import React from 'react';
import { CircleHelp } from 'lucide-react';
import { ServiceInfo } from '@/hooks/useFAQData';

interface FAQHeaderProps {
  serviceInfo: ServiceInfo | null;
}

const FAQHeader: React.FC<FAQHeaderProps> = ({ serviceInfo }) => {
  return (
    <div className="text-center mb-8">
      <CircleHelp className="h-12 w-12 mx-auto mb-3 text-chatbot-primary" />
      <h1 className="text-2xl font-bold text-gray-900">Perguntas Frequentes</h1>
      {serviceInfo && (
        <p className="text-gray-600 mt-1">{serviceInfo.department} - {serviceInfo.name}</p>
      )}
    </div>
  );
};

export default FAQHeader;
