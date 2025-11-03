
// Global Mock Data/API functions
export const MOCK_API = {
  // Provides historical data (frequency, difficulty) for the roadmap AI
  getPastExamAnalysis: (subjectPair: [string, string]) => Promise.resolve({
    subjects: subjectPair,
    historical_data: [
      { topic: 'Tense structure', frequency: 0.85, avg_difficulty: 7.2 },
      { topic: 'Literary Devices', frequency: 0.78, avg_difficulty: 6.5 },
      { topic: 'Algebraic Equations', frequency: 0.92, avg_difficulty: 8.1 },
      { topic: 'Verb Conjugation', frequency: 0.88, avg_difficulty: 7.5 },
    ]
  }),
  // Mock function to update user's progress/errors after a quiz
  postUserProgress: (userId: string, results: any) => Promise.resolve({ success: true, new_mastery_score: 75 }),
};
