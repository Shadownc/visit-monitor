import { db } from '../../lib/db'
import { applyCors } from '../../lib/cors'

function generateVisitorId() {
    return 'visitor_' + Math.random().toString(36).substr(2, 9);
}

export default async function handler(req, res) {
    applyCors(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ message: 'URL is required' });
    }

    const visitorId = req.headers['x-visitor-id'] || generateVisitorId();

    try {
        // 尝试插入新记录，如果已存在则更新
        await db.execute(`
            INSERT INTO page_views (url, pv_count, uv_count)
            VALUES (?, 1, 0)
            ON CONFLICT(url) DO UPDATE
            SET pv_count = pv_count + 1
        `, [url]);

        // 检查并记录访客
        const isNewVisitor = await db.execute(`
            INSERT INTO visitors (visitor_id, url)
            VALUES (?, ?)
            ON CONFLICT(visitor_id, url) DO NOTHING
            RETURNING 1
        `, [visitorId, url]);

        // 如果是新访客，增加 uv_count
        if (isNewVisitor.rowsAffected > 0) {
            await db.execute(`
                UPDATE page_views 
                SET uv_count = uv_count + 1
                WHERE url = ?
            `, [url]);
        }

        // 获取最新统计
        const stats = await db.execute(`
            SELECT pv_count, uv_count 
            FROM page_views 
            WHERE url = ?
        `, [url]);

        return res.status(200).json({
            url,
            pvCount: stats.rows[0]?.pv_count || 1,
            uvCount: stats.rows[0]?.uv_count || 0,
            visitorId
        });

    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
            message: 'Internal server error',
            error: err.message 
        });
    }
}