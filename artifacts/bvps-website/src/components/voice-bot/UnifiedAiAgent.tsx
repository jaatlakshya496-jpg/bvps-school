import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Mic, MicOff, Volume2, VolumeX, Send, X, Sparkles, 
  Bot, PhoneCall, ArrowRight, MessageSquare, 
  RotateCcw, Check, Sparkle, Globe
} from 'lucide-react';
import schoolLogo from '@/assets/school-logo.png';
import { RobotAvatar } from './RobotAvatar';
import { useLanguage, type Language } from '@/lib/language-context';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionLink?: {
    label: string;
    path: string;
    isExternal?: boolean;
  };
  options?: string[];
}

interface SmartIntent {
  patterns: RegExp[];
  keywords: string[];
  responses: {
    en: string;
    hi: string;
    pa: string;
  };
  path?: string;
  actionLabels: {
    en: string;
    hi: string;
    pa: string;
  };
  followUps: {
    en: string[];
    hi: string[];
    pa: string[];
  };
}

// Multi-lingual Smart Intents (English, Hindi, Punjabi)
const SMART_INTENTS: SmartIntent[] = [
  // 1. Fee Structure
  {
    patterns: [
      /f+e+|f+i+|fees|fess|shulk|paisa|paise|kharch|kitna|kitne|rupee|rupaye|amount|charge|kitna lagega|pisa|fee structure|fees dikhao|fees batao|ਫੀਸ|ਖਰਚਾ/i,
    ],
    keywords: ['fee', 'fees', 'paisa', 'paise', 'rupee', 'shulk', 'kharch', 'amount', 'kitni fee', 'rupaye', 'cost', 'tuition', 'ਫੀਸ'],
    responses: {
      en: "Fee structure page has been opened! Class 1-2: ₹3,000/yr, Class 3-5: ₹3,500/yr, Class 6-8: ₹4,500/yr, Class 9-10: ₹5,500/yr, and Class 11-12: ₹7,000/yr.",
      hi: "फीस संरचना पेज खोल दिया गया है! कक्षा 1-2: ₹3,000/वर्ष, कक्षा 3-5: ₹3,500/वर्ष, कक्षा 6-8: ₹4,500/वर्ष, कक्षा 9-10: ₹5,500/वर्ष और कक्षा 11-12: ₹7,000/वर्ष है।",
      pa: "ਫੀਸ ਦਾ ਵੇਰਵਾ ਪੇਜ ਖੋਲ੍ਹ ਦਿੱਤਾ ਗਿਆ ਹੈ! ਕਲਾਸ 1-2: ₹3,000/ਸਾਲ, ਕਲਾਸ 3-5: ₹3,500/ਸਾਲ, ਕਲਾਸ 6-8: ₹4,500/ਸਾਲ, ਕਲਾਸ 9-10: ₹5,500/ਸਾਲ ਅਤੇ ਕਲਾਸ 11-12: ₹7,000/ਸਾਲ ਹੈ।"
    },
    path: '/fee-structure',
    actionLabels: {
      en: 'View Fee Structure',
      hi: 'फीस संरचना देखें',
      pa: 'ਫੀਸ ਦਾ ਵੇਰਵਾ ਵੇਖੋ'
    },
    followUps: {
      en: ['Open Admission Form', 'Class 11 Streams', 'School Timings'],
      hi: ['एडमिशन फॉर्म खोलें', '11वीं के संकाय', 'स्कूल का समय'],
      pa: ['ਦਾਖਲਾ ਫਾਰਮ ਖੋਲ੍ਹੋ', '11ਵੀਂ ਦੀਆਂ ਸਟ੍ਰੀਮਜ਼', 'ਸਕੂਲ ਦਾ ਸਮਾਂ']
    }
  },

  // 2. Admission Form / Apply Online
  {
    patterns: [
      /admis|admi|dakhil|daakhil|pravesh|form|apply|bharna|bharna hai|admission|online|application|entry|admission form|form dikhao|form kholo|apply online|ਦਾਖਲਾ|ਫਾਰਮ/i,
    ],
    keywords: ['admission', 'form', 'apply', 'dakhila', 'pravesh', 'online form', 'application', 'bharna', 'enroll', 'ਦਾਖਲਾ', 'ਫਾਰਮ'],
    responses: {
      en: "Online admission form has been opened! Admissions are open for Classes 1 to 12 for the current session. Please fill in the student details.",
      hi: "ऑनलाइन प्रवेश फॉर्म खोल दिया गया है! सत्र 2025-26 के लिए कक्षा 1 से 12वीं तक प्रवेश खुले हैं। कृपया छात्र का विवरण भरें।",
      pa: "ਆਨਲਾਈਨ ਦਾਖਲਾ ਫਾਰਮ ਖੋਲ੍ਹ ਦਿੱਤਾ ਗਿਆ ਹੈ! ਸੈਸ਼ਨ ਲਈ ਕਲਾਸ 1 ਤੋਂ 12ਵੀਂ ਤੱਕ ਦਾਖਲੇ ਖੁੱਲ੍ਹੇ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਵਿਦਿਆਰਥੀ ਦਾ ਵੇਰਵਾ ਭਰੋ।"
    },
    path: '/application',
    actionLabels: {
      en: 'Fill Admission Form',
      hi: 'प्रवेश फॉर्म भरें',
      pa: 'ਦਾਖਲਾ ਫਾਰਮ ਭਰੋ'
    },
    followUps: {
      en: ['How Much Is The Fee?', 'Required Documents', 'Streams in 11th'],
      hi: ['फीस कितनी है?', 'जरूरी दस्तावेज', '11वीं के संकाय'],
      pa: ['ਫੀਸ ਕਿੰਨੀ ਹੈ?', 'ਜ਼ਰੂਰੀ ਦਸਤਾਵੇਜ਼', '11ਵੀਂ ਦੀਆਂ ਸਟ੍ਰੀਮਜ਼']
    }
  },

  // 3. Class 11 & 12 Streams / Subjects
  {
    patterns: [
      /stream|sankay|vishey|subject|arts|commerce|non med|science|11th|12th|gyarahvi|barahvi|subjects|medical|padhai|ਸਟ੍ਰੀਮ|ਵਿਸ਼ੇ/i,
    ],
    keywords: ['stream', 'streams', 'arts', 'commerce', 'non medical', 'science', 'subject', '11th', '12th', 'vishey', 'ਸਟ੍ਰੀਮ'],
    responses: {
      en: "Class 11th and 12th streams are available on our streams page. BVPS offers 3 main streams: 1) Arts / Humanities, 2) Commerce, and 3) Science Non-Medical.",
      hi: "कक्षा 11वीं और 12वीं के संकाय पेज पर उपलब्ध हैं। BVPS में 3 मुख्य संकाय हैं: 1) आर्ट्स / मानविकी, 2) कॉमर्स, और 3) साइंस नॉन-मेडिकल।",
      pa: "ਕਲਾਸ 11ਵੀਂ ਅਤੇ 12ਵੀਂ ਦੀਆਂ ਸਟ੍ਰੀਮਜ਼ ਉਪਲਬਧ ਹਨ। BVPS ਵਿੱਚ 3 ਮੁੱਖ ਸਟ੍ਰੀਮਜ਼ ਹਨ: 1) ਆਰਟਸ / ਮਨੁੱਖਤਾ, 2) ਕਾਮਰਸ, ਅਤੇ 3) ਸਾਇੰਸ ਨਾਨ-ਮੈਡੀਕਲ।"
    },
    path: '/streams',
    actionLabels: {
      en: 'View 11th-12th Streams',
      hi: '11वीं-12वीं संकाय देखें',
      pa: '11ਵੀਂ-12ਵੀਂ ਸਟ੍ਰੀਮਜ਼ ਵੇਖੋ'
    },
    followUps: {
      en: ['Fee Structure', 'Admission Form', 'School Timings'],
      hi: ['फीस संरचना', 'एडमिशन फॉर्म', 'स्कूल का समय'],
      pa: ['ਫੀਸ ਦਾ ਵੇਰਵਾ', 'ਦਾਖਲਾ ਫਾਰਮ', 'ਸਕੂਲ ਦਾ ਸਮਾਂ']
    }
  },

  // 4. School Timings & Schedule
  {
    patterns: [
      /time|timing|samay|kab khulta|kab band|kitne baje|baje|prayer|assembly|schedule|chhutti|holiday|office time|ਸਮਾਂ/i,
    ],
    keywords: ['timing', 'timings', 'time', 'samay', 'kab khulta hai', 'kab band hota hai', 'hours', 'schedule', 'ਸਮਾਂ'],
    responses: {
      en: "School timing is Monday to Saturday from 8:00 AM to 3:00 PM. Morning assembly begins sharply at 8:00 AM. Sunday is a holiday.",
      hi: "स्कूल का समय सोमवार से शनिवार सुबह 8:00 बजे से दोपहर 3:00 बजे तक है। सुबह 8:00 बजे प्रार्थना सभा होती है। रविवार को अवकाश रहता है।",
      pa: "ਸਕੂਲ ਦਾ ਸਮਾਂ ਸੋਮਵਾਰ ਤੋਂ ਸ਼ਨੀਵਾਰ ਸਵੇਰੇ 8:00 ਵਜੇ ਤੋਂ ਦੁਪਹਿਰ 3:00 ਵਜੇ ਤੱਕ ਹੈ। ਸਵੇਰ ਦੀ ਸਭਾ ਠੀਕ 8:00 ਵਜੇ ਸ਼ੁਰੂ ਹੁੰਦੀ ਹੈ। ਐਤਵਾਰ ਨੂੰ ਛੁੱਟੀ ਹੁੰਦੀ ਹੈ।"
    },
    path: '/school-timing',
    actionLabels: {
      en: 'View School Timings',
      hi: 'स्कूल का समय देखें',
      pa: 'ਸਕੂਲ ਦਾ ਸਮਾਂ ਵੇਖੋ'
    },
    followUps: {
      en: ['Principal Message', 'Contact Number', 'Admission Form'],
      hi: ['प्रधानाचार्य संदेश', 'संपर्क नंबर', 'प्रवेश फॉर्म'],
      pa: ['ਪ੍ਰਿੰਸੀਪਲ ਸੁਨੇਹਾ', 'ਸੰਪਰਕ ਨੰਬਰ', 'ਦਾਖਲਾ ਫਾਰਮ']
    }
  },

  // 5. Results & Sports Achievements
  {
    patterns: [
      /result|parinam|topper|marks|score|achievement|sports|khel|karate|cricket|football|trophy|gold medal|wrestling|champion|ਨਤੀਜਾ|ਖੇਡਾਂ/i,
    ],
    keywords: ['result', 'results', 'topper', 'marks', 'achievement', 'sports', 'karate', 'cricket', 'football', 'trophy', 'ਨਤੀਜਾ'],
    responses: {
      en: "Bal Vikas Public School maintains a 100% board exam pass rate! In sports, our students are District Champions in Football & Cricket, and Gold Medalists in State Karate & Wrestling.",
      hi: "स्कूल का बोर्ड परीक्षा परिणाम शत-प्रतिशत रहता है! खेलकूद में हमारे छात्र फुटबॉल व क्रिकेट में जिला चैंपियन तथा राज्यस्तरीय कराटे व कुश्ती में स्वर्ण पदक विजेता हैं।",
      pa: "ਸਕੂਲ ਦਾ ਬੋਰਡ ਪ੍ਰੀਖਿਆ ਨਤੀਜਾ 100% ਪਾਸ ਰਹਿੰਦਾ ਹੈ! ਖੇਡਾਂ ਵਿੱਚ ਸਾਡੇ ਵਿਦਿਆਰਥੀ ਫੁੱਟਬਾਲ ਅਤੇ ਕ੍ਰਿਕਟ ਵਿੱਚ ਜ਼ਿਲ੍ਹਾ ਚੈਂਪੀਅਨ ਅਤੇ ਰਾਜ ਕਰਾਟੇ ਅਤੇ ਕੁਸ਼ਤੀ ਵਿੱਚ ਗੋਲਡ ਮੈਡਲ ਜੇਤੂ ਹਨ।"
    },
    path: '/results',
    actionLabels: {
      en: 'View Results & Trophies',
      hi: 'परिणाम व ट्रॉफियां देखें',
      pa: 'ਨਤੀਜੇ ਅਤੇ ਟਰਾਫੀਆਂ ਵੇਖੋ'
    },
    followUps: {
      en: ['Photo Gallery', 'Admission Form', 'School Facilities'],
      hi: ['फोटो गैलरी', 'प्रवेश फॉर्म', 'स्कूल सुविधाएं'],
      pa: ['ਫੋਟੋ ਗੈਲਰੀ', 'ਦਾਖਲਾ ਫਾਰਮ', 'ਸਕੂਲ ਸਹੂਲਤਾਂ']
    }
  },

  // 6. Photo Gallery
  {
    patterns: [
      /gallery|photo|tasveer|picture|images|pic|campus photo|program|function|building photo|ਫੋਟੋ|ਗੈਲਰੀ/i,
    ],
    keywords: ['gallery', 'photo', 'photos', 'picture', 'tasveer', 'images', 'ਗੈਲਰੀ', 'ਤਸਵੀਰਾਂ'],
    responses: {
      en: "Photo gallery page has been opened! Here you can explore real campus photos, sports events, science exhibitions, and cultural functions.",
      hi: "फोटो गैलरी पेज खोल दिया गया है। यहाँ आप स्कूल कैंपस, खेलकूद, विज्ञान प्रदर्शनी और सांस्कृतिक कार्यक्रमों की तस्वीरें देख सकते हैं।",
      pa: "ਫੋਟੋ ਗੈਲਰੀ ਪੇਜ ਖੋਲ੍ਹਿਆ ਗਿਆ ਹੈ। ਇੱਥੇ ਤੁਸੀਂ ਸਕੂਲ ਕੈਂਪਸ, ਖੇਡ ਮੁਕਾਬਲਿਆਂ, ਵਿਗਿਆਨ ਪ੍ਰਦਰਸ਼ਨੀਆਂ ਅਤੇ ਸੱਭਿਆਚਾਰਕ ਸਮਾਗਮਾਂ ਦੀਆਂ ਫੋਟੋਆਂ ਵੇਖ ਸਕਦੇ ਹੋ।"
    },
    path: '/gallery',
    actionLabels: {
      en: 'Open Photo Gallery',
      hi: 'फोटो गैलरी खोलें',
      pa: 'ਫੋਟੋ ਗੈਲਰੀ ਖੋਲ੍ਹੋ'
    },
    followUps: {
      en: ['School Facilities', 'Results Page', 'Home Page'],
      hi: ['स्कूल सुविधाएं', 'परिणाम पेज', 'होम पेज'],
      pa: ['ਸਕੂਲ ਸਹੂਲਤਾਂ', 'ਨਤੀਜੇ ਪੇਜ', 'ਮੁੱਖ ਪੰਨਾ']
    }
  },

  // 7. Facilities / Computer Lab / Library
  {
    patterns: [
      /facility|facilities|suvidha|lab|computer|library|smart class|cctv|water|ground|playground|bus|vehicle|ro water|ਸਹੂਲਤਾਂ|ਲੈਬ/i,
    ],
    keywords: ['facility', 'facilities', 'library', 'computer', 'lab', 'smart class', 'playground', 'cctv', 'suvidha', 'ਸਹੂਲਤਾਂ'],
    responses: {
      en: "BVPS Kalayat offers modern facilities: 2,000+ books Library, 25+ PCs Computer Lab, 12 Smart Classrooms, Big Playground, 24/7 CCTV security, and RO Chilled Drinking Water.",
      hi: "BVPS कलायत की आधुनिक सुविधाएं: 2000+ पुस्तकों से युक्त लाइब्रेरी, 25+ कंप्यूटर वाली लैब, 12 स्मार्ट क्लासरूम, विशाल खेल मैदान, 24/7 सीसीटीवी और आरओ शीतल पेयजल।",
      pa: "BVPS ਕਲਾਇਤ ਦੀਆਂ ਆਧੁਨਿਕ ਸਹੂਲਤਾਂ: 2000+ ਕਿਤਾਬਾਂ ਵਾਲੀ ਲਾਇਬ੍ਰੇਰੀ, 25+ ਕੰਪਿਊਟਰ ਲੈਬ, 12 ਸਮਾਰਟ ਕਲਾਸਰੂਮ, ਖੇਡ ਮੈਦਾਨ, 24/7 ਸੀਸੀਟੀਵੀ ਅਤੇ ਆਰਓ ਠੰਡਾ ਪੀਣ ਵਾਲਾ ਪਾਣੀ।"
    },
    path: '/facilities',
    actionLabels: {
      en: 'View All Facilities',
      hi: 'सभी सुविधाएं देखें',
      pa: 'ਸਾਰੀਆਂ ਸਹੂਲਤਾਂ ਵੇਖੋ'
    },
    followUps: {
      en: ['Sports Results', 'School Timings', 'Admission Form'],
      hi: ['खेल परिणाम', 'स्कूल का समय', 'प्रवेश फॉर्म'],
      pa: ['ਖੇਡ ਨਤੀਜੇ', 'ਸਕੂਲ ਦਾ ਸਮਾਂ', 'ਦਾਖਲਾ ਫਾਰਮ']
    }
  },

  // 8. Principal's Desk
  {
    patterns: [
      /principal|headmaster|ramphal|sharma|director|pradhanacharya|owner|sir|ਪ੍ਰਿੰਸੀਪਲ/i,
    ],
    keywords: ['principal', 'headmaster', 'ramphal sharma', 'director', 'pradhanacharya', 'ਪ੍ਰਿੰਸੀਪਲ'],
    responses: {
      en: "Principal's Desk page opened! Sh. Ramphal Sharma has been leading the institution since 2004 with 20+ years of dedicated experience, fostering noble thoughts and character building.",
      hi: "प्रधानाचार्य श्री रामफल शर्मा जी का संदेश पेज खोल दिया गया है। 2004 से 20+ वर्षों के समृद्ध अनुभव के साथ वे उच्च विचार और नैतिक संस्कारों का निर्माण कर रहे हैं।",
      pa: "ਪ੍ਰਿੰਸੀਪਲ ਸ਼੍ਰੀ ਰਾਮਫਲ ਸ਼ਰਮਾ ਜੀ ਦਾ ਸੁਨੇਹਾ ਪੇਜ ਖੋਲ੍ਹਿਆ ਗਿਆ ਹੈ। 2004 ਤੋਂ 20+ ਸਾਲਾਂ ਦੇ ਤਜਰਬੇ ਨਾਲ ਉਹ ਵਿਦਿਆਰਥੀਆਂ ਵਿੱਚ ਉੱਚ ਵਿਚਾਰ ਅਤੇ ਨੈਤਿਕ ਸੰਸਕਾਰ ਭਰ ਰਹੇ ਹਨ।"
    },
    path: '/principal-message',
    actionLabels: {
      en: "Open Principal's Desk",
      hi: 'प्रधानाचार्य कक्ष खोलें',
      pa: 'ਪ੍ਰਿੰਸੀਪਲ ਡੈਸਕ ਖੋਲ੍ਹੋ'
    },
    followUps: {
      en: ['Contact School', 'About School', 'Admission Form'],
      hi: ['स्कूल से संपर्क करें', 'स्कूल के बारे में', 'प्रवेश फॉर्म'],
      pa: ['ਸਕੂਲ ਨਾਲ ਸੰਪਰਕ ਕਰੋ', 'ਸਕੂਲ ਬਾਰੇ', 'ਦਾਖਲਾ ਫਾਰਮ']
    }
  },

  // 9. Contact / Phone Number / Address
  {
    patterns: [
      /contact|phone|mobile|call|number|address|location|kahan|pata|sampark|email|kalayat|rasta|ਸੰਪਰਕ|ਫੋਨ/i,
    ],
    keywords: ['contact', 'phone', 'number', 'address', 'location', 'sampark', 'pata', 'call', 'ਸੰਪਰਕ'],
    responses: {
      en: "School Address: Bal Vikas Public School, Railway Road, Kalayat, Kaithal (Haryana). Helpline Phone: +91 98125 50200. Email: info@bvpskalayat.edu.in.",
      hi: "स्कूल का पता: बाल विकास पब्लिक स्कूल, रेलवे रोड, कलायत, कैथल (हरियाणा)। हेल्पलाइन फोन: +91 98125 50200। ईमेल: info@bvpskalayat.edu.in।",
      pa: "ਸਕੂਲ ਦਾ ਪਤਾ: ਬਾਲ ਵਿਕਾਸ ਪਬਲਿਕ ਸਕੂਲ, ਰੇਲਵੇ ਰੋਡ, ਕਲਾਇਤ, ਕੈਥਲ (ਹਰਿਆਣਾ)। ਹੈਲਪਲਾਈਨ ਫੋਨ: +91 98125 50200। ਈਮੇਲ: info@bvpskalayat.edu.in।"
    },
    path: '/contact',
    actionLabels: {
      en: 'Contact Details & Map',
      hi: 'संपर्क विवरण व नक्शा',
      pa: 'ਸੰਪਰਕ ਵੇਰਵਾ ਅਤੇ ਨਕਸ਼ਾ'
    },
    followUps: {
      en: ['School Timings', 'Fees Structure', 'Admission Form'],
      hi: ['स्कूल का समय', 'फीस संरचना', 'प्रवेश फॉर्म'],
      pa: ['ਸਕੂਲ ਦਾ ਸਮਾਂ', 'ਫੀਸ ਦਾ ਵੇਰਵਾ', 'ਦਾਖਲਾ ਫਾਰਮ']
    }
  },

  // 10. Required Documents / Interview
  {
    patterns: [
      /document|documents|kaagaz|kagzat|aadhaar|tc|birth certificate|interview|rules|niyam|praman patra|ਦਸਤਾਵੇਜ਼/i,
    ],
    keywords: ['document', 'documents', 'interview', 'rules', 'kaagaz', 'aadhaar', 'tc', 'ਦਸਤਾਵੇਜ਼'],
    responses: {
      en: "Required documents for admission: 1) Student Aadhaar Card, 2) Birth Certificate / Transfer Certificate (TC), 3) Previous Report Card, 4) 4 Passport Photos, and 5) Parent ID proof.",
      hi: "प्रवेश हेतु आवश्यक दस्तावेज: 1) छात्र का आधार कार्ड, 2) जन्म प्रमाण पत्र / टीसी, 3) पिछली कक्षा का रिपोर्ट कार्ड, 4) 4 पासपोर्ट फोटो, और 5) माता-पिता का पहचान पत्र।",
      pa: "ਦਾਖਲੇ ਲਈ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼: 1) ਵਿਦਿਆਰਥੀ ਦਾ ਆਧਾਰ ਕਾਰਡ, 2) ਜਨਮ ਸਰਟੀਫਿਕੇਟ / ਟੀਸੀ, 3) ਪਿਛਲਾ ਰਿਪੋਰਟ ਕਾਰਡ, 4) 4 ਪਾਸਪੋਰਟ ਫੋਟੋਆਂ, ਅਤੇ 5) ਮਾਪਿਆਂ ਦਾ ਆਈਡੀ ਪਰੂਫ।"
    },
    path: '/interview',
    actionLabels: {
      en: 'Interview & Documents List',
      hi: 'दस्तावेज सूची देखें',
      pa: 'ਦਸਤਾਵੇਜ਼ ਸੂਚੀ ਵੇਖੋ'
    },
    followUps: {
      en: ['Admission Form', 'How Much Is The Fee?', 'Enrollment Guide'],
      hi: ['प्रवेश फॉर्म', 'फीस कितनी है?', 'नामांकन विवरण'],
      pa: ['ਦਾਖਲਾ ਫਾਰਮ', 'ਫੀਸ ਕਿੰਨੀ ਹੈ?', 'ਦਾਖਲਾ ਗਾਈਡ']
    }
  },

  // 11. About School / History
  {
    patterns: [
      /about|history|bvps|school|parichay|baare me|itihas|founder|ਬਾਰੇ|ਇਤਿਹਾਸ/i,
    ],
    keywords: ['about', 'history', 'school', 'bvps', 'kalayat', 'parichay', 'ਬਾਰੇ'],
    responses: {
      en: "Bal Vikas Public School (BVPS) Kalayat, Kaithal is a premier senior secondary institution established in 2004, offering values-based quality education from Nursery to Class 12.",
      hi: "बाल विकास पब्लिक स्कूल (BVPS) कलायत, कैथल 2004 से स्थापित एक अग्रणी वरिष्ठ माध्यमिक विद्यालय है जो उच्च नैतिक संस्कारों और गुणवत्तापूर्ण शिक्षा के लिए समर्पित है।",
      pa: "ਬਾਲ ਵਿਕਾਸ ਪਬਲਿਕ ਸਕੂਲ (BVPS) ਕਲਾਇਤ, ਕੈਥਲ 2004 ਤੋਂ ਸਥਾਪਿਤ ਇੱਕ ਪ੍ਰਮੁੱਖ ਸੀਨੀਅਰ ਸੈਕੰਡਰੀ ਸਕੂਲ ਹੈ ਜੋ ਉੱਚ ਨੈਤਿਕ ਕਦਰਾਂ-ਕੀਮਤਾਂ ਅਤੇ ਮਿਆਰੀ ਸਿੱਖਿਆ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ।"
    },
    path: '/about',
    actionLabels: {
      en: 'View About Us Page',
      hi: 'हमारे बारे में जानें',
      pa: 'ਸਾਡੇ ਬਾਰੇ ਜਾਣੋ'
    },
    followUps: {
      en: ["Principal's Desk", 'Facilities', 'Admission Form'],
      hi: ['प्रधानाचार्य संदेश', 'सुविधाएं', 'प्रवेश फॉर्म'],
      pa: ['ਪ੍ਰਿੰਸੀਪਲ ਸੁਨੇਹਾ', 'ਸਹੂਲਤਾਂ', 'ਦਾਖਲਾ ਫਾਰਮ']
    }
  },

  // 12. Home Page
  {
    patterns: [
      /home|shuru|start|main page|mukhya prashth|pehle page|ਮੁੱਖ ਪੰਨਾ/i,
    ],
    keywords: ['home', 'start', 'shuru', 'main page', 'ਮੁੱਖ'],
    responses: {
      en: "Home page has been opened for you.",
      hi: "मुख्य पृष्ठ (होम पेज) खोल दिया गया है।",
      pa: "ਮੁੱਖ ਪੰਨਾ (Home Page) ਖੋਲ੍ਹ ਦਿੱਤਾ ਗਿਆ ਹੈ।"
    },
    path: '/',
    actionLabels: {
      en: 'Home Page',
      hi: 'होम पेज',
      pa: 'ਮੁੱਖ ਪੰਨਾ'
    },
    followUps: {
      en: ['Fee Structure', 'Admission Form', 'Facilities'],
      hi: ['फीस संरचना', 'प्रवेश फॉर्म', 'सुविधाएं'],
      pa: ['ਫੀਸ ਦਾ ਵੇਰਵਾ', 'ਦਾਖਲਾ ਫਾਰਮ', 'ਸਹੂਲਤਾਂ']
    }
  }
];

// Localized UI Texts
const UI_TEXTS: Record<Language, {
  title: string;
  subtitle: string;
  badge: string;
  mute: string;
  unmute: string;
  listeningBar: string;
  speakingBar: string;
  stopBtn: string;
  quickTitle: string;
  quickPrompts: string[];
  placeholder: string;
  listenVoiceBtn: string;
  micOnTitle: string;
  micOffTitle: string;
  entranceTitle: string;
  entranceText: string;
  entranceSpeech: string;
  initialMessage: string;
  initialOptions: string[];
  greetingResponse: string;
  fallbackResponse: string;
  commandPrefix: string;
}> = {
  en: {
    title: 'BVPS AI Voice & Chat Assistant',
    subtitle: 'Speak or type — I will instantly navigate & answer!',
    badge: 'Online',
    mute: 'Mute Voice',
    unmute: 'Unmute Voice',
    listeningBar: 'Mic is listening... speak your question...',
    speakingBar: 'AI Assistant is speaking in English...',
    stopBtn: 'Stop',
    quickTitle: 'Quick Prompts:',
    quickPrompts: ['Fee Structure', 'Admission Form', '11th Streams', 'School Timings', 'Facilities', "Principal's Desk"],
    placeholder: 'Type anything or tap mic to speak in English...',
    listenVoiceBtn: 'Listen in English',
    micOnTitle: 'Stop Mic',
    micOffTitle: 'Tap to Speak',
    entranceTitle: 'Welcome to Bal Vikas Public School, Kalayat',
    entranceText: 'I am your AI Voice & Site Assistant. Speak or type anything to control the website and get instant answers!',
    entranceSpeech: 'Welcome to Bal Vikas Public School, Kalayat! I am your AI Voice Assistant. Speak or type anything to explore the school!',
    initialMessage: '🙏 Welcome to Bal Vikas Public School, Kalayat!\n\nI am your AI Voice & Site Assistant. Ask me anything about fees, admissions, streams, timings, or results, and I will instantly assist you!',
    initialOptions: ['How Much Is The Fee?', 'Open Admission Form', 'Class 11 Streams', 'School Timings'],
    greetingResponse: 'Hello! 🙏 Welcome to BVPS Kalayat AI Assistant. You can speak or write anything (like Fees, Admission, Streams, Timings) and I will guide you instantly!',
    fallbackResponse: 'I have received your request. Please select an option below to explore BVPS Kalayat:',
    commandPrefix: 'Command: '
  },
  hi: {
    title: 'BVPS AI वॉइस व चैट असिस्टेंट',
    subtitle: 'बोलें या लिखें — जो बोलेंगे वही पेज तुरंत खुलेगा!',
    badge: 'सक्रिय',
    mute: 'आवाज़ बंद करें',
    unmute: 'आवाज़ चालू करें',
    listeningBar: 'माइक चालू है... अपना प्रश्न बोलें...',
    speakingBar: 'AI असिस्टेंट हिन्दी में बोल रहा है...',
    stopBtn: 'रोकें',
    quickTitle: 'त्वरित विकल्प:',
    quickPrompts: ['फीस संरचना', 'प्रवेश फॉर्म', '11वीं संकाय', 'स्कूल का समय', 'सुविधाएं', 'प्रधानाचार्य संदेश'],
    placeholder: 'कुछ भी लिखें या माइक दबाकर हिन्दी में बोलें...',
    listenVoiceBtn: 'आवाज़ में सुनें',
    micOnTitle: 'माइक बंद करें',
    micOffTitle: 'बोलने के लिए माइक दबाएं',
    entranceTitle: 'बाल विकास पब्लिक स्कूल, कलायत में स्वागत है',
    entranceText: 'मैं आपका AI वॉइस व साइट असिस्टेंट हूँ। आप बोलकर या लिखकर वेबसाइट चला सकते हैं और तुरंत जानकारी पा सकते हैं।',
    entranceSpeech: 'नमस्ते! बाल विकास पब्लिक स्कूल कलायत में आपका हार्दिक स्वागत है! मैं आपका AI असिस्टेंट हूँ। आप बोलकर या लिखकर स्कूल की जानकारी ले सकते हैं!',
    initialMessage: '🙏 नमस्ते! बाल विकास पब्लिक स्कूल, कलायत में आपका स्वागत है!\n\nमैं आपका AI असिस्टेंट हूँ। फीस, प्रवेश, 11वीं संकाय, समय या परीक्षा परिणामों के बारे में कुछ भी पूछें, मैं तुरंत सहायता करूँगा!',
    initialOptions: ['फीस कितनी है?', 'प्रवेश फॉर्म खोलें', '11वीं के संकाय', 'स्कूल का समय'],
    greetingResponse: 'नमस्ते! 🙏 BVPS कलायत AI असिस्टेंट में आपका स्वागत है। आप बोलकर या लिखकर कुछ भी पूछें (जैसे फीस, एडमिशन, संकाय, समय), मैं तुरंत वही पेज खोल दूंगा!',
    fallbackResponse: 'मैंने आपकी बात समझ ली है। BVPS कलायत से जुड़ी जानकारी के लिए नीचे दिए गए विकल्प चुनें:',
    commandPrefix: 'आदेश: '
  },
  pa: {
    title: 'BVPS AI ਵਾਇਸ ਅਤੇ ਚੈਟ ਅਸਿਸਟੈਂਟ',
    subtitle: 'ਬੋਲੋ ਜਾਂ ਲਿਖੋ — ਜੋ ਕਹੋਗੇ ਉਹੀ ਪੇਜ ਤੁਰੰਤ ਖੁੱਲ੍ਹੇਗਾ!',
    badge: 'ਸਰਗਰਮ',
    mute: 'ਆਵਾਜ਼ ਬੰਦ ਕਰੋ',
    unmute: 'ਆਵਾਜ਼ ਚਾਲੂ ਕਰੋ',
    listeningBar: 'ਮਾਈਕ ਚਾਲੂ ਹੈ... ਆਪਣਾ ਸਵਾਲ ਬੋਲੋ...',
    speakingBar: 'AI ਅਸਿਸਟੈਂਟ ਪੰਜਾਬੀ ਵਿੱਚ ਬੋਲ ਰਿਹਾ ਹੈ...',
    stopBtn: 'ਰੋਕੋ',
    quickTitle: 'ਤੁਰੰਤ ਵਿਕਲਪ:',
    quickPrompts: ['ਫੀਸ ਦਾ ਵੇਰਵਾ', 'ਦਾਖਲਾ ਫਾਰਮ', '11ਵੀਂ ਸਟ੍ਰੀਮਜ਼', 'ਸਕੂਲ ਦਾ ਸਮਾਂ', 'ਸਹੂਲਤਾਂ', 'ਪ੍ਰਿੰਸੀਪਲ ਸੁਨੇਹਾ'],
    placeholder: 'ਕੁਝ ਵੀ ਲਿਖੋ ਜਾਂ ਮਾਈਕ ਦਬਾ ਕੇ ਪੰਜਾਬੀ ਵਿੱਚ ਬੋਲੋ...',
    listenVoiceBtn: 'ਆਵਾਜ਼ ਸੁਣੋ',
    micOnTitle: 'ਮਾਈਕ ਬੰਦ ਕਰੋ',
    micOffTitle: 'ਬੋਲਣ ਲਈ ਮਾਈਕ ਦਬਾਓ',
    entranceTitle: 'ਬਾਲ ਵਿਕਾਸ ਪਬਲਿਕ ਸਕੂਲ, ਕਲਾਇਤ ਵਿੱਚ ਸਵਾਗਤ ਹੈ',
    entranceText: 'ਮੈਂ ਤੁਹਾਡਾ AI ਵਾਇਸ ਅਤੇ ਸਾਈਟ ਅਸਿਸਟੈਂਟ ਹਾਂ। ਤੁਸੀਂ ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਵੈੱਬਸਾਈਟ ਬਾਰੇ ਕੋਈ ਵੀ ਜਾਣਕਾਰੀ ਲੈ ਸਕਦੇ ਹੋ।',
    entranceSpeech: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਬਾਲ ਵਿਕਾਸ ਪਬਲਿਕ ਸਕੂਲ ਕਲਾਇਤ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ! ਮੈਂ ਤੁਹਾਡਾ AI ਅਸਿਸਟੈਂਟ ਹਾਂ।',
    initialMessage: '🙏 ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਬਾਲ ਵਿਕਾਸ ਪਬਲਿਕ ਸਕੂਲ, ਕਲਾਇਤ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ!\n\nਮੈਂ ਤੁਹਾਡਾ AI ਅਸਿਸਟੈਂਟ ਹਾਂ। ਫੀਸ, ਦਾਖਲਾ, 11ਵੀਂ ਦੀਆਂ ਸਟ੍ਰੀਮਜ਼, ਸਮਾਂ ਜਾਂ ਨਤੀਜਿਆਂ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ!',
    initialOptions: ['ਫੀਸ ਕਿੰਨੀ ਹੈ?', 'ਦਾਖਲਾ ਫਾਰਮ ਖੋਲ੍ਹੋ', '11ਵੀਂ ਦੀਆਂ ਸਟ੍ਰੀਮਜ਼', 'ਸਕੂਲ ਦਾ ਸਮਾਂ'],
    greetingResponse: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! 🙏 BVPS ਕਲਾਇਤ AI ਅਸਿਸਟੈਂਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਤੁਸੀਂ ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਫੀਸ, ਦਾਖਲਾ, ਸਟ੍ਰੀਮਜ਼ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ!',
    fallbackResponse: 'ਮੈਂ ਤੁਹਾਡੀ ਬੇਨਤੀ ਸਮਝ ਲਈ ਹੈ। ਜਾਣਕਾਰੀ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਕਲਪ ਚੁਣੋ:',
    commandPrefix: 'ਹੁਕਮ: '
  }
};

// Smart Intent Resolver with Language Context
function resolveSmartIntent(query: string, lang: Language): { 
  matchedIntent?: SmartIntent;
  responseText: string;
  path?: string;
  actionLabel?: string;
  followUps: string[];
} {
  const clean = query.toLowerCase().trim();
  const currentUi = UI_TEXTS[lang] || UI_TEXTS.en;

  // Greetings match
  if (/^(hi|hello|hey|namaste|pranam|namaskar|ram ram|shastriakal|sat sri akal|satsriakal|greetings|radhe radhe|jai shree ram|ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ|ਨਮਸਤੇ)/i.test(clean)) {
    return {
      responseText: currentUi.greetingResponse,
      followUps: currentUi.initialOptions
    };
  }

  // 1. Regex Pattern match
  for (const intent of SMART_INTENTS) {
    if (intent.patterns.some(p => p.test(clean))) {
      return {
        matchedIntent: intent,
        responseText: intent.responses[lang] || intent.responses.en,
        path: intent.path,
        actionLabel: intent.actionLabels[lang] || intent.actionLabels.en,
        followUps: intent.followUps[lang] || intent.followUps.en
      };
    }
  }

  // 2. Keyword substring match
  for (const intent of SMART_INTENTS) {
    if (intent.keywords.some(k => clean.includes(k.toLowerCase()))) {
      return {
        matchedIntent: intent,
        responseText: intent.responses[lang] || intent.responses.en,
        path: intent.path,
        actionLabel: intent.actionLabels[lang] || intent.actionLabels.en,
        followUps: intent.followUps[lang] || intent.followUps.en
      };
    }
  }

  // 3. Fallback in active language
  return {
    responseText: currentUi.fallbackResponse,
    followUps: currentUi.quickPrompts
  };
}

export function UnifiedAiAgent() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const ui = UI_TEXTS[language] || UI_TEXTS.en;

  // Entrance Banner State
  const [showEntranceGreeting, setShowEntranceGreeting] = useState(false);

  // Chatboard & Voice State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const isVoiceMutedRef = useRef(isVoiceMuted);
  isVoiceMutedRef.current = isVoiceMuted;

  const [inputVal, setInputVal] = useState('');
  const voiceEnabledRef = useRef(false);
  
  // Feedback HUD toast
  const [hudToast, setHudToast] = useState<{ title: string; subtitle: string } | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg',
      sender: 'bot',
      text: ui.initialMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: ui.initialOptions
    }
  ]);

  // When language changes, update initial chat message and recognition language
  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return [{
          id: 'init-msg',
          sender: 'bot',
          text: ui.initialMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: ui.initialOptions
        }];
      }
      return prev;
    });

    if (recognitionRef.current) {
      if (language === 'pa') {
        recognitionRef.current.lang = 'pa-IN';
      } else if (language === 'hi') {
        recognitionRef.current.lang = 'hi-IN';
      } else {
        recognitionRef.current.lang = 'en-IN';
      }
    }
  }, [language, ui]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening, isSpeaking]);

  // Automatic Entrance Greeting on Site Landing
  useEffect(() => {
    let active = true;
    let speakTimer: ReturnType<typeof setTimeout>;

    const unlockVoice = () => {
      voiceEnabledRef.current = true;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
      document.removeEventListener('click', unlockVoice);
      document.removeEventListener('touchstart', unlockVoice);
    };
    document.addEventListener('click', unlockVoice, { once: true });
    document.addEventListener('touchstart', unlockVoice, { once: true });

    const hasSeenGreeting = sessionStorage.getItem('bvps_entrance_greeted');
    if (!hasSeenGreeting) {
      setShowEntranceGreeting(true);
      
      const welcomeSpeech = ui.entranceSpeech;

      const safetyTimer = setTimeout(() => {
        if (!active) return;
        setShowEntranceGreeting(false);
        sessionStorage.setItem('bvps_entrance_greeted', 'true');
      }, 8500);

      let attempts = 0;
      const trySpeak = () => {
        if (!active || attempts > 10) return;
        attempts++;
        if (voiceEnabledRef.current) {
          speakVoice(welcomeSpeech, () => {
            if (!active) return;
            clearTimeout(safetyTimer);
            setTimeout(() => {
              if (!active) return;
              setShowEntranceGreeting(false);
              sessionStorage.setItem('bvps_entrance_greeted', 'true');
            }, 1200);
          });
        } else {
          speakTimer = setTimeout(trySpeak, 600);
        }
      };
      speakTimer = setTimeout(trySpeak, 500);

      return () => {
        active = false;
        clearTimeout(safetyTimer);
        clearTimeout(speakTimer);
        document.removeEventListener('click', unlockVoice);
        document.removeEventListener('touchstart', unlockVoice);
      };
    }

    return () => {
      active = false;
      document.removeEventListener('click', unlockVoice);
      document.removeEventListener('touchstart', unlockVoice);
    };
  }, []);

  // Web Speech Recognition Engine
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'pa' ? 'pa-IN' : (language === 'hi' ? 'hi-IN' : 'en-IN');

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleExecuteCommand(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition setup:', e);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      window.speechSynthesis?.cancel();
    };
  }, [language]);

  // Text-to-Speech Engine
  const speakVoice = (text: string, onFinish?: () => void) => {
    if (isVoiceMutedRef.current || !('speechSynthesis' in window)) {
      onFinish?.();
      return;
    }

    window.speechSynthesis.cancel();
    voiceEnabledRef.current = true;
    const cleanText = text.replace(/[🙏🎤🔊⚡✨🤖🎧💬✅🎯🎉🏆📊📸🖼️🏛️📚🏫🚌🖥️💧🏥]/g, '').replace(/\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Dynamic Language & Voice Selection
    const voices = window.speechSynthesis.getVoices();
    if (language === 'pa') {
      utterance.lang = 'pa-IN';
      const paVoice = voices.find(v => v.lang.includes('pa') || v.name.toLowerCase().includes('punjabi') || v.lang.includes('hi-IN'));
      if (paVoice) utterance.voice = paVoice;
    } else if (language === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    const resumeInterval = setInterval(() => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      clearInterval(resumeInterval);
      setIsSpeaking(false);
      onFinish?.();
    };
    utterance.onerror = () => {
      clearInterval(resumeInterval);
      setIsSpeaking(false);
      onFinish?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopVoice = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // Smooth scroll
  const slowScrollPage = () => {
    const totalHeight = document.documentElement.scrollHeight;
    const viewHeight = window.innerHeight;
    const maxScroll = totalHeight - viewHeight;
    const startPos = window.scrollY;
    const travel = maxScroll - startPos;
    if (travel <= 0) return;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      const pxPerMs = travel / 15000;
      const move = pxPerMs * dt;
      const newY = window.scrollY + move;
      if (newY >= maxScroll) {
        window.scrollTo(0, maxScroll);
        return;
      }
      window.scrollTo(0, newY);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Toggle Voice Listening
  const toggleListening = () => {
    stopVoice();
    if (!recognitionRef.current) {
      setHudToast({
        title: language === 'pa' ? 'ਮਾਈਕ੍ਰੋਫ਼ੋਨ ਚੇਤਾਵਨੀ' : (language === 'hi' ? 'माइक्रोफ़ोन सूचना' : 'Microphone Notice'),
        subtitle: language === 'pa' 
          ? 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਮਾਈਕ੍ਰੋਫ਼ੋਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ।' 
          : (language === 'hi' 
            ? 'कृपया अपने ब्राउज़र में माइक्रोफ़ोन की अनुमति (Permission) दें।' 
            : 'Please allow microphone access in your browser settings.')
      });
      setTimeout(() => setHudToast(null), 4000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'pa' ? 'pa-IN' : (language === 'hi' ? 'hi-IN' : 'en-IN');
        recognitionRef.current.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // Execute Voice / Text Command
  const handleExecuteCommand = (rawText: string) => {
    if (!rawText.trim()) return;

    // Add user message to chat
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: rawText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Resolve Intent & Execute Action in active language
    const result = resolveSmartIntent(rawText, language);

    // Navigate immediately if page path is found!
    if (result.path) {
      setLocation(result.path);
      setTimeout(() => {
        setIsChatOpen(false);
      }, 500);
    }

    // Show HUD toast notification in active language
    setHudToast({
      title: `${ui.commandPrefix}"${rawText}"`,
      subtitle: result.responseText
    });
    setTimeout(() => setHudToast(null), 4000);

    // Add bot response to chat in active language
    setTimeout(() => {
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: result.responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink: result.path ? { label: result.actionLabel || (language === 'pa' ? 'ਪੇਜ ਖੋਲ੍ਹੋ' : (language === 'hi' ? 'पेज खोलें' : 'Open Page')), path: result.path } : undefined,
        options: result.followUps
      };

      setMessages(prev => [...prev, botMsg]);
      speakVoice(result.responseText);
    }, 250);
  };

  return (
    <>
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 1. ENTRANCE GREETING POP-OVER                                        */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {showEntranceGreeting && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-xl bg-gradient-to-r from-slate-950 via-primary to-slate-900 text-white rounded-3xl p-5 shadow-2xl border-2 border-amber-400/60 flex items-center gap-4 animate-in fade-in slide-in-from-top-6 duration-300 notranslate">
          
          {/* Animated Robot Avatar */}
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-white/10 p-1 flex items-center justify-center border border-amber-300/40 shadow-inner">
            <RobotAvatar size="md" isSpeaking={isSpeaking} isGreeting={true} showHands={true} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-amber-300 font-extrabold text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                [{ui.entranceTitle}]
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              "{ui.entranceText}"
            </p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => {
              stopVoice();
              setShowEntranceGreeting(false);
              sessionStorage.setItem('bvps_entrance_greeted', 'true');
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 2. HUD TOAST                                                         */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {hudToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-amber-400/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 notranslate">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-300 truncate">{hudToast.title}</p>
            <p className="text-xs text-slate-200 leading-tight mt-0.5 line-clamp-2">{hudToast.subtitle}</p>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 3. PERSISTENT FLOATING CIRCULAR AI AGENT BUTTON                     */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes ai-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes ai-glow-pulse {
          0%, 100% { box-shadow: 0 0 12px 3px rgba(251,191,36,0.4), 0 0 30px 6px rgba(37,99,235,0.2); }
          50% { box-shadow: 0 0 22px 8px rgba(251,191,36,0.6), 0 0 50px 12px rgba(37,99,235,0.35); }
        }
        @keyframes ai-ring-expand {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes ai-spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ai-bounce-in {
          0% { transform: scale(0) rotate(-30deg); opacity: 0; }
          50% { transform: scale(1.15) rotate(5deg); }
          70% { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .ai-agent-btn {
          animation: ai-bounce-in 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards,
                     ai-float 3s ease-in-out 0.8s infinite,
                     ai-glow-pulse 2.5s ease-in-out infinite;
        }
        .ai-agent-ring {
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          border: 2px solid rgba(251,191,36,0.35);
          animation: ai-ring-expand 2s ease-out infinite;
        }
        .ai-agent-ring:nth-child(2) {
          animation-delay: 0.7s;
        }
        .ai-agent-ring:nth-child(3) {
          animation-delay: 1.4s;
        }
        .ai-agent-spin {
          animation: ai-spin-slow 12s linear infinite;
        }
      `}</style>

      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 select-none notranslate">
        
        <div className="relative">
          {/* Expanding rings */}
          <span className="ai-agent-ring"></span>
          <span className="ai-agent-ring"></span>
          <span className="ai-agent-ring"></span>

          {/* Spinning gradient border */}
          <div className="absolute inset-[-3px] rounded-full ai-agent-spin" style={{
            background: 'conic-gradient(from 0deg, #f59e0b, #2563eb, #f59e0b, #2563eb, #f59e0b)',
            opacity: 0.6,
          }}></div>

          {/* Main circular button */}
          <button
            onClick={() => {
              voiceEnabledRef.current = true;
              if (!isChatOpen) {
                setIsChatOpen(true);
                setTimeout(() => {
                  speakVoice(ui.greetingResponse);
                }, 400);
              } else {
                setIsChatOpen(false);
              }
            }}
            aria-label="Open AI Voice & Chat Assistant"
            className="ai-agent-btn relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-[#1e3a8a] to-secondary text-white flex items-center justify-center shadow-2xl hover:shadow-primary/50 hover:scale-110 active:scale-95 transition-transform duration-200 border-2 border-amber-300/60 z-10 overflow-hidden"
          >
            {/* Inner glow overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/10 via-transparent to-blue-400/10"></div>

            <RobotAvatar size="md" isSpeaking={isSpeaking} isListening={isListening} showHands={false} />

            {/* Online badge */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 4. INTEGRATED VOICE & CHATBOARD DIALOG MODAL (Multilingual)         */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isChatOpen && (
        <div className="fixed bottom-28 left-3 sm:left-6 w-[95vw] sm:w-[440px] max-h-[85vh] h-[650px] z-50 bg-white rounded-3xl shadow-2xl border-2 border-primary/20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-250 notranslate">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-[#1e3a8a] to-primary p-3.5 text-white flex items-center justify-between shadow-sm relative shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 p-0.5 border border-amber-300/60 flex items-center justify-center shrink-0">
                <RobotAvatar size="sm" isSpeaking={isSpeaking} isListening={isListening} showHands={false} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm leading-tight text-white">{ui.title}</h3>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-400 text-primary rounded-full uppercase tracking-wider">{ui.badge}</span>
                </div>
                <p className="text-[11px] text-white/80">
                  {ui.subtitle}
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5">
              {/* Mute Voice */}
              <button
                onClick={() => {
                  if (isSpeaking) stopVoice();
                  setIsVoiceMuted(!isVoiceMuted);
                }}
                title={isVoiceMuted ? ui.unmute : ui.mute}
                className={`p-1.5 rounded-lg transition-colors ${isVoiceMuted ? 'bg-red-500/30 text-red-200' : 'bg-white/15 hover:bg-white/25 text-white'}`}
              >
                {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  stopVoice();
                  if (isListening && recognitionRef.current) {
                    recognitionRef.current.stop();
                  }
                  setIsChatOpen(false);
                }}
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                title="Close chatboard"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Listening / Speaking Bar */}
          {(isListening || isSpeaking) && (
            <div className={`py-1.5 px-4 text-xs font-semibold flex items-center justify-between shrink-0 transition-colors ${
              isListening ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 text-white'
            }`}>
              <div className="flex items-center gap-2">
                {isListening ? (
                  <>
                    <Mic className="w-4 h-4 animate-bounce" />
                    <span>{ui.listeningBar}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span>{ui.speakingBar}</span>
                  </>
                )}
              </div>
              <button 
                onClick={() => {
                  if (isListening) recognitionRef.current?.stop();
                  if (isSpeaking) stopVoice();
                }}
                className="text-[10px] font-bold bg-black/25 px-2 py-0.5 rounded hover:bg-black/40"
              >
                {ui.stopBtn}
              </button>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/80">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`flex gap-2.5 max-w-[90%] ${
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

                    {/* Direct Page Link Button */}
                    {msg.actionLink && (
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            if (msg.actionLink?.path) {
                              setLocation(msg.actionLink.path);
                              setTimeout(() => {
                                setIsChatOpen(false);
                                setTimeout(slowScrollPage, 1000);
                              }, 1000);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <span>{msg.actionLink.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                        </button>
                      </div>
                    )}

                    {/* Replay Audio in active language */}
                    {msg.sender === 'bot' && (
                      <button
                        onClick={() => speakVoice(msg.text)}
                        className="self-start inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-primary mt-1 font-medium transition-colors"
                      >
                        <Volume2 className="w-3 h-3 text-secondary" />
                        <span>{ui.listenVoiceBtn}</span>
                      </button>
                    )}

                    {/* Follow-up Prompt Pills */}
                    {msg.options && msg.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 mt-1 border-t border-slate-100">
                        {msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleExecuteCommand(opt)}
                            className="text-xs bg-slate-100 hover:bg-amber-400 hover:text-slate-900 text-slate-700 font-medium px-2.5 py-1 rounded-full border border-slate-200 transition-all text-left"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice Prompt Shortcuts */}
          <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200/80 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap uppercase tracking-wider">
              {ui.quickTitle}
            </span>
            {ui.quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteCommand(q)}
                className="whitespace-nowrap text-xs bg-white text-primary font-medium px-3 py-1 rounded-full border border-slate-300/80 hover:bg-primary hover:text-white transition-colors shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Bottom Voice Mic + Text Input Form */}
          <div className="p-3 bg-white border-t border-border flex items-center gap-2 shrink-0">
            {/* Big Mic Button */}
            <button
              onClick={toggleListening}
              title={isListening ? ui.micOnTitle : ui.micOffTitle}
              className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 shadow-md ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200'
                  : 'bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-900 hover:scale-105 active:scale-95'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 font-bold" />}
            </button>

            {/* Text Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteCommand(inputVal);
              }}
              className="flex-1 flex items-center gap-2 bg-slate-100 rounded-2xl px-3.5 py-1.5 border border-slate-200 focus-within:border-primary focus-within:bg-white transition-all"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={ui.placeholder}
                className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400"
              >
              </input>
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
    </>
  );
}

