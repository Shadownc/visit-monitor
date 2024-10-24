import { initDB } from '../../lib/db'

export default async function handler(req, res) {
    try {
        await initDB();
        res.status(200).json({ message: 'Database initialized successfully' });
    } catch (err) {
        console.error('Failed to initialize database:', err);
        res.status(500).json({ message: 'Failed to initialize database' });
    }
}