
import React, { useState, useEffect, useCallback } from 'react';
import { generateQuestions } from '../services/geminiService';
import type { Question, UserAnswer, DailyTask, UserError } from '../types';
import LoadingSpinner from './LoadingSpinner';
import MarkdownRenderer from './MarkdownRenderer';
import { LightBulbIcon } from './icons';

interface ExamSimulationProps {
  task: DailyTask;
  onFinish: (results: { answers: UserAnswer[], errors: UserError[] }) => void;
}

const ExamSimulation: React.FC<ExamSimulationProps> = ({ task, onFinish }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [finalResults, setFinalResults] = useState<{ answers: UserAnswer[], errors: UserError[] } | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState<number[]>([]);

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedQuestions = await generateQuestions(task.subject, task.topic_id, 6, 5);
      setQuestions(fetchedQuestions);
      setUserAnswers(new Array(fetchedQuestions.length).fill(''));
      setTimePerQuestion(new Array(fetchedQuestions.length).fill(0));
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error("Failed to generate questions:", error);
      // Handle error state in UI
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.subject, task.topic_id]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const submitExam = () => {
    const finalTimes = [...timePerQuestion];
    finalTimes[currentQuestionIndex] = (Date.now() - questionStartTime) / 1000;

    const results: UserAnswer[] = questions.map((q, i) => ({
        question: q,
        user_answer: userAnswers[i],
        is_correct: q.correct_answer.toLowerCase().trim() === userAnswers[i].toLowerCase().trim(),
        subject: task.subject,
        time_taken_seconds: finalTimes[i] || 0,
    }));
    const errors: UserError[] = results.filter((r): r is UserError => !r.is_correct);
    setFinalResults({ answers: results, errors });
    setIsFinished(true);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const timeTaken = (Date.now() - questionStartTime) / 1000;
      setTimePerQuestion(prev => {
          const newTimes = [...prev];
          newTimes[currentQuestionIndex] = timeTaken;
          return newTimes;
      });
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
    } else {
      submitExam();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner text="Generating your practice exam..." /></div>;
  }
  
  if (isFinished && finalResults) {
    const score = finalResults.answers.filter(a => a.is_correct).length;
    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-center mb-2">Practice Complete!</h1>
            <p className="text-center text-slate-600 mb-8">You scored {score} out of {questions.length}.</p>
            <div className="space-y-6">
                {finalResults.answers.map((result, index) => (
                    <div key={index} className={`p-6 rounded-lg border ${result.is_correct ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                        <div className="flex justify-between items-start">
                           <p className="font-semibold text-slate-800 mb-2 flex-1">{index + 1}. {result.question.question_text}</p>
                           <span className="text-xs text-slate-500 ml-4 whitespace-nowrap">{result.time_taken_seconds.toFixed(1)}s</span>
                        </div>
                        <p className="text-sm">Your answer: <span className={`font-medium ${result.is_correct ? 'text-green-700' : 'text-red-700'}`}>{result.user_answer || "No answer"}</span></p>
                        {!result.is_correct && <p className="text-sm">Correct answer: <span className="font-medium text-green-700">{result.question.correct_answer}</span></p>}
                        <div className="mt-4 p-4 bg-indigo-50 rounded-md border border-indigo-200">
                           <div className="flex items-center text-indigo-700 font-semibold mb-2">
                               <LightBulbIcon className="w-5 h-5 mr-2"/>
                               <span>Explanation</span>
                           </div>
                           <div className="text-sm text-indigo-900">
                               <MarkdownRenderer content={result.question.correct_answer_explanation} />
                           </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-8">
                 <button onClick={() => onFinish(finalResults)} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-700 transition-colors">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
  }

  if (!questions.length) {
    return <div className="text-center p-8">Could not generate questions for this topic. Please try again later.</div>
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="mb-6">
                <p className="text-sm text-indigo-600 font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <div className="mt-1 w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-6">{currentQuestion.question_text}</h2>

            {currentQuestion.type === 'MCQ' && currentQuestion.options ? (
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <label key={index} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${userAnswers[currentQuestionIndex] === option ? 'bg-indigo-100 border-indigo-500' : 'border-slate-300 hover:bg-slate-50'}`}>
                            <input type="radio" name={`question-${currentQuestionIndex}`} value={option} checked={userAnswers[currentQuestionIndex] === option} onChange={(e) => handleAnswerChange(e.target.value)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                            <span className="ml-3 text-slate-700">{option}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <textarea
                    rows={4}
                    value={userAnswers[currentQuestionIndex]}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            )}
            
            <div className="mt-8 text-right">
                <button onClick={handleNext} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-slate-400" disabled={!userAnswers[currentQuestionIndex]}>
                    {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ExamSimulation;
