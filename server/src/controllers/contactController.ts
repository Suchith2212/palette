import { Request, Response } from 'express';
import Contact from '../models/Contact';
import asyncHandler from 'express-async-handler';

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    res.status(201).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getContactSubmissions = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteContactSubmission = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }

  const { id } = req.params;
  const submission = await Contact.findById(id);

  if (!submission) {
    res.status(404);
    throw new Error('Contact submission not found');
  }

  await submission.deleteOne();
  res.json({ message: 'Contact submission removed successfully' });
});
