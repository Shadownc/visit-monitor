// export async function getServerSideProps({ res }) {
//     res.setHeader('Content-Type', 'application/json');
//     res.statusCode = 200;
//     res.end(JSON.stringify({ message: "API 运行中" }));
//     return { props: {} };
//   }
  
//   export default function Home() {
//     return null;
//   }

// pages/index.js
import { useEffect } from 'react';
import VisitMonitor from 'visit-monitor';
import { useState } from 'react';

export default function Home() {
  const [pvCount, setPvCount] = useState(null);
  const [uvCount, setUvCount] = useState(null);
  const [updateTime, setUpdateTime] = useState('加载中...');

  useEffect(() => {
    const monitor = new VisitMonitor({
      apiUrl: '/api/log-visit',
    });

    const updateTime = () => {
      const now = new Date();
      setUpdateTime(now.toLocaleTimeString());
    };

    monitor.onUpdate((pv, uv) => {
      setPvCount(pv);
      setUvCount(uv);
      updateTime();
    });

    monitor.init();

    // 每小时更新一次数据
    const interval = setInterval(() => {
      monitor.logVisit();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="wave-background min-h-screen">
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* 头部区域 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4 floating">
            访问统计面板
          </h1>
          <p className="text-gray-100 text-xl">实时监控网站访问数据 · 智能分析</p>
        </div>

        {/* 统计卡片区域 */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PV卡片 */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold text-white">
                  <i className="fas fa-eye mr-2 text-blue-300" />
                  访问次数 (PV)
                </div>
                <div className="bg-blue-400/30 text-white px-3 py-1 rounded-full text-sm">
                  实时
                </div>
              </div>
              <div className="text-4xl font-bold text-white">
                {pvCount === null ? (
                  <div className="animate-pulse bg-white/20 h-8 w-32 rounded" />
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-5xl text-white">{pvCount}</span>
                    <span className="ml-2 text-sm text-gray-100">次</span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm text-gray-100">
                <i className="fas fa-chart-line mr-1" />
                持续监控中...
              </div>
            </div>

            {/* UV卡片 */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold text-white">
                  <i className="fas fa-users mr-2 text-blue-300" />
                  访客数量 (UV)
                </div>
                <div className="bg-blue-400/30 text-white px-3 py-1 rounded-full text-sm">
                  实时
                </div>
              </div>
              <div className="text-4xl font-bold text-white">
                {uvCount === null ? (
                  <div className="animate-pulse bg-white/20 h-8 w-32 rounded" />
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-5xl text-white">{uvCount}</span>
                    <span className="ml-2 text-sm text-gray-100">人</span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm text-gray-100">
                <i className="fas fa-chart-bar mr-1" />
                持续监控中...
              </div>
            </div>
          </div>

          {/* 信息卡片 */}
          <div className="mt-8 glass-card rounded-2xl p-8">
            <div className="flex items-center space-x-4 text-white">
              <i className="fas fa-info-circle text-blue-300 text-xl" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">数据说明</h3>
                <p className="text-sm opacity-90">
                  PV（Page View）表示页面浏览量，UV（Unique Visitor）表示独立访客数。数据每小时自动更新，无需刷新页面。
                </p>
              </div>
            </div>
          </div>

          {/* 更新时间 */}
          <div className="mt-6 text-center text-white/80 text-sm">
            <i className="fas fa-clock mr-1" />
            <span>最后更新时间: {updateTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}