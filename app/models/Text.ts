// Text model for the mobile app
export type Text = {
  id: string;
  title: string;
  content: string;
  scrollSpeed: number;
  fontSize?: number;
  dateCreated: Date;
  dateModified: Date;
  order: number;
};

// Helper to create a new text with default values
export const createText = (partial: Partial<Text> & { title: string; content: string }): Text => {
  const now = new Date();
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    scrollSpeed: 50,
    fontSize: 24,
    dateCreated: now,
    dateModified: now,
    order: 0,
    ...partial,
  };
};
