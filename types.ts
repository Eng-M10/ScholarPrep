
export interface DailyTask {
  day: string;
  topic_id: string;
  task_type: 'lesson' | 'practice';
  subject: string;
  description: string;
}

export interface WeeklySchedule {
  week: number;
  theme: string;
  tasks: DailyTask[];
}

export interface Roadmap {
  startDate: string;
  endDate: string;
  schedule: WeeklySchedule[];
}

export interface Question {
  question_text: string;
  type: 'MCQ' | 'Short Answer';
  options?: string[];
  correct_answer: string;
  correct_answer_explanation: string;
  topic_id: string;
  cognitive_category: string;
}

export interface UserAnswer {
  question: Question;
  user_answer: string;
  is_correct: boolean;
  subject: string;
  time_taken_seconds: number;
}

export interface UserError extends UserAnswer {
  is_correct: false;
}

export interface UserData {
  subjects: [string, string];
  targetDate: string;
  weaknesses?: string;
}

export type AppView = 'onboarding' | 'dashboard' | 'exam' | 'lesson' | 'review' | 'insights';

export interface Lesson {
    topicId: string;
    content: string;
}
