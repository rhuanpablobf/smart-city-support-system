
import { useState } from 'react';

export const useCpfFormatter = () => {
  const [cpf, setCpf] = useState('');

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    // Limita a 14 caracteres (XXX.XXX.XXX-XX)
    if (formatted.length <= 14) {
      setCpf(formatted);
    }
  };

  // Validar CPF 
  const isValidCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11;
  };

  return {
    cpf,
    setCpf,
    handleCPFChange,
    isValidCPF
  };
};
