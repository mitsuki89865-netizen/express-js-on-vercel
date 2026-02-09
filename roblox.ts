import express from 'express';
const app = express();
app.use(express.json());

// CORS設定（Robloxやブラウザからのアクセスを許可）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-goog-api-key');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.post('/api/chat', async (req: any, res: any) => {
    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // 🔍 診断1: キーのチェック
    if (!API_KEY || API_KEY.trim() === "") {
        return res.status(500).json({ 
            error: "Vercelの環境変数にGEMINI_API_KEYが設定されてません！" 
        });
    }

    // ニキのこだわり：変数名を明示的に定義
    const MODEL_NAME = "gemini-2.0-flash"; 
    const GOOGLE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(GOOGLE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data: any = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            // フロント側の let aiText = data.text に合わせて返す
            res.json({ text: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: "Geminiからの応答が空です", detail: data });
        }
    } catch (e) {
        res.status(500).json({ error: "VercelからGeminiへの通信中にエラーが発生しました" });
    }
});

export default app;
