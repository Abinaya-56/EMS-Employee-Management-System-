import { answerEmployeeQuery } from "../services/chatbot.service.js";

export async function queryChatbot(req, res) {
  try {
    const { question } = req.body;
    const answer = await answerEmployeeQuery(question, req.user.id);
    return res.json({ answer });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
