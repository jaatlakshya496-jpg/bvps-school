import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, 
  Check, Phone, Navigation, ArrowRight, CornerDownLeft
} from 'lucide-react';

interface VoiceCommand {
  patterns: RegExp[];
  action: (setLocation: (path: string) => void) => { messageHi: string; messageEn: string; path?: string };
}

const VOICE_COMMANDS: VoiceCommand[] = [
  // Fee Structure
  {
    patterns: [
      /fee|fees|shulk|paisa|kitni fee|kharch|fee structure|fees dikhao|fees batao|fees kitni/i,
    ],
    action: (setLocation) => {
      setLocation('/fee-structure');
      return {
        messageHi: "फीस स्ट्रक्चर पेज खोल दिया गया है। कक्षा 1 से 12वीं तक की फीस स्क्रीन पर उपलब्ध है।",
        messageEn: "Opening Fee Structure page. Transparent fees for Classes 1 to 12 are displayed on your screen.",
        path: '/fee-structure'
      };
    }
  },
  // Admission Form / Apply
  {
    patterns: [
      /admission form|form bharna|apply|admission|dakhila form|daakhila|online form|application|form dikhao|form kholo/i,
    ],
    action: (setLocation) => {
      setLocation('/application');
      return {
        messageHi: "ऑनलाइन एडमिशन फॉर्म खोल दिया गया है। कृपया छात्र का विवरण दर्ज करें।",
        messageEn: "Opening Online Admission Form. Please fill in the student application details.",
        path: '/application'
      };
    }
  },
  // Streams 11th - 12th
  {
    patterns: [
      /stream|streams|arts|commerce|non medical|science|subject|subjects|11th|12th|gyarahvi|barahvi|sankay|vishey/i,
    ],
    action: (setLocation) => {
      setLocation('/streams');
      return {
        messageHi: "11वीं और 12वीं के संकाय (Arts, Commerce, Non-Medical) पेज पर उपलब्ध हैं।",
        messageEn: "Opening Streams page for Classes 11 and 12 (Arts, Commerce, and Science Non-Medical).",
        path: '/streams'
      };
    }
  },
  // School Timings
  {
    patterns: [
      /timing|timings|samay|time|kab khulta|kab band|kitne baje|schedule|prayer|assembly/i,
    ],
    action: (setLocation) => {
      setLocation('/school-timing');
      return {
        messageHi: "स्कूल का समय सोमवार से शनिवार सुबह 8:00 बजे से दोपहर 3:00 बजे तक है।",
        messageEn: "School timings are Monday to Saturday, 8:00 AM to 3:00 PM.",
        path: '/school-timing'
      };
    }
  },
  // Results & Achievements
  {
    patterns: [
      /result|results|topper|toppers|achievement|achievements|sports|karate|cricket|football|parinam|trophy/i,
    ],
    action: (setLocation) => {
      setLocation('/results');
      return {
        messageHi: "स्कूल के 100% बोर्ड परिणाम और राज्यस्तरीय खेल उपलब्धियों का पेज खुल गया है।",
        messageEn: "Opening Results and Sports Achievements page.",
        path: '/results'
      };
    }
  },
  // Gallery / Photos
  {
    patterns: [
      /gallery|photo|photos|picture|pictures|image|images|tasveer|photo dikhao/i,
    ],
    action: (setLocation) => {
      setLocation('/gallery');
      return {
        messageHi: "स्कूल की फोटो गैलरी खोल दी गई है।",
        messageEn: "Opening BVPS Photo Gallery.",
        path: '/gallery'
      };
    }
  },
  // Facilities
  {
    patterns: [
      /facility|facilities|lab|computer|library|smart class|cctv|water|ground|playground|suvidha/i,
    ],
    action: (setLocation) => {
      setLocation('/facilities');
      return {
        messageHi: "स्कूल की सुविधाएं - कंप्यूटर लैब, 2000+ पुस्तकों की लाइब्रेरी और 12 स्मार्ट क्लासेस स्क्रीन पर हैं।",
        messageEn: "Opening Facilities page showcasing Computer Lab, Library, and Smart Classrooms.",
        path: '/facilities'
      };
    }
  },
  // Principal's Desk
  {
    patterns: [
      /principal|headmaster|ramphal|sharma|director|pradhanacharya|sir/i,
    ],
    action: (setLocation) => {
      setLocation('/principal-message');
      return {
        messageHi: "प्रधानाचार्य श्री रामफल शर्मा जी का संदेश स्क्रीन पर है।",
        messageEn: "Opening Principal's Desk - Message from Principal Sh. Ramphal Sharma.",
        path: '/principal-message'
      };
    }
  },
  // Contact & Address
  {
    patterns: [
      /contact|phone|number|mobile|address|location|kahan hai|pata|sampark|call/i,
    ],
    action: (setLocation) => {
      setLocation('/contact');
      return {
        messageHi: "स्कूल का पता: रेलवे रोड, कलायत, कैथल। हेल्पलाइन फोन नंबर: 98125 50200 है।",
        messageEn: "Opening Contact Us page. School is located at Railway Road, Kalayat, Kaithal. Phone: +91 98125 50200.",
        path: '/contact'
      };
    }
  },
  // About Us
  {
    patterns: [
      /about|history|bvps|school ke baare|parichay/i,
    ],
    action: (setLocation) => {
      setLocation('/about');
      return {
        messageHi: "बाल विकास पब्लिक स्कूल के परिचय और इतिहास का पेज खुल गया है।",
        messageEn: "Opening About Us page.",
        path: '/about'
      };
    }
  },
  // Interview & Rules
  {
    patterns: [
      /interview|document|documents|rules|process|kaagaz|praman patra/i,
    ],
    action: (setLocation) => {
      setLocation('/interview');
      return {
        messageHi: "साक्षात्कार प्रक्रिया और आवश्यक दस्तावेजों की सूची खुल गई है।",
        messageEn: "Opening Interview guidelines and required documents checklist.",
        path: '/interview'
      };
    }
  },
  // Enrollment
  {
    patterns: [
      /enrollment|namankan|admission process/i,
    ],
    action: (setLocation) => {
      setLocation('/enrollment');
      return {
        messageHi: "नामांकन और प्रवेश गाइड का पेज खोल दिया गया है।",
        messageEn: "Opening Student Enrollment page.",
        path: '/enrollment'
      };
    }
  },
  // Home Page
  {
    patterns: [
      /home|shuru|start|main page|mukhya prashth/i,
    ],
    action: (setLocation) => {
      setLocation('/');
      return {
        messageHi: "होम पेज पर आ गए हैं।",
        messageEn: "Navigated to Home page.",
        path: '/'
      };
    }
  },
  // Scroll Down
  {
    patterns: [
      /scroll down|niche jao|niche karo|scroll/i,
    ],
    action: () => {
      window.scrollBy({ top: 500, behavior: 'smooth' });
      return {
        messageHi: "पेज नीचे स्क्रॉल कर दिया गया है।",
        messageEn: "Scrolled down the page."
      };
    }
  },
  // Scroll Up / Top
  {
    patterns: [
      /scroll up|upar jao|top pe jao|shuru me jao/i,
    ],
    action: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return {
        messageHi: "पेज सबसे ऊपर आ गया है।",
        messageEn: "Scrolled to top of the page."
      };
    }
  }
];

export function GlobalVoiceCommander() {
  const [, setLocation] = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<{ title: string; subtitle: string; type: 'success' | 'listening' | 'info' } | null>(null);

  const recognitionRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Recognizes Hindi & Indian English seamlessly

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0].transcript.trim();
        if (transcript) {
          processVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically restart listening if user enabled continuous active voice
        if (sessionStorage.getItem('bvps_voice_active') === 'true') {
          restartTimerRef.current = setTimeout(() => {
            try {
              recognition.start();
            } catch (_) {}
          }, 300);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to initialize speech recognition:', err);
    }

    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Text-to-Speech Output
  const speakResponse = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi') || v.lang.includes('en-IN'));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Match & Execute Voice Command
  const processVoiceCommand = (rawTranscript: string) => {
    setLastSpokenText(rawTranscript);

    let executed = false;
    for (const cmd of VOICE_COMMANDS) {
      const match = cmd.patterns.some(pattern => pattern.test(rawTranscript));
      if (match) {
        const result = cmd.action(setLocation);
        setActiveNotification({
          title: `आदेश: "${rawTranscript}"`,
          subtitle: result.messageHi,
          type: 'success'
        });
        speakResponse(result.messageHi);
        executed = true;
        break;
      }
    }

    if (!executed) {
      // General helpful fallback
      const feedback = `आपने कहा: "${rawTranscript}"। आप "फीस स्ट्रक्चर", "एडमिशन फॉर्म", "11वीं के विषय" या "स्कूल टाइमिंग" कह सकते हैं।`;
      setActiveNotification({
        title: `सुना: "${rawTranscript}"`,
        subtitle: "सटीक कमांड बोलें जैसे: 'फीस दिखाओ', 'फॉर्म खोलो', 'टाइमिंग'",
        type: 'info'
      });
      speakResponse("माफ़ कीजिये, कृपया कहें जैसे फीस स्ट्रक्चर दिखाओ, या एडमिशन फॉर्म खोलो।");
    }

    // Auto dismiss notification toast after 4.5s
    setTimeout(() => {
      setActiveNotification(null);
    }, 4500);
  };

  // Toggle Voice Listening On / Off
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("आपके ब्राउज़र में वॉइस सपोर्ट उपलब्ध नहीं है। कृपया Chrome या Edge ब्राउज़र का उपयोग करें।");
      return;
    }

    if (isListening) {
      sessionStorage.removeItem('bvps_voice_active');
      recognitionRef.current.stop();
      setIsListening(false);
      window.speechSynthesis?.cancel();
      setActiveNotification({
        title: "वॉइस कंट्रोल बंद",
        subtitle: "माइक बंद कर दिया गया है।",
        type: 'info'
      });
    } else {
      try {
        sessionStorage.setItem('bvps_voice_active', 'true');
        recognitionRef.current.start();
        setIsListening(true);
        setActiveNotification({
          title: "वॉइस कंट्रोल सक्रिय (Active) 🎤",
          subtitle: "बोलें: 'फीस दिखाओ', 'एडमिशन फॉर्म खोलो', 'टाइमिंग क्या है'...",
          type: 'listening'
        });
        speakResponse("वॉइस कंट्रोल चालू है। आप जो भी बोलेंगे, वह पेज खुल जाएगा।");
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  return (
    <>
      {/* Sleek, Non-intrusive Floating Voice Mic Controller on bottom-right */}
      <div className="fixed bottom-6 right-20 sm:right-24 z-50 flex items-center gap-2 select-none">
        
        {/* Discreet One-Tap Mic Switch */}
        <button
          onClick={toggleListening}
          aria-label={isListening ? "Mute Voice Control" : "Activate Voice Control"}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-lg transition-all duration-300 border backdrop-blur-md ${
            isListening 
              ? 'bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-400/30 scale-105' 
              : 'bg-slate-900/90 hover:bg-slate-900 text-slate-200 hover:text-white border-slate-700 hover:scale-105'
          }`}
        >
          {/* Animated sound wave bars when active */}
          {isListening ? (
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-amber-300 rounded-full animate-bounce h-4" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <Mic className="w-4 h-4 text-amber-400" />
          )}

          <div className="flex flex-col text-left pr-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 leading-tight">
              {isListening ? 'वॉइस चालू 🎤' : 'वॉइस कंट्रोल'}
            </span>
            <span className="text-xs font-semibold leading-none">
              {isListening ? 'सुन रहा हूँ...' : 'बोलकर चलाएं'}
            </span>
          </div>

          {/* Pulse dot */}
          {isListening && (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
            </span>
          )}
        </button>
      </div>

      {/* Floating Action Toast / Feedback HUD (Appears only when user speaks or commands run) */}
      {activeNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-amber-400/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            activeNotification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
          }`}>
            {activeNotification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5 animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-300 truncate">
              {activeNotification.title}
            </p>
            <p className="text-xs text-slate-200 leading-snug mt-0.5">
              {activeNotification.subtitle}
            </p>
          </div>

          {/* Mute output button */}
          <button
            onClick={() => {
              if (isSpeaking) {
                window.speechSynthesis?.cancel();
                setIsSpeaking(false);
              }
              setIsMuted(!isMuted);
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors shrink-0"
            title={isMuted ? "Unmute Voice" : "Mute Voice"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      )}
    </>
  );
}
