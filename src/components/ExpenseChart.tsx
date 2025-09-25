import React from 'react';
import { PieChart as PieChartIcon, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { Expense, CustomCategory } from '../types';
import { calculateCategoryStats, formatCurrency, calculateTotalIncome, calculatePaidExpenses, calculateRemainingBudgetWithLoans } from '../utils/calculations';
import { Income, Loan } from '../types';

interface ExpenseChartProps {
  expenses: Expense[];
  categories: CustomCategory[];
  incomes: Income[];
  loans: Loan[];
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses, categories, incomes, loans }) => {
  const categoryStats = calculateCategoryStats(expenses, categories);
  const totalIncome = calculateTotalIncome(incomes);
  const paidExpenses = calculatePaidExpenses(expenses);
  const remainingBudget = calculateRemainingBudgetWithLoans(incomes, expenses, loans);
  const savingsRate = totalIncome > 0 ? ((remainingBudget / totalIncome) * 100) : 0;

  if (categoryStats.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Graphiques & Analyses</h3>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500">Aucune dépense enregistrée</p>
          <p className="text-sm text-gray-400 mt-1">Marquez des dépenses comme payées pour voir les graphiques</p>
        </div>
      </div>
    );
  }

  let cumulativePercentage = 0;
  
  const chartRadius = 80;
  const chartCenter = 100;
  const strokeWidth = 8;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">Graphiques & Analyses</h3>
      </div>
      
      {/* Section Graphique */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-800 mb-4">Répartition des Dépenses Payées</h4>
        <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            <circle
              cx={chartCenter}
              cy={chartCenter}
              r={chartRadius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
            />
            {categoryStats.map((stat, index) => {
              const circumference = 2 * Math.PI * chartRadius;
              const strokeDasharray = `${(stat.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercentage * circumference / 100;
              
              cumulativePercentage += stat.percentage;
              
              return (
                <circle
                  key={index}
                  cx={chartCenter}
                  cy={chartCenter}
                  r={chartRadius}
                  fill="none"
                  stroke={stat.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                />
              );
            })}
          </svg>
          {/* Total au centre */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xs text-gray-500">Total payé</div>
            <div className="text-lg font-bold text-gray-800">{formatCurrency(paidExpenses)}</div>
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          {categoryStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stat.color }}
                />
                <span className="font-medium text-gray-800">{stat.category}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{formatCurrency(stat.amount)}</div>
                <div className="text-sm text-gray-500">{stat.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Section Analyses et Conseils */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="text-purple-600" size={20} />
          Analyses et Conseils
        </h4>
        
        {/* Indicateurs clés */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-xl border ${
            savingsRate >= 20 ? 'bg-green-50 border-green-200' :
            savingsRate >= 10 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={
                savingsRate >= 20 ? 'text-green-600' :
                savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
              } size={18} />
              <span className="font-medium text-gray-800">Taux d'Épargne</span>
            </div>
            <div className={`text-2xl font-bold ${
              savingsRate >= 20 ? 'text-green-700' :
              savingsRate >= 10 ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {savingsRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              {savingsRate >= 20 ? 'Excellent !' :
               savingsRate >= 10 ? 'Correct' : 'À améliorer'}
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <PieChartIcon className="text-blue-600" size={18} />
              <span className="font-medium text-gray-800">Catégorie Principale</span>
            </div>
            <div className="text-lg font-bold text-blue-700">
              {categoryStats[0]?.category || 'Aucune'}
            </div>
            <div className="text-sm text-blue-600">
              {categoryStats[0] ? `${categoryStats[0].percentage.toFixed(1)}% du budget` : ''}
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${
            remainingBudget >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {remainingBudget >= 0 ? 
                <CheckCircle className="text-green-600" size={18} /> :
                <AlertTriangle className="text-red-600" size={18} />
              }
              <span className="font-medium text-gray-800">Budget</span>
            </div>
            <div className={`text-lg font-bold ${
              remainingBudget >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {remainingBudget >= 0 ? 'Équilibré' : 'Déficitaire'}
            </div>
            <div className={`text-sm ${
              remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(Math.abs(remainingBudget))} {remainingBudget >= 0 ? 'restant' : 'de déficit'}
            </div>
          </div>
        </div>

        {/* Conseils personnalisés */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
          <h5 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
            💡 Conseils Personnalisés
          </h5>
          <div className="space-y-2 text-sm">
            {/* Conseils basés sur le taux d'épargne */}
            {savingsRate >= 20 && (
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-600 mt-0.5" size={16} />
                <p className="text-green-700">
                  <strong>Excellent taux d'épargne !</strong> Vous épargnez {savingsRate.toFixed(1)}% de vos revenus. Continuez ainsi !
                </p>
              </div>
            )}
            
            {savingsRate < 20 && savingsRate >= 10 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
                <p className="text-yellow-700">
                  <strong>Taux d'épargne correct</strong> ({savingsRate.toFixed(1)}%), mais vous pourriez viser 20% pour plus de sécurité financière.
                </p>
              </div>
            )}
            
            {savingsRate < 10 && remainingBudget >= 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-red-600 mt-0.5" size={16} />
                <p className="text-red-700">
                  <strong>Taux d'épargne faible</strong> ({savingsRate.toFixed(1)}%). Essayez d'économiser au moins 10% de vos revenus.
                </p>
              </div>
            )}
            
            {remainingBudget < 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-red-600 mt-0.5" size={16} />
                <p className="text-red-700">
                  <strong>Budget déficitaire !</strong> Vos dépenses payées dépassent vos revenus de {formatCurrency(Math.abs(remainingBudget))}.
                </p>
              </div>
            )}

            {/* Conseils basés sur les catégories */}
            {categoryStats.length > 0 && categoryStats[0].percentage > 50 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-orange-600 mt-0.5" size={16} />
                <p className="text-orange-700">
                  <strong>Concentration élevée :</strong> {categoryStats[0].category} représente {categoryStats[0].percentage.toFixed(1)}% de vos dépenses. 
                  Diversifiez vos dépenses si possible.
                </p>
              </div>
            )}

            {/* Conseils généraux */}
            <div className="flex items-start gap-2">
              <Target className="text-blue-600 mt-0.5" size={16} />
              <p className="text-blue-700">
                <strong>Suivi régulier :</strong> Marquez vos dépenses comme payées au fur et à mesure pour un suivi précis de votre budget.
              </p>
            </div>

            {expenses.filter(e => !e.isPaid).length > 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-orange-600 mt-0.5" size={16} />
                <p className="text-orange-700">
                  <strong>Dépenses en attente :</strong> Vous avez {expenses.filter(e => !e.isPaid).length} dépense(s) non payée(s) 
                  pour un total de {formatCurrency(expenses.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0))}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};