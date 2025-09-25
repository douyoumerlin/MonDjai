import React from 'react';
import { FileText, Calendar, TrendingUp, TrendingDown, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { Income, Expense, Loan, FutureExpense, CustomCategory } from '../types';
import { 
  calculateTotalIncome, 
  calculatePaidExpenses,
  calculateUnpaidExpenses,
  calculatePaidLoans,
  calculateUnpaidLoans,
  calculateTotalFutureExpenses,
  calculateRemainingBudget,
  formatCurrency, 
  formatDate, 
  calculateCategoryStats 
} from '../utils/calculations';

interface MonthlyReportProps {
  incomes: Income[];
  expenses: Expense[];
  loans: Loan[];
  futureExpenses: FutureExpense[];
  categories: CustomCategory[];
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({ 
  incomes, 
  expenses, 
  loans, 
  futureExpenses, 
  categories 
}) => {
  const totalIncome = calculateTotalIncome(incomes);
  const paidExpenses = calculatePaidExpenses(expenses);
  const unpaidExpenses = calculateUnpaidExpenses(expenses);
  const paidLoans = calculatePaidLoans(loans);
  const unpaidLoans = calculateUnpaidLoans(loans);
  const totalFutureExpenses = calculateTotalFutureExpenses(futureExpenses);
  const remainingBudget = calculateRemainingBudget(incomes, expenses);
  const categoryStats = calculateCategoryStats(expenses, categories);
  
  const currentMonth = new Intl.DateTimeFormat('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  const savingsRate = totalIncome > 0 ? ((remainingBudget / totalIncome) * 100) : 0;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-emerald-600" size={18} />
            <span className="font-medium text-emerald-800">Revenus</span>
          </div>
          <div className="text-xl font-bold text-emerald-700">{formatCurrency(totalIncome)}</div>
          <div className="text-sm text-emerald-600">{incomes.length} source(s)</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-red-600" size={18} />
            <span className="font-medium text-red-800">Dépenses Payées</span>
          </div>
          <div className="text-xl font-bold text-red-700">{formatCurrency(paidExpenses)}</div>
          <div className="text-sm text-red-600">{expenses.filter(e => e.isPaid).length} transaction(s)</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-orange-600" size={18} />
            <span className="font-medium text-orange-800">Non Payées</span>
          </div>
          <div className="text-xl font-bold text-orange-700">{formatCurrency(unpaidExpenses)}</div>
          <div className="text-sm text-orange-600">{expenses.filter(e => !e.isPaid).length} restante(s)</div>
        </div>

        <div className={`${remainingBudget >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className={remainingBudget >= 0 ? 'text-blue-600' : 'text-red-600'} size={18} />
            <span className={`font-medium ${remainingBudget >= 0 ? 'text-blue-800' : 'text-red-800'}`}>Budget Restant</span>
          </div>
          <div className={`text-xl font-bold ${remainingBudget >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {formatCurrency(remainingBudget)}
          </div>
          <div className={`text-sm ${remainingBudget >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            Taux d'épargne: {savingsRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Section Prêts */}
      {loans.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CreditCard size={18} />
            État des Prêts
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="font-medium text-red-800">À Rembourser</div>
              <div className="text-lg font-bold text-red-700">{formatCurrency(unpaidLoans)}</div>
              <div className="text-sm text-red-600">{loans.filter(l => !l.isPaid).length} prêt(s)</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="font-medium text-green-800">Remboursés</div>
              <div className="text-lg font-bold text-green-700">{formatCurrency(paidLoans)}</div>
              <div className="text-sm text-green-600">{loans.filter(l => l.isPaid).length} prêt(s)</div>
            </div>
          </div>
        </div>
      )}

      {/* Section Dépenses Futures */}
      {futureExpenses.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar size={18} />
            Dépenses à Prévoir
          </h4>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="font-medium text-orange-800">Total Estimé</div>
            <div className="text-lg font-bold text-orange-700">{formatCurrency(totalFutureExpenses)}</div>
            <div className="text-sm text-orange-600">{futureExpenses.length} dépense(s) planifiée(s)</div>
          </div>
        </div>
      )}

      {/* Analyse des dépenses par catégorie */}
      {categoryStats.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Répartition des Dépenses Payées</h4>
          <div className="space-y-2">
            {categoryStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-gray-700">{stat.category}</span>
                </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Derniers revenus */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Derniers Revenus</h4>
          {incomes.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {incomes.slice(-3).reverse().map((income) => (
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

        {/* Dernières dépenses payées */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Dernières Dépenses Payées</h4>
          {expenses.filter(e => e.isPaid).length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {expenses.filter(e => e.isPaid).slice(-3).reverse().map((expense) => (
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
            <p className="text-gray-500 text-sm">Aucune dépense payée</p>
          )}
        </div>
      </div>

      {/* Conseils et alertes */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Analyse et Conseils</h4>
        <div className="text-sm text-blue-700 space-y-1">
          {savingsRate >= 20 && <p>✅ Excellent taux d'épargne ! Continuez ainsi.</p>}
          {savingsRate < 20 && savingsRate >= 10 && <p>⚠️ Taux d'épargne correct, mais il y a de la marge pour améliorer.</p>}
          {savingsRate < 10 && remainingBudget >= 0 && <p>⚠️ Essayez d'économiser au moins 10% de vos revenus.</p>}
          {remainingBudget < 0 && <p>🚨 Attention : vos dépenses payées dépassent vos revenus ce mois-ci.</p>}
          {unpaidExpenses > remainingBudget && <p>⚠️ Vos dépenses non payées dépassent votre budget restant.</p>}
          {unpaidLoans > 0 && <p>💳 N'oubliez pas vos remboursements de prêts en cours.</p>}
          {futureExpenses.length > 0 && <p>📅 Pensez à budgétiser vos {futureExpenses.length} dépense(s) future(s).</p>}
          {categoryStats.length > 0 && categoryStats[0].percentage > 50 && 
            <p>📊 {categoryStats[0].category} représente plus de 50% de vos dépenses payées.</p>}
        </div>
      </div>
    </div>
  );
};