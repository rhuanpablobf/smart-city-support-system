
import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { QAItem } from '@/types';

interface QAListProps {
  items: QAItem[];
}

const QAList: React.FC<QAListProps> = ({ items }) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item) => (
        <FAQAccordionItem key={item.id} item={item} />
      ))}
    </Accordion>
  );
};

interface FAQAccordionItemProps {
  item: QAItem;
}

const FAQAccordionItem: React.FC<FAQAccordionItemProps> = ({ item }) => {
  return (
    <AccordionItem value={item.id}>
      <AccordionTrigger className="font-semibold">
        {item.question}
      </AccordionTrigger>
      <AccordionContent className="py-2">
        {item.answer}
        {item.hasLink && item.linkUrl && item.linkText && (
          <div className="mt-2">
            <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {item.linkText}
            </a>
          </div>
        )}
        {item.hasImage && item.imageUrl && (
          <div className="mt-4">
            <img src={item.imageUrl} alt={item.question} className="rounded-md max-w-full h-auto" />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default QAList;
