import React from 'react';
import { Database } from 'lucide-react';

interface DatabaseManagerProps {
  onDataChange: () => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
      <div className="flex items-center gap-3 mb-4">
        <Database className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Données</h2>
      </div>
      <p className="text-gray-600">Import/Export et gestion de la base de données</p>
    </div>
  );
};
