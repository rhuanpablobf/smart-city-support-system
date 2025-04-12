
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CpfInputProps {
  cpf: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CpfInput: React.FC<CpfInputProps> = ({ cpf, onChange }) => {
  return (
    <div className="relative">
      <Label htmlFor="cpf">CPF</Label>
      <Input
        id="cpf"
        placeholder="000.000.000-00"
        className="peer mt-1 w-full rounded-md border border-gray-200 px-5 py-3 text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-blue-300"
        value={cpf}
        onChange={onChange}
        maxLength={14}
      />
    </div>
  );
};

export default CpfInput;
