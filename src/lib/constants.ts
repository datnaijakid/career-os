export const APPLICATION_STATUSES = {
  SAVED: { label: 'Saved', color: 'neutral' },
  PREPARING: { label: 'Preparing', color: 'info' },
  NEEDS_INFO: { label: 'Needs Information', color: 'warning' },
  READY_FOR_REVIEW: { label: 'Ready for Review', color: 'info' },
  SUBMITTED: { label: 'Submitted', color: 'success' },
  INTERVIEW: { label: 'Interview', color: 'info' },
  OFFER: { label: 'Offer', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'danger' },
  WITHDRAWN: { label: 'Withdrawn', color: 'neutral' },
} as const;

export type ApplicationStatusType = keyof typeof APPLICATION_STATUSES;

export const SKILL_CATEGORIES = [
  { id: 'languages', label: 'Programming Languages' },
  { id: 'frameworks', label: 'Frameworks & Libraries' },
  { id: 'tools', label: 'Developer Tools' },
  { id: 'databases', label: 'Databases' },
  { id: 'cloud', label: 'Cloud & DevOps' },
  { id: 'aiml', label: 'AI & Machine Learning' },
  { id: 'other', label: 'Other Skills' }
] as const;
