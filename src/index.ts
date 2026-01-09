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

let totalRequestsToday = 0;
let lastResetDate = new Date().getDate();

app.post('/api/chat', async (req: any, res: any) => {
    const today = new Date().getDate();
    if (today !== lastResetDate) {
        totalRequestsToday = 0;
        lastResetDate = today;
    }

    if (totalRequestsToday > 500) {
        return res.status(503).json({ error: "今日はお小遣い切れだよ！" });
    }

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; // Vercelの環境変数から取得

    try {
        totalRequestsToday++;
        // 🚀 あなたが教えてくれた curl の形式に合わせました
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-goog-api-key': API_KEY as string // ヘッダーでキーを送る形式
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data: any = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            res.json({ text: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: "AIが空っぽの返事をしました", detail: data });
        }

    } catch (e) {
        res.status(500).json({ error: "通信エラーが発生しました" });
    }
});

export default app;
