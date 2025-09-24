import React from 'react';
import { FileText, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Income, Expense, CustomCategory } from '../types';
import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance, 
  formatCurrency, 
  formatDate, 
  calculateCategoryStats 
} from '../utils/calculations';

interface MonthlyReportProps {
  incomes: Income[];
  expenses: Expense[];
  categories: CustomCategory[];
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({ incomes, expenses, categories }) => {
  const totalIncome = calculateTotalIncome(incomes);
  const totalExpenses = calculateTotalExpenses(expenses);
  const balance = calculateBalance(incomes, expenses);
  const categoryStats = calculateCategoryStats(expenses, categories);
  
  const currentMonth = new Intl.DateTimeFormat('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="text-purple-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">Rapport Mensuel</h3>
        <div className="flex items-center gap-1 ml-auto text-sm text-gray-500">
          <Calendar size={16} />
          {currentMonth}
        </div>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-emerald-600" size={18} />
            <span className="font-medium text-emerald-800">Revenus</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalIncome)}</div>
          <div className="text-sm text-emerald-600">{incomes.length} transaction(s)</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="text-red-600" size={18} />
            <span className="font-medium text-red-800">Dépenses</span>
          </div>
          <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</div>
          <div className="text-sm text-red-600">{expenses.length} transaction(s)</div>
        </div>
      </div>

      {/* Métriques importantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
          <div className="font-medium mb-1">Solde Final</div>
          <div className={`text-xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {formatCurrency(balance)}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="font-medium mb-1">Taux d'Épargne</div>
          <div className={`text-xl font-bold ${savingsRate >= 20 ? 'text-emerald-700' : savingsRate >= 10 ? 'text-yellow-700' : 'text-red-700'}`}>
            {savingsRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Analyse des dépenses */}
      {categoryStats.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Analyse des Dépenses par Catégorie</h4>
          <div className="space-y-2">
            {categoryStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-700">{stat.category}</span>
                <div className="text-right">
                  <span className="font-medium">{formatCurrency(stat.amount)}</span>
                  <span className="text-sm text-gray-500 ml-2">({stat.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dernières transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers revenus */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Derniers Revenus</h4>
          {incomes.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {incomes.slice(-5).reverse().map((income) => (
                <div key={income.id} className="flex justify-between items-center p-2 bg-emerald-50 rounded text-sm">
                  <div>
                    <div className="font-medium text-emerald-800">{income.description}</div>
                    <div className="text-emerald-600 text-xs">{formatDate(income.date)}</div>
                  </div>
                  <div className="font-semibold text-emerald-700">+{formatCurrency(income.amount)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucun revenu enregistré</p>
          )}
        </div>

        {/* Dernières dépenses */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Dernières Dépenses</h4>
          {expenses.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {expenses.slice(-5).reverse().map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-2 bg-red-50 rounded text-sm">
                  <div>
                    <div className="font-medium text-red-800">{expense.description}</div>
                    <div className="text-red-600 text-xs">{expense.category} • {formatDate(expense.date)}</div>
                  </div>
                  <div className="font-semibold text-red-700">-{formatCurrency(expense.amount)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucune dépense enregistrée</p>
          )}
        </div>
      </div>

      {/* Conseils */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Conseils</h4>
        <div className="text-sm text-blue-700 space-y-1">
          {savingsRate >= 20 && <p>✅ Excellent taux d'épargne ! Continuez ainsi.</p>}
          {savingsRate < 20 && savingsRate >= 10 && <p>⚠️ Taux d'épargne correct, mais il y a de la marge pour améliorer.</p>}
          {savingsRate < 10 && balance >= 0 && <p>⚠️ Essayez d'économiser au moins 10% de vos revenus.</p>}
          {balance < 0 && <p>🚨 Attention : vos dépenses dépassent vos revenus ce mois-ci.</p>}
          {categoryStats.length > 0 && categoryStats[0].percentage > 50 && 
            <p>📊 {categoryStats[0].category} représente plus de 50% de vos dépenses.</p>}
        </div>
      </div>
    </div>
  );
};