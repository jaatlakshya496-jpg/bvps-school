import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Mic, MicOff, Volume2, VolumeX, Send, X, Sparkles, 
  Languages, PhoneCall, ArrowRight, MessageSquare, 
  RotateCcw, Play, CornerDownLeft, Award, HelpCircle
} from 'lucide-react';
import schoolLogo from '@/assets/school-logo.png';
import { RobotAvatar } from './RobotAvatar';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  hindiText?: string;
  timestamp: string;
  actionLink?: {
    label: string;
    path: string;
    isExternal?: boolean;
  };
  options?: string[];
}

interface KnowledgeItem {
  keywords: string[];
  responseEn: string;
  responseHi: string;
  actionLink?: {
    label: string;
    path: string;
    isExternal?: boolean;
  };
  suggestedFollowUps?: string[];
}

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    keywords: ['admission', 'admissions', 'apply', 'form', 'enroll', 'daakhila', 'dakhila', 'pravesh', 'admission form', 'online form', 'dakhile'],
    responseEn: "Admissions for Session 2025–26 are open for Classes 1 to 12 at Bal Vikas Public School, Kalayat! You can submit the online enquiry form or visit the school admission office between 9:00 AM and 2:00 PM.",
    responseHi: "सत्र 2025-26 के लिए कक्षा 1 से 12वीं तक बाल विकास पब्लिक स्कूल, कलायत में प्रवेश खुले हैं! आप ऑनलाइन फॉर्म भर सकते हैं या सुबह 9:00 से दोपहर 2:00 बजे तक स्कूल आ सकते हैं।",
    actionLink: { label: 'Online Admission Form', path: '/application' },
    suggestedFollowUps: ['Fee Structure', 'Required Documents', 'Streams in 11th']
  },
  {
    keywords: ['fee', 'fees', 'cost', 'charge', 'amount', 'paisa', 'rupee', 'shulk', 'kharch', 'kitni fee hai', 'paise'],
    responseEn: "Our fee structure is transparent & affordable: Classes 1-2: ₹3,000/yr | Classes 3-5: ₹3,500/yr | Classes 6-8: ₹4,500/yr | Classes 9-10: ₹5,500/yr | Classes 11-12 (Arts, Commerce, Non-Med): ₹7,000/yr. We also support online UPI payment.",
    responseHi: "हमारी फीस बेहद किफायती है: कक्षा 1-2: ₹3,000/वर्ष | कक्षा 3-5: ₹3,500/वर्ष | कक्षा 6-8: ₹4,500/वर्ष | कक्षा 9-10: ₹5,500/वर्ष | कक्षा 11-12 (आर्ट्स, कॉमर्स, नॉन-मेडिकल): ₹7,000/वर्ष। ऑनलाइन UPI भुगतान भी उपलब्ध है।",
    actionLink: { label: 'View Fee Structure', path: '/fee-structure' },
    suggestedFollowUps: ['Admission Process', 'School Timings', 'Streams in 11th']
  },
  {
    keywords: ['time', 'timing', 'timings', 'hours', 'samay', 'kab khulta hai', 'kab band hota hai', 'office hours', 'schedule', 'kitne baje'],
    responseEn: "School timings are Monday to Saturday: 8:00 AM – 3:00 PM. Morning assembly starts sharp at 8:00 AM. Sunday is a holiday. Admission office is open Monday to Saturday, 9:00 AM – 2:00 PM.",
    responseHi: "स्कूल का समय सोमवार से शनिवार: सुबह 8:00 बजे से दोपहर 3:00 बजे तक है। सुबह 8:00 बजे प्रार्थना सभा होती है। रविवार अवकाश रहता है। एडमिशन कार्यालय सुबह 9:00 से दोपहर 2:00 बजे तक खुला है।",
    actionLink: { label: 'Check School Timings', path: '/school-timing' },
    suggestedFollowUps: ['Principal Desk', 'Contact Number', 'Admission Form']
  },
  {
    keywords: ['stream', 'streams', 'subject', 'subjects', 'arts', 'commerce', 'non medical', 'science', '11th', '12th', 'vishey', 'sankay'],
    responseEn: "For Classes 11 & 12, we offer 3 major streams: 1) Arts / Humanities (History, Pol Sci, Geography, Economics, Hindi, English), 2) Commerce (Accountancy, Business Studies, Economics, Math), and 3) Science Non-Medical (Physics, Chemistry, Mathematics, English, Computer Science).",
    responseHi: "11वीं और 12वीं कक्षा के लिए हमारे पास 3 मुख्य संकाय (Streams) हैं: 1) आर्ट्स / मानविकी, 2) कॉमर्स (वाणिज्य), और 3) साइंस नॉन-मेडिकल (भौतिक विज्ञान, रसायन विज्ञान, गणित व कंप्यूटर)।",
    actionLink: { label: 'Explore 11th & 12th Streams', path: '/streams' },
    suggestedFollowUps: ['Fee Structure', 'Admission Form', 'Principal Message']
  },
  {
    keywords: ['facility', 'facilities', 'library', 'computer', 'smart class', 'lab', 'playground', 'cctv', 'water', 'suvidha', 'suvidhaye', 'ground'],
    responseEn: "BVPS Kalayat offers modern facilities: A rich library with 2000+ books, a modern Computer Lab with 25+ PCs, 12 Smart Digital Classrooms, a large sports playground, 24/7 CCTV safety surveillance, and pure chilled RO drinking water.",
    responseHi: "बीवीपीएस कलायत में उत्कृष्ट सुविधाएं हैं: 2000+ पुस्तकों से समृद्ध लाइब्रेरी, 25+ कंप्यूटर वाली लैब, 12 स्मार्ट डिजिटल क्लासरूम, बड़ा खेल मैदान, 24/7 सीसीटीवी सुरक्षा और शुद्ध आरओ शीतल पेयजल।",
    actionLink: { label: 'View All Facilities', path: '/facilities' },
    suggestedFollowUps: ['Sports Results', 'School Timings', 'Photo Gallery']
  },
  {
    keywords: ['result', 'results', 'topper', 'toppers', 'marks', 'achievement', 'achievements', 'parinam', 'sports', 'karate', 'cricket', 'football', 'trophy'],
    responseEn: "BVPS maintains a 100% board examination pass record! In sports, our students are District Champions in Football and Cricket, and won Gold Medals in State Karate (Khushi & Krish) and Wrestling (Hanshul).",
    responseHi: "बीवीपीएस का बोर्ड परीक्षा परिणाम 100% रहता है! खेलों में हमारे छात्र जिला स्तर पर फुटबॉल और क्रिकेट में चैंपियन रहे हैं, और राज्य कराटे (खुशी व क्रिश) व कुश्ती में स्वर्ण पदक विजेता हैं।",
    actionLink: { label: 'View Results & Trophies', path: '/results' },
    suggestedFollowUps: ['Photo Gallery', 'Admission Form', 'About School']
  },
  {
    keywords: ['principal', 'headmaster', 'ramphal', 'sharma', 'director', 'pradhanacharya', 'owner', 'sir'],
    responseEn: "The Principal of Bal Vikas Public School is Sh. Ramphal Sharma. Under his vision since 2004, the school has nurtured thousands of successful students in Kalayat, Kaithal district with strong ethics and academic excellence.",
    responseHi: "बाल विकास पब्लिक स्कूल के प्रधानाचार्य श्री रामफल शर्मा जी हैं। 2004 से उनके कुशल मार्गदर्शन में स्कूल कलायत क्षेत्र के बच्चों को उच्च संस्कार और गुणवत्तापूर्ण शिक्षा प्रदान कर रहा है।",
    actionLink: { label: "Principal's Desk", path: '/principal-message' },
    suggestedFollowUps: ['Contact School', 'About Us', 'Admission Form']
  },
  {
    keywords: ['contact', 'phone', 'mobile', 'call', 'number', 'address', 'location', 'where', 'kahan', 'pata', 'sampark', 'email', 'kalayat'],
    responseEn: "School Address: Bal Vikas Public School, Railway Road, Kalayat, District Kaithal, Haryana (PIN: 136117). Helpline Phone: +91 98125 50200. Email: info@bvpskalayat.edu.in.",
    responseHi: "स्कूल का पता: बाल विकास पब्लिक स्कूल, रेलवे रोड, कलायत, जिला कैथल, हरियाणा (पिन: 136117)। फोन नंबर: +91 98125 50200। ईमेल: info@bvpskalayat.edu.in।",
    actionLink: { label: 'Contact Us & Map', path: '/contact' },
    suggestedFollowUps: ['School Timings', 'Fee Structure', 'Admission Form']
  },
  {
    keywords: ['interview', 'document', 'documents', 'rules', 'process', 'kaagaz', 'kya chahiye', 'aadhaar', 'tc', 'photo', 'kagzat'],
    responseEn: "Required admission documents: 1) Student Aadhaar Card, 2) Birth Certificate / Previous School TC, 3) Report Card of previous class, 4) 4 Passport photos, and 5) Parent ID proof. Friendly interaction is held with student & parents.",
    responseHi: "दाखिले के आवश्यक दस्तावेज: 1) छात्र का आधार कार्ड, 2) जन्म प्रमाण पत्र / पूर्व स्कूल टीसी, 3) पिछली कक्षा की अंकतालिका, 4) 4 पासपोर्ट फोटो, और 5) अभिभावक का पहचान पत्र।",
    actionLink: { label: 'Interview & Checklist', path: '/interview' },
    suggestedFollowUps: ['Enrollment Checklist', 'Fee Structure', 'Admission Form']
  },
  {
    keywords: ['gallery', 'photo', 'photos', 'picture', 'pictures', 'image', 'tasveer', 'campus photo'],
    responseEn: "You can view our vibrant photo gallery featuring the modern school building, sports days, science exhibitions, cultural programs, and student awards.",
    responseHi: "आप हमारी फोटो गैलरी में स्कूल भवन, खेल दिवस, विज्ञान प्रदर्शनी, सांस्कृतिक कार्यक्रम और पदक विजेताओं की तस्वीरें देख सकते हैं।",
    actionLink: { label: 'Open Photo Gallery', path: '/gallery' },
    suggestedFollowUps: ['Our Facilities', 'Results & Sports', 'About Us']
  },
  {
    keywords: ['about', 'history', 'school', 'bvps', 'kalayat', 'kaithal', 'hindi medium', 'english'],
    responseEn: "Bal Vikas Public School (BVPS) is a premier private co-educational senior secondary institution established in 2004 in Kalayat, Kaithal. We provide quality education from Classes 1 to 12 with Hindi medium instruction and English integration.",
    responseHi: "बाल विकास पब्लिक स्कूल (बीवीपीएस) कलायत, कैथल में वर्ष 2004 से स्थापित एक अग्रणी सह-शिक्षा सीनियर सेकेंडरी विद्यालय है। यहाँ कक्षा 1 से 12वीं तक सुदृढ़ नैतिक व आधुनिक शिक्षा दी जाती है।",
    actionLink: { label: 'About School History', path: '/about' },
    suggestedFollowUps: ['Principal Message', 'Facilities', 'Admissions']
  }
];

function findAnswer(query: string, lang: 'hi' | 'en'): { text: string; actionLink?: { label: string; path: string }; options?: string[] } {
  const normalized = query.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|namaste|pranam|namaskar|ram ram|shastriakal|greetings|jai shree ram)/i.test(normalized)) {
    if (lang === 'hi') {
      return {
        text: "नमस्ते! 🙏 मैं बाल विकास पब्लिक स्कूल, कलायत का AI रोबोट मित्र हूँ। आप मुझसे दाखिला, फीस, 11वीं-12वीं के विषय या किसी भी सुविधा के बारे में पूछ सकते हैं।",
        options: ['एडमिशन फॉर्म', 'फीस विवरण', '11वीं के विषय', 'स्कूल का समय', 'प्रधानाचार्य संदेश']
      };
    }
    return {
      text: "Namaste & Hello! I am the BVPS Kalayat AI Robot Host. How may I help you with admissions, fees, streams, or school facilities today?",
      options: ['Admission Form', 'Fee Structure', 'Class 11 Streams', 'School Timings', 'Facilities']
    };
  }

  // Search in Knowledge base
  for (const item of KNOWLEDGE_BASE) {
    const match = item.keywords.some(kw => normalized.includes(kw));
    if (match) {
      return {
        text: lang === 'hi' ? item.responseHi : item.responseEn,
        actionLink: item.actionLink,
        options: item.suggestedFollowUps
      };
    }
  }

  // Fallback
  if (lang === 'hi') {
    return {
      text: "माफ़ कीजिये, मैं इसे पूरी तरह समझ नहीं पाया। आप नीचे दिए गए प्रमुख विकल्पों में से चुन सकते हैं या हमारे हेल्पलाइन नंबर +91 98125 50200 पर सीधे कॉल कर सकते हैं।",
      actionLink: { label: 'Call School Office', path: 'tel:+919812550200', isExternal: true },
      options: ['फीस कितनी है?', 'एडमिशन कैसे लें?', '11वीं के विषय', 'स्कूल का समय']
    };
  }

  return {
    text: "I didn't quite catch that. You can choose from the quick topics below or call our school office helpline at +91 98125 50200.",
    actionLink: { label: 'Call School Office', path: 'tel:+919812550200', isExternal: true },
    options: ['Fee Structure', 'Admission Process', 'Streams Available', 'School Timings']
  };
}

export function VoiceBot() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'robot-welcome' | 'chat'>('robot-welcome');
  const [lang, setLang] = useState<'hi' | 'en'>('hi');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isGreeting, setIsGreeting] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [hasGreetedVoice, setHasGreetedVoice] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: "नमस्ते! 🙏 बाल विकास पब्लिक स्कूल, कलायत की ओर से आपका स्वागत है। मैं आपका AI रोबोट मित्र हूँ।",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: ['एडमिशन फॉर्म', 'फीस विवरण', '11वीं के विषय', 'स्कूल समय']
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening, isSpeaking, viewMode]);

  // Listen to external open trigger
  useEffect(() => {
    const handleOpen = () => {
      openBot(true);
    };
    window.addEventListener('open-bvps-voicebot', handleOpen);
    return () => window.removeEventListener('open-bvps-voicebot', handleOpen);
  }, []);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          if (viewMode === 'robot-welcome') {
            setViewMode('chat');
          }
          handleUserMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition setup failed:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      window.speechSynthesis?.cancel();
    };
  }, [lang, viewMode]);

  // Handle Text-to-Speech
  const speakText = (text: string, onEndCallback?: () => void) => {
    if (isVoiceMuted || !('speechSynthesis' in window)) {
      onEndCallback?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => 
      lang === 'hi' 
        ? v.lang.includes('hi') || v.name.includes('Hindi') 
        : v.lang.includes('en-IN') || v.lang.includes('en')
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsGreeting(false);
      onEndCallback?.();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsGreeting(false);
      onEndCallback?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsGreeting(false);
  };

  // Play Namaste Speech when opened
  const triggerNamasteGreeting = () => {
    setIsGreeting(true);
    const greetingText = lang === 'hi'
      ? "नमस्ते! बाल विकास पब्लिक स्कूल, कलायत की ओर से आपका हार्दिक स्वागत है! मैं आपका AI रोबोट मित्र हूँ। आप मुझसे स्कूल दाखिले, फीस, ग्यारहवीं-बारहवीं के विषय या किसी भी सुविधा के बारे में बोलकर या लिखकर पूछ सकते हैं।"
      : "Namaste! A very warm welcome from Bal Vikas Public School, Kalayat! I am your AI Robot Host. How can I assist you with admissions, fees, streams, or school facilities today?";
    
    speakText(greetingText);
    setHasGreetedVoice(true);
  };

  const openBot = (autoGreet = true) => {
    setIsOpen(true);
    setViewMode('robot-welcome');
    if (autoGreet && !hasGreetedVoice) {
      setTimeout(() => {
        triggerNamasteGreeting();
      }, 300);
    }
  };

  const toggleListening = () => {
    stopSpeaking();
    if (!speechSupported || !recognitionRef.current) {
      alert(lang === 'hi' 
        ? "आपका ब्राउज़र वॉइस इनपुट का समर्थन नहीं करता है। कृपया नीचे लिखकर संदेश भेजें।" 
        : "Speech recognition is not supported in this browser. Please type your message."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
        setIsListening(false);
      }
    }
  };

  const handleUserMessage = (text: string) => {
    if (!text.trim()) return;

    if (viewMode === 'robot-welcome') {
      setViewMode('chat');
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Generate Bot Answer
    setTimeout(() => {
      const result = findAnswer(text, lang);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink: result.actionLink,
        options: result.options
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(result.text);
    }, 350);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'hi' ? 'en' : 'hi';
    setLang(nextLang);
    stopSpeaking();
    const greeting = nextLang === 'hi'
      ? "भाषा बदलकर हिंदी कर दी गई है। आप क्या पूछना चाहते हैं?"
      : "Switched to English. What would you like to know about BVPS Kalayat?";
    
    const botMsg: Message = {
      id: `bot-lang-${Date.now()}`,
      sender: 'bot',
      text: greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: nextLang === 'hi' ? ['एडमिशन फॉर्म', 'फीस विवरण', '11वीं के विषय', 'स्कूल समय'] : ['Admission Form', 'Fee Structure', 'Class 11 Streams', 'School Timings']
    };
    setMessages(prev => [...prev, botMsg]);
    speakText(greeting);
  };

  return (
    <>
      {/* Floating Animated AI Robot Trigger Widget on bottom-right */}
      <div className="fixed bottom-6 right-20 sm:right-24 z-50 flex items-center gap-2 select-none">
        
        {/* Floating Greeting Speech Bubble (shows automatically) */}
        {!isOpen && (
          <div 
            onClick={() => openBot(true)}
            className="hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-md text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl border border-secondary/50 cursor-pointer hover:border-secondary hover:scale-105 transition-all duration-300 animate-bounce group"
            style={{ animationDuration: '3s' }}
          >
            <span className="text-amber-500 font-bold">🙏 नमस्ते!</span>
            <span className="text-primary font-medium">बोलकर पूछें</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
        )}

        <button
          onClick={() => {
            if (isOpen) {
              stopSpeaking();
              setIsOpen(false);
            } else {
              openBot(true);
            }
          }}
          aria-label="Open BVPS AI Robot Assistant"
          className="relative flex items-center gap-2.5 bg-gradient-to-tr from-primary via-[#1e3a8a] to-secondary text-white p-2 sm:pl-3.5 sm:pr-4 sm:py-2.5 rounded-full shadow-2xl hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-amber-300/40 group"
        >
          {/* Animated Mini Robot Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary/40 flex items-center justify-center shrink-0">
            <RobotAvatar size="sm" isSpeaking={isSpeaking} isListening={isListening} isGreeting={isGreeting} showHands={false} />
          </div>

          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              BVPS AI Robot
            </span>
            <span className="text-xs font-bold leading-tight text-white">
              {lang === 'hi' ? 'आवाज़ सहायक 🙏' : 'AI Host 🙏'}
            </span>
          </div>

          {/* Online badge */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        </button>
      </div>

      {/* Main Interactive AI Robot Modal Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-3 sm:right-6 w-[95vw] sm:w-[430px] max-h-[85vh] h-[640px] z-50 bg-white rounded-3xl shadow-2xl border-2 border-primary/20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-250">
          
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-primary via-[#1e3a8a] to-primary p-3.5 text-white flex items-center justify-between shadow-sm relative shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-2xl bg-white p-0.5 shadow-sm border border-amber-400/60 shrink-0 overflow-hidden">
                <img src={schoolLogo} alt="BVPS Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm leading-tight text-white">BVPS AI Robot Host</h3>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-400 text-primary rounded-full uppercase tracking-wider">Mitr</span>
                </div>
                <p className="text-[11px] text-white/80">
                  {lang === 'hi' ? 'बाल विकास पब्लिक स्कूल, कलायत' : 'Bal Vikas Public School, Kalayat'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              {/* View Switcher: Robot Welcome Screen vs Chatboard */}
              <button
                onClick={() => {
                  stopSpeaking();
                  setViewMode(viewMode === 'robot-welcome' ? 'chat' : 'robot-welcome');
                }}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                  viewMode === 'robot-welcome' ? 'bg-amber-400 text-primary' : 'bg-white/15 text-white hover:bg-white/25'
                }`}
                title="Toggle Robot Host / Chatboard"
              >
                {viewMode === 'robot-welcome' ? 'चैटबोर्ड' : 'रोबोट देखें'}
              </button>

              {/* Language Switch */}
              <button
                onClick={toggleLanguage}
                title="Switch Language / भाषा बदलें"
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center gap-1"
              >
                <Languages className="w-3 h-3 text-amber-300" />
                {lang === 'hi' ? 'Eng' : 'हिंदी'}
              </button>

              {/* Mute Voice */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setIsVoiceMuted(!isVoiceMuted);
                }}
                title={isVoiceMuted ? 'Unmute voice' : 'Mute voice'}
                className={`p-1.5 rounded-lg transition-colors ${isVoiceMuted ? 'bg-red-500/30 text-red-200' : 'bg-white/15 hover:bg-white/25 text-white'}`}
              >
                {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  stopSpeaking();
                  if (isListening && recognitionRef.current) {
                    recognitionRef.current.stop();
                  }
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SPEAKING STATUS BANNER */}
          {(isSpeaking || isListening) && (
            <div className={`py-1.5 px-4 text-xs font-semibold flex items-center justify-between shrink-0 transition-colors ${
              isListening ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 text-white'
            }`}>
              <div className="flex items-center gap-2">
                {isListening ? (
                  <>
                    <Mic className="w-4 h-4 animate-bounce" />
                    <span>{lang === 'hi' ? 'सुन रहा हूँ... अपना प्रश्न बोलें...' : 'Listening... please speak now...'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span>{lang === 'hi' ? 'रोबोट आवाज़ में बोल रहा है...' : 'AI Robot is speaking...'}</span>
                  </>
                )}
              </div>
              <button 
                onClick={() => {
                  if (isListening) recognitionRef.current?.stop();
                  if (isSpeaking) stopSpeaking();
                }}
                className="text-[10px] font-bold bg-black/25 px-2 py-0.5 rounded hover:bg-black/40"
              >
                {lang === 'hi' ? 'रोकें' : 'Stop'}
              </button>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* VIEW 1: SPEAKING AI ROBOT HOST SCREEN (बोलता हुआ नमस्ते)          */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewMode === 'robot-welcome' ? (
            <div className="flex-1 flex flex-col items-center justify-between p-5 bg-gradient-to-b from-slate-900 via-primary/95 to-slate-950 text-white overflow-y-auto">
              
              {/* Robot Greeting Header */}
              <div className="text-center pt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  Bal Vikas Public School, Kalayat
                </span>
              </div>

              {/* Big Animated Robot with Namaste Gesture 🙏 */}
              <div className="relative my-2 flex flex-col items-center">
                <RobotAvatar
                  size="xl"
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  isGreeting={isGreeting || isSpeaking}
                  showHands={true}
                />
                
                {/* Namaste Badge */}
                <div className="mt-2 flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold px-3.5 py-1 rounded-full shadow-lg">
                  <span>🙏 सादर नमस्ते!</span>
                </div>
              </div>

              {/* Welcome Message Card */}
              <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center shadow-lg">
                <p className="text-sm sm:text-base font-serif font-medium leading-relaxed text-slate-100">
                  {lang === 'hi' ? (
                    <>
                      "बाल विकास पब्लिक स्कूल, कलायत की ओर से आपका हार्दिक स्वागत है! मैं आपका <span className="text-amber-300 font-bold">AI रोबोट मित्र</span> हूँ। आप मुझसे दाखिले, फीस, 11वीं-12वीं के विषय या किसी भी सुविधा के बारे में पूछ सकते हैं।"
                    </>
                  ) : (
                    <>
                      "Welcome to Bal Vikas Public School, Kalayat! I am your <span className="text-amber-300 font-bold">AI Robot Host</span>. Ask me about admissions, fee structure, class 11-12 streams, or school facilities."
                    </>
                  )}
                </p>

                {/* Replay Voice Greeting Button */}
                <button
                  onClick={triggerNamasteGreeting}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  {lang === 'hi' ? 'नमस्ते संदेश फिर से सुनें' : 'Replay Welcome Speech'}
                </button>
              </div>

              {/* Action Buttons: Open Chatboard or Speak */}
              <div className="w-full space-y-2.5 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      stopSpeaking();
                      setViewMode('chat');
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold text-sm py-3 px-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {lang === 'hi' ? 'चैटबोर्ड खोलें' : 'Open Chat'}
                  </button>

                  <button
                    onClick={toggleListening}
                    className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-3 px-4 rounded-xl shadow-lg transition-all ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-white/20 hover:bg-white/30 text-white hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    <Mic className="w-4 h-4 text-amber-300" />
                    {lang === 'hi' ? 'बोलकर पूछें' : 'Speak Now'}
                  </button>
                </div>

                {/* Quick Topic Chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {(lang === 'hi' 
                    ? ['दाखिला प्रक्रिया', 'फीस विवरण', '11वीं के विषय', 'स्कूल समय', 'प्रधानाचार्य'] 
                    : ['Admission Form', 'Fee Structure', 'Streams in 11th', 'School Timings', 'Principal Desk']
                  ).map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        stopSpeaking();
                        handleUserMessage(topic);
                      }}
                      className="text-xs bg-white/10 hover:bg-amber-400 hover:text-slate-900 text-slate-200 px-3 py-1 rounded-full border border-white/10 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (

            /* ═════════════════════════════════════════════════════════════════ */
            /* VIEW 2: INTERACTIVE VOICE & TEXT CHATBOARD                        */
            /* ═════════════════════════════════════════════════════════════════ */
            <div className="flex-1 flex flex-col bg-slate-50/70 overflow-hidden">
              
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`flex gap-2.5 max-w-[88%] ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-2xl rounded-tr-sm p-3.5 shadow-sm'
                          : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-200/80'
                      }`}
                    >
                      {msg.sender === 'bot' && (
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <RobotAvatar size="sm" isSpeaking={isSpeaking} showHands={false} />
                        </div>
                      )}

                      <div className="flex flex-col gap-2 flex-1">
                        <p className="text-sm leading-relaxed whitespace-pre-line select-text font-normal">
                          {msg.text}
                        </p>

                        {/* Direct Action Link if provided */}
                        {msg.actionLink && (
                          <div className="pt-1">
                            {msg.actionLink.isExternal ? (
                              <a
                                href={msg.actionLink.path}
                                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
                              >
                                <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                                {msg.actionLink.label}
                              </a>
                            ) : (
                              <button
                                onClick={() => {
                                  if (msg.actionLink?.path) {
                                    setLocation(msg.actionLink.path);
                                    setIsOpen(false);
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
                              >
                                <span>{msg.actionLink.label}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Re-play Audio for this message */}
                        {msg.sender === 'bot' && (
                          <button
                            onClick={() => speakText(msg.text)}
                            className="self-start inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-primary mt-1 font-medium transition-colors"
                          >
                            <Volume2 className="w-3 h-3 text-secondary" />
                            {lang === 'hi' ? 'आवाज़ सुनें' : 'Listen Voice'}
                          </button>
                        )}

                        {/* Follow-up Quick Options */}
                        {msg.options && msg.options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2 mt-1 border-t border-slate-100">
                            {msg.options.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => handleUserMessage(opt)}
                                className="text-xs bg-slate-100 hover:bg-amber-400 hover:text-slate-900 text-slate-700 font-medium px-2.5 py-1 rounded-full border border-slate-200 transition-all text-left"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isListening && (
                  <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs shadow-sm">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <span className="font-semibold">{lang === 'hi' ? 'माइक चालू है... अपना प्रश्न बोलें...' : 'Listening... ask your question now...'}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions Horizontal Scroll */}
              <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200/80 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap uppercase tracking-wider">
                  {lang === 'hi' ? 'त्वरित:' : 'Quick:'}
                </span>
                {(lang === 'hi' 
                  ? ['दाखिला प्रक्रिया?', 'फीस विवरण?', '11वीं के संकाय?', 'स्कूल का समय?', 'सुविधाएं?', 'प्रधानाचार्य'] 
                  : ['Admission Form?', 'Fee Structure?', 'Class 11 Streams?', 'School Timings?', 'Facilities?', 'Principal']
                ).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUserMessage(q)}
                    className="whitespace-nowrap text-xs bg-white text-primary font-medium px-3 py-1 rounded-full border border-slate-300/80 hover:bg-primary hover:text-white transition-colors shrink-0 shadow-2xs"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Bottom Voice & Text Input Bar */}
              <div className="p-3 bg-white border-t border-border flex items-center gap-2 shrink-0">
                {/* Big Mic Button */}
                <button
                  onClick={toggleListening}
                  title={isListening ? "Stop Listening" : "Tap to Speak (बोलकर पूछें)"}
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 shadow-md ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200'
                      : 'bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-900 hover:scale-105 active:scale-95'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5 font-bold" />
                  )}
                </button>

                {/* Text Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUserMessage(inputVal);
                  }}
                  className="flex-1 flex items-center gap-2 bg-slate-100 rounded-2xl px-3.5 py-1.5 border border-slate-200 focus-within:border-primary focus-within:bg-white transition-all"
                >
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={lang === 'hi' ? "प्रश्न लिखें या माइक दबाकर बोलें..." : "Type question or tap mic to speak..."}
                    className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim()}
                    aria-label="Send message"
                    className="p-1.5 rounded-xl bg-primary text-white disabled:opacity-40 disabled:hover:bg-primary hover:bg-primary/90 transition-all shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      )}
    </>
  );
}
