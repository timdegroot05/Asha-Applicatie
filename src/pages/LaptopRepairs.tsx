import React, { useState } from 'react';
import { useLaptops } from '../context/LaptopContext';
import { Problem } from '../types';

export default function LaptopRepairs() {
  const { laptops, updateLaptop } = useLaptops();
  const [repairDetails, setRepairDetails] = useState('');
  const [resolverName, setResolverName] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Get all open problems from all laptops and sort by date (newest first)
  const allProblems = laptops.flatMap(laptop => 
    laptop.problems.map(problem => ({
      ...problem,
      laptopId: laptop.id,
      laptopName: laptop.computerName
    }))
  )
  .filter(problem => problem.status === 'open')
  .sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());

  const handleRepair = (problemId: string, laptopId: string) => {
    if (!repairDetails.trim()) {
      setError('Opslaan mislukt reparatiedetails zijn verplicht.');
      return;
    }

    if (!resolverName.trim()) {
      setError('Opslaan mislukt naam is verplicht.');
      return;
    }

    const laptop = laptops.find(l => l.id === laptopId);
    if (!laptop) return;

    const updatedProblems = laptop.problems.map(problem => 
      problem.id === problemId
        ? {
            ...problem,
            status: 'resolved' as const,
            repairDetails,
            resolverName,
            dateResolved: new Date().toISOString()
          }
        : problem
    );
    
    updateLaptop({
      ...laptop,
      problems: updatedProblems
    });

    setRepairDetails('');
    setResolverName('');
    setSelectedProblem(null);
    setError('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1c1c1c]">Laptop Reparaties</h1>

      <div className="grid gap-4">
        {allProblems.map((problem) => (
          <div key={problem.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="w-full">
                <p className="font-semibold mb-2">Laptop: {problem.laptopName}</p>
                <p className="font-semibold">Status: 
                  <span className="text-[#d73f3f] ml-1">
                    {problem.status}
                  </span>
                </p>
                <div className="mt-2">
                  <p className="font-semibold">Gemeld door:</p>
                  <p className="break-words">{problem.reporterName}</p>
                  <p className="text-sm text-gray-600">{problem.reporterEmail}</p>
                </div>
                <div className="mt-2">
                  <p className="font-semibold">Beschrijving:</p>
                  <p className="break-words">{problem.description}</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Gemeld op: {new Date(problem.dateReported).toLocaleDateString()}
                </p>
              </div>
              
              <button
                onClick={() => setSelectedProblem(problem.id)}
                className="w-full sm:w-auto px-4 py-2 bg-[#07114d] text-white rounded-lg hover:bg-[#2e376f]"
              >
                Probleem oplossen
              </button>
            </div>

            {selectedProblem === problem.id && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
                    Uw naam *
                  </label>
                  <input
                    type="text"
                    value={resolverName}
                    onChange={(e) => setResolverName(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Voer uw naam in..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
                    Reparatiedetails *
                  </label>
                  <textarea
                    value={repairDetails}
                    onChange={(e) => setRepairDetails(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Voer reparatiedetails in..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRepair(problem.id, problem.laptopId)}
                    className="flex-1 sm:flex-none px-3 py-1 bg-[#599651] text-white rounded-lg hover:bg-green-600"
                  >
                    Opslaan
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProblem(null);
                      setRepairDetails('');
                      setResolverName('');
                      setError('');
                    }}
                    className="flex-1 sm:flex-none px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {allProblems.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center text-gray-500">
            Er zijn momenteel geen openstaande problemen
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-[#d73f3f] rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}