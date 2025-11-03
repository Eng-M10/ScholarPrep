
import React, { useState, useEffect, useCallback } from 'react';
import { generateLesson } from '../services/geminiService';
import type { DailyTask, Lesson } from '../types';
import LoadingSpinner from './LoadingSpinner';
import MarkdownRenderer from './MarkdownRenderer';
import { BookOpenIcon } from './icons';

interface LessonViewProps {
  task?: DailyTask;
  topicId: string;
  contextualError?: string;
  onBack: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ task, topicId, contextualError, onBack }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadLesson = useCallback(async () => {
    try {
      setIsLoading(true);
      const content = await generateLesson(topicId, contextualError);
      setLesson({ topicId, content });
    } catch (error) {
      console.error("Failed to generate lesson:", error);
    } finally {
      setIsLoading(false);
    }
  }, [topicId, contextualError]);

  useEffect(() => {
    loadLesson();
  }, [loadLesson]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        {isLoading ? (
          <LoadingSpinner text="Generating your lesson..." />
        ) : lesson ? (
          <>
            <div className="flex items-center text-slate-800 mb-6 pb-6 border-b border-slate-200">
                <div className="p-3 bg-indigo-100 rounded-full mr-4">
                   <BookOpenIcon className="w-8 h-8 text-indigo-600"/>
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{task?.description || topicId.replace(/_/g, ' ')}</h1>
                    {task && <p className="text-slate-500">{task.subject}</p>}
                </div>
            </div>
            <MarkdownRenderer content={lesson.content} />
          </>
        ) : (
          <p className="text-center text-red-500">Could not load the lesson. Please try again.</p>
        )}
        <div className="mt-8 text-center">
          <button onClick={onBack} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-md hover:bg-slate-300 transition-colors">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonView;
