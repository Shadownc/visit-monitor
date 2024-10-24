```
(function () {
      // 发送访问日志请求
      function logVisit() {
        const url = window.location.href;

        fetch('https://vis.yyycy.us.kg/api/log-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: url }),
          credentials: 'include', // 确保带上 Cookies
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('访问记录成功:', data);
            updateVisitCount(data.pvCount, data.uvCount);
          })
          .catch((error) => {
            console.error('访问记录出错:', error);
            updateVisitCount('N/A', 'N/A'); // 请求失败时显示 N/A
          });
      }

      // 更新页面访问统计数据
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

      // 页面加载时发送访问日志请求
      window.addEventListener('load', () => {
        const counterElement = document.getElementById('visit-counter');
        if (counterElement) counterElement.classList.add('loading');
        logVisit();
      });
    })();
```
