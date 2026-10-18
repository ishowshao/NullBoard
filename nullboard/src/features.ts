export interface Feature {
  id: string;
  label: string;
  message: string;
  premium?: boolean;
}

export const features: readonly Feature[] = [
  {
    id: 'create-task',
    label: 'Create a new task',
    message: 'Task created in a parallel universe. This one remains beautifully empty.',
  },
  {
    id: 'add-tags',
    label: 'Add tags',
    message: 'Tag rejected: even #nothing was too much commitment.',
  },
  {
    id: 'collaborate',
    label: 'Collaborate with team',
    message: 'Your team is perfectly aligned on doing nothing. No invitations were sent.',
  },
  {
    id: 'save-progress',
    label: 'Save your progress',
    message: "Progress saved to your imagination. Please don't clear your daydreams.",
  },
  {
    id: 'premium-ai',
    label: '✨ Premium AI Assistant (New!)',
    message: 'Our premium AI recommends taking a break. Zero tokens. Zero tasks. Maximum confidence.',
    premium: true,
  },
];
