
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Mood = 'great' | 'good' | 'okay' | 'bad' | 'awful' | null;

export interface MoodEntry {
  date: Date;
  mood: Mood;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AppContextType {
  user: {
    name: string;
    streakDays: number;
  } | null;
  setUser: React.Dispatch<React.SetStateAction<{
    name: string;
    streakDays: number;
  } | null>>;
  currentMood: Mood;
  setCurrentMood: React.Dispatch<React.SetStateAction<Mood>>;
  moodHistory: MoodEntry[];
  addMoodEntry: (entry: MoodEntry) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  breathingExerciseActive: boolean;
  setBreathingExerciseActive: React.Dispatch<React.SetStateAction<boolean>>;
  breathingPhase: 'inhale' | 'hold' | 'exhale' | 'rest';
  setBreathingPhase: React.Dispatch<React.SetStateAction<'inhale' | 'hold' | 'exhale' | 'rest'>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User state
  const [user, setUser] = useState<{ name: string; streakDays: number } | null>(null);
  
  // Mood tracking
  const [currentMood, setCurrentMood] = useState<Mood>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Breathing exercise state
  const [breathingExerciseActive, setBreathingExerciseActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  
  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mindhaven-user');
    const storedMoodHistory = localStorage.getItem('mindhaven-mood-history');
    const storedChatMessages = localStorage.getItem('mindhaven-chat-messages');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedMoodHistory) {
      const parsedMoodHistory = JSON.parse(storedMoodHistory);
      // Convert string dates back to Date objects
      setMoodHistory(parsedMoodHistory.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      })));
    }
    
    if (storedChatMessages) {
      const parsedChatMessages = JSON.parse(storedChatMessages);
      setChatMessages(parsedChatMessages.map((message: any) => ({
        ...message,
        timestamp: new Date(message.timestamp)
      })));
    }
  }, []);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('mindhaven-user', JSON.stringify(user));
    }
  }, [user]);
  
  useEffect(() => {
    if (moodHistory.length > 0) {
      localStorage.setItem('mindhaven-mood-history', JSON.stringify(moodHistory));
    }
  }, [moodHistory]);
  
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem('mindhaven-chat-messages', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);
  
  // Helper function to add a mood entry
  const addMoodEntry = (entry: MoodEntry) => {
    setMoodHistory(prev => [...prev, entry]);
    setCurrentMood(entry.mood);
  };
  
  // Helper function to add a chat message
  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    
    // If user sends a message, simulate AI response
    if (message.sender === 'user') {
      setTimeout(() => {
        generateAIResponse(message.text);
      }, 1000);
    }
  };
  
  // Simple AI response generator based on keywords
  const generateAIResponse = (userMessage: string) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    let response = '';
    
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      response = "Hello! I'm your MindHaven companion. How are you feeling today?";
    } else if (lowerCaseMessage.includes('anxious') || lowerCaseMessage.includes('anxiety')) {
      response = "I'm sorry to hear you're feeling anxious. Remember that anxiety is a normal response to stress. Try taking a few deep breaths with me in our breathing exercise section.";
    } else if (lowerCaseMessage.includes('sad') || lowerCaseMessage.includes('depressed')) {
      response = "I hear that you're feeling down. Depression and sadness are common emotions that many people experience. Would you like to talk more about what's on your mind?";
    } else if (lowerCaseMessage.includes('stress') || lowerCaseMessage.includes('stressed')) {
      response = "Stress can be overwhelming. Consider taking a short break to reset. Our guided breathing exercises can help reduce stress levels.";
    } else if (lowerCaseMessage.includes('happy') || lowerCaseMessage.includes('good')) {
      response = "I'm glad to hear you're feeling positive! It's important to acknowledge and celebrate these moments.";
    } else if (lowerCaseMessage.includes('breathe') || lowerCaseMessage.includes('breathing')) {
      response = "Breathing exercises can help calm your mind and body. You can try our guided breathing exercise in the 'Breathing' tab.";
    } else if (lowerCaseMessage.includes('help') || lowerCaseMessage.includes('emergency')) {
      response = "If you're in crisis, please reach out to a mental health professional immediately. You can call the National Suicide Prevention Lifeline at 1-800-273-8255 or text HOME to 741741 for Crisis Text Line.";
    } else {
      response = "Thank you for sharing. Remember that it's okay to feel what you're feeling, and I'm here to support you. Would you like to explore some coping strategies together?";
    }
    
    const newAIMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: response,
      sender: 'ai' as const,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newAIMessage]);
  };
  
  const value = {
    user,
    setUser,
    currentMood,
    setCurrentMood,
    moodHistory,
    addMoodEntry,
    chatMessages,
    addChatMessage,
    breathingExerciseActive,
    setBreathingExerciseActive,
    breathingPhase,
    setBreathingPhase
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
