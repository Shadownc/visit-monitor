const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cookieParser = require('cookie-parser');

// 初始化 Express 应用
const app = express();
app.use(express.json());
app.use(cookieParser());

// SQLite 数据库路径
const dbPath = path.resolve(__dirname, '../data/database.sqlite');

// 打开数据库
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        // 创建表结构
        db.run(`
            CREATE TABLE IF NOT EXISTS page_views (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                pv_count INTEGER DEFAULT 0,
                uv_count INTEGER DEFAULT 0
            )
        `, (err) => {
            if (err) {
                console.error('Error creating page_views table:', err);
            }
        });

        db.run(`
            CREATE TABLE IF NOT EXISTS visitors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                visitor_id TEXT NOT NULL,
                url TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error creating visitors table:', err);
            }
        });
    }
});

// 生成唯一访客ID
function generateVisitorId() {
    return 'visitor_' + Math.random().toString(36).substr(2, 9);
}

// 统计页面访问量和唯一访客
app.post('/api/log-visit', (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).send('URL is required');
    }

    let visitorId = req.cookies['visitor_id'];
    if (!visitorId) {
        visitorId = generateVisitorId();
        res.cookie('visitor_id', visitorId, { maxAge: 365 * 24 * 60 * 60 * 1000 });  // 设置 Cookie 有效期为一年
    }

    db.get(`SELECT * FROM page_views WHERE url = ?`, [url], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        let pvCount = 1;
        let uvCount = 1;

        if (row) {
            pvCount = row.pv_count + 1;

            db.get(`SELECT * FROM visitors WHERE visitor_id = ? AND url = ?`, [visitorId, url], (err, visitor) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error' });
                }

                if (visitor) {
                    uvCount = row.uv_count;
                } else {
                    uvCount = row.uv_count + 1;
                    db.run(`INSERT INTO visitors (visitor_id, url) VALUES (?, ?)`, [visitorId, url]);
                }

                db.run(`UPDATE page_views SET pv_count = ?, uv_count = ? WHERE url = ?`, [pvCount, uvCount, url], (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Database error' });
                    }

                    res.status(200).json({ url: url, pvCount: pvCount, uvCount: uvCount });
                });
            });
        } else {
            db.run(`INSERT INTO page_views (url, pv_count, uv_count) VALUES (?, ?, ?)`, [url, pvCount, uvCount], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error' });
                }

                db.run(`INSERT INTO visitors (visitor_id, url) VALUES (?, ?)`, [visitorId, url], (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Database error' });
                    }

                    res.status(200).json({ url: url, pvCount: pvCount, uvCount: uvCount });
                });
            });
        }
    });
});

// 获取页面的 PV 和 UV
app.get('/api/get-visit-count', (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).send('URL is required');
    }

    db.get(`SELECT * FROM page_views WHERE url = ?`, [url], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (row) {
            res.status(200).json({ url: url, pvCount: row.pv_count, uvCount: row.uv_count });
        } else {
            res.status(404).json({ url: url, pvCount: 0, uvCount: 0 });
        }
    });
});

// 新增的根路径路由，返回“API 运行中”消息
app.get('/', (req, res) => {
    res.status(200).send('API 运行中');
});

// 导出 Express 应用以便部署到 Vercel
module.exports = app;

// 如果在本地运行，启动服务器进行监听
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}