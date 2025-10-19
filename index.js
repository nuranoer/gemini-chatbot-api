import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;                   // ✅ pakai messages

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages must be an array!');
    }

    // role 'assistant' → 'model', sisanya 'user'
    const contents = messages.map(({ role, content }) => ({
      role: role === 'assistant' ? 'model' : 'user',
      parts: [{ text: content || '' }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
    });

    // @google/genai: hasilnya umumnya di response.text
    return res.status(200).json({ result: response.text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// Serve file statis dari folder 'public'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server ready on http://localhost:${PORT}`)
);
