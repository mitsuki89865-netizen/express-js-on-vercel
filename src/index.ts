import express from 'express';
import cors from 'cors'; // ← CORSを追加
const app = express();

// ★ここが重要！ shirothread.net からのアクセスを許可します
app.use(cors({
  origin: 'https://shirothread.net' 
}));

app.use(express.json());

let totalRequestsToday = 0;
let lastResetDate = new Date().getDate();

app.post('/api/chat', async (req: any, res: any) => {
    const today = new Date().getDate();
    if (today !== lastResetDate) {
        totalRequestsToday = 0;
        lastResetDate = today;
    }

    // 🚨 500回を超えたら強制停止（お財布防衛）
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
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "サーバーがちょっと休憩中..." });
    }
});

app.get('/', (req, res) => {
  res.send('防衛システム稼働中！shirothread.net からの通信を許可しています。');
});

export default app;
