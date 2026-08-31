import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'pa';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

export const LANGUAGES: { code: Language; label: string; nativeName: string; flag: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Top Bar & Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.results': 'Results',
    'nav.gallery': 'Gallery',
    'nav.facilities': 'Facilities',
    'nav.timing': 'School Timing',
    'nav.streams': 'Streams',
    'nav.interview': 'Interview & Syllabus',
    'nav.enrollment': 'Enrollment',
    'nav.fees': 'Fee Structure',
    'nav.contact': 'Contact',
    'nav.principal': "Principal's Desk",
    'nav.apply': 'Apply Online',
    'nav.call': 'Call Us',

    // Principal Page Headings & Content in English
    'principal.badge': '20+ Years of Educational Leadership & Teaching',
    'principal.title': "Principal's Desk & Direct Message",
    'principal.subtitle': '"Noble thoughts, discipline, moral values, and quality education — dedicated 20+ years of excellence."',
    'principal.name': 'Sh. Ramphal Sharma',
    'principal.role': 'Principal & Founder',
    'principal.educatorRole': 'Senior Hindi Educator & Literature Specialist',
    'principal.experience': '20+ Years Exp.',
    'principal.studentsGuided': '945+ Students Guided',
    'principal.est': 'Est. 2004',
    'principal.schoolName': 'Bal Vikas Public School, Kalayat (Kaithal)',
    
    'principal.quote': '“Every child has unique potential. Our responsibility is to provide the right guidance, opportunities and environment so that every student can discover and achieve their potential.”',
    
    'principal.p1_title': '20+ Years of Dedicated Teaching & Leadership:',
    'principal.p1_text': 'Since founding Bal Vikas Public School in 2004, Sh. Ramphal Sharma has maintained a steadfast vision — providing affordable, modern, disciplined, and value-based education to every child in Kalayat and neighboring rural and urban regions.',
    
    'principal.p2_title': 'Inspiration as a Senior Hindi Educator:',
    'principal.p2_text': 'As a veteran Hindi teacher and scholar, he teaches students not just grammar and literature, but the beauty of expression, eloquent communication, cultural heritage, and moral conduct. His classes foster confidence, clarity of thought, and high ethical grounding.',
    
    'principal.p3_title': 'Student-Centric Guidance & Noble Thoughts (उच्च विचार):',
    'principal.p3_text': 'Firmly believing in "Simple Living, High Thinking" (सादा जीवन, उच्च विचार), he personally mentors students and leads a dedicated faculty of 29 teachers, closely monitoring each student\'s academic progress, sports involvement, and moral development.',
    
    // Core Pillars
    'pillar.heading': '4 Core Pillars of Leadership & Mentorship',
    'pillar.subheading': 'Key guiding principles behind Bal Vikas Public School Kalayat',
    
    'pillar1.title': '20+ Years Experience',
    'pillar1.sub': 'Dedicated Leadership',
    'pillar1.desc': 'Over two decades of school administration and classroom teaching, helping thousands of students excel in board exams and future careers.',
    
    'pillar2.title': 'Senior Hindi Educator',
    'pillar2.sub': 'Language & Literature',
    'pillar2.desc': 'Deep mastery of Hindi literature and linguistics, empowering students with eloquent communication, essay writing, and cultural identity.',
    
    'pillar3.title': 'Noble Thoughts & Values',
    'pillar3.sub': 'Character Building',
    'pillar3.desc': 'Nurturing sound ethics, discipline, respect for elders, and positive thinking alongside core academic excellence.',
    
    'pillar4.title': 'Accessible Mentor',
    'pillar4.sub': 'Student & Parent Welfare',
    'pillar4.desc': 'Always accessible to parents and students for personal counseling, academic guidance, and individual doubt resolution.',

    // Stats
    'stat.exp': 'Teaching & Leadership',
    'stat.students': 'Current Enrolled Students',
    'stat.teachers': 'Dedicated Faculty Members',
    'stat.classes': 'HBSE Classes (1st to 12th)',

    // Form
    'form.title': 'Write a Direct Message to the Principal',
    'form.subtitle': 'Direct communication channel to Principal Sh. Ramphal Sharma',
    'form.name': 'Your Full Name',
    'form.role': 'I am a...',
    'form.phone': 'WhatsApp / Phone Number',
    'form.email': 'Email Address (Optional)',
    'form.category': 'Message Category',
    'form.subject': 'Subject / Topic',
    'form.message': 'Your Message to Sh. Ramphal Sharma',
    'form.messagePlaceholder': 'Write your question, admission query, or meeting request here...',
    'form.submit': 'Send Direct Message',
    'form.whatsapp': 'Send via WhatsApp',
    'form.confidential': 'Messages are strictly confidential and routed directly to the Principal.',
    'form.urgent': 'Have urgent queries? Call the Principal directly at +91 98125 50200.',
    
    // Home Principal Section
    'home.principalTag': 'Noble Thoughts, Discipline & Values',
    'home.principalQuote': '"At Bal Vikas Public School, our foremost mission is not just textbook instruction, but awakening noble thoughts, self-discipline, moral virtues, and fearless confidence in each student so they become exemplary citizens."',
    'home.messagePrincipalBtn': 'Message Principal Direct',
    'home.viewFullDeskBtn': 'Read Full Message & Profile →',
    'principal.experienceBadgeTitle': '20+ Years',
    'principal.experienceBadgeSub': 'Teaching Experience',
    'principal.hindiEducatorTitle': 'Hindi Educator',
    'principal.hindiEducatorSub': 'Literature & Grammar',
    'principal.nobleThoughtsTitle': 'Noble Thoughts',
    'principal.nobleThoughtsSub': 'Values & Character',
  },

  hi: {
    // Top Bar & Navigation
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.results': 'परीक्षा परिणाम',
    'nav.gallery': 'गैलरी',
    'nav.facilities': 'सुविधाएं',
    'nav.timing': 'स्कूल समय',
    'nav.streams': 'संकाय / स्ट्रीम्स',
    'nav.interview': 'साक्षात्कार व पाठ्यक्रम',
    'nav.enrollment': 'नामांकन',
    'nav.fees': 'फीस संरचना',
    'nav.contact': 'संपर्क',
    'nav.principal': 'प्रधानाचार्य संदेश',
    'nav.apply': 'ऑनलाइन आवेदन',
    'nav.call': 'कॉल करें',

    // Principal Page Headings & Content in Hindi
    'principal.badge': '20+ वर्षों का शिक्षण एवं शैक्षणिक नेतृत्व',
    'principal.title': 'प्रधानाचार्य संदेश एवं डायरेक्ट डेस्क',
    'principal.subtitle': '"उच्च विचार, अनुशासन, नैतिक संस्कार और गुणवत्तापूर्ण शिक्षा की 20+ वर्षों की समर्पित परंपरा"',
    'principal.name': 'श्री रामफल शर्मा',
    'principal.role': 'प्रधानाचार्य एवं संस्थापक',
    'principal.educatorRole': 'वरिष्ठ हिंदी शिक्षक एवं साहित्य विशेषज्ञ',
    'principal.experience': '20+ वर्ष अनुभव',
    'principal.studentsGuided': '945+ विद्यार्थी लाभान्वित',
    'principal.est': 'स्थापना 2004',
    'principal.schoolName': 'बाल विकास पब्लिक स्कूल, कलायत (कैथल)',

    'principal.quote': '“प्रत्येक बच्चे में अद्वितीय क्षमता होती है। हमारी जिम्मेदारी सही मार्गदर्शन, अवसर और वातावरण प्रदान करना है ताकि हर छात्र अपनी क्षमता को पहचान सके और उसे हासिल कर सके।”',

    'principal.p1_title': '20+ वर्षों का समर्पित शिक्षण व प्रशासनिक अनुभव:',
    'principal.p1_text': 'वर्ष 2004 में बाल विकास पब्लिक स्कूल (BVPS) की स्थापना के समय से ही श्री रामफल शर्मा जी का एक ही संकल्प रहा है — कलायत व आसपास के ग्रामीण व शहरी क्षेत्र के प्रत्येक बच्चे को उच्चतम स्तर की गुणवत्तापूर्ण, आधुनिक, अनुशासित और संस्कारवान शिक्षा उपलब्ध कराना।',

    'principal.p2_title': 'वरिष्ठ हिंदी शिक्षक के रूप में प्रेरणा:',
    'principal.p2_text': 'एक अनुभवी एवं समर्पित हिंदी शिक्षक के रूप में, वे विद्यार्थियों को केवल व्याकरण व साहित्य ही नहीं सिखाते, बल्कि उन्हें भाषा के सौंदर्य, अभिव्यक्ति की स्पष्टता, शिष्टाचार और भारतीय सांस्कृतिक मूल्यों से जोड़ते हैं। उनकी कक्षाएं विद्यार्थियों में सकारात्मक दृष्टिकोण और आत्मविश्वास का संचार करती हैं।',

    'principal.p3_title': 'छात्र-केंद्रित मार्गदर्शन व उच्च विचार (Noble Thoughts):',
    'principal.p3_text': 'उनका दृढ़ विश्वास है कि "सादा जीवन, उच्च विचार" ही सच्चे नेतृत्व की पहचान है। वे विद्यालय के 29 योग्य शिक्षकों की टीम के साथ हर छात्र की व्यक्तिगत प्रगति, खेलकूद, अनुशासन और मानसिक विकास पर व्यक्तिगत रूप से ध्यान देते हैं।',

    // Core Pillars
    'pillar.heading': 'प्रधानाचार्य जी के 4 मुख्य जीवन व शिक्षण सिद्धांत',
    'pillar.subheading': 'बाल विकास पब्लिक स्कूल कलायत के मार्गदर्शक आधारस्तंभ',

    'pillar1.title': '20+ वर्षों का अनुभव',
    'pillar1.sub': 'समर्पित नेतृत्व',
    'pillar1.desc': '2004 से लगातार दो दशकों का शिक्षण व प्रशासनिक नेतृत्व, जिसके अंतर्गत हजारों छात्रों ने बोर्ड परीक्षाओं व करियर में सफलता पाई।',

    'pillar2.title': 'वरिष्ठ हिंदी शिक्षक',
    'pillar2.sub': 'मातृभाषा व साहित्य',
    'pillar2.desc': 'मातृभाषा हिंदी, साहित्य व व्याकरण में गहन विशेषज्ञता। बच्चों को स्पष्ट वाक्पटुता, निबंध लेखन व सांस्कृतिक पहचान से जोड़ते हैं।',

    'pillar3.title': 'उच्च विचार एवं संस्कार',
    'pillar3.sub': 'चरित्र निर्माण',
    'pillar3.desc': 'किताबी ज्ञान के साथ-साथ नैतिक मूल्य, अनुशासन, बड़ों के प्रति आदर, और सकारात्मक चिंतन का निरंतर विकास।',

    'pillar4.title': 'सुलभ व समर्पित संरक्षक',
    'pillar4.sub': 'छात्र व अभिभावक कल्याण',
    'pillar4.desc': 'हर अभिभावक व छात्र के लिए सदैव उपलब्ध। व्यक्तिगत समस्याओं, करियर मार्गदर्शन व काउंसिलिंग में विशेष रुचि।',

    // Stats
    'stat.exp': 'शिक्षण व नेतृत्व अनुभव',
    'stat.students': 'वर्तमान नामांकित छात्र',
    'stat.teachers': 'योग्य व अनुभवी शिक्षक',
    'stat.classes': 'HBSE कक्षाएं (1 से 12वीं)',

    // Form
    'form.title': 'प्रधानाचार्य को सीधा संदेश भेजें',
    'form.subtitle': 'प्रधानाचार्य श्री रामफल शर्मा जी से सीधा संवाद का माध्यम',
    'form.name': 'आपका पूरा नाम',
    'form.role': 'आप कौन हैं...',
    'form.phone': 'मोबाइल / व्हाट्सएप नंबर',
    'form.email': 'ईमेल पता (वैकल्पिक)',
    'form.category': 'संदेश का विषय वर्ग',
    'form.subject': 'संक्षेप में विषय',
    'form.message': 'श्री रामफल शर्मा जी के लिए संदेश',
    'form.messagePlaceholder': 'अपना संदेश, प्रवेश सम्बन्धी प्रश्न अथवा मिलने का अनुरोध यहाँ लिखें...',
    'form.submit': 'सीधा संदेश भेजें',
    'form.whatsapp': 'व्हाट्सएप पर भेजें',
    'form.confidential': 'सभी संदेश पूर्णतः गोपनीय हैं और सीधे प्रधानाचार्य कार्यालय को प्राप्त होते हैं।',
    'form.urgent': 'तत्काल जानकारी के लिए सीधे कॉल करें: +91 98125 50200',

    // Home Principal Section
    'home.principalTag': 'उच्च विचार, अनुशासन एवं संस्कार',
    'home.principalQuote': '"बाल विकास पब्लिक स्कूल में हमारा मुख्य ध्येय केवल किताबी ज्ञान देना नहीं, बल्कि बच्चों के भीतर उच्च विचार, नैतिक संस्कार, सुदृढ़ अनुशासन और निडर आत्मविश्वास जगाना है ताकि वे एक आदर्श नागरिक बन सकें।"',
    'home.messagePrincipalBtn': 'प्रधानाचार्य को सीधा संदेश भेजें',
    'home.viewFullDeskBtn': 'पूरा संदेश व प्रोफाइल पढ़ें →',
    'principal.experienceBadgeTitle': '20+ वर्ष',
    'principal.experienceBadgeSub': 'समर्पित शिक्षण अनुभव',
    'principal.hindiEducatorTitle': 'वरिष्ठ हिंदी शिक्षक',
    'principal.hindiEducatorSub': 'साहित्य व व्याकरण',
    'principal.nobleThoughtsTitle': 'उच्च विचार',
    'principal.nobleThoughtsSub': 'संस्कार व चरित्र निर्माण',
  },

  pa: {
    // Top Bar & Navigation
    'nav.home': 'ਮੁੱਖ ਪੰਨਾ',
    'nav.about': 'ਸਾਡੇ ਬਾਰੇ',
    'nav.results': 'ਨਤੀਜੇ',
    'nav.gallery': 'ਗੈਲਰੀ',
    'nav.facilities': 'ਸਹੂਲਤਾਂ',
    'nav.timing': 'ਸਕੂਲ ਦਾ ਸਮਾਂ',
    'nav.streams': 'ਸਟ੍ਰੀਮਜ਼',
    'nav.interview': 'ਇੰਟਰਵਿਊ ਅਤੇ ਸਿਲੇਬਸ',
    'nav.enrollment': 'ਦਾਖ਼ਲਾ ਵੇਰਵਾ',
    'nav.fees': 'ਫੀਸ ਢਾਂਚਾ',
    'nav.contact': 'ਸੰਪਰਕ',
    'nav.principal': 'ਪ੍ਰਿੰਸੀਪਲ ਸੁਨੇਹਾ',
    'nav.apply': 'ਆਨਲਾਈਨ ਅਪਲਾਈ ਕਰੋ',
    'nav.call': 'ਕਾਲ ਕਰੋ',

    // Principal Page Headings & Content in Punjabi
    'principal.badge': '20+ ਸਾਲਾਂ ਦਾ ਵਿੱਦਿਅਕ ਅਨੁਭਵ ਅਤੇ ਲੀਡਰਸ਼ਿਪ',
    'principal.title': 'ਪ੍ਰਿੰਸੀਪਲ ਸਾਹਿਬ ਦਾ ਸੁਨੇਹਾ ਅਤੇ ਡਾਇਰੈਕਟ ਡੈਸਕ',
    'principal.subtitle': '"ਉੱਚ ਵਿਚਾਰ, ਅਨੁਸ਼ਾਸਨ, ਨੈਤਿਕ ਸੰਸਕਾਰ ਅਤੇ ਮਿਆਰੀ ਸਿੱਖਿਆ ਦੀ 20+ ਸਾਲਾਂ ਦੀ ਸਮਰਪਿਤ ਪਰੰਪਰਾ"',
    'principal.name': 'ਸ਼੍ਰੀ ਰਾਮਫਲ ਸ਼ਰਮਾ',
    'principal.role': 'ਪ੍ਰਿੰਸੀਪਲ ਅਤੇ ਬਾਨੀ',
    'principal.educatorRole': 'ਸੀਨੀਅਰ ਹਿੰਦੀ ਅਧਿਆਪਕ ਅਤੇ ਸਾਹਿਤ ਵਿਸ਼ੇਸ਼ੱਗ',
    'principal.experience': '20+ ਸਾਲ ਤਜਰਬਾ',
    'principal.studentsGuided': '945+ ਵਿਦਿਆਰਥੀ',
    'principal.est': 'ਸਥਾਪਨਾ 2004',
    'principal.schoolName': 'ਬਾਲ ਵਿਕਾਸ ਪਬਲਿਕ ਸਕੂਲ, ਕਲਾਇਤ (ਕੈਥਲ)',

    'principal.quote': '“ਹਰ ਬੱਚੇ ਵਿੱਚ ਵਿਲੱਖਣ ਸਮਰੱਥਾ ਹੁੰਦੀ ਹੈ। ਸਾਡੀ ਜ਼ਿੰਮੇਵਾਰੀ ਸਹੀ ਮਾਰਗਦਰਸ਼ਨ, ਮੌਕੇ ਅਤੇ ਵਾਤਾਵਰਣ ਪ੍ਰਦਾਨ ਕਰਨਾ ਹੈ ਤਾਂ ਜੋ ਹਰ ਵਿਦਿਆਰਥੀ ਆਪਣੀ ਸਮਰੱਥਾ ਨੂੰ ਪਛਾਣ ਕੇ ਹਾਸਲ ਕਰ ਸਕੇ।”',

    'principal.p1_title': '20+ ਸਾਲਾਂ ਦਾ ਸਮਰਪਿਤ ਅਧਿਆਪਨ ਅਨੁਭਵ:',
    'principal.p1_text': 'ਸਾਲ 2004 ਵਿੱਚ ਬਾਲ ਵਿਕਾਸ ਪਬਲਿਕ ਸਕੂਲ (BVPS) ਦੀ ਸਥਾਪਨਾ ਦੇ ਸਮੇਂ ਤੋਂ ਹੀ ਸ਼੍ਰੀ ਰਾਮਫਲ ਸ਼ਰਮਾ ਜੀ ਦਾ ਇਕੋ-ਇਕ ਸੰਕਲਪ ਰਿਹਾ ਹੈ — ਕਲਾਇਤ ਅਤੇ ਆਸ-ਪਾਸ ਦੇ ਇਲਾਕਿਆਂ ਦੇ ਹਰ ਬੱਚੇ ਨੂੰ ਉੱਚ ਮਿਆਰੀ, ਆਧੁਨਿਕ, ਅਨੁਸ਼ਾਸਿਤ ਅਤੇ ਸੰਸਕਾਰੀ ਸਿੱਖਿਆ ਪ੍ਰਦਾਨ ਕਰਨਾ।',

    'principal.p2_title': 'ਸੀਨੀਅਰ ਹਿੰਦੀ ਅਧਿਆਪਕ ਵਜੋਂ ਪ੍ਰੇਰਨਾ:',
    'principal.p2_text': 'ਇੱਕ ਤਜਰਬੇਕਾਰ ਅਤੇ ਸਮਰਪਿਤ ਹਿੰਦੀ ਅਧਿਆਪਕ ਵਜੋਂ, ਉਹ ਵਿਦਿਆਰਥੀਆਂ ਨੂੰ ਨਾ ਸਿਰਫ਼ ਵਿਆਕਰਣ ਅਤੇ ਸਾਹਿਤ ਸਿਖਾਉਂਦੇ ਹਨ, ਸਗੋਂ ਉਹਨਾਂ ਨੂੰ ਸਪਸ਼ਟ ਬੋਲਚਾਲ, ਨੈਤਿਕ ਕਦਰਾਂ-ਕੀਮਤਾਂ ਅਤੇ ਸੱਭਿਆਚਾਰਕ ਪਛਾਣ ਨਾਲ ਵੀ ਜੋੜਦੇ ਹਨ।',

    'principal.p3_title': 'ਵਿਦਿਆਰਥੀ-ਕੇਂਦਰਿਤ ਅਗਵਾਈ ਅਤੇ ਉੱਚ ਵਿਚਾਰ:',
    'principal.p3_text': 'ਉਹਨਾਂ ਦਾ ਦ੍ਰਿੜ੍ਹ ਵਿਸ਼ਵਾਸ ਹੈ ਕਿ "ਸਾਦਾ ਜੀਵਨ, ਉੱਚ ਵਿਚਾਰ" ਹੀ ਸੱਚੇ ਨੇਤਾ ਦੀ ਪਛਾਣ ਹੈ। ਉਹ 29 ਸਮਰਪਿਤ ਅਧਿਆਪਕਾਂ ਦੀ ਟੀਮ ਨਾਲ ਹਰੇਕ ਵਿਦਿਆਰਥੀ ਦੀ ਪੜ੍ਹਾਈ, ਖੇਡਾਂ ਅਤੇ ਚਰਿੱਤਰ ਨਿਰਮਾਣ \'ਤੇ ਨਿੱਜੀ ਧਿਆਨ ਦਿੰਦੇ ਹਨ।',

    // Core Pillars
    'pillar.heading': 'ਪ੍ਰਿੰਸੀਪਲ ਸਾਹਿਬ ਦੇ 4 ਮੁੱਖ ਜੀਵਨ ਅਤੇ ਸਿੱਖਿਆ ਸਿਧਾਂਤ',
    'pillar.subheading': 'ਬਾਲ ਵਿਕਾਸ ਪਬਲਿਕ ਸਕੂਲ ਕਲਾਇਤ ਦੇ ਮੁੱਖ ਮਾਰਗਦਰਸ਼ਕ ਥੰਮ੍ਹ',

    'pillar1.title': '20+ ਸਾਲਾਂ ਦਾ ਤਜਰਬਾ',
    'pillar1.sub': 'ਸਮਰਪਿਤ ਲੀਡਰਸ਼ਿਪ',
    'pillar1.desc': '2004 ਤੋਂ ਲੈ ਕੇ ਦੋ ਦਹਾਕਿਆਂ ਦਾ ਅਧਿਆਪਨ ਅਤੇ ਪ੍ਰਬੰਧਕੀ ਤਜਰਬਾ, ਜਿਸ ਤਹਿਤ ਹਜ਼ਾਰਾਂ ਵਿਦਿਆਰਥੀਆਂ ਨੇ ਬੋਰਡ ਪ੍ਰੀਖਿਆਵਾਂ ਵਿੱਚ ਸਫਲਤਾ ਹਾਸਲ ਕੀਤੀ।',

    'pillar2.title': 'ਸੀਨੀਅਰ ਹਿੰਦੀ ਅਧਿਆਪਕ',
    'pillar2.sub': 'ਭਾਸ਼ਾ ਅਤੇ ਸਾਹਿਤ',
    'pillar2.desc': 'ਹਿੰਦੀ ਸਾਹਿਤ ਅਤੇ ਭਾਸ਼ਾ ਵਿੱਚ ਡੂੰਘੀ ਮੁਹਾਰਤ, ਜੋ ਬੱਚਿਆਂ ਨੂੰ ਸਪਸ਼ਟ ਸੰਚਾਰ ਅਤੇ ਸੱਭਿਆਚਾਰਕ ਪਛਾਣ ਦਿੰਦੀ ਹੈ।',

    'pillar3.title': 'ਉੱਚ ਵਿਚਾਰ ਅਤੇ ਸੰਸਕਾਰ',
    'pillar3.sub': 'ਚਰਿੱਤਰ ਨਿਰਮਾਣ',
    'pillar3.desc': 'ਕਿਤਾਬੀ ਗਿਆਨ ਦੇ ਨਾਲ-ਨਾਲ ਨੈਤਿਕ ਕਦਰਾਂ-ਕੀਮਤਾਂ, ਅਨੁਸ਼ਾਸਨ, ਵੱਡਿਆਂ ਦਾ ਸਤਿਕਾਰ ਅਤੇ ਸਕਾਰਾਤਮਕ ਸੋਚ ਦਾ ਵਿਕਾਸ।',

    'pillar4.title': 'ਸਮਰਪਿਤ ਸਲਾਹਕਾਰ',
    'pillar4.sub': 'ਵਿਦਿਆਰਥੀ ਅਤੇ ਮਾਪਿਆਂ ਦੀ ਭਲਾਈ',
    'pillar4.desc': 'ਹਰ ਮਾਪੇ ਅਤੇ ਵਿਦਿਆਰਥੀ ਲਈ ਹਮੇਸ਼ਾ ਉਪਲਬਧ। ਨਿੱਜੀ ਮਾਰਗਦਰਸ਼ਨ ਅਤੇ ਕਾਊਂਸਲਿੰਗ ਵਿੱਚ ਵਿਸ਼ੇਸ਼ ਰੁਚੀ।',

    // Stats
    'stat.exp': 'ਅਧਿਆਪਨ ਅਤੇ ਲੀਡਰਸ਼ਿਪ',
    'stat.students': 'ਮੌਜੂਦਾ ਵਿਦਿਆਰਥੀ',
    'stat.teachers': 'ਸਮਰਪਿਤ ਅਧਿਆਪਕ',
    'stat.classes': 'HBSE ਜਮਾਤਾਂ (1 ਤੋਂ 12ਵੀਂ)',

    // Form
    'form.title': 'ਪ੍ਰਿੰਸੀਪਲ ਸਾਹਿਬ ਨੂੰ ਸਿੱਧਾ ਸੁਨੇਹਾ ਭੇਜੋ',
    'form.subtitle': 'ਪ੍ਰਿੰਸੀਪਲ ਸ਼੍ਰੀ ਰਾਮਫਲ ਸ਼ਰਮਾ ਜੀ ਨਾਲ ਸਿੱਧਾ ਸੰਪਰਕ ਕਰਨ ਦਾ ਸਾਧਨ',
    'form.name': 'ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ',
    'form.role': 'ਤੁਸੀਂ ਕੌਣ ਹੋ...',
    'form.phone': 'ਮੋਬਾਈਲ / ਵਟਸਐਪ ਨੰਬਰ',
    'form.email': 'ਈਮੇਲ ਪਤਾ (ਵਿਕਲਪਿਕ)',
    'form.category': 'ਸੁਨੇਹੇ ਦਾ ਵਿਸ਼ਾ ਵਰਗ',
    'form.subject': 'ਵਿਸ਼ਾ',
    'form.message': 'ਸ਼੍ਰੀ ਰਾਮਫਲ ਸ਼ਰਮਾ ਜੀ ਲਈ ਸੁਨੇਹਾ',
    'form.messagePlaceholder': 'ਆਪਣਾ ਸੁਨੇਹਾ, ਦਾਖ਼ਲੇ ਬਾਰੇ ਸਵਾਲ ਜਾਂ ਮਿਲਣ ਦੀ ਬੇਨਤੀ ਇੱਥੇ ਲਿਖੋ...',
    'form.submit': 'ਸਿੱਧਾ ਸੁਨੇਹਾ ਭੇਜੋ',
    'form.whatsapp': 'ਵਟਸਐਪ ਰਾਹੀਂ ਭੇਜੋ',
    'form.confidential': 'ਸਾਰੇ ਸੁਨੇਹੇ ਪੂਰੀ ਤਰ੍ਹਾਂ ਗੁਪਤ ਹਨ ਅਤੇ ਸਿੱਧੇ ਪ੍ਰਿੰਸੀਪਲ ਦਫ਼ਤਰ ਨੂੰ ਜਾਂਦੇ ਹਨ।',
    'form.urgent': 'ਜ਼ਰੂਰੀ ਜਾਣਕਾਰੀ ਲਈ ਸਿੱਧਾ ਕਾਲ ਕਰੋ: +91 98125 50200',

    // Home Principal Section
    'home.principalTag': 'ਉੱਚ ਵਿਚਾਰ, ਅਨੁਸ਼ਾਸਨ ਅਤੇ ਸੰਸਕਾਰ',
    'home.principalQuote': '"ਬਾਲ ਵਿਕਾਸ ਪਬਲਿਕ ਸਕੂਲ ਵਿੱਚ ਸਾਡਾ ਮੁੱਖ ਉਦੇਸ਼ ਸਿਰਫ਼ ਕਿਤਾਬੀ ਗਿਆਨ ਦੇਣਾ ਨਹੀਂ, ਸਗੋਂ ਬੱਚਿਆਂ ਵਿੱਚ ਉੱਚ ਵਿਚਾਰ, ਨੈਤਿਕ ਸੰਸਕਾਰ, ਅਨੁਸ਼ਾਸਨ ਅਤੇ ਆਤਮ-ਵਿਸ਼ਵਾਸ ਪੈਦਾ ਕਰਨਾ ਹੈ ਤਾਂ ਜੋ ਉਹ ਇੱਕ ਆਦਰਸ਼ ਨਾਗਰਿਕ ਬਣ ਸਕਣ।"',
    'home.messagePrincipalBtn': 'ਪ੍ਰਿੰਸੀਪਲ ਨੂੰ ਸਿੱਧਾ ਸੁਨੇਹਾ ਭੇਜੋ',
    'home.viewFullDeskBtn': 'ਪੂਰਾ ਸੁਨੇਹਾ ਅਤੇ ਪ੍ਰੋਫਾਈਲ ਪੜ੍ਹੋ →',
    'principal.experienceBadgeTitle': '20+ ਸਾਲ',
    'principal.experienceBadgeSub': 'ਅਧਿਆਪਨ ਤਜਰਬਾ',
    'principal.hindiEducatorTitle': 'ਸੀਨੀਅਰ ਹਿੰਦੀ ਅਧਿਆਪਕ',
    'principal.hindiEducatorSub': 'ਸਾਹਿਤ ਅਤੇ ਵਿਆਕਰਣ',
    'principal.nobleThoughtsTitle': 'ਉੱਚ ਵਿਚਾਰ',
    'principal.nobleThoughtsSub': 'ਸੰਸਕਾਰ ਅਤੇ ਚਰਿੱਤਰ ਨਿਰਮਾਣ',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

function applyUniversalTranslation(targetLang: Language) {
  if (typeof window === 'undefined') return;

  const host = window.location.hostname;
  const cookieVal = targetLang === 'en' ? '/en/en' : `/en/${targetLang}`;

  // Clear and update Google translate cookies
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host};`;

  document.cookie = `googtrans=${cookieVal}; path=/;`;
  document.cookie = `googtrans=${cookieVal}; path=/; domain=${host};`;
  document.cookie = `googtrans=${cookieVal}; path=/; domain=.${host};`;

  const tryChange = () => {
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      if (combo.value !== targetLang) {
        combo.value = targetLang;
        combo.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    }
    return false;
  };

  if (!tryChange()) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (tryChange() || attempts > 20) {
        clearInterval(interval);
      }
    }, 250);
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('bvps_language') as Language;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'pa')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  useEffect(() => {
    applyUniversalTranslation(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('bvps_language', lang);
    } catch {
      // ignore
    }
    applyUniversalTranslation(lang);
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
