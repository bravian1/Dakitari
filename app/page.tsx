'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Send, History, MessageSquare, Stethoscope, Loader2, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSpeechRecognition, playAudioBase64, stopAudio } from '@/hooks/useSpeech';
import { getTriageResult, generateSpeech } from '@/lib/gemini';
import { TriageResult, Consultation } from '@/types';
import { TriageCard } from '@/components/TriageCard';
import { HistorySidebar } from '@/components/HistorySidebar';

const translations = {
  sw: {
    appTitle: "Dakitari",
    voiceMode: "Sauti",
    chatMode: "Ujumbe",
    tapToSpeak: "Gusa ili uongee",
    listening: "Inasikiliza...",
    processing: "Inachanganua...",
    typeSymptoms: "Andika dalili hapa...",
    send: "Tuma",
    history: "Historia",
    newPatient: "Mgonjwa Mpya",
    listenAgain: "Sikiliza Tena",
    stopAudio: "Simamisha Sauti",
    loadingAudio: "Inapakia sauti...",
    settings: "Mipangilio",
    aiVoice: "Sauti ya AI",
    severityLow: "Chini",
    severityMedium: "Kati",
    severityCritical: "Mahututi",
    condition: "Hali Inayowezekana",
    symptoms: "Dalili Zilizotambuliwa",
    actions: "Hatua za Kuchukua",
    noHistory: "Hakuna historia ya wagonjwa bado.",
    voiceNotSupported: "Kivinjari chako hakikubali sauti. Tafadhali tumia ujumbe.",
  },
  en: {
    appTitle: "Dakitari",
    voiceMode: "Voice",
    chatMode: "Chat",
    tapToSpeak: "Tap to speak",
    listening: "Listening...",
    processing: "Analyzing...",
    typeSymptoms: "Type symptoms here...",
    send: "Send",
    history: "History",
    newPatient: "New Patient",
    listenAgain: "Listen Again",
    stopAudio: "Stop Audio",
    loadingAudio: "Loading audio...",
    settings: "Settings",
    aiVoice: "AI Voice",
    severityLow: "Low",
    severityMedium: "Medium",
    severityCritical: "Critical",
    condition: "Likely Condition",
    symptoms: "Matched Symptoms",
    actions: "Recommended Actions",
    noHistory: "No patient history yet.",
    voiceNotSupported: "Your browser does not support voice input. Please use chat.",
  }
};

export default function Home() {
  const [lang, setLang] = useState<'sw' | 'en'>('sw');
  const [mode, setMode] = useState<'voice' | 'chat'>('voice');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [currentConsultation, setCurrentConsultation] = useState<Consultation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  const [voice, setVoice] = useState('Kore');
  const [showSettings, setShowSettings] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioReqRef = useRef<string | null>(null);

  const t = translations[lang];
  
  const handleFinalTranscript = async (text: string) => {
    if (!text.trim()) return;
    await processInput(text);
  };

  const { isListening, isSupported: sttSupported, transcript, startListening, stopListening } = useSpeechRecognition(
    lang === 'sw' ? 'sw-KE' : 'en-KE',
    handleFinalTranscript
  );

  useEffect(() => {
    if (!sttSupported) {
      setMode('chat');
    }
  }, [sttSupported]);

  const handleToggleAudio = async (c: Consultation) => {
    if (activeAudioId === c.id) {
      stopAudio();
      setActiveAudioId(null);
      setIsAudioLoading(false);
      audioReqRef.current = null;
      return;
    }

    stopAudio();
    const reqId = Math.random().toString();
    audioReqRef.current = reqId;
    setActiveAudioId(c.id);
    setIsAudioLoading(true);

    try {
      const summary = lang === 'sw' ? c.result.summary_sw : c.result.summary_en;
      const base64 = await generateSpeech(summary, voice);

      if (audioReqRef.current === reqId) {
        setIsAudioLoading(false);
        if (base64) {
          await playAudioBase64(base64, () => {
            if (audioReqRef.current === reqId) {
              setActiveAudioId(null);
              audioReqRef.current = null;
            }
          });
        } else {
          setActiveAudioId(null);
        }
      }
    } catch (e) {
      console.error("TTS Error", e);
      if (audioReqRef.current === reqId) {
        setIsAudioLoading(false);
        setActiveAudioId(null);
      }
    }
  };

  const processInput = async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await getTriageResult(text);
      const newConsultation: Consultation = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        transcript: text,
        result,
      };
      setConsultations(prev => [...prev, newConsultation]);
      setCurrentConsultation(newConsultation);
      
      if (mode === 'voice') {
        handleToggleAudio(newConsultation);
      }
    } catch (error) {
      console.error("Triage error:", error);
      alert("Error processing triage. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendChat = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isProcessing) return;
    processInput(chatInput);
    setChatInput('');
  };

  const resetConsultation = () => {
    setCurrentConsultation(null);
    stopAudio();
    setActiveAudioId(null);
    setIsAudioLoading(false);
    audioReqRef.current = null;
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consultations, mode, isProcessing]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 text-blue-600">
          <Stethoscope className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">{t.appTitle}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
            <button 
              onClick={() => setLang('sw')}
              className={`px-3 py-1 rounded-md transition-colors ${lang === 'sw' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              SW
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-md transition-colors ${lang === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              EN
            </button>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mode Switcher */}
      <div className="flex justify-center p-4">
        <div className="bg-white border p-1 rounded-full flex shadow-sm">
          <button
            onClick={() => { setMode('voice'); resetConsultation(); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'voice' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Mic className="w-4 h-4" />
            {t.voiceMode}
          </button>
          <button
            onClick={() => { setMode('chat'); resetConsultation(); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {t.chatMode}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative overflow-hidden">
        {mode === 'voice' ? (
          <div className="flex-grow flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {currentConsultation ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full"
                >
                  <TriageCard 
                    result={currentConsultation.result} 
                    lang={lang} 
                    t={t} 
                    isSpeaking={activeAudioId === currentConsultation.id && !isAudioLoading}
                    isLoadingAudio={activeAudioId === currentConsultation.id && isAudioLoading}
                    onToggleAudio={() => handleToggleAudio(currentConsultation)}
                    onNewPatient={resetConsultation}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="input"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center w-full"
                >
                  {!sttSupported && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-center text-sm">
                      {t.voiceNotSupported}
                    </div>
                  )}
                  
                  <div className="relative mb-12">
                    {isListening && (
                      <motion.div 
                        className="absolute inset-0 bg-blue-400 rounded-full opacity-20"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    )}
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={!sttSupported || isProcessing}
                      className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-xl ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-12 h-12 animate-spin" />
                      ) : isListening ? (
                        <Square className="w-10 h-10 fill-current" />
                      ) : (
                        <Mic className="w-12 h-12" />
                      )}
                    </button>
                  </div>

                  <div className="text-center max-w-md w-full">
                    <h2 className="text-xl font-medium text-gray-800 mb-4">
                      {isProcessing ? t.processing : isListening ? t.listening : t.tapToSpeak}
                    </h2>
                    <div className="min-h-[100px] p-6 bg-white rounded-2xl border border-gray-100 shadow-inner text-gray-600 text-lg leading-relaxed">
                      {transcript || <span className="text-gray-300 italic">...</span>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-grow flex flex-col max-w-3xl mx-auto w-full h-full">
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
              {consultations.map((c) => (
                <div key={c.id} className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                      {c.transcript}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[95%]">
                      <TriageCard 
                        result={c.result} 
                        lang={lang} 
                        t={t} 
                        isSpeaking={activeAudioId === c.id && !isAudioLoading}
                        isLoadingAudio={activeAudioId === c.id && isAudioLoading}
                        onToggleAudio={() => handleToggleAudio(c)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    {t.processing}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 bg-white border-t">
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t.typeSymptoms}
                  disabled={isProcessing}
                  className="flex-grow bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isProcessing}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <HistorySidebar 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        consultations={[...consultations].reverse()} 
        lang={lang} 
        t={t}
        onSelect={(c) => {
          setMode('voice');
          setCurrentConsultation(c);
        }}
      />

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{t.settings}</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.aiVoice}</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  {['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
