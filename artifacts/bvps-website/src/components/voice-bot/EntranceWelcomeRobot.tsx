import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Sparkles, Volume2, VolumeX, X, ArrowRight, 
  FileText, MessageSquare, Play, HelpCircle, PhoneCall
} from 'lucide-react';
import schoolLogo from '@/assets/school-logo.png';
import { RobotAvatar } from './RobotAvatar';

interface EntranceWelcomeRobotProps {
  onOpenVoiceAssistant?: () => void;
}

export function EntranceWelcomeRobot({ onOpenVoiceAssistant }: EntranceWelcomeRobotProps) {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Check if shown in current session
    const hasSeenWelcome = sessionStorage.getItem('bvps_welcome_robot_seen');
    if (!hasSeenWelcome) {
      // Show welcoming robot after a brief 1.2s delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const welcomeSpeechText = 
    "नमस्ते! बाल विकास पब्लिक स्कूल, कलायत में आपका हार्दिक स्वागत है! सत्र 2025-26 के दाखिले कक्षा 1 से 12वीं तक खुले हैं। हमारी वेबसाइट पर पधारने के लिए बहुत-बहुत धन्यवाद!";

  const playVoiceGreeting = () => {
    setHasInteracted(true);
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(welcomeSpeechText);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const closeWelcome = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsVisible(false);
    sessionStorage.setItem('bvps_welcome_robot_seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Welcome Card */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-primary/95 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/40 flex flex-col items-center text-center overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/40 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeWelcome}
          aria-label="Close welcome robot"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* School Crest Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 mb-3">
          <img src={schoolLogo} alt="BVPS Logo" className="w-5 h-5 object-contain" />
          <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase">
            Bal Vikas Public School, Kalayat
          </span>
        </div>

        {/* Animated 3D Welcome Robot Avatar with Namaste 🙏 */}
        <div className="relative my-2">
          <RobotAvatar
            size="lg"
            isSpeaking={isSpeaking}
            isGreeting={true}
            showHands={true}
          />
          
          {/* Namaste Ribbon */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black px-4 py-1 rounded-full shadow-lg border border-white/40 flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '2s' }}>
            <span>🙏 सादर नमस्ते! स्वागतम्</span>
          </div>
        </div>

        {/* Spoken Welcome Text Bubble */}
        <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 shadow-inner mt-4 mb-5">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
            बाल विकास पब्लिक स्कूल, कलायत में आपका स्वागत है!
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            "सत्र <span className="text-amber-300 font-bold">2025-26</span> के लिए कक्षा 1 से 12वीं तक दाखिले प्रारंभ हैं। मैं आपका <span className="text-amber-300 font-bold">AI रोबोट मित्र</span> हूँ। स्कूल से जुड़ी कोई भी जानकारी पाने के लिए मुझसे कभी भी बात करें।"
          </p>

          {/* Audio Greeting Play Trigger */}
          <div className="mt-3.5 flex items-center justify-center gap-2">
            <button
              onClick={playVoiceGreeting}
              className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all shadow-md ${
                isSpeaking 
                  ? 'bg-emerald-500 text-white animate-pulse' 
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 hover:scale-105'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'आवाज़ में बोल रहा हूँ...' : '🔊 आवाज़ में स्वागत सुनें (Listen Voice)'}</span>
            </button>
          </div>
        </div>

        {/* Action Grid Buttons */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 z-10">
          
          {/* 1. Open Voice Assistant */}
          <button
            onClick={() => {
              closeWelcome();
              if (onOpenVoiceAssistant) {
                onOpenVoiceAssistant();
              } else {
                // Trigger voice bot open event
                window.dispatchEvent(new CustomEvent('open-bvps-voicebot'));
              }
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI रोबोट से पूछें (Voice Chat)</span>
          </button>

          {/* 2. Admission Application */}
          <button
            onClick={() => {
              closeWelcome();
              setLocation('/application');
            }}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 border border-white/20 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>दाखिला फॉर्म भरें (Apply)</span>
          </button>
        </div>

        {/* Continue to Website Link */}
        <button
          onClick={closeWelcome}
          className="mt-4 text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <span>वेबसाइट देखना जारी रखें (Continue to Website)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
