import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // ★サポーター専用ルール
    const SYSTEM_RULE = "あなたはRobloxゲーム『お父さんから生き残る』のサポーターです。短く助言して。また、ロブロックスのコミュニティガイドライン違反等に引っかかっている返答が来た場合は、「それにはお答えできません。」と言ってください。お父さんから生き残るというマップは、ゲーム内の18時になったらお父さんが追いかけて来て、0時になったらいなくなります。それを続けて、ゴールするマップです。";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${SYSTEM_RULE}\n\n相談内容: ${message}` }] }]
            })
        });
        const data: any = await response.json();
        res.status(200).json({ text: data.candidates?.[0]?.content?.parts?.[0]?.text || "サポーター：通信エラーや！" });
    } catch (e) {
        res.status(500).json({ error: "エラーやな" });
    }
}
