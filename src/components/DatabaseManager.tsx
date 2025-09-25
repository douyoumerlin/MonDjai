import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  RotateCcw, 
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { LocalDatabase, DatabaseBackup } from '../utils/storage';
import { formatDate } from '../utils/calculations';

interface DatabaseManagerProps {
  onDataChange: () => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onDataChange }) => {
  const [backups, setBackups] = useState(LocalDatabase.getBackups());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateBackup = () => {
    try {
      setIsLoading(true);
      LocalDatabase.createBackup();
      LocalDatabase.cleanOldBackups();
      setBackups(LocalDatabase.getBackups());
      showMessage('success', 'Sauvegarde créée avec succès');
    } catch (error) {
      showMessage('error', 'Erreur lors de la création de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = (backup: DatabaseBackup) => {
    if (confirm('Restaurer cette sauvegarde ? Les données actuelles seront remplacées.')) {
      try {
        setIsLoading(true);
        LocalDatabase.restoreFromBackup(backup);
        onDataChange();
        showMessage('success', 'Données restaurées avec succès');
      } catch (error) {
        showMessage('error', 'Erreur lors de la restauration');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExportData = () => {
    try {
      const jsonData = LocalDatabase.exportToJSON();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage('success', 'Données exportées avec succès');
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'exportation');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setIsLoading(true);
        const jsonString = e.target?.result as string;
        LocalDatabase.importFromJSON(jsonString);
        onDataChange();
        showMessage('success', 'Données importées avec succès');
      } catch (error) {
        showMessage('error', 'Fichier invalide ou corrompu');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleDeleteBackup = (key: string) => {
    if (confirm('Supprimer cette sauvegarde ?')) {
      LocalDatabase.deleteBackup(key);
      setBackups(LocalDatabase.getBackups());
      showMessage('success', 'Sauvegarde supprimée');
    }
  };

  const handleClearAllData = () => {
    LocalDatabase.clearAllData();
    onDataChange();
    setBackups([]);
    showMessage('success', 'Toutes les données ont été effacées');
  };

  const storageStats = LocalDatabase.getStorageStats();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Database className="text-indigo-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">Gestion de la Base de Données</h3>
      </div>

      {/* Message de statut */}
      {message && (
        <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {message.text}
        </div>
      )}

      {/* Statistiques de stockage */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="text-gray-600" size={18} />
          <span className="font-medium text-gray-800">Utilisation du Stockage</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Utilisé: {(storageStats.used / 1024).toFixed(1)} KB</span>
            <span>{storageStats.itemCount} éléments</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                storageStats.percentage > 80 ? 'bg-red-500' : 
                storageStats.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(storageStats.percentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {storageStats.percentage.toFixed(1)}% utilisé
          </div>
        </div>
      </div>

      {/* Actions principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleCreateBackup}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <Save size={18} />
          Créer une Sauvegarde
        </button>

        <button
          onClick={handleExportData}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <Download size={18} />
          Exporter les Données
        </button>

        <label className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer font-medium">
          <Upload size={18} />
          Importer les Données
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
          />
        </label>

        <button
          onClick={handleClearAllData}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <Trash2 size={18} />
          Effacer Tout
        </button>
      </div>

      {/* Liste des sauvegardes */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Clock size={18} />
          Sauvegardes Automatiques ({backups.length})
        </h4>
        
        {backups.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {backups.map(({ key, backup }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div>
                  <div className="font-medium text-gray-800">
                    {formatDate(backup.timestamp)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Version {backup.version} • 
                    {backup.data.incomes.length} revenus • 
                    {backup.data.expenses.length} dépenses • 
                    {backup.data.categories.length} catégories
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestoreBackup(backup)}
                    disabled={isLoading}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 disabled:text-gray-400 transition-colors duration-200 rounded-lg"
                    title="Restaurer cette sauvegarde"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteBackup(key)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 transition-colors duration-200 rounded-lg"
                    title="Supprimer cette sauvegarde"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">💾</div>
            <p className="text-gray-500">Aucune sauvegarde disponible</p>
            <p className="text-sm text-gray-400">Créez votre première sauvegarde pour sécuriser vos données</p>
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Conseils</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Les sauvegardes sont créées automatiquement lors des modifications importantes</p>
          <p>• Exportez régulièrement vos données pour les sauvegarder hors ligne</p>
          <p>• Les 5 sauvegardes les plus récentes sont conservées automatiquement</p>
          <p>• Utilisez l'import/export pour transférer vos données entre appareils</p>
        </div>
      </div>
    </div>
  );
};