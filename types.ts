export type Page = 'exam' | 'lesson' | 'project';

export enum Difficulty {
  Easy = 'سهل',
  Medium = 'متوسط',
  Hard = 'صعب',
}

export enum ExamType {
  MultipleChoice = 'خيارات متعددة',
  FillInTheBlank = 'املأ الفراغ',
  TrueFalse = 'صح / خطأ',
  Comprehensive = 'امتحان شامل',
}

export enum ExplanationStyle {
  Philosophical = 'فلسفي',
  Scientific = 'علمي',
  Simple = 'مبسط',
}

export type Question = {
  question: string;
  type: 'multiple-choice' | 'fill-in-the-blank' | 'true-false' | 'short-answer';
  options?: string[];
  answer: string | boolean;
};

export type Exam = {
  title: string;
  questions: Question[];
};

export type UserAnswers = { [key: number]: string | boolean };

export type CorrectionResult = {
  score: number;
  total: number;
  feedback: {
    questionIndex: number;
    isCorrect: boolean;
    correctAnswer: string | boolean;
    explanation: string;
  }[];
};

export type ChatMessage = {
  sender: 'user' | 'bot';
  text: string;
};

export type HistoryItem<T> = {
  id: string;
  timestamp: number;
  title: string;
  type: Page;
  data: T;
};
