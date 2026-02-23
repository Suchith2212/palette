// types/event.ts

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  date: Date | string;
  endDate?: Date | string;
  location: string;
  type: 'workshop' | 'competition' | 'event';
  imageUrl: string;
  maxParticipants?: number;
  registeredParticipants: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
