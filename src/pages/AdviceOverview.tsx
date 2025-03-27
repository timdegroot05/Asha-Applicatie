import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdvice } from '../context/AdviceContext';
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  CheckSquare,
  PenSquare,
  Archive
} from 'lucide-react';

export default function AdviceOverview() {
  const navigate = useNavigate();
  const { adviceRequests, updateAdviceStatus } = useAdvice();
  const pendingAdvice = adviceRequests.filter(advice => advice.status === 'pending');

  const handleReject = (id: string) => {
    const reason = prompt('Geef een reden voor afwijzing:');
    if (reason) {
      updateAdviceStatus(id, 'rejected', reason);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#07114d] flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Voorgestelde Adviezen
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate('/advice/processed')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200"
          >
            <Archive className="h-5 w-5" />
            <span>Verwerkte Adviezen</span>
          </button>
          <button
            onClick={() => navigate('/advice/new')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200"
          >
            <PenSquare className="h-5 w-5" />
            <span>Advies Noteren</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {pendingAdvice.map((advice) => (
          <div key={advice.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-[#07114d]/5 px-6 py-4 border-b border-[#07114d]/10">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#e4c76b]/20 text-[#e4c76b] rounded-full text-sm font-medium">
                    In behandeling
                  </span>
                  <span className="text-[#07114d] font-semibold">
                    {advice.type}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  Aangevraagd op: {new Date(advice.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[#07114d]" />
                    <span className="font-medium">{advice.reporterName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#07114d]" />
                    <a href={`mailto:${advice.reporterEmail}`} className="text-[#07114d] hover:underline">
                      {advice.reporterEmail}
                    </a>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-[#07114d]" />
                    <a href={`tel:${advice.reporterPhone}`} className="text-[#07114d] hover:underline">
                      {advice.reporterPhone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#07114d]" />
                    <span className="text-gray-600">Genoteerd door: {advice.notedBy}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold text-[#07114d]">Beschrijving:</h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                  {advice.description}
                </p>
              </div>

              {/* Requirements */}
              {advice.requirements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#07114d] flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Vereisten:
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                    {advice.requirements.map((req, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-2"
                      >
                        <div className="h-2 w-2 rounded-full bg-[#07114d] mt-2" />
                        <span className="text-gray-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {advice.additionalNotes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-[#07114d]">Aanvullende opmerkingen:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                    {advice.additionalNotes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => updateAdviceStatus(advice.id, 'approved')}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#599651] text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Goedkeuren</span>
                </button>
                <button
                  onClick={() => handleReject(advice.id)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#d73f3f] text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Afwijzen</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {pendingAdvice.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="flex justify-center">
                <FileText className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Geen openstaande adviesaanvragen
              </h3>
              <p className="text-gray-500">
                Er zijn momenteel geen adviesaanvragen die op verwerking wachten.
              </p>
              <button
                onClick={() => navigate('/advice/new')}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f] transition-colors duration-200"
              >
                <PenSquare className="h-5 w-5" />
                <span>Nieuw Advies Noteren</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}