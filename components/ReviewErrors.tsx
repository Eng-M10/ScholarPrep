
import React from 'react';
import type { UserError } from '../types';
import { PencilSquareIcon } from './icons';

interface ReviewErrorsProps {
  errors: UserError[];
  onAnalyzeError: (error: UserError) => void;
  onPracticeTopic: (topic: string, subject: string) => void;
}

const ReviewErrors: React.FC<ReviewErrorsProps> = ({ errors, onAnalyzeError, onPracticeTopic }) => {
  if (errors.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center">
            <PencilSquareIcon className="w-8 h-8"/>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mt-4">No Mistakes to Review!</h2>
        <p className="text-slate-500 mt-2">Great job! Keep up the hard work on your practice sessions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold text-slate-900 mb-6">Review Your Mistakes</h1>
      <div className="space-y-6">
        {errors.map((error, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-amber-300">
            <p className="font-semibold text-slate-800 mb-2">{error.question.question_text}</p>
            <div className="text-sm space-y-1 mb-4">
                <p>Your answer: <span className="font-medium text-red-600 bg-red-100 px-2 py-1 rounded">{error.user_answer}</span></p>
                <p>Correct answer: <span className="font-medium text-green-600 bg-green-100 px-2 py-1 rounded">{error.question.correct_answer}</span></p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                 <button onClick={() => onAnalyzeError(error)} className="flex-1 bg-amber-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-amber-600 transition-colors text-sm">
                    Analyze My Mistake
                 </button>
                 <button onClick={() => onPracticeTopic(error.question.question_text, 'Unknown')} className="flex-1 bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors text-sm">
                    Practice This Topic
                 </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewErrors;
