```
(function() {
    function logVisit() {
        const url = window.location.href;

        fetch('/api/log-visit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url }),
            credentials: 'include'  // 确保带上 Cookies
        })
        .then(response => response.json())
        .then(data => {
            console.log('Visit logged:', data);
            updateVisitCount(data.pvCount, data.uvCount);
        })
        .catch(error => {
            console.error('Error logging visit:', error);
        });
    }

    function updateVisitCount(pvCount, uvCount) {
        const counterElement = document.getElementById('visit-counter');
        if (counterElement) {
            counterElement.innerText = `Page Views: ${pvCount}, Unique Visitors: ${uvCount}`;
        }
    }

    window.addEventListener('load', logVisit);
})();
```
