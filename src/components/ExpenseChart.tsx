import React from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Expense, CustomCategory } from '../types';
import { calculateCategoryStats, formatCurrency } from '../utils/calculations';

interface ExpenseChartProps {
  expenses: Expense[];
  categories: CustomCategory[];
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses, categories }) => {
  const categoryStats = calculateCategoryStats(expenses, categories);

  if (categoryStats.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Répartition des Dépenses</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500">Aucune dépense enregistrée</p>
        </div>
      </div>
    );
  }

  let cumulativePercentage = 0;
  
  const chartRadius = 80;
  const chartCenter = 100;
  const strokeWidth = 8;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">Répartition des Dépenses</h3>
      </div>
      
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
        </div>
        
        <div className="flex-1 space-y-3">
          {categoryStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
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
  );
};