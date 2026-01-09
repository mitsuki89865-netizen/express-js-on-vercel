import express from 'express';
const app = express();

app.use(express.json());

// 🛡️ CORSエラーを力技で解決する設定
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://shirothread.net'); // あなたのサイトを許可
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // プリフライト（事前確認）リクエストへの対応
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
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
        return res.status(503).json({ error: "今日のお小遣い切れ！また明日ね。" });
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
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "サーバーがちょっと休憩中..." });
    }
});

app.get('/', (req, res) => {
  res.send('防衛システム稼働中！shirothread.net を許可しました！');
});

export default app;
