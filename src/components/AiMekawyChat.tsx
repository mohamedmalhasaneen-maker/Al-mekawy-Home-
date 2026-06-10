import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, MessageCircle, Phone, ArrowUp } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  "ما هي أسعار قطاعات UPVC المتاحة؟",
  "هل تقدمون معاينة مجانية لرفع المقاسات؟",
  "ما هو الفرق بين سلك البليسيه والبلاك أوت؟",
  "كيف أحسب تكلفة شباك في حاسبة الموقع؟"
];

const INITIAL_WELCOME = "مرحباً بك يا فندم في المكاوي هوم! 🌟 أنا مساعدك الذكي *Ai El-mekawy*. يمكنني إجابتك على كافة استفساراتك حول قطاعات الـ UPVC، أنواع الزجاج الفاخرة، والأسعار. كيف يمكنني خدمتك اليوم؟";

export default function AiMekawyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: INITIAL_WELCOME,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Create message history payload for the backend
      const payload = messages.concat(userMsg).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: payload })
      });

      if (!res.ok) {
        throw new Error('فشل الاتصال بالخادم الذكي');
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        content: "أهلاً بك! واجهت صعوبة في معالجة طلبك حالياً عبر نظام الـ AI، ولكن يشرفنا بالكامل تواصلك مع ممثلي مبيعات *المكاوي هوم* هاتفياً على *01141761261* أو *01060524985* أو عبر الواتساب فورا للحصول على الخدمة والمعاينة المجانية الدقيقة!",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-24 md:bottom-8 left-6 z-40 print:hidden">
        <motion.button
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-[#0F172A] text-white p-4 sm:p-5 rounded-full shadow-[0_4px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.45)] cursor-pointer flex items-center justify-center gap-2 border-2 border-white/20 transition-all group overflow-hidden"
          style={{ direction: 'rtl' }}
        >
          {/* Subtle moving glow light */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FACC15]/20 via-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <Sparkles className="w-5 h-5 text-[#FACC15] animate-pulse" />
          <span className="text-xs sm:text-sm font-black hidden sm:inline ml-1">Ai المكاوي لخدمتك</span>
          
          <div className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FACC15]"></span>
          </div>
        </motion.button>
      </div>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-28 sm:left-6 sm:w-96 h-[100dvh] sm:h-[550px] bg-white sm:rounded-3xl shadow-2xl border border-slate-100 z-50 flex flex-col overflow-hidden text-right print:hidden" dir="rtl">
            {/* Header decoration */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-indigo-600" />
            
            {/* Header */}
            <div className="bg-[#0F172A] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative p-2 bg-emerald-600/20 rounded-xl border border-emerald-550/30">
                  <Sparkles size={18} className="text-[#FACC15]" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#0F172A]" />
                </div>
                <div>
                  <h4 className="font-black text-sm tracking-tight text-white">Ai El-mekawy</h4>
                  <p className="text-[10px] text-emerald-400 font-bold">مستشارك الذكي وجاهز للرد فوراً</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/55 scrollbar-thin">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-bold leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-200 text-slate-800 rounded-tr-none' 
                      : 'bg-[#0F172A] text-white rounded-tl-none'
                  }`}>
                    {/* Preserve line-breaks and basic bold formatting from backend reply */}
                    <div className="whitespace-pre-wrap">
                      {msg.content.split('**').map((part, index) => 
                        index % 2 === 1 ? <strong key={index} className="text-[#FACC15]">{part}</strong> : part
                      ).map((part, idx) => 
                        typeof part === 'string' 
                          ? part.split('*').map((item, idy) => idy % 2 === 1 ? <strong key={idy} className="text-[#FACC15]">{item}</strong> : item)
                          : part
                      )}
                    </div>
                    <span className={`block text-[8px] mt-1.5 text-left opacity-60 ${
                      msg.role === 'user' ? 'text-slate-500' : 'text-slate-300'
                    }`}>
                      {msg.timestamp.toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-end">
                  <div className="bg-[#0F172A] text-white rounded-2xl p-4 text-xs font-bold rounded-tl-none flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>يكتب الذكاء الاصطناعي...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts (only when user has just welcome or simple thread) */}
            {messages.length <= 2 && (
              <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-1.5">
                <p className="text-[10px] text-slate-400 font-bold mb-1">أسئلة مقترحة:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      disabled={isLoading}
                      className="text-[10px] font-bold text-[#0F172A] bg-slate-50 hover:bg-[#FACC15] hover:text-[#0F172A] border border-slate-200 px-2.5 py-1.5 rounded-xl cursor-pointer text-right transition-colors disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 bg-slate-50 border-t border-slate-150 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="أرسل استفسارك لـ المكاوي هوم..."
                className="flex-1 bg-white text-xs font-bold border border-slate-200 focus:outline-none focus:border-emerald-500 rounded-xl px-3.5 py-3 text-right text-slate-800"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 bg-[#0F172A] hover:bg-emerald-600 text-white rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-[#0F172A]"
              >
                <Send size={15} className="rotate-180" />
              </button>
            </form>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
