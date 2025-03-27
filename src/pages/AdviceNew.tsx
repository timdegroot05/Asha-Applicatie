import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdvice } from '../context/AdviceContext';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, FileText, CheckSquare, AlertCircle } from 'lucide-react';

interface AdviceForm {
  type: string;
  description: string;
  requirements: string[];
  additionalNotes: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  notedBy: string;
}

export default function AdviceNew() {
  const navigate = useNavigate();
  const { addAdvice } = useAdvice();
  const { user } = useAuth();
  const [formData, setFormData] = useState<AdviceForm>({
    type: '',
    description: '',
    requirements: [],
    additionalNotes: '',
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    notedBy: user?.email || ''
  });
  const [error, setError] = useState('');

  const adviceTypes = [
    'Nieuw softwarepakket',
    'Nieuwe functionaliteit',
    'Hardware kwaliteit'
  ];

  const requirementOptions = {
    'Nieuw softwarepakket': [
      'Compatibiliteit met bestaande systemen',
      'Gebruiksvriendelijke interface',
      'Offline beschikbaarheid',
      'Data import/export mogelijkheden',
      'Multi-user ondersteuning',
      'Printer driver voor printtaken',
      'Performance status monitoring (CPU, RAM, etc.)'
    ],
    'Nieuwe functionaliteit': [
      'Mobiele simulatie',
      'Presentatie tools',
      'Remote desktop mogelijkheden',
      'Cloud synchronisatie',
      'Virtualisatie opties'
    ],
    'Hardware kwaliteit': [
      'Geluidskaart kwaliteit',
      'Videokaart prestaties',
      'Processor snelheid',
      'Geheugen capaciteit',
      'Scherm resolutie'
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.description || !formData.reporterName || !formData.reporterEmail || !formData.reporterPhone) {
      setError('Vul alle verplichte velden in');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.reporterEmail)) {
      setError('Voer een geldig e-mailadres in');
      return;
    }

    // Validate phone number format (Dutch format)
    const phoneRegex = /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9])((\s|\s?-\s?)?[0-9])((\s|\s?-\s?)?[0-9])\s?[0-9]\s?[0-9]\s?[0-9]\s?[0-9]\s?[0-9]$/;
    if (!phoneRegex.test(formData.reporterPhone)) {
      setError('Voer een geldig telefoonnummer in (bijv. 06-12345678)');
      return;
    }

    addAdvice(formData);
    navigate('/advice/overview');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#07114d]">Advies Noteren</h1>
        <button
          onClick={() => navigate('/advice/overview')}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200 flex items-center justify-center gap-2"
        >
          Terug naar overzicht
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Contact Information Section */}
        <div className="border-b border-gray-200">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[#07114d] mb-6 flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Informatie
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Naam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.reporterName}
                  onChange={(e) => setFormData(prev => ({ ...prev, reporterName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                  placeholder="Voer uw naam in"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  E-mailadres <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.reporterEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporterEmail: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                    placeholder="Voer uw e-mailadres in"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Telefoonnummer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.reporterPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporterPhone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                    placeholder="Voer uw telefoonnummer in"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Genoteerd door
                </label>
                <input
                  type="text"
                  value={formData.notedBy}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advice Details Section */}
        <div className="p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-semibold text-[#07114d] flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Advies Details
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Type Advies <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    type: e.target.value,
                    requirements: []
                  }));
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                required
              >
                <option value="">Selecteer type advies</option>
                {adviceTypes.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Beschrijving <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                rows={4}
                placeholder="Beschrijf hier uw adviesvraag..."
                required
              />
            </div>

            {formData.type && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-[#07114d]" />
                  Specifieke Vereisten
                </label>
                <div className="grid sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                  {requirementOptions[formData.type as keyof typeof requirementOptions].map(option => (
                    <label key={option} className="flex items-start gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.requirements.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              requirements: [...prev.requirements, option]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              requirements: prev.requirements.filter(r => r !== option)
                            }));
                          }
                        }}
                        className="mt-1 rounded border-gray-300 text-[#07114d] focus:ring-[#07114d]"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Aanvullende opmerkingen
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                rows={4}
                placeholder="Voeg hier eventuele extra informatie toe..."
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 sm:mx-8 mb-6 p-4 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-[#d73f3f] shrink-0 mt-0.5" />
            <p className="text-[#d73f3f]">{error}</p>
          </div>
        )}

        <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/advice/overview')}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Annuleren
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#599651] text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            Advies Versturen
          </button>
        </div>
      </form>
    </div>
  );
}