/**
 * Offline school knowledge base.
 *
 * Chatbot pehle server (Render + Groq) se jawab patahta hai. Agar server down,
 * cold-start slow, ya network block ho toh ye rules-based fallback chalti hai —
 * isse assistant hamesha kuch sahi jawab deta hai aur user ko "temporarily
 * unavailable" jaisa dead-end message nahi milta.
 *
 * NOTE: Site ka verified content hi yahan hai (BVPS, Kalayat). Koi invented
 * fee/date/time nahi — jo confirm nahi hai wo "school office se confirm karein"
 * bol deta hai.
 */

export type LocalAnswer = {
  text: string;
  link?: { label: string; path: string };
  images?: ('campus' | 'students' | 'facilities')[];
};

type Rule = {
  keys: RegExp;
  en: string;
  hi: string;
  link?: LocalAnswer['link'];
  images?: LocalAnswer['images'];
};

const OFFICE = '+91 98125 50200';

const RULES: Rule[] = [
  {
    keys: /\b(hi|hello|hey|namaste|namaskar|good (morning|afternoon|evening)|salaam|start|help|jai)\b/i,
    en: `Namaste! Welcome to Bal Vikas Public School, Kalayat. I can help with admissions, fees, school timings, streams, facilities, documents, and contact details. What would you like to know?`,
    hi: `नमस्ते! बाल विकास पब्लिक स्कूल, कलायत में आपका स्वागत है। मैं दाखिला, फीस, स्कूल का समय, स्ट्रीम, सुविधाएँ, दस्तावेज़ और संपर्क जानकारी में मदद कर सकता हूँ। आप क्या जानना चाहेंगे?`,
  },
  {
    keys: /(admission|admissions|apply|application|enrol|enroll|form|dakhila|daakhila|pravesh|प्रवेश|दाखिला|फॉर्म)/i,
    en: `Admissions are open for Classes 1 to 12. You can fill the online admission form on this website, or visit the school admission office Monday to Saturday between 9:00 AM and 2:00 PM (best time 10:00 AM – 12:00 PM). Please call the office on ${OFFICE} to confirm the current session and seat availability.`,
    hi: `कक्षा 1 से 12वीं तक दाखिले चल रहे हैं। आप इसी website par online admission form bhar sakte hain, ya sonevarshwar se shanivar 9:00 baje se dopahar 2:00 baje tak (10:00 – 12:00 baje sabse accha) admission office aa sakte hain. Session aur seat ki jaanch ke liye office ko ${OFFICE} par call karein.`,
    link: { label: 'Online Admission Form', path: '/application' },
  },
  {
    keys: /(fee|fees|fee structure|charges?|cost|paisa|paise|rupee|rupay|kharch|shulk|फीस|शुल्क|पैसा)/i,
    en: `The fee structure is class-wise: admission fee, monthly tuition, and annual fund (total per year = monthly × 12 + annual fund). The exact current amounts are shown on the Fee Structure page of this website, and you can also pay by UPI. For the final amount, please confirm with the school office on ${OFFICE}.`,
    hi: `Fee structure class ke hisaab se hai: admission fee, monthly tuition aur annual fund (saal ka total = monthly × 12 + annual fund). Aaj ki amounts isi website ke "Fee Structure" page par hain, aur UPI se payment bhi ho jati hai. Final amount ke liye school office ko ${OFFICE} par confirm kar lein.`,
    link: { label: 'View Fee Structure', path: '/fee-structure' },
  },
  {
    keys: /(time|timing|timings|hours?|schedule|samay|kab (khulti|khulta|band)|समय|टाइम)/i,
    en: `School hours are Monday to Saturday, 8:00 AM – 3:00 PM; Sunday is closed. Morning assembly starts at 8:00 AM and recess is 12:00 PM – 12:30 PM. The admission office is open Monday to Saturday, 9:00 AM – 2:00 PM.`,
    hi: `स्कूल का समय सोमवार से शनिवार सुबह 8:00 बजे से दोपहर 3:00 बजे तक है; रविवार अवकाश रहता है। प्रार्थना सभा 8:00 बजे होती है और छूट 12:00 – 12:30 बजे। एडमिशन कार्यालय सोमवार से शनिवार 9:00 – 14:00 बजे तक खुला है।`,
    link: { label: 'Check School Timings', path: '/school-timing' },
  },
  {
    keys: /(stream|streams|subject|subjects|commerce|arts|humanities|medical|non.?medical|science|sankay|vishey|संभाग|विषय|स्ट्रीम|कॉमर्स|आर्ट्स)/i,
    en: `For Classes 11 and 12 the school offers Medical, Non-Medical, Commerce, and Humanities (Arts) streams. For the exact subject combination of each stream, please see the Streams & Curriculum page or call the office on ${OFFICE}.`,
    hi: `कक्षा 11वीं और 12वीं में मेडिकल, नॉन-मेडिकल, कॉमर्स और ह्यूमैनिटीज़ (आर्ट्स) स्ट्रीम हैं। हर स्ट्रीम के विषयों की सही जानकारी "Streams & Curriculum" page par hai, या office को ${OFFICE} par call kar lein.`,
    link: { label: 'Streams & Curriculum', path: '/streams' },
  },
  {
    keys: /(facilit|suvidha|सुविधा|library|libra|computer|smart class|lab|playground|ground|cctv|water|drinking|मेंदिर|लाइब्रेरी|कंप्यूटर|खेल मैदान)/i,
    en: `Facilities at BVPS: a rich library, a modern computer lab with internet access, interactive smart classes, a spacious playground, 24/7 CCTV surveillance, RO drinking water, and spacious classrooms (31 classrooms on campus).`,
    hi: `बीवीपीएस की सुविधाएँ: समृद्ध लाइब्रेरी, इंटरनेट वाली आधुनिक कंप्यूटर लैब, इंटरैक्टिव स्मार्ट क्लास, विशाल खेल मैदान, 24/7 सीसीटीवी निगरानी, आरओ पेयजल और बड़े कक्षा कक्ष (31 कक्षाएँ)।`,
    link: { label: 'View All Facilities', path: '/facilities' },
    images: ['facilities'],
  },
  {
    keys: /(document|documents|proof|testimonial|kaagaz|kagaz|aadhaar|adhar|birth certificate|tc|transfer|marksheet|report card|दस्तावेज़|कागज़|आधार|प्रमाण पत्र)/i,
    en: `Admission documents normally required: student's Aadhaar card, birth certificate, previous school TC, last report card, 4 passport-size photos, and parent's ID proof. A friendly interaction/interview with the student and parents is also part of the process.`,
    hi: `दाखिले के लिए आमतौर पर चाहिए: छात्र का आधार कार्ड, जन्म प्रमाण पत्र, पिछले स्कूल की टीसी, पिछली कक्षा की अंकतालिका, 4 पासपोर्ट फोटो, और अभिभावक का पहचान पत्र। छात्र व अभिभावक के साथ मुलाक़ात/इंटरव्यू भी होता है।`,
    link: { label: 'Interview & Checklist', path: '/interview' },
  },
  {
    keys: /(enrol|registration|submit|form bharna|फॉर्म भरना|नामांकन)/i,
    en: `After admission you have to submit the admission form and complete the enrolment steps. The online form and the step-by-step enrolment checklist are both on this website.`,
    hi: `दाखिले के बाद admission form bhar-na aur enrolment ki steps poori karni hoti hain. Online form aur step-by-step checklist dono isi website par hain.`,
    link: { label: 'Enrolment Steps', path: '/enrollment' },
  },
  {
    keys: /(result|results|topper|marks|parinam|percentage|board exam|exam|परिणाम|रिजल्ट|प्रतिशत)/i,
    en: `Results & achievements are listed on this website, including board results and sports achievements (district-level football and cricket, state-level karate and wrestling gold medals).`,
    hi: `परीक्षा परिणाम और खेल उपलब्धियाँ इसी website par di gayi hain — बोर्ड परिणाम के साथ जिला स्तरीय फुटबॉल/क्रिकेट और राज्य स्तरीय कराटे व कुश्ती के स्वर्ण पदक।`,
    link: { label: 'Results & Achievements', path: '/results' },
  },
  {
    keys: /(principal|headmaster|director|owner|ramphal|sharma|प्रधानाचार्य|शर्मा)/i,
    en: `The Principal and Founder of Bal Vikas Public School is Sh. Ramphal Sharma, guiding the school since 2004. You can read his message or write to him directly through the Principal's Desk page.`,
    hi: `बाल विकास पब्लिक स्कूल के प्रधानाचार्य व संस्थापक श्री रामफल शर्मा जी हैं, जिनके मार्गदर्शन में स्कूल 2004 से चल रहा है। आप "Principal's Desk" page par उनका संदेश पढ़ सकते हैं या सीधे संदेश भेज सकते हैं।`,
    link: { label: "Principal's Desk", path: '/principal-message' },
  },
  {
    keys: /(contact|phone|mobile|call|number|helpline|address|location|where|reach|directions?|kahan|pata|sampark|email|kalayat|kaithal|संपर्क|पता|फोन|मोबाइल)/i,
    en: `Address: Bal Vikas Public School, Railway Road, Kalayat, District Kaithal, Haryana – 136117. Phone: ${OFFICE} (also ${OFFICE.slice(0, -2)}02 on the timings page). Email: info@bvpskalayat.edu.in for general queries and admissions@bvpskalayat.edu.in for admissions.`,
    hi: `पता: बाल विकास पब्लिक स्कूल, रेलवे रोड, कलायत, जिला कैथल, हरियाणा – 136117। फोन: ${OFFICE}। ईमेल: info@bvpskalayat.edu.in (सामान्य जानकारी) और admissions@bvpskalayat.edu.in (दाखिला)।`,
    link: { label: 'Contact Us & Map', path: '/contact' },
  },
  {
    keys: /(gallery|photo|photos|picture|pictures|image|images|video|tasveer|footo|गैलरी|फोटो|तस्वीर|चित्र)/i,
    en: `You can see the school building, sports days, cultural programmes, and student achievements in the photo gallery.`,
    hi: `फोटो गैलरी में स्कूल भवन, खेल दिवस, सांस्कृतिक कार्यक्रम और छात्रों की उपलब्धियों की तस्वीरें देख सकते हैं।`,
    link: { label: 'Open Photo Gallery', path: '/gallery' },
    images: ['campus', 'students'],
  },
  {
    keys: /(blog|news|update|announcement|article|खबर|ब्लॉग|समाचार)/i,
    en: `Latest school news, events, and announcements are published in the Blog & News section of this website.`,
    hi: `स्कूल की ताज़ा खबरें, कार्यक्रम और सूचनाएँ इसी website के "Blog & News" section में प्रकाशित होती हैं।`,
    link: { label: 'Read Blog & News', path: '/blog' },
  },
  {
    keys: /(about|history|school|bvps|establish|founded|vision|mission|affiliat|board|bseh|haryana board|परिचय|इतिहास|स्कूल)/i,
    en: `Bal Vikas Public School (BVPS), Kalayat was established in 2004. It is a co-educational school affiliated to the Haryana Board of School Education (BSEH), offering Classes 1 to 12 with a rich library, smart classes, computer lab, playground, and 24/7 CCTV safety.`,
    hi: `बाल विकास पब्लिक स्कूल (बीवीपीएस), कलायत की स्थापना 2004 में हुई। यह हरियाणा बोर्ड (बीएसईएच) से संबद्ध सह-शिक्षा विद्यालय है, जो कक्षा 1 से 12 तक पढ़ाता है।`,
    link: { label: 'About the School', path: '/about' },
  },
  {
    keys: /(transport|bus|van|pick.?up|drop|ढुलाई|बस|यातायात)/i,
    en: `For school bus / transport information, please call the school office on ${OFFICE} — routes and timings are confirmed directly by the school.`,
    hi: `स्कूल बस / ढुलाई की जानकारी के लिए school office को ${OFFICE} पर call करें — रूट और समय स्कूल द्वारा सीधे बताया जाता है।`,
  },
  {
    keys: /(feedback|complain|suggestion|review|शिकायत|सुझाव|फीडबैक)/i,
    en: `You can share your feedback or suggestions directly on the Feedback page — we read every message.`,
    hi: `आप Feedback page par apni राय, शिकायत या सुझाव सीधे भेज सकते हैं — हम हर संदेश पढ़ते हैं।`,
    link: { label: 'Share Feedback', path: '/feedback' },
  },
];

const FALLBACK_EN =
  `I could not find that detail in my school information. Please call the school office on ${OFFICE} (Mon–Sat, 9:00 AM – 2:00 PM) or use the pages below:\n\n• Admissions: /admissions\n• Fee Structure: /fee-structure\n• School Timings: /school-timing\n• Contact: /contact`;

const FALLBACK_HI =
  `यह जानकारी मेरे पास नहीं है। कृपया school office को ${OFFICE} पर call करें (सोम–शनि, 9:00 – 14:00) या नीचे दिए pages देखें:\n\n• दाखिला: /admissions\n• फीस: /fee-structure\n• समय: /school-timing\n• संपर्क: /contact`;

function isHindi(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

/** Hindi/Hinglish detection — Hinglish me bhi Hindi jawab accha lagta hai.
 *  Sirf clearly Hinglish/Hindi shabd dekhte hain (school/fees jaise English
 *  words hone par jawab English hi rahega). */
function isHinglish(text: string): boolean {
  const lower = text.toLowerCase();
  return /\b(hai|hain|hona|raha|rahe|kya|kyu|kyun|kaise|kahan|kab|kaun|kitna|kitni|kripya|batao|bata|namaste|shukriya|accha|acha|sundar|padhai|dakhila|khul|band|pata|chalo|chahiye|dikhao|dikhawao|dekho|dekhna)\b/.test(
    lower,
  );
}

export function getLocalAnswer(question: string): LocalAnswer {
  const text = question.trim();
  const hindi = isHindi(text) || isHinglish(text);

  for (const rule of RULES) {
    if (rule.keys.test(text)) {
      return {
        text: hindi ? rule.hi : rule.en,
        link: rule.link,
        images: rule.images,
      };
    }
  }

  return { text: hindi ? FALLBACK_HI : FALLBACK_EN };
}
