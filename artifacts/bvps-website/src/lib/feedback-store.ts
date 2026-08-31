export interface FeedbackEntry {
  id: string;
  name: string;
  role: 'parent' | 'student' | 'alumni' | 'visitor';
  category: 'academics' | 'facilities' | 'staff' | 'overall' | 'other';
  rating: number;
  feedback: string;
  submittedAt: string;
}

const STORAGE_KEY = 'bvps_feedback';

export function saveFeedback(entry: Omit<FeedbackEntry, 'id' | 'submittedAt'>): FeedbackEntry {
  const all = getFeedbacks();
  const newEntry: FeedbackEntry = {
    ...entry,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  };
  all.unshift(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newEntry;
}

export function getFeedbacks(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FeedbackEntry[]) : [];
  } catch {
    return [];
  }
}

export const roleLabels: Record<FeedbackEntry['role'], string> = {
  parent: 'Parent / Guardian',
  student: 'Student',
  alumni: 'Alumni',
  visitor: 'Visitor',
};

export const categoryLabels: Record<FeedbackEntry['category'], string> = {
  academics: 'Academics & Teaching',
  facilities: 'Facilities & Infrastructure',
  staff: 'Staff & Administration',
  overall: 'Overall Experience',
  other: 'Other',
};
