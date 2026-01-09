import { Request, Response } from 'express';
import { Contact } from '../models/Contact';
import { Message } from '../models/Message';

export const submitContact = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name is required (minimum 2 characters)' });
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }
    
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ message: 'Message is required (minimum 10 characters)' });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 100),
      subject: (subject || 'General Inquiry').trim().slice(0, 200),
      message: message.trim().slice(0, 5000),
    };

    const newContact = await Contact.create(sanitizedData);

    // Mirror contact into message store for unified inbox
    await Message.create({
      channel: 'inapp',
      direction: 'inbound',
      status: 'pending',
      senderEmail: sanitizedData.email,
      senderName: sanitizedData.name,
      content: sanitizedData.message,
      contentType: 'text',
      metadata: {
        subject: sanitizedData.subject,
        contactId: newContact._id?.toString(),
        source: 'contact_form',
      },
      conversationId: sanitizedData.email,
    });

    // TODO: Send email notification via SendGrid/Nodemailer here

    res.status(201).json({ 
      message: 'Message received successfully', 
      contactId: newContact._id 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Error submitting contact form. Please try again.' });
  }
};
