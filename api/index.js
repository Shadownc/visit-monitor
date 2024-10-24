const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // 导入 CORS 中间件
const fs = require('fs'); // 文件系统模块

const app = express();
app.use(express.json());
app.use(cookieParser());

// 动态 CORS 配置
const corsOptionsDelegate = (req, callback) => {
    const origin = req.header('Origin'); // 获取请求的来源
    const corsOptions = {
        origin: origin || '*', // 如果有 Origin，则使用它；否则允许所有
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的请求方法
        allowedHeaders: ['Content-Type', 'Authorization'], // 允许的自定义 Header
        credentials: true, // 允许携带 cookies
    };
    callback(null, corsOptions); // 回调函数，设置 CORS 选项
};

// 启用 CORS 并处理预检请求
app.use(cors(corsOptionsDelegate));
app.options('*', cors(corsOptionsDelegate)); // 处理 OPTIONS 请求

// SQLite 数据库路径配置
const dbPath = process.env.NODE_ENV === 'production'
    ? path.resolve('/tmp', 'database.sqlite') // Vercel 使用 /tmp
    : path.resolve(__dirname, './data/database.sqlite'); // 本地使用 ./data

// 如果 data 目录不存在，则创建它（本地使用）
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// 打开数据库并创建表结构
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log(`Connected to SQLite database at ${dbPath}`);
        db.run(`
            CREATE TABLE IF NOT EXISTS page_views (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                pv_count INTEGER DEFAULT 0,
                uv_count INTEGER DEFAULT 0
            )
        `, (err) => {
            if (err) console.error('Error creating page_views table:', err);
        });

        db.run(`
            CREATE TABLE IF NOT EXISTS visitors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                visitor_id TEXT NOT NULL,
                url TEXT NOT NULL
            )
        `, (err) => {
            if (err) console.error('Error creating visitors table:', err);
        });
    }
});

// 生成唯一访客ID
function generateVisitorId() {
    return 'visitor_' + Math.random().toString(36).substr(2, 9);
}

// 记录页面访问量
app.post('/api/log-visit', (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ message: 'URL is required' });
    }

    let visitorId = req.cookies['visitor_id'];
    console.log('visitorId',visitorId)
    if (!visitorId) {
        visitorId = generateVisitorId();
        res.cookie('visitor_id', visitorId, {
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 年
            httpOnly: true, // 提升安全性
            sameSite: 'Lax', // 防止 CSRF
            secure: true , // 只能通过 https 传输
        });
    }

    db.get(`SELECT * FROM page_views WHERE url = ?`, [url], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        let pvCount = 1;
        let uvCount = 1;

        if (row) {
            pvCount = row.pv_count + 1;

            db.get(`SELECT * FROM visitors WHERE visitor_id = ? AND url = ?`, [visitorId, url], (err, visitor) => {
                if (err) return res.status(500).json({ message: 'Database error' });

                if (visitor) {
                    uvCount = row.uv_count;
                } else {
                    uvCount = row.uv_count + 1;
                    db.run(`INSERT INTO visitors (visitor_id, url) VALUES (?, ?)`, [visitorId, url]);
                }

                db.run(`UPDATE page_views SET pv_count = ?, uv_count = ? WHERE url = ?`, [pvCount, uvCount, url], (err) => {
                    if (err) return res.status(500).json({ message: 'Database error' });

                    res.status(200).json({ url, pvCount, uvCount });
                });
            });
        } else {
            db.run(`INSERT INTO page_views (url, pv_count, uv_count) VALUES (?, ?, ?)`, [url, pvCount, uvCount], (err) => {
                if (err) return res.status(500).json({ message: 'Database error' });

                db.run(`INSERT INTO visitors (visitor_id, url) VALUES (?, ?)`, [visitorId, url], (err) => {
                    if (err) return res.status(500).json({ message: 'Database error' });

                    res.status(200).json({ url, pvCount, uvCount });
                });
            });
        }
    });
});

// 获取访问统计
app.get('/api/get-visit-count', (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ message: 'URL is required' });
    }

    db.get(`SELECT * FROM page_views WHERE url = ?`, [url], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (row) {
            res.status(200).json({ url, pvCount: row.pv_count, uvCount: row.uv_count });
        } else {
            res.status(404).json({ url, pvCount: 0, uvCount: 0 });
        }
    });
});

// 根路径返回 API 状态
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API 运行中' });
});

// 捕获未处理的错误
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 导出 Express 应用
module.exports = app;

// 本地运行监听端口
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
