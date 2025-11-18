
import React from 'react';
import type { UserAnswer, UserError } from '../types';
import { ChartBarIcon, ClockIcon, ArrowPathIcon, LightBulbIcon } from './icons';

interface PerformanceInsightsProps {
  allAnswers: UserAnswer[];
  errors: UserError[];
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ allAnswers, errors }) => {
  
  const recurringErrors = errors.reduce((acc, error) => {
    const topic = error.question.topic_id;
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sortedRecurringErrors = Object.entries(recurringErrors).sort((a, b) => b[1] - a[1]);

  const cognitivePerformance = allAnswers.reduce((acc, answer) => {
    const category = answer.question.cognitive_category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { correct: 0, total: 0 };
    }
    acc[category].total++;
    if (answer.is_correct) {
      acc[category].correct++;
    }
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);
  
  const correctAnswers = allAnswers.filter(a => a.is_correct);
  const incorrectAnswers = allAnswers.filter(a => !a.is_correct);

  const avgTimeCorrect = correctAnswers.length > 0 ? correctAnswers.reduce((sum, a) => sum + a.time_taken_seconds, 0) / correctAnswers.length : 0;
  const avgTimeIncorrect = incorrectAnswers.length > 0 ? incorrectAnswers.reduce((sum, a) => sum + a.time_taken_seconds, 0) / incorrectAnswers.length : 0;
  const avgTimeTotal = allAnswers.length > 0 ? allAnswers.reduce((sum, a) => sum + a.time_taken_seconds, 0) / allAnswers.length : 0;

  if (allAnswers.length === 0) {
      return (
        <div className="text-center p-12 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-8">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mx-auto flex items-center justify-center">
                <ChartBarIcon className="w-8 h-8"/>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mt-4">Diagnóstico de Desempenho</h2>
            <p className="text-slate-500 mt-2">Complete algumas sessões de prática para ver sua análise detalhada aqui.</p>
        </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Diagnóstico de Desempenho</h1>
        <p className="text-slate-500 mt-2">Análise em tempo real para otimizar seus estudos.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recurring Errors */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-full mr-3">
              <ArrowPathIcon className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Erros Recorrentes</h3>
          </div>
          {sortedRecurringErrors.length > 0 ? (
            <ul className="space-y-2">
              {sortedRecurringErrors.slice(0, 5).map(([topic, count]) => (
                <li key={topic} className="text-sm text-slate-600 flex justify-between">
                  <span className="truncate pr-2 capitalize">{topic.replace(/_/g, ' ')}</span>
                  <span className="font-bold">{count} {count > 1 ? 'erros' : 'erro'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Nenhum erro registrado ainda. Ótimo trabalho!</p>
          )}
        </div>

        {/* Pacing Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-md">
           <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <ClockIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Ritmo de Resolução</h3>
          </div>
          <div className="space-y-3 text-sm">
             <div className="flex justify-between items-center">
                <span className="text-slate-600">Tempo médio (Total)</span>
                <span className="font-bold text-slate-800">{avgTimeTotal.toFixed(1)}s</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-green-600">Tempo médio (Corretas)</span>
                <span className="font-bold text-green-700">{avgTimeCorrect.toFixed(1)}s</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-red-600">Tempo médio (Incorretas)</span>
                <span className="font-bold text-red-700">{avgTimeIncorrect.toFixed(1)}s</span>
             </div>
          </div>
        </div>
        
        {/* Cognitive Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-full mr-3">
              <LightBulbIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Análise Cognitiva</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(cognitivePerformance).map(([category, data]) => {
              const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-medium text-slate-700">{category}</span>
                    <span className="font-semibold text-indigo-600">{accuracy.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${accuracy}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;
