export interface Playlist {
  id: string;
  name: string;
  description?: string;
  textIds: string[]; // Array of text IDs in this playlist
  dateCreated: Date;
  dateModified: Date;
  order: number;
}

export const createPlaylist = (
  data: Pick<Playlist, 'name'> & Partial<Omit<Playlist, 'id' | 'dateCreated' | 'dateModified'>>
): Playlist => {
  const now = new Date();
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: data.name,
    description: data.description || '',
    textIds: data.textIds || [],
    dateCreated: now,
    dateModified: now,
    order: data.order ?? 0,
  };
};
