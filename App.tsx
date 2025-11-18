
import React, { useState, useCallback } from 'react';
import type { AppView, DailyTask, Roadmap, UserAnswer, UserData, UserError } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ExamSimulation from './components/ExamSimulation';
import LessonView from './components/LessonView';
import ReviewErrors from './components/ReviewErrors';
import PerformanceInsights from './components/PerformanceInsights';
import { generateRoadmap } from './services/geminiService';
import { GraduationCapIcon, SparklesIcon } from './components/icons';


const App: React.FC = () => {
    const [view, setView] = useState<AppView>('onboarding');
    const [isLoading, setIsLoading] = useState(false);
    
    const [userData, setUserData] = useState<UserData | null>(null);
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [errors, setErrors] = useState<UserError[]>([]);
    const [allAnswers, setAllAnswers] = useState<UserAnswer[]>([]);
    const [masteryScore, setMasteryScore] = useState(70); // Initial mock score
    const [completionPercentage, setCompletionPercentage] = useState(10); // Initial mock percentage

    const [activeTask, setActiveTask] = useState<DailyTask | null>(null);
    const [activeTopic, setActiveTopic] = useState<{id: string, context?: string} | null>(null);

    const handleOnboardingComplete = useCallback(async (data: UserData) => {
        setIsLoading(true);
        try {
            const newRoadmap = await generateRoadmap(data.subjects, data.targetDate, data.weaknesses);
            setUserData(data);
            setRoadmap(newRoadmap);
            setView('dashboard');
        } catch (error) {
            console.error("Failed to generate roadmap:", error);
            // Optionally, set an error state to show in the UI
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleStartTask = (task: DailyTask) => {
        setActiveTask(task);
        if(task.task_type === 'lesson') {
            setActiveTopic({id: task.topic_id});
            setView('lesson');
        } else {
            setView('exam');
        }
    };

    const handleFinishExam = (results: { answers: UserAnswer[], errors: UserError[] }) => {
        setErrors(prevErrors => [...prevErrors, ...results.errors]);
        setAllAnswers(prevAnswers => [...prevAnswers, ...results.answers]);
        // Mock update mastery score
        const newScore = Math.min(100, masteryScore + 5 - results.errors.length);
        setMasteryScore(newScore);
        // Mock update completion
        setCompletionPercentage(prev => Math.min(100, prev + 5));
        
        setView('dashboard');
        setActiveTask(null);
    };
    
    const handleAnalyzeError = (error: UserError) => {
        setActiveTopic({id: error.question.question_text, context: `My incorrect answer was "${error.user_answer}". The correct answer is "${error.question.correct_answer}". Please explain the concept and why I was wrong.`});
        setView('lesson');
    };

    const handlePracticeTopic = (topic: string, subject: string) => {
        const practiceTask: DailyTask = {
            day: "Review",
            topic_id: topic,
            task_type: 'practice',
            subject: subject, // This is a limitation, we don't know the subject here. Should be improved.
            description: `Targeted practice for: ${topic}`
        };
        setActiveTask(practiceTask);
        setView('exam');
    };

    const navigateTo = (targetView: AppView) => {
        setActiveTask(null);
        setActiveTopic(null);
        setView(targetView);
    };


    const renderContent = () => {
        switch(view) {
            case 'onboarding':
                return <Onboarding onOnboardingComplete={handleOnboardingComplete} isLoading={isLoading} />;
            case 'dashboard':
                return roadmap ? <Dashboard roadmap={roadmap} masteryScore={masteryScore} completionPercentage={completionPercentage} onStartTask={handleStartTask} /> : null;
            case 'exam':
                return activeTask ? <ExamSimulation task={activeTask} onFinish={handleFinishExam} /> : null;
            case 'lesson':
                return activeTopic ? <LessonView topicId={activeTopic.id} contextualError={activeTopic.context} task={activeTask || undefined} onBack={() => navigateTo('dashboard')} /> : null;
            case 'review':
                return <ReviewErrors errors={errors} onAnalyzeError={handleAnalyzeError} onPracticeTopic={handlePracticeTopic} />;
            case 'insights':
                return <PerformanceInsights allAnswers={allAnswers} errors={errors} />;
            default:
                return <div>Invalid state</div>;
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-50">
            {view !== 'onboarding' && (
                <nav className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-2">
                                <GraduationCapIcon className="w-8 h-8 text-indigo-600"/>
                                <span className="font-bold text-xl text-slate-800">ScholarPrep</span>
                            </div>
                            <div className="flex space-x-1 sm:space-x-2">
                               <button onClick={() => navigateTo('dashboard')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'dashboard' ? 'text-indigo-600 bg-indigo-100' : 'text-slate-600 hover:bg-slate-100'}`}>Dashboard</button>
                               <button onClick={() => navigateTo('review')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'review' ? 'text-indigo-600 bg-indigo-100' : 'text-slate-600 hover:bg-slate-100'}`}>Revisar Erros</button>
                               <button onClick={() => navigateTo('insights')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${view === 'insights' ? 'text-indigo-600 bg-indigo-100' : 'text-slate-600 hover:bg-slate-100'}`}>
                                   <SparklesIcon className="w-4 h-4 mr-1.5" />
                                   Diagnóstico
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            )}
            <main>
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
