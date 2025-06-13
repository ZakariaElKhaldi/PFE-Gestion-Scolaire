import { Request, Response } from 'express';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Get all users' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};