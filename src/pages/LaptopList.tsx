import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  MonitorCheck,
  Search,
  ArrowUpDown,
  PlusCircle,
  XCircle,
  Laptop
} from 'lucide-react';
import { useLaptops } from '../context/LaptopContext';

export default function LaptopList() {
  const navigate = useNavigate();
  const { laptops, deleteLaptop, isLoading } = useLaptops();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteTimeout, setDeleteTimeout] = useState<NodeJS.Timeout | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [timeoutMessage, setTimeoutMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  useEffect(() => {
    if (timeoutMessage) {
      const timeout = setTimeout(() => {
        setTimeoutMessage('');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [timeoutMessage]);

  const handleDelete = (laptopId: string) => {
    setShowDeleteConfirm(laptopId);
    
    const timeout = setTimeout(() => {
      if (showDeleteConfirm === laptopId) {
        setShowDeleteConfirm(null);
        setTimeoutMessage('Verwijder aanvraag is verlopen na 15 minuten inactiviteit');
      }
    }, 15 * 60 * 1000); // 15 minutes
    
    setDeleteTimeout(timeout);
  };

  const confirmDelete = async (laptopId: string) => {
    try {
      await deleteLaptop(laptopId);
      setShowDeleteConfirm(null);
      setSuccessMessage('Laptop is succesvol verwijderd');
      if (deleteTimeout) {
        clearTimeout(deleteTimeout);
      }
    } catch (error) {
      setTimeoutMessage('Er is een fout opgetreden bij het verwijderen van de laptop');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
    if (deleteTimeout) {
      clearTimeout(deleteTimeout);
    }
  };

  const filteredLaptops = laptops
    .filter(laptop => 
      laptop.computerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      laptop.cpu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      laptop.ram.toLowerCase().includes(searchQuery.toLowerCase()) ||
      laptop.gpu.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.computerName.localeCompare(b.computerName)
          : b.computerName.localeCompare(a.computerName);
      } else {
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Laptop className="w-12 h-12 text-[#07114d] animate-pulse mx-auto" />
          <p className="text-gray-600">Laptops laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#07114d] flex items-center gap-2">
          <MonitorCheck className="h-8 w-8" />
          Overzicht Laptops
        </h1>
        <button
          onClick={() => navigate('/laptops/create')}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Nieuwe Laptop Toevoegen</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zoeken
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek op naam, CPU, RAM of GPU..."
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d]"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </div>
          <div className="sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sorteren op
            </label>
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as ['name' | 'status', 'asc' | 'desc'];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg appearance-none focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d]"
              >
                <option value="name-asc">Naam (A-Z)</option>
                <option value="name-desc">Naam (Z-A)</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Laptops Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLaptops.map((laptop) => {
          const activeProblems = laptop.problems.filter(p => p.status === 'open');
          const resolvedProblems = laptop.problems.filter(p => p.status === 'resolved');
          
          return (
            <div key={laptop.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-[#07114d] px-6 py-4 border-b border-[#07114d]/10">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-white break-words flex-1">
                    {laptop.computerName}
                  </h2>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(laptop.id);
                    }}
                    className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors duration-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div 
                onClick={() => navigate(`/laptops/${laptop.id}`)}
                className="p-6 space-y-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">CPU</p>
                    <p className="font-medium break-words">{laptop.cpu}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">RAM</p>
                    <p className="font-medium break-words">{laptop.ram}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GPU</p>
                    <p className="font-medium break-words">{laptop.gpu}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium ${
                      laptop.status === 'storing' ? 'text-[#d73f3f]' :
                      laptop.status === 'Controleren' ? 'text-[#e4c76b]' :
                      laptop.status === 'beschikbaar' ? 'text-[#599651]' :
                      laptop.status === 'in behandeling' ? 'text-[#e4c76b]' :
                      laptop.status === 'gereserveerd' ? 'text-[#07114d]' :
                      'text-[#599651]'
                    }`}>
                      {laptop.status}
                    </p>
                  </div>
                </div>
                
                {/* Problems Section */}
                <div className="space-y-2 pt-4 border-t">
                  {activeProblems.length > 0 && (
                    <div className="flex items-center gap-2 text-[#d73f3f]">
                      <AlertCircle size={16} />
                      <span className="text-sm">
                        {activeProblems.length} actief {activeProblems.length === 1 ? 'probleem' : 'problemen'}
                      </span>
                    </div>
                  )}

                  {resolvedProblems.length > 0 && (
                    <div className="flex items-center gap-2 text-[#599651]">
                      <CheckCircle2 size={16} />
                      <span className="text-sm">
                        {resolvedProblems.length} opgelost {resolvedProblems.length === 1 ? 'probleem' : 'problemen'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === laptop.id && (
                <div className="p-4 bg-red-50 border-t border-red-100 animate-fadeIn">
                  <div className="flex items-start gap-2 mb-3">
                    <XCircle className="h-5 w-5 text-[#d73f3f] shrink-0 mt-0.5" />
                    <p className="text-[#d73f3f]">
                      Weet u zeker dat u deze laptop wilt verwijderen?
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(laptop.id);
                      }}
                      className="flex-1 px-4 py-2 bg-[#d73f3f] text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      Bevestigen
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelDelete();
                      }}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLaptops.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="flex justify-center">
              <Laptop className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {searchQuery
                ? 'Geen laptops gevonden'
                : 'Nog geen laptops toegevoegd'
              }
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Probeer andere zoektermen of pas de filters aan'
                : 'Begin met het toevoegen van laptops aan het systeem'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/laptops/create')}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Nieuwe Laptop Toevoegen</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {(successMessage || timeoutMessage) && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg animate-fadeIn ${
          successMessage ? 'bg-green-100 text-[#599651]' : 'bg-yellow-100 text-[#e4c76b]'
        }`}>
          {successMessage || timeoutMessage}
        </div>
      )}
    </div>
  );
}