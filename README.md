# visit-monitor

**极简网页计数器**

## 部署准备
1. 注册`https://turso.tech`
2. 创建数据库 记录数据库链接 `TOKEN` 
3. 填入环境变量
    ```
    TURSO_DATABASE_URL = 
    TURSO_AUTH_TOKEN = 
    ```
## 在自己的项目内引用
```
(function () {
  function getOrCreateVisitorId() {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
  }

  function logVisit() {
    const url = window.location.href;
    const visitorId = getOrCreateVisitorId();

    fetch('/api/log-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Visitor-ID': visitorId,
      },
      body: JSON.stringify({ url }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('访问记录成功:', data);
        updateVisitCount(data.pvCount, data.uvCount);
      })
      .catch((error) => {
        console.error('访问记录出错:', error);
        updateVisitCount('N/A', 'N/A');
      });
  }

  function updateVisitCount(pvCount, uvCount) {
    const counterElement = document.getElementById('visit-counter');
    if (counterElement) {
      counterElement.innerHTML = `
        <span>访问次数：<strong>${pvCount}</strong></span> |
        <span>访客数量：<strong>${uvCount}</strong></span>
      `;
      counterElement.classList.remove('loading');
      counterElement.classList.add('loaded');
    }
  }

  window.addEventListener('load', () => {
    const counterElement = document.getElementById('visit-counter');
    if (counterElement) counterElement.classList.add('loading');
    logVisit();
  });
})();

```