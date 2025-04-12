
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        navigate('/agent');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, loading, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-10 h-10 border-4 border-chatbot-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Index;
