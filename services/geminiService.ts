
import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_API } from './mockApi';
import type { Roadmap, Question } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a multi-week study roadmap.
 */
export const generateRoadmap = async (
  subject_pair: [string, string],
  target_exam_date: string,
  user_initial_weaknesses?: string
): Promise<Roadmap> => {
  const examAnalysis = await MOCK_API.getPastExamAnalysis(subject_pair);

  const systemInstruction = `Act as a seasoned college counselor and data analyst. Based on the user's selected subjects and historical exam patterns, create a multi-week study roadmap that prioritizes topics based on frequency in past exams and user-reported/inferred weakness. The roadmap should be structured as a JSON object. Ensure the schedule dynamically interweaves both subjects. The roadmap should span 8 weeks.`;

  const prompt = `
    Subjects: ${subject_pair.join(' & ')}
    Target Exam Date: ${target_exam_date}
    ${user_initial_weaknesses ? `User-reported weaknesses: ${user_initial_weaknesses}` : ''}
    Historical Data: ${JSON.stringify(examAnalysis.historical_data)}

    Generate an 8-week study roadmap.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.INTEGER },
                theme: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.STRING },
                      topic_id: { type: Type.STRING, description: "A concise, unique identifier for the topic, e.g., 'english_grammar_tenses'."},
                      task_type: { type: Type.STRING, description: "'lesson' or 'practice'" },
                      subject: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ["day", "topic_id", "task_type", "subject", "description"]
                  }
                }
              },
              required: ["week", "theme", "tasks"]
            }
          }
        },
        required: ["startDate", "endDate", "schedule"]
      },
    }
  });

  return JSON.parse(response.text) as Roadmap;
};


/**
 * Generates a lesson or explanation for a specific topic.
 */
export const generateLesson = async (
  topic_id: string,
  contextual_error?: string
): Promise<string> => {
  const systemInstruction = `Act as a subject matter expert. Generate concise, mobile-optimized lesson material, tutorials, or deep-dive explanations tailored to the specific knowledge gap identified. Keep the tone encouraging and academic. The output must be in Markdown format. Include an introductory summary, the core lesson, and example problems.`;

  const prompt = `
    Topic: ${topic_id}
    ${contextual_error ? `Specific mistake made by user: ${contextual_error}`: ''}
    
    Please generate the lesson content.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
    }
  });
  
  return response.text;
};

/**
 * Generates exam or practice questions.
 */
export const generateQuestions = async (
  subject: string,
  topic: string,
  difficulty_level: number,
  count: number = 5
): Promise<Question[]> => {
  const systemInstruction = `Generate high-quality, simulated entrance exam questions (MCQs and open-ended) that match the style, difficulty, and format of standard college entrance exams. Structure the output as a JSON array. For MCQs, provide 4 options. Always include a correct answer and a detailed explanation for why it's correct.`;

  const prompt = `
    Subject: ${subject}
    Topic: ${topic}
    Difficulty Level (1-10): ${difficulty_level}
    Number of Questions to Generate: ${count}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question_text: { type: Type.STRING },
            type: { type: Type.STRING, description: "'MCQ' or 'Short Answer'" },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correct_answer: { type: Type.STRING },
            correct_answer_explanation: { type: Type.STRING },
          },
          required: ["question_text", "type", "correct_answer", "correct_answer_explanation"]
        }
      }
    }
  });

  const parsedQuestions = JSON.parse(response.text) as Omit<Question, 'topic_id'>[];
  return parsedQuestions.map(q => ({ ...q, topic_id: topic }));
};