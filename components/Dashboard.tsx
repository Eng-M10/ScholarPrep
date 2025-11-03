
import React, { useState } from 'react';
import type { Roadmap, DailyTask } from '../types';
import RingChart from './RingChart';
import { BookOpenIcon, CheckCircleIcon } from './icons';

interface DashboardProps {
  roadmap: Roadmap;
  masteryScore: number;
  completionPercentage: number;
  onStartTask: (task: DailyTask) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ roadmap, masteryScore, completionPercentage, onStartTask }) => {
  const [activeWeek, setActiveWeek] = useState(0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Your Study Dashboard</h1>
        <p className="text-slate-500 mt-2">Here's your personalized plan for success. Stay focused!</p>
      </header>
      
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-around">
          <RingChart progress={completionPercentage} label="Completion" />
          <RingChart progress={masteryScore} label="Mastery Score" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-slate-800">Roadmap Overview</h3>
            <p className="text-sm text-slate-500">Your plan from {new Date(roadmap.startDate).toLocaleDateString()} to {new Date(roadmap.endDate).toLocaleDateString()}</p>
            <p className="mt-2 text-sm text-slate-600">Total Weeks: <span className="font-bold">{roadmap.schedule.length}</span></p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Weekly Plan</h2>
        <div className="flex space-x-2 mb-6 border-b border-slate-200">
          {roadmap.schedule.map((week, index) => (
            <button 
              key={week.week} 
              onClick={() => setActiveWeek(index)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeWeek === index ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-100'}`}
            >
              Week {week.week}
            </button>
          ))}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-1">{roadmap.schedule[activeWeek].theme}</h3>
            <p className="text-slate-500 mb-6">Week {roadmap.schedule[activeWeek].week} Focus</p>
            <div className="space-y-4">
              {roadmap.schedule[activeWeek].tasks.map((task) => (
                <div key={`${task.day}-${task.topic_id}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${task.task_type === 'lesson' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {task.task_type === 'lesson' ? <BookOpenIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{task.description}</p>
                      <p className="text-sm text-slate-500">{task.day} &middot; {task.subject} &middot; {task.task_type.charAt(0).toUpperCase() + task.task_type.slice(1)}</p>
                    </div>
                  </div>
                  <button onClick={() => onStartTask(task)} className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors text-sm">
                    Start
                  </button>
                </div>
              ))}
            </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
