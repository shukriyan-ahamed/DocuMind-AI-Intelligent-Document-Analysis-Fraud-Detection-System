import React, { useState, useRef, useEffect } from 'react';
import { UploadedFile, ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  file: UploadedFile;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ file }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on mount or file change
  useEffect(() => {
    chatSessionRef.current = createChatSession(file.base64, file.mimeType);
    setMessages([{
      role: 'model',
      text: `Hi! I've analyzed **${file.file.name}**. Ask me anything about it.`,
      timestamp: new Date()
    }]);
  }, [file]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: input });
      const responseText = result.text;
      
      setMessages(prev => [...prev, {
        role: 'model',
        text: responseText,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "Sorry, I encountered an error responding to that. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="font-semibold text-slate-200 text-sm">Chatting with {file.file.name}</span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                        {msg.role === 'user' ? <User size={16} className="text-white"/> : <Bot size={16} className="text-white"/>}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                        <Bot size={16} className="text-white"/>
                    </div>
                    <div className="bg-slate-700 border border-slate-600 px-4 py-2 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-slate-400"/>
                        <span className="text-slate-400 text-xs">Thinking...</span>
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-700">
            <div className="relative flex items-center">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about the document..."
                    className="w-full bg-slate-800 text-slate-200 border border-slate-600 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 text-sm transition-all"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    </div>
  );
};
