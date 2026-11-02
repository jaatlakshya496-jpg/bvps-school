import { apiPost, generateSubmissionKey } from '@/lib/api';

export interface FeedbackEntry {
  id: string;
  name: string;
  email?: string;
  role: 'parent' | 'student' | 'alumni' | 'visitor';
  category: 'academics' | 'facilities' | 'staff' | 'overall' | 'other';
  rating: number;
  feedback: string;
  submittedAt: string;
}

export async function saveFeedback(entry: Omit<FeedbackEntry, 'id' | 'submittedAt'>): Promise<FeedbackEntry> {
  const res = await apiPost<{ success: boolean; id?: number | string }>(
    '/feedback',
    {
      name: entry.name,
      email: (entry as any).email ?? '',
      role: entry.role,
      category: entry.category,
      message: entry.feedback,
      rating: entry.rating,
      submissionKey: generateSubmissionKey(),
    },
  );

  if (!res?.success) {
    throw new Error((res as any)?.error || 'Failed to save feedback');
  }

  return {
    ...entry,
    id: String(res.id ?? crypto.randomUUID()),
    submittedAt: new Date().toISOString(),
  };
}

export function getFeedbacks(): FeedbackEntry[] {
  // Feedbacks are fetched from DB via admin/API where needed; client-side listing
  // of all feedbacks requires authenticated/admin access. Return empty array
  // to avoid showing unverified/stale local data.
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
