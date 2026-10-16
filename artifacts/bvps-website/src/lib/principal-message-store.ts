// Sirf type rakha gaya hai — form ab real `POST /api/principal-messages`
// call karta hai (localStorage fallback nahi, kyunki wahi wajah se message
// Principal tak nahi pahunchta tha). API fail hone par user ko toast error
// milta hai aur DB me enquiry safe rehti hai.
export interface PrincipalDirectMessage {
  id: string;
  senderName: string;
  senderRole: string; // 'Parent' | 'Student' | 'Prospective Parent' | 'Alumni' | 'Other';
  phone: string;
  email?: string;
  category: string; // 'Admission Guidance' | 'Academic Progress' | 'Discipline & Values' | 'Fee & Scholarships' | 'Feedback / Suggestion' | 'Personal Appointment Request' | 'General Query';
  subject: string;
  message: string;
  submittedAt: string;
  status: 'sent' | 'received';
}
