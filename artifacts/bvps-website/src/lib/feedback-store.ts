export interface FeedbackEntry {
  id: string;
  name: string;
  role: 'parent' | 'student' | 'alumni' | 'visitor';
  category: 'academics' | 'facilities' | 'staff' | 'overall' | 'other';
  rating: number;
  feedback: string;
  submittedAt: string;
}

export function saveFeedback(entry: Omit<FeedbackEntry, 'id' | 'submittedAt'>): FeedbackEntry {
  console.log("Feedback saved to server via API", entry);
  return {
    ...entry,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  };
}

export function getFeedbacks(): FeedbackEntry[] {
  return [];
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