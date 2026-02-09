import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS対策（AI彼女のサイトから届くようにする）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data: any = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "彼女：ごめん、ちょっと調子が悪いみたい...";
        res.status(200).json({ text: aiText });
    } catch (e) {
        res.status(500).json({ text: "エラーが発生したわ。" });
    }
}
