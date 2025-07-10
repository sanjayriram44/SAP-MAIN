import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LLMInterviewState, ConversationEntry } from "@/types/llm-interview";
import { sourcingSubprocesses, rfxQuestions } from "@/data/llm-interview-data";

export const useLLMInterview = () => {
  const navigate = useNavigate();
  const { productId, moduleId } = useParams();
  
  const [state, setState] = useState<LLMInterviewState>({
    currentSubprocessIndex: 0,
    currentQuestionIndex: 0,
    conversationHistory: [],
    showUnderstanding: false,
    asIsConfirmed: false,
    missingDetails: "",
    showToBeProcess: false,
    selectedToBeOption: "",
    currentAnswer: ""
  });
  const getCurrentFollowup = () => {
    const isRFx = state.currentSubprocessIndex === 2; // index for "RFx Management"
    const followUpIndex = state.currentQuestionIndex - 1;
  
    if (isRFx && rfxQuestions[0] && followUpIndex >= 0 && followUpIndex < rfxQuestions[0].followUps.length) {
      return {
        question: rfxQuestions[0].followUps[followUpIndex],
        answer: state.currentAnswer
      };
    }
  
    return null;
  };
  

  const currentSubprocess = sourcingSubprocesses[state.currentSubprocessIndex];
  const progress = ((state.currentSubprocessIndex + 1) / sourcingSubprocesses.length) * 100;

  const getCurrentQuestion = () => {
    if (state.currentSubprocessIndex === 2 && rfxQuestions[0]) { // RFx Management
      if (state.currentQuestionIndex === 0) {
        return rfxQuestions[0].question;
      } else if (state.currentQuestionIndex <= rfxQuestions[0].followUps.length) {
        return rfxQuestions[0].followUps[state.currentQuestionIndex - 1];
      }
    }
    return "Tell me about your current process for " + currentSubprocess.name.toLowerCase();
  };

  const handleAnswerSubmit = () => {
    if (!state.currentAnswer.trim()) return;

    const newEntry: ConversationEntry = {
      role: 'customer',
      message: state.currentAnswer
    };

    const consultantQuestion: ConversationEntry = {
      role: 'consultant',
      message: getCurrentQuestion()
    };

    setState(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, consultantQuestion, newEntry],
      currentAnswer: "",
      currentQuestionIndex: prev.currentSubprocessIndex === 2 && prev.currentQuestionIndex < rfxQuestions[0].followUps.length 
        ? prev.currentQuestionIndex + 1 
        : prev.currentQuestionIndex
    }));
  };

  const handleShowUnderstanding = () => {
    setState(prev => ({ ...prev, showUnderstanding: true }));
  };

  const handleConfirmAsIs = () => {
    setState(prev => ({ ...prev, asIsConfirmed: true }));
  };

  const handleRegenerateUnderstanding = () => {
    setState(prev => ({ ...prev, missingDetails: "" }));
  };

  const handleShowToBeProcess = () => {
    setState(prev => ({ ...prev, showToBeProcess: true }));
  };

  const handleNextSubprocess = () => {
    if (state.currentSubprocessIndex < sourcingSubprocesses.length - 1) {
      setState(prev => ({
        ...prev,
        currentSubprocessIndex: prev.currentSubprocessIndex + 1,
        currentQuestionIndex: 0,
        conversationHistory: [],
        showUnderstanding: false,
        asIsConfirmed: false,
        showToBeProcess: false,
        selectedToBeOption: ""
      }));
    } else {
      navigate(`/product/${productId}/module/${moduleId}/generation/bbp/questionnaire/llm-interview/blueprint`);
    }
  };

  const updateState = (updates: Partial<LLMInterviewState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return {
    state,
    currentSubprocess,
    progress,
    productId,
    moduleId,
    getCurrentQuestion,
    handleAnswerSubmit,
    handleShowUnderstanding,
    handleConfirmAsIs,
    handleRegenerateUnderstanding,
    handleShowToBeProcess,
    handleNextSubprocess,
    updateState,
    navigate
  };
};