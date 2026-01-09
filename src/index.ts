import express from 'express';
const app = express();

app.use(express.json());

// 🛡️ 全許可設定（どこからでもアクセスOK！）
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

    // 🚨 1日500回制限（お財布防衛）
    if (totalRequestsToday > 500) {
        return res.status(503).json({ error: "今日はお小遣い切れ！また明日ね。" });
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

        // --- 🚨 ここが重要！Geminiの複雑なデータからテキストだけを抜き出す ---
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            res.json({ text: aiText }); // HTMLが読みやすい形に変換して送る
        } else {
            // エラーが起きた場合はそのままエラーを返す
            console.error("Gemini Error:", data);
            res.status(500).json({ error: "Gemini君が返事をしてくれません…", detail: data });
        }

    } catch (e) {
        res.status(500).json({ error: "サーバーでエラーが発生しました" });
    }
});

app.get('/', (req, res) => {
  res.send('防衛システム稼働中！全オリジンを許可しました。');
});

export default app;
