import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLaptops } from '../context/LaptopContext';
import { 
  ArrowLeft,
  AlertCircle, 
  CheckCircle2, 
  MonitorCheck,
  Settings,
  MessageSquare,
  Wrench,
  User,
  Mail,
  Clock,
  XCircle,
  Pencil,
  Save,
  X,
  Cpu,
  MemoryStick as Memory,
  Code,
  Activity
} from 'lucide-react';

export default function LaptopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { laptops, updateLaptop } = useLaptops();
  const errorRef = useRef<HTMLDivElement>(null);
  
  const laptop = laptops.find(l => l.id === id);
  
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingProperties, setIsEditingProperties] = useState(false);
  const [newStatus, setNewStatus] = useState(laptop?.status || 'Ingebruik');
  const [newRemark, setNewRemark] = useState('');
  const [showRemarkForm, setShowRemarkForm] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editedProperties, setEditedProperties] = useState({
    cpu: laptop?.cpu || '',
    ram: laptop?.ram || '',
    gpu: laptop?.gpu || '',
    softwareVersion: laptop?.softwareVersion || ''
  });

  useEffect(() => {
    if (errorMessage && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorMessage]);

  if (!laptop) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-[#d73f3f] mx-auto" />
          <p className="text-gray-600">Laptop niet gevonden</p>
          <button
            onClick={() => navigate('/laptops')}
            className="px-4 py-2 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200"
          >
            Terug naar overzicht
          </button>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = () => {
    if (newStatus === laptop.status) {
      setErrorMessage('Er is geen wijziging gemaakt.');
      return;
    }
    
    updateLaptop({ ...laptop, status: newStatus });
    setIsEditingStatus(false);
    setErrorMessage('');
  };

  const handlePropertiesUpdate = () => {
    if (Object.values(editedProperties).some(value => !value.trim())) {
      setErrorMessage('Alle velden zijn verplicht.');
      return;
    }

    updateLaptop({
      ...laptop,
      ...editedProperties
    });
    setIsEditingProperties(false);
    setErrorMessage('');
  };

  const handleAddRemark = () => {
    if (!newRemark.trim()) {
      setErrorMessage('Opmerking is verplicht.');
      return;
    }

    updateLaptop({
      ...laptop,
      remarks: [...laptop.remarks, newRemark]
    });
    setNewRemark('');
    setShowRemarkForm(false);
    setErrorMessage('');
  };

  const handleReportProblem = () => {
    if (!problemDescription.trim()) {
      setErrorMessage('Melden mislukt: probleembeschrijving is verplicht.');
      return;
    }

    if (!reporterName.trim()) {
      setErrorMessage('Melden mislukt: naam is verplicht.');
      return;
    }

    if (!reporterEmail.trim()) {
      setErrorMessage('Melden mislukt: email is verplicht.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reporterEmail)) {
      setErrorMessage('Melden mislukt: voer een geldig emailadres in.');
      return;
    }

    const newProblem = {
      id: crypto.randomUUID(),
      description: problemDescription,
      reporterName: reporterName,
      reporterEmail: reporterEmail,
      status: 'open' as const,
      dateReported: new Date().toISOString()
    };

    updateLaptop({
      ...laptop,
      problems: [newProblem, ...laptop.problems]
    });
    setProblemDescription('');
    setReporterName('');
    setReporterEmail('');
    setShowProblemForm(false);
    setErrorMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#07114d] flex items-center gap-2">
          <MonitorCheck className="h-8 w-8" />
          {laptop.computerName}
        </h1>
        <button
          onClick={() => navigate('/laptops')}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Terug naar overzicht</span>
        </button>
      </div>

      {errorMessage && (
        <div ref={errorRef} className="p-4 bg-red-50 rounded-lg border-l-4 border-[#d73f3f] flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="h-5 w-5 text-[#d73f3f] shrink-0 mt-0.5" />
          <p className="text-[#d73f3f]">{errorMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Properties Section */}
        <div className="border-b border-gray-200">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#07114d] flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Eigenschappen
              </h2>
              <button
                onClick={() => setIsEditingProperties(true)}
                className="px-4 py-2 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200 flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                <span>Bewerken</span>
              </button>
            </div>

            {!isEditingProperties ? (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                    <Cpu className="h-4 w-4 text-[#07114d]" />
                    CPU
                  </p>
                  <p className="text-gray-900 break-words">{laptop.cpu}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                    <Memory className="h-4 w-4 text-[#07114d]" />
                    RAM
                  </p>
                  <p className="text-gray-900 break-words">{laptop.ram}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                    <Cpu className="h-4 w-4 text-[#07114d]" />
                    GPU
                  </p>
                  <p className="text-gray-900 break-words">{laptop.gpu}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                    <Code className="h-4 w-4 text-[#07114d]" />
                    Software Versie
                  </p>
                  <p className="text-gray-900 break-words">{laptop.softwareVersion}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-[#07114d]" />
                      CPU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editedProperties.cpu}
                      onChange={(e) => setEditedProperties(prev => ({ ...prev, cpu: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                      placeholder="Voer CPU specificaties in..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Memory className="h-5 w-5 text-[#07114d]" />
                      RAM <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editedProperties.ram}
                      onChange={(e) => setEditedProperties(prev => ({ ...prev, ram: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                      placeholder="Voer RAM specificaties in..."
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-[#07114d]" />
                      GPU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editedProperties.gpu}
                      onChange={(e) => setEditedProperties(prev => ({ ...prev, gpu: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                      placeholder="Voer GPU specificaties in..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Code className="h-5 w-5 text-[#07114d]" />
                      Software Versie <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editedProperties.softwareVersion}
                      onChange={(e) => setEditedProperties(prev => ({ ...prev, softwareVersion: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                      placeholder="Voer software versie in..."
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handlePropertiesUpdate}
                    className="px-4 py-2 bg-[#599651] text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Opslaan
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProperties(false);
                      setEditedProperties({
                        cpu: laptop.cpu,
                        ram: laptop.ram,
                        gpu: laptop.gpu,
                        softwareVersion: laptop.softwareVersion
                      });
                      setErrorMessage('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Section */}
        <div className="border-b border-gray-200">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#07114d] flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Status
              </h2>
            </div>
            
            {!isEditingStatus ? (
              <div className="flex items-center justify-between">
                <span className={`font-medium ${
                  laptop.status === 'storing' ? 'text-[#d73f3f]' :
                  laptop.status === 'Controleren' ? 'text-[#e4c76b]' :
                  laptop.status === 'beschikbaar' ? 'text-[#599651]' :
                  laptop.status === 'in behandeling' ? 'text-[#e4c76b]' :
                  laptop.status === 'gereserveerd' ? 'text-[#07114d]' :
                  'text-[#599651]'
                }`}>
                  {laptop.status}
                </span>
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="px-4 py-2 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200 flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Status aanpassen
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                >
                  <option value="beschikbaar">Beschikbaar</option>
                  <option value="in behandeling">In behandeling</option>
                  <option value="gereserveerd">Gereserveerd</option>
                  <option value="Ingebruik">In gebruik</option>
                  <option value="Controleren">Controleren</option>
                  <option value="storing">Storing</option>
                </select>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleStatusUpdate}
                    className="px-4 py-2 bg-[#599651] text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Opslaan
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingStatus(false);
                      setNewStatus(laptop.status);
                      setErrorMessage('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Remarks Section */}
        <div className="border-b border-gray-200">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#07114d] flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Opmerkingen
              </h2>
              <button
                onClick={() => setShowRemarkForm(true)}
                className="px-4 py-2 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200 flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Opmerking toevoegen
              </button>
            </div>

            {showRemarkForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg animate-fadeIn">
                <textarea
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                  placeholder="Voer een opmerking in..."
                  rows={3}
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddRemark}
                    className="px-4 py-2 bg-[#599651] text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Opslaan
                  </button>
                  <button
                    onClick={() => {
                      setShowRemarkForm(false);
                      setNewRemark('');
                      setErrorMessage('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}

            {laptop.remarks.length > 0 ? (
              <ul className="space-y-3">
                {laptop.remarks.map((remark, index) => (
                  <li key={index} className="p-3 bg-gray-50 rounded-lg break-words">
                    {remark}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">
                Geen opmerkingen beschikbaar
              </p>
            )}
          </div>
        </div>

        {/* Problems Section */}
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#07114d] flex items-center gap-2">
              <Wrench className="h-6 w-6" />
              Problemen
            </h2>
            <button
              onClick={() => setShowProblemForm(true)}
              className="px-4 py-2 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200 flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Probleem melden
            </button>
          </div>

          {showProblemForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg animate-fadeIn">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#07114d]" />
                    Uw naam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                    placeholder="Voer uw naam in..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#07114d]" />
                    Uw email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                    placeholder="Voer uw emailadres in..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-[#07114d]" />
                    Probleembeschrijving <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#07114d]/20 focus:border-[#07114d] transition-colors duration-200"
                    placeholder="Beschrijf het probleem..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleReportProblem}
                    className="px-4 py-2 bg-[#599651] text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Probleem melden
                  </button>
                  <button
                    onClick={() => {
                      setShowProblemForm(false);
                      setProblemDescription('');
                      setReporterName('');
                      setReporterEmail('');
                      setErrorMessage('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            </div>
          )}

          {laptop.problems.length > 0 ? (
            <div className="space-y-4">
              {laptop.problems.map((problem) => (
                <div key={problem.id} className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    {problem.status === 'resolved' ? (
                      <CheckCircle2 className="h-5 w-5 text-[#599651]" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-[#d73f3f]" />
                    )}
                    <span className={problem.status === 'resolved' ? 'text-[#599651]' : 'text-[#d73f3f]'}>
                      {problem.status === 'resolved' ? 'Opgelost' : 'Open'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[#07114d]" />
                      <span className="font-medium">{problem.reporterName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-[#07114d]" />
                      <a href={`mailto:${problem.reporterEmail}`} className="text-[#07114d] hover:underline">
                        {problem.reporterEmail}
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Beschrijving:</p>
                    <p className="text-gray-700 break-words">{problem.description}</p>
                  </div>

                  {problem.repairDetails && (
                    <div className="space-y-2">
                      <p className="font-medium">Reparatie details:</p>
                      <p className="text-gray-700 break-words">{problem.repairDetails}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Gemeld: {new Date(problem.dateReported).toLocaleDateString()}</span>
                    </div>
                    {problem.dateResolved && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Opgelost: {new Date(problem.dateResolved).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              Geen problemen gemeld
            </p>
          )}
        </div>
      </div>
    </div>
  );
}