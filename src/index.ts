import express from 'express';
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-goog-api-key');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.post('/api/chat', async (req: any, res: any) => {
    const { message } = req.body;
    
    // 🔍 診断1: Vercelがキーを認識しているかチェック
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY || API_KEY.trim() === "") {
        return res.status(500).json({ 
            error: "Vercelの金庫に鍵（APIキー）が入っていません。Environment Variablesを再確認してください。" 
        });
    }

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-goog-api-key': API_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data: any = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            res.json({ text: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: "Geminiに届きましたが拒否されました", detail: data });
        }
    } catch (e) {
        res.status(500).json({ error: "VercelからGeminiへの通信中に爆発しました" });
    }
});

export default app;
