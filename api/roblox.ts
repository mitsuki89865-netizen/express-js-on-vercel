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
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY || API_KEY.trim() === "") {
        return res.status(500).json({ error: "APIキーが設定されていません。" });
    }

    const MODEL_NAME = "gemini-2.0-flash"; 
    const GOOGLE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    // ★ ここに「ルール」をブチ込む！
    const SYSTEM_RULE = `
    あなたはRobloxゲーム「お父さんから生き残る」の有能なサポーターAIです。
    【掟】
    ・短く、頼りになる口調で話すこと。
    ・「お父さん」から生き残るためのアドバイスを優先すること。
    ・プライベートサーバーは無料、ゲームパスの予定はないことを周知すること。
    ・ロブロックスコミュニティガイドラインで不適切な言葉には「その言葉にはお答えできません」と返すこと。
    `;

    try {
        const response = await fetch(GOOGLE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `${SYSTEM_RULE}\n\nプレイヤーからの通信: ${message}` }] 
                }]
            })
        });

        const data: any = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            res.json({ text: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: "Geminiが止まりました。内容に問題があるかもしれません。", detail: data });
        }
    } catch (e) {
        res.status(500).json({ error: "通信中に爆発しました。" });
    }
});

export default app;
