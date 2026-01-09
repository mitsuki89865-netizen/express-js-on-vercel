import express from 'express';
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
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
        return res.status(503).json({ error: "今日のお小遣い切れ！" });
    }

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        totalRequestsToday++;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data: any = await response.json();

        // 🔍 Geminiからの生データをVercelのログに出力（デバッグ用）
        console.log("Gemini Response:", JSON.stringify(data));

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const aiText = data.candidates[0].content.parts[0].text;
            res.json({ text: aiText });
        } else {
            // データが想定外の形なら、そのままエラーとして返す
            res.status(500).json({ error: "Geminiのデータが空でした", raw: data });
        }

    } catch (e) {
        res.status(500).json({ error: "通信エラーが発生しました" });
    }
});

export default app;
