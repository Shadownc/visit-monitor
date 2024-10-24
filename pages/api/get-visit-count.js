import { db } from '../../lib/db'
import { applyCors } from '../../lib/cors'

export default async function handler(req, res) {
    applyCors(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ message: 'URL is required' });
    }

    try {
        const result = await db.execute(`
            SELECT pv_count, uv_count 
            FROM page_views 
            WHERE url = ?
        `, [url]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No data found for this URL' });
        }

        const { pv_count, uv_count } = result.rows[0];

        return res.status(200).json({
            url,
            pvCount: pv_count,
            uvCount: uv_count
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}