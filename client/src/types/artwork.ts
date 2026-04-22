// types/artwork.ts

export interface IArtwork {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  type: 'painting' | 'sketch' | 'digital' | 'other';
  artist: {
    _id: string;
    name: string; // Include name as it's populated
    email?: string;
    personalEmail?: string;
    iitgEmail?: string;
    phoneNumber?: string;
    photoUrl?: string;
  };
  credits: string; // New field for credits
  status: 'pending' | 'approved' | 'rejected'; // Replaced 'approved' with 'status'
  score?: number;
  displayOrder?: number | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
