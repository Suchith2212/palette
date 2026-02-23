// types/artwork.ts

export interface IArtwork {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  artist: {
    _id: string;
    name: string; // Include name as it's populated
    email?: string;
    iitgEmail?: string;
    rollNumber?: string;
  };
  credits: string; // New field for credits
  status: 'pending' | 'approved' | 'rejected'; // Replaced 'approved' with 'status'
  score?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}