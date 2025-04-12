
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, UserCog, BarChart2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b">
        <div className="text-xl font-bold text-purple-700">SmartChat</div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/login')}
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          Login
        </Button>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
          Atendimento automatizado para sua cidade
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          Uma plataforma integrada com inteligência artificial para atendimento ao cidadão,
          tornando a comunicação com a administração pública mais fácil e eficiente.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            size="lg"
            onClick={() => navigate('/chat')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Iniciar conversa
          </Button>
          <Button 
            variant="outline"
            size="lg"
            onClick={() => navigate('/login')}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <UserCog className="mr-2 h-5 w-5" />
            Área administrativa
          </Button>
        </div>
      </main>

      {/* Features section */}
      <section className="bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<MessageCircle className="h-10 w-10" />}
            title="Atendimento Inteligente"
            description="Chatbot treinado para responder perguntas frequentes e encaminhar ao departamento correto."
          />
          <FeatureCard 
            icon={<UserCog className="h-10 w-10" />}
            title="Gestão de Atendimentos"
            description="Painel administrativo para gerenciar conversas, atendentes e departamentos."
          />
          <FeatureCard 
            icon={<BarChart2 className="h-10 w-10" />}
            title="Relatórios Detalhados"
            description="Análise de dados para medir desempenho e satisfação dos cidadãos."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 px-6 bg-gray-50 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} SmartChat Municipal. Todos os direitos reservados.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center flex flex-col items-center">
      <div className="text-purple-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Index;
