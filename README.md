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

## 一键部署Vercel
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/Shadownc/visit-monitor)

> 部署完成后访问`https://example.com/api/init-db`初始化数据库
## 搭配cdn使用
## 引入 JS 使用

### 1. HTML 结构
```html
<div id="visit-counter" class="visit-counter">统计数据加载中...</div>
```

### 2. 引入 JS
```html
<script src="https://unpkg.com/visit-monitor@latest/dist/visit-monitor.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/visit-monitor@latest/dist/visit-monitor.min.js"></script>
```

### 3. 使用
```html
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const monitor = new VisitMonitor({
            apiUrl: 'https://example.com/api/log-visit',
        });

        monitor.onUpdate((pv, uv) => {
            const counterElement = document.getElementById('visit-counter');
            counterElement.innerHTML = `
                <span>访问次数：<strong>${pv}</strong></span> |
                <span>访客数量：<strong>${uv}</strong></span>
            `;
        });

        monitor.init();
    });
</script>
```

---

## 在 Vue 中使用

### 1. 安装
```bash
npm i visit-monitor
```

### 2. 使用
```vue
<template>
  <div class="visit-counter">
    <slot :pvCount="pvCount" :uvCount="uvCount">
      <template v-if="!pvCount && !uvCount">统计数据加载中...</template>
      <template v-else>
        <span>访问次数：<strong>{{ pvCount }}</strong></span> |
        <span>访客数量：<strong>{{ uvCount }}</strong></span>
      </template>
    </slot>
  </div>
</template>

<script setup>
import VisitMonitor from "visit-monitor";

const pvCount = ref();
const uvCount = ref();

onMounted(() => {
    const monitor = new VisitMonitor({
        apiUrl: "https://example.com/api/log-visit",
    });

    monitor.onUpdate((pv, uv) => {
        pvCount.value = pv;
        uvCount.value = uv;
    });

    monitor.init();
});
</script>
```

---

## 在 React 中使用

### 1. 安装
```bash
npm install visit-monitor
```

### 2. 使用
```javascript
// VisitCounter.jsx
import React, { useEffect, useState } from 'react';
import VisitMonitor from 'visit-monitor';

const VisitCounter = () => {
    const [pvCount, setPvCount] = useState(null);
    const [uvCount, setUvCount] = useState(null);

    useEffect(() => {
        const monitor = new VisitMonitor({
            apiUrl: 'https://example.com/api/log-visit',
        });

        monitor.onUpdate((pv, uv) => {
            setPvCount(pv);
            setUvCount(uv);
        });

        monitor.init();
    }, []);

    return (
        <div className="visit-counter">
            {pvCount === null && uvCount === null ? (
                <span>统计数据加载中...</span>
            ) : (
                <>
                    <span>访问次数：<strong>{pvCount}</strong></span> |
                    <span>访客数量：<strong>{uvCount}</strong></span>
                </>
            )}
        </div>
    );
};

export default VisitCounter;
```
## 不搭配cdn使用
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

    fetch('https://example.com/api/log-visit', {
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
