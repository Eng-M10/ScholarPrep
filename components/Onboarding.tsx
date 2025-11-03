
import React, { useState } from 'react';
import type { UserData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { GraduationCapIcon } from './icons';

interface OnboardingProps {
  onOnboardingComplete: (userData: UserData) => void;
  isLoading: boolean;
}

const availableSubjects = [
  "English", "Portuguese", "Mathematics", "History", "Geography",
  "Physics", "Chemistry", "Biology", "Philosophy", "Sociology"
];

const Onboarding: React.FC<OnboardingProps> = ({ onOnboardingComplete, isLoading }) => {
  const [subject1, setSubject1] = useState<string>("English");
  const [subject2, setSubject2] = useState<string>("Mathematics");
  const [targetDate, setTargetDate] = useState<string>(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 60 days from now
  const [weaknesses, setWeaknesses] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject1 === subject2) {
      setError('Please select two different subjects.');
      return;
    }
    setError('');
    onOnboardingComplete({
      subjects: [subject1, subject2],
      targetDate,
      weaknesses,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-block bg-indigo-100 p-3 rounded-full mb-4">
             <GraduationCapIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome to ScholarPrep</h1>
          <p className="text-slate-500 mt-2">Your personal AI tutor for exam success.</p>
        </div>
        
        {isLoading ? (
          <LoadingSpinner text="Building your personalized roadmap..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="subject1" className="block text-sm font-medium text-slate-700">Select Subject 1</label>
              <select id="subject1" value={subject1} onChange={(e) => setSubject1(e.target.value)} className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div>
              <label htmlFor="subject2" className="block text-sm font-medium text-slate-700">Select Subject 2</label>
              <select id="subject2" value={subject2} onChange={(e) => setSubject2(e.target.value)} className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-slate-700">Target Exam Date</label>
              <input type="date" id="targetDate" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label htmlFor="weaknesses" className="block text-sm font-medium text-slate-700">Initial Weaknesses (Optional)</label>
              <textarea id="weaknesses" value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} rows={3} placeholder="e.g., advanced grammar, quadratic equations" className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300">
              Generate My Roadmap
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
