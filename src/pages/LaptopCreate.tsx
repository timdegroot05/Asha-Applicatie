import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLaptops } from '../context/LaptopContext';
import { ArrowLeft, AlertCircle, MonitorCheck, Cpu, MemoryStick as Memory, Cpu as Gpu, Code } from 'lucide-react';

export default function LaptopCreate() {
  const navigate = useNavigate();
  const { addLaptop } = useLaptops();
  const [formData, setFormData] = useState({
    computerName: '',
    cpu: '',
    ram: '',
    gpu: '',
    softwareVersion: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.values(formData).some(value => !value.trim())) {
      setError('kan gegevens niet aanmaken vul alle verplichte velden in.');
      return;
    }

    const newLaptop = {
      id: crypto.randomUUID(),
      ...formData,
      status: 'Ingebruik' as const,
      remarks: [],
      problems: []
    };

    addLaptop(newLaptop);
    navigate('/laptops');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#07114d] flex items-center gap-2">
          <MonitorCheck className="h-8 w-8" />
          Nieuwe Laptop Toevoegen
        </h1>
        <button
          onClick={() => navigate('/laptops')}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Terug naar overzicht</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid gap-6">
            <div>
              <label htmlFor="computerName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MonitorCheck className="h-5 w-5 text-[#07114d]" />
                Computer Naam <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="computerName"
                name="computerName"
                value={formData.computerName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                placeholder="Voer de computernaam in..."
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="cpu" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-[#07114d]" />
                  CPU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cpu"
                  name="cpu"
                  value={formData.cpu}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                  placeholder="Bijv. Intel Core i7-11700K"
                  required
                />
              </div>

              <div>
                <label htmlFor="ram" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Memory className="h-5 w-5 text-[#07114d]" />
                  RAM <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="ram"
                  name="ram"
                  value={formData.ram}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                  placeholder="Bijv. 16GB DDR4-3200"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="gpu" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Gpu className="h-5 w-5 text-[#07114d]" />
                  GPU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="gpu"
                  name="gpu"
                  value={formData.gpu}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                  placeholder="Bijv. NVIDIA RTX 3060"
                  required
                />
              </div>

              <div>
                <label htmlFor="softwareVersion" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Code className="h-5 w-5 text-[#07114d]" />
                  Software Versie <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="softwareVersion"
                  name="softwareVersion"
                  value={formData.softwareVersion}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                  placeholder="Bijv. Windows 11 Pro 21H2"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-[#d73f3f] shrink-0 mt-0.5" />
              <p className="text-[#d73f3f]">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/laptops')}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Annuleren
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#599651] text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Laptop Toevoegen
          </button>
        </div>
      </form>
    </div>
  );
}