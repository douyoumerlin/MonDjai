import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Palette } from 'lucide-react';
import { CustomCategory } from '../types';

interface CategoryManagerProps {
  categories: CustomCategory[];
  onAddCategory: (category: Omit<CustomCategory, 'id'>) => void;
  onUpdateCategory: (id: string, category: Partial<CustomCategory>) => void;
  onDeleteCategory: (id: string) => void;
}

const availableIcons = ['🏠', '🚗', '🍽️', '🎯', '📦', '💰', '🛒', '⚡', '🏥', '📚', '🎮', '✈️', '👕', '🎵', '🏋️', '🐕', '🎨', '🔧'];
const availableColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📦',
    color: '#6B7280'
  });

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;
    
    onAddCategory({
      ...newCategory,
      name: newCategory.name.trim(),
      isDefault: false
    });
    
    setNewCategory({ name: '', icon: '📦', color: '#6B7280' });
    setIsAddingCategory(false);
  };

  const handleUpdateCategory = (id: string, updates: Partial<CustomCategory>) => {
    onUpdateCategory(id, updates);
    setEditingId(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      onDeleteCategory(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Palette className="text-purple-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Gestion des Catégories</h3>
        </div>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <Plus size={16} />
          Nouvelle Catégorie
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {isAddingCategory && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3">Nouvelle Catégorie</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Santé, Éducation..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
              <div className="grid grid-cols-6 gap-2">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, icon })}
                    className={`p-2 rounded border transition-all duration-200 ${
                      newCategory.icon === icon
                        ? 'bg-purple-100 border-purple-500'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
              <div className="grid grid-cols-5 gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      newCategory.color === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddCategory}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Save size={16} />
              Ajouter
            </button>
            <button
              onClick={() => setIsAddingCategory(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <X size={16} />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des catégories */}
      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: category.color }}
              >
                {category.icon}
              </div>
              <div>
                <span className="font-medium text-gray-800">{category.name}</span>
                {category.isDefault && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Par défaut
                  </span>
                )}
              </div>
            </div>
            
            {!category.isDefault && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingId(category.id)}
                  className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-gray-500 hover:text-red-600 transition-colors duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📂</div>
          <p className="text-gray-500">Aucune catégorie personnalisée</p>
        </div>
      )}
    </div>
  );
};