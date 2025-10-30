import React, { useState, useRef, useEffect } from 'react';
import { streamChatResponse } from '../services/gemini';
import { ChatMessage } from '../types';
import { ChatIcon, CloseIcon, SendIcon } from './Icons';

const welcomeMessage: ChatMessage = {
    sender: 'bot',
    text: `أهلاً بك في AI Book! أنا مساعدك الذكي.
يمكنني مساعدتك في:
- **مولد الاختبارات:** أنشئ امتحانات من أي نص أو ملف.
- **شرح الدروس:** بسّط المواضيع المعقدة بأساليب مختلفة.
- **منشئ المشاريع:** جهّز مشاريع متكاملة مع صور.
كيف يمكنني خدمتك اليوم؟`,
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const hasInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
        setMessages([welcomeMessage]);
        hasInitialized.current = true;
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botMessage: ChatMessage = { sender: 'bot', text: '' };
    setMessages(prev => [...prev, botMessage]);

    try {
        await streamChatResponse(input, (chunk) => {
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.sender === 'bot') {
                    const updatedMsg = { ...lastMsg, text: lastMsg.text + chunk };
                    return [...prev.slice(0, -1), updatedMsg];
                }
                return prev;
            });
        });
    } catch (error) {
        console.error("Chat error:", error);
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.sender === 'bot') {
              const updatedMsg = { ...lastMsg, text: "عذراً، لقد واجهت خطأ." };
              return [...prev.slice(0, -1), updatedMsg];
          }
          return prev;
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 z-50"
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-6 w-full max-w-sm h-[70vh] max-h-[600px] bg-gray-800/80 backdrop-blur-xl border border-slate-600/30 rounded-lg shadow-2xl flex flex-col z-40 animate-fade-in-slide-up">
          <div className="p-4 border-b border-slate-500/20 text-center font-orbitron text-lg text-slate-300">
            المساعد الذكي
          </div>
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-slate-600/50 text-white' : 'bg-gray-700 text-gray-200'}`}>
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                </div>
              </div>
            ))}
             {isLoading && messages[messages.length-1]?.sender === 'bot' && (
                <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-gray-700 text-gray-200">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-slate-500/20">
            <div className="flex items-center space-x-2 rtl:space-x-reverse bg-gray-900/50 rounded-lg p-1 border border-gray-600 focus-within:ring-2 focus-within:ring-slate-500">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسألني أي شيء..."
                className="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none px-2"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 rounded-md bg-slate-500 hover:bg-slate-400 text-gray-900 disabled:bg-gray-600 transition-colors"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
