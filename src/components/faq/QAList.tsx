
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { QAItem } from '@/hooks/useFAQData';

interface QAListProps {
  items: QAItem[];
}

const QAList: React.FC<QAListProps> = ({ items }) => {
  return (
    <div className="space-y-4 mb-8">
      {items.map((item) => (
        <Card key={item.id} className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h3 className="font-medium text-lg text-gray-900 mb-2">{item.question}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{item.answer}</p>
            
            {item.has_link && item.link_url && item.link_text && (
              <a 
                href={item.link_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-chatbot-primary hover:text-chatbot-dark flex items-center mt-3"
              >
                {item.link_text}
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            )}
            
            {item.has_image && item.image_url && (
              <div className="mt-3">
                <img 
                  src={item.image_url} 
                  alt="Imagem ilustrativa" 
                  className="max-w-full h-auto rounded-md" 
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QAList;
