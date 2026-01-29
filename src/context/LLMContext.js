// LLMContext.js
import React, { createContext, useContext, useState } from "react";

const LLMContext = createContext();

export const LLMProvider = ({ children }) => {
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [llmProjectId, setLLMProjectId] = useState("")
  const [promptsSelectedDate, SetPromptsSelectedDate] = useState("")

  return (
    <LLMContext.Provider value={{ totalAnswers, setTotalAnswers, llmProjectId, setLLMProjectId, promptsSelectedDate, SetPromptsSelectedDate }}>
      {children}
    </LLMContext.Provider>
  );
};

export const useLLM = () => {
  const context = useContext(LLMContext);
  if (!context) throw new Error("useLLM must be used within LLMProvider");
  return context;
};