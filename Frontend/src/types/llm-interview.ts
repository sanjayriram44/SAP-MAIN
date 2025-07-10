export interface ConversationEntry {
  role: 'consultant' | 'customer';
  message: string;
}

export interface Subprocess {
  name: string;
  description: string;
}

export interface Question {
  question: string;
  followUps: string[];
}

export interface ToBeOption {
  title: string;
  description: string;
}

export interface LLMInterviewState {
  currentSubprocessIndex: number;
  currentQuestionIndex: number;
  conversationHistory: ConversationEntry[];
  showUnderstanding: boolean;
  asIsConfirmed: boolean;
  missingDetails: string;
  showToBeProcess: boolean;
  selectedToBeOption: string;
  currentAnswer: string;
}