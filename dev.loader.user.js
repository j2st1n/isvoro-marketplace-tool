// ==UserScript==
// @name         [DEV] Isvoro 市场助手 (本地实时热加载)
// @namespace    https://github.com/j2st1n/isvoro-marketplace-tool
// @version      1.0.0-dev
// @description  本地开发调试加载器：页面加载时自动从本地 127.0.0.1:8789 拉取最新源码并执行，无需手动反复更新安装油猴脚本
// @author       j2st1n
// @match        *://isvoro.com/*
// @match        *://*.isvoro.com/*
// @match        *://127.0.0.1:*/*
// @match        *://localhost:*/*
// @homepageURL  https://github.com/j2st1n/isvoro-marketplace-tool
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      localhost
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    const timestamp = Date.now();
    const scriptUrl = `http://127.0.0.1:8789/isvoro-value.user.js?_t=${timestamp}`;

    console.log(`[Isvoro-Dev-Loader] 正在从本地拉取最新插件源码: ${scriptUrl}`);

    if (typeof GM_xmlhttpRequest !== 'undefined') {
        GM_xmlhttpRequest({
            method: 'GET',
            url: scriptUrl,
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
            onload: function(res) {
                if (res.status >= 200 && res.status < 300) {
                    try {
                        const scriptEl = document.createElement('script');
                        scriptEl.textContent = res.responseText;
                        (document.head || document.documentElement).appendChild(scriptEl);
                        console.log('%c[Isvoro-Dev-Loader] ✅ 本地最新源码热加载成功！', 'color:#10b981;font-weight:bold;');
                    } catch (e) {
                        console.error('[Isvoro-Dev-Loader] 源码注入报错:', e);
                    }
                } else {
                    console.error(`[Isvoro-Dev-Loader] 无法从本地加载源码，HTTP 状态: ${res.status}`);
                }
            },
            onerror: function(err) {
                console.error('[Isvoro-Dev-Loader] 连接本地 8789 调试服务失败，请确认 server.js 是否已启动。', err);
            }
        });
    } else {
        // 原生 fetch 降级（用于本地非油猴沙箱页面）
        fetch(scriptUrl)
            .then(res => res.text())
            .then(code => {
                const s = document.createElement('script');
                s.textContent = code;
                (document.head || document.documentElement).appendChild(s);
                console.log('%c[Isvoro-Dev-Loader] ✅ 本地源码原生注入成功！', 'color:#10b981;font-weight:bold;');
            })
            .catch(err => console.error('[Isvoro-Dev-Loader] 原生拉取失败:', err));
    }
})();
