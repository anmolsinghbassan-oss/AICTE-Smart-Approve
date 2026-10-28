import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Paperclip,
  Trash2,
  FileCheck2,
  Bot,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ChatMsg {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  docAnalysis?: any;
  citations?: string[];
}

export const FloatingAIAssistant: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getGreetingText = (lng: string): string => {
    switch (lng) {
      case 'hi':
        return `नमस्ते! मैं आपका **एआईसीटीई स्मार्टअपरूव सहायक** हूँ।\n\nमैं आपकी क्या मदद कर सकता हूँ?\n- पूछें *"मेरी अर्ज़ी क्यों रुकी है?"*\n- पूछें *"मेरा स्कोर कैसे बढ़ाएं?"*\n- पूछें *"फायर एनओसी के क्या नियम हैं?"*`;
      case 'mr':
        return `नमस्ते! मी आपला **एआयसीटीई स्मार्टअपरूव सहाय्यक** आहे.\n\nमी आपल्याला कशी मदत करू शकेन?\n- विचारा *"माझा अर्ज का प्रलंबित आहे?"*\n- विचारा *"माझे गुण कसे वाढवावे?"*\n- विचारा *"अग्निशमन एनओसीचे नियम काय आहेत?"*`;
      case 'ta':
        return `வணக்கம்! நான் உங்கள் **AICTE SmartApprove உதவியாளர்**.\n\nஉங்களுக்கு நான் எவ்வாறு உதவ முடியும்?\n- கேளுங்கள் *"விண்ணப்பம் ஏன் நிலுவையில் உள்ளது?"*\n- கேளுங்கள் *"மதிப்பெண்ணை எவ்வாறு உயர்த்துவது?"*\n- கேளுங்கள் *"தீ பாதுகாப்புச் சான்றிதழ் விதிகள் என்ன?"*`;
      case 'bn':
        return `নমস্কার! আমি আপনার **AICTE SmartApprove সহকারী**।\n\nআপনাকে কীভাবে সাহায্য করতে পারি?\n- জিজ্ঞাসা করুন *"আমার আবেদন কেন আটকে আছে?"*\n- জিজ্ঞাসা করুন *"স্কোর কীভাবে উন্নত করব?"*\n- জিজ্ঞাসা করুন *"ফায়ার এনওসি নিয়মাবলী কী?"*`;
      default:
        return `Namaste! I am your **AICTE SmartApprove Assistant**.\n\nHow can I help you today?\n- Ask *"Why is my application stuck?"*\n- Ask *"Why is my score low?"*\n- Ask *"What are the Fire NOC rules?"*`;
    }
  };

  const getChips = (lng: string): string[] => {
    switch (lng) {
      case 'hi':
        return ['मेरी अर्ज़ी क्यों रुकी है?', 'मेरा स्कोर कैसे बढ़ाएं?', 'फायर एनओसी नियम', 'शिक्षक-छात्र अनुपात'];
      case 'mr':
        return ['माझा अर्ज का प्रलंबित आहे?', 'माझे गुण कसे वाढवावे?', 'अग्निशमन एनओसी नियम', 'शिक्षक प्रमाण'];
      case 'ta':
        return ['விண்ணப்பம் ஏன் நிலுவையில் உள்ளது?', 'மதிப்பெண்ணை உயர்த்துவது எப்படி?', 'தீ பாதுகாப்பு விதிகள்', 'ஆசிரியர் விகிதம்'];
      case 'bn':
        return ['আমার আবেদন কেন আটকে আছে?', 'স্কোর কীভাবে বাড়াব?', 'ফায়ার এনওসি নিয়ম', 'শিক্ষক অনুপাত'];
      default:
        return ['Why is my application stuck?', 'Why is my score low?', 'Validate Fire NOC document', 'Show Faculty Ratio'];
    }
  };

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content: getGreetingText(i18n.language || 'en'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: ['AICTE Handbook APH 2026']
    }
  ]);

  const [chips, setChips] = useState<string[]>(getChips(i18n.language || 'en'));

  // Update greeting and chips when language changes if no conversation has taken place
  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([
        {
          role: 'assistant',
          content: getGreetingText(i18n.language || 'en'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: ['AICTE Handbook APH 2026']
        }
      ]);
      setChips(getChips(i18n.language || 'en'));
    }
  }, [i18n.language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleCustomTrigger = (e: any) => {
      setIsOpen(true);
      if (e.detail?.query) {
        handleSend(e.detail.query);
      }
    };
    window.addEventListener('open-ai-assistant', handleCustomTrigger);
    return () => window.removeEventListener('open-ai-assistant', handleCustomTrigger);
  }, [messages, loading, i18n.language]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.chatAI([...messages, userMsg], i18n.language);
      const assistantMsg: ChatMsg = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
        docAnalysis: response.docAnalysis
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (response.suggestedChips && response.suggestedChips.length > 0) {
        setChips(response.suggestedChips);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Sorry, there was a temporary error. Please try again. All AICTE guidelines are based on the Approval Process Handbook (APH 2026).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const userMsg: ChatMsg = {
      role: 'user',
      content: `Uploaded document: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      setIsUploading(false);
      handleSend(`Validate and check rules for uploaded file ${file.name}`);
    }, 1200);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: getGreetingText(i18n.language || 'en'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['AICTE Handbook APH 2026']
      }
    ]);
    setChips(getChips(i18n.language || 'en'));
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-[#1F3864] hover:bg-blue-800 text-white shadow-xl hover:scale-105 active:scale-95 transition-all group ring-4 ring-blue-100"
        aria-label="Open AICTE Assistant"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-300 border-2 border-[#1F3864] animate-ping" />
        </div>
        <span className="font-bold text-xs tracking-tight">{t('ai.title') || 'AI Assistant'}</span>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[95vw] sm:w-[440px] h-[580px] max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#1F3864] text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  {t('ai.title')}
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-700/60 text-blue-200">
                    APH 2026
                  </span>
                </h4>
                <p className="text-[10px] text-blue-200">
                  {t('ai.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear Conversation"
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#1F3864] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] border border-blue-200">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#1F3864] text-white rounded-tr-xs font-medium'
                      : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-1 font-sans">
                    {msg.content.split('\n\n').map((para, pIdx) => {
                      if (para.startsWith('### ')) {
                        return <h5 key={pIdx} className="font-bold text-sm text-[#1F3864] mt-1">{para.replace('### ', '')}</h5>;
                      }
                      if (para.startsWith('#### ')) {
                        return <h6 key={pIdx} className="font-semibold text-xs text-slate-900 mt-1">{para.replace('#### ', '')}</h6>;
                      }
                      return <p key={pIdx} className="text-xs">{para}</p>;
                    })}
                  </div>

                  {/* Document Analysis Card if present */}
                  {msg.docAnalysis && (
                    <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span className="flex items-center gap-1 text-blue-700">
                          <FileCheck2 className="w-3.5 h-3.5" />
                          {msg.docAnalysis.documentName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          {msg.docAnalysis.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Confidence: {msg.docAnalysis.confidence}% | Rule Ref: {msg.docAnalysis.aphClause}
                      </div>
                    </div>
                  )}

                  {/* Citations & Source Links */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200 flex flex-wrap gap-1.5">
                      {msg.citations.map((cite, cIdx) => (
                        <span
                          key={cIdx}
                          onClick={() => navigate('/help')}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 hover:underline cursor-pointer bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          {cite}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className={`block text-[9px] mt-1 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Checking rules...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {chips.map((chip, cIdx) => (
              <button
                key={cIdx}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap bg-white text-slate-700 border border-slate-300 hover:border-blue-600 hover:text-blue-700 transition shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="px-3 py-1 bg-blue-50 text-[9px] text-[#1F3864] flex items-center justify-between border-t border-blue-100">
            <span className="truncate">
              {t('ai.disclaimer')}
            </span>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach document"
              className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-slate-100 transition"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={t('ai.placeholder')}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border-none text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-[#1F3864] hover:bg-blue-800 disabled:opacity-50 text-white transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
