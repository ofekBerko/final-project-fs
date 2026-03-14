import { Request, Response } from "express";
import contentDao from "../dao/contentDao";

export const generateContent = async (req: Request, res: Response)=> {
  try {
    const { contentType } = req.body;
    const content = await contentDao.generateContent(contentType);

    return res.status(201).json(content);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Something went wrong" });
  }
};