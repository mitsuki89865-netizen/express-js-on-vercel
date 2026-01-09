const express = require('express');
const app = express();
app.use(express.json());

// --- 💰 お財布防衛システム ---
let totalRequestsToday = 0; // 今日使った回数
let lastResetDate = new Date().getDate();

app.post('/api/chat', async (req, res) => {
    // 日付が変わったらカウンターを 0 にリセット
    const today = new Date().getDate();
    if (today !== lastResetDate) {
        totalRequestsToday = 0;
        lastResetDate = today;
    }

    // 🚨 【ストッパー】1日の合計が 500回 を超えたら強制停止
    // Gemini Flashモデルなら500回使ってもほぼ無料枠内ですが、
    // ここで止めておけば、絶対に予算を超えません。
    if (totalRequestsToday > 500) {
        return res.status(503).json({ error: "今日のお小遣いを使い切っちゃった。また明日話そうね！" });
    }

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        totalRequestsToday++; // カウントアップ
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
  res.send('防衛システム稼働中！安心してね。');
});

module.exports = app;
