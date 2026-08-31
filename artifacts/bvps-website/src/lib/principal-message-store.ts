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

const STORAGE_KEY = 'bvps_principal_direct_messages';

export function savePrincipalMessage(
  data: Omit<PrincipalDirectMessage, 'id' | 'submittedAt' | 'status'>
): PrincipalDirectMessage {
  const all = getPrincipalMessages();
  const newMsg: PrincipalDirectMessage = {
    ...data,
    id: `PRIN-${Date.now().toString().slice(-6)}`,
    submittedAt: new Date().toISOString(),
    status: 'sent',
  };
  all.unshift(newMsg);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save principal message', err);
  }
  return newMsg;
}

export function getPrincipalMessages(): PrincipalDirectMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PrincipalDirectMessage[]) : [];
  } catch {
    return [];
  }
}
