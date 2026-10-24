# Isvoro 二手交易市场计算与科学排序助手

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/j2st1n/isvoro-marketplace-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Tampermonkey%20%7C%20Violentmonkey%20%7C%20ScriptCat-orange.svg)]()
[![Regression Tests](https://img.shields.io/badge/tests-47%20passed%20%7C%20100%25-brightgreen.svg)]()

专为 **Isvoro 二手交易市场** ([https://isvoro.com/marketplace](https://isvoro.com/marketplace)) 量身打造的高性能浏览器用户脚本与科学计算助手。

自动感知 Vue 3 单页路由状态，秒级计算每台在售机器的**实际剩余价值、让利倒贴/溢价额、实际折数、买家接手日均成本与归一化月均续费成本**；提供 **6 维科学排序矩阵（正常 IP 优先，被墙机器 1 亿权重沉底）**与**多维智能筛选器（隐藏被墙机器、只看倒贴机、全部/月付/季付/半年付/年付周期切换）**，并完美融合 Tailwind CSS HSL 原生暗黑模式。

---

## 🌟 核心特性与设计哲学

### 1. 💰 科学透明的二手 VPS 价值模型
传统交易平台仅罗列“售价”与“续费价格”，买家需要心算距离到期天数、折算实际剩余资费以及卖家是否加价割韭菜。本项目提供端到端透明化估值：
- **精确剩余价值 ($V_{rem}$)**：
  $$V_{rem} = P_{renew} \times \frac{\max(0, D_{float})}{D_{cycle}}$$
  基于到期时间戳与当前时刻的秒级差值计算浮点天数 $D_{float}$，严格按对应周期标准天数（月付 30 天、季付 90 天、半年付 180 天、年付 365 天）折算实际有效剩余资费；
- **让利倒贴 / 溢价额 ($\Delta P = P_{sale} - V_{rem}$)**：
  - **超值倒贴甩卖**：$\Delta P < -0.01$ 时标出绿色醒目徽章 `🎁 倒贴 ¥XX.XX`；
  - **平价出鸡流转**：$|\Delta P| \le 0.01$ 时标出蓝色徽章 `平价转让`；
  - **卖家加价出鸡**：$\Delta P > 0.01$ 时标出 `溢价 +¥XX.XX`（高溢价标红警示）；
- **实际折扣力度与折数**：精准计算打折幅度（如 **-38% / 6.2折**），快速捕获高让利机器；
- **接手日均持有成本 ($C_{daily}$)**：
  $$C_{daily} = \frac{P_{sale}}{\max(1, D_{float})}$$
  反映买家接手后在机器到期前每日实际支出的分摊成本；
- **归一化月均续费成本 ($C_{monthly\_renew}$)**：消除年付、季付、月付周期差异，统一折算为“每月续费持有成本”，便于横向比较机器真实长期成本；
- **流量存量可视化**：解析已用流量与总量，生成彩色渐变剩余流量进度条，并高保真识别“不限流量”实例。

---

### 2. 🛡️ 6 维科学排序矩阵与 1 亿权重沉底机制
二手市场中买家最大的痛点是低价机器往往是 IP 已被阻断的“废机”，容易误导新手。本项目首创 **1 亿权重惩罚基数（`ipPenalty = 100,000,000`）**：

$$\text{Score} = \text{ipPenalty} + f(\text{Metric})$$

在任何排序模式下，被阻断 IP 机器的得分均比正常机器大至少 **90,000,000 分**，**绝对沉底在所有正常卡片之后**：

| 排序模式 | 键名 | 核心业务意图与应用场景 |
| :--- | :--- | :--- |
| **🎁 倒贴最多** | `bonus` | 按卖家亏本让利金额降序排列，**二手市场捡漏首选** |
| **🔥 折扣最大** | `discount` | 按实际折扣力度（如 2 折、5 折）排在最前 |
| **👑 月均续费最低** | `renew` | 归一化月均续费升序，**专为挖掘低续费“传家宝”神机设计** |
| **⏱️ 接手日均最低** | `daily` | 剩余持有期内单日花费最少，适合精打细算的买家 |
| **📶 剩余流量最多** | `traffic` | 智能解析网络规格，按可用流量存量比例重排 |
| **⚡ 综合默认** | `default` | 保持原站最新发布流次序，但被墙机器依然被沉底 |

---

### 3. 🔍 IP 状态三级探测流水线与防误杀清洗矩阵
通过对 Isvoro 生产环境 DOM 与 API 逆向，构建了多层容错探测与文本清洗过滤机制：
- **Level 1**：`.pb-3 span` 专属 IP 状态标签徽章精准匹配；
- **Level 2**：全卡片 `.badge` 与 `span[class*="text-"]` 类名节点扫描；
- **Level 3**：中英双语与异常状态统一映射（正向覆盖：`[IP被墙]`、`IP被封`、`IP阻断`、`GFW`、`blocked`、`banned`、`unreachable`、`超时`、`检测失败` 等）；
- **防误杀免疫清洗（Sanitization Matrix）**：
  采用正则预清洗防御，彻底排除“防火墙规则”、“续费锁价”、“锁单中”、“不锁配置”、“未锁单”、“不阻断”、“未阻断”等业务词汇，杜绝将含“防火墙”或“锁单”的正常机器误杀为被墙。

---

### 4. 🎛️ 现代 HUD 仪表盘与智能筛选
- **周期快捷单选胶囊**：集成 `全部 / 月付 / 季付 / 半年付 / 年付` 一键切换；
- **快捷开关过滤器**：
  - `🚫 隐藏被墙机器`：一键过滤所有阻断或异常 IP，只看可用机器；
  - `🎁 只看倒贴机器`：剔除全部溢价机型，只看亏本转让好鸡；
- **纯 CSS Order 无损排序**：
  - 排序完全依赖卡片样式的 `order` 属性；
  - 筛选隐藏采用专用类 `isvoro-xrv-hidden` (`display: none !important`)；
  - **零 DOM 节点位移**，完全不破坏 Vue 3 虚拟 DOM 树与 Reka UI 响应式挂载点；
- **实时大盘统计**：HUD 顶部实时汇报“共 N 台 (IP正常 X / 被墙 Y) · 倒贴捡漏 Z 台”。

---

### 5. 🎨 Tailwind CSS HSL 原生双模暗黑自适应
Isvoro 前端基于 Tailwind CSS 3 与 HSL CSS 变量（`--card`、`--border`、`--primary`、`--success`、`--destructive` 等）驱动明暗主题。
- 插件全面采用 `hsl(var(--...))` 映射规范，**零十六进制绝对颜色硬编码**；
- 跟随页面 `html.dark` 类名即时无缝变色，不论日间亮白模式还是深夜暗黑模式，卡片与 HUD 均与宿主原生风格完全融为一体。

---

### 6. ⚡ SPA 路由生命周期即时响应
- 劫持 HTML5 History API（`pushState` / `replaceState`），并监听 `popstate` 与 `hashchange` 事件；
- 买家从官网任何子页面（如控制台、个人设置、公告栏）点击跳转至 `/marketplace` 时秒级自动激活与挂载 HUD，**彻底告别手动按 F5 刷新**；
- 离开市场时自动卸载 HUD 容器，保持零内存泄漏。

---

## 📁 目录结构与工程布局

```text
userscripts/isvoro-marketplace-tool/
├── isvoro-value.user.js         # 核心生产版油猴脚本（全功能内嵌）
├── dev.loader.user.js           # 本地热重载 Loader 脚本
├── server.js                    # 本地轻量静态与 Mock API 服务 (PORT: 8789)
├── start-dev.sh                 # 本地开发服务一键启动脚本
├── index.html                   # 本地调试与安装导航门户
├── mock-marketplace.html        # 1:1 仿真测试沙箱（预置 12 组全场景卡片与明暗切换）
├── mock-marketplace-data.json   # 生产级仿真 API 数据契约
├── test-regression.js           # 47 项全量自动化回归测试套件
├── docs/                        # 逆向与架构规格说明书
│   ├── isvoro-dom-and-data-model-spec.md      # DOM 拓扑、Tailwind Token 与数据模型契约
│   └── isvoro-value-model-and-sorting-spec.md  # 价值模型、科学排序与 SPA 生命周期技术规范
└── README.md                    # 本交付文档
```

---

## 📥 安装与使用指南

### 方式一：生产环境直接安装（推荐）

1. 在浏览器中安装常见油猴扩展：[Tampermonkey](https://www.tampermonkey.net/)、[Violentmonkey](https://violentmonkey.github.io/) 或 [ScriptCat](https://scriptcat.org/)；
2. 打开安装链接或将 `isvoro-value.user.js` 添加至扩展中；
3. 打开 [https://isvoro.com/marketplace](https://isvoro.com/marketplace)，插件将自动在卡片列表上方挂载 HUD 仪表盘并在每张机器卡片上注入剩余价值行。

---

### 方式二：本地开发实时热重载 (Local Dev Mode)

专为本地二次开发与功能调试打造，无需每次修改代码后手动在扩展中重新贴源码：

1. **启动本地开发服务器**：
   ```bash
   cd userscripts/isvoro-marketplace-tool
   bash start-dev.sh
   # 本地调试服务将启动在 http://127.0.0.1:8789
   ```

2. **安装本地 Dev Loader**：
   - 访问门户：`http://127.0.0.1:8789/`；
   - 点击安装：`http://127.0.0.1:8789/dev.loader.user.js`；

3. **实时热调试**：
   - 修改 `isvoro-value.user.js` 并保存；
   - 刷新目标页面或仿真页面，Loader 会实时从本地拉取最新脚本执行。

---

## 🖥️ 仿真测试沙箱 (Mock Marketplace Sandbox)

为保证在无 Isvoro 账号或外网不可达的环境下仍能进行完整的功能验收与视觉走查，工程配备了完整的仿真测试沙箱：

- **访问地址**：`http://127.0.0.1:8789/mock-marketplace.html`
- **沙箱能力**：
  1. **1:1 还原 DOM 结构**：包含 `PageHeader`、`div[role="tablist"]`、`div[role="tabpanel"][data-state="active"]`、警告框与 `.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-4` 卡片网格；
  2. **12 组全场景典型卡片**：
     - `HK-BGP-Standard-1C1G`：月付大额倒贴甩卖神机（6.2折）；
     - `TYO-Softbank-2C2G-Annual`：年付优质大折价机器；
     - `SJC-BGP-1C1G-Blocked`：年付低价机器，但 IP 被墙（验证 1 亿权重沉底）；
     - `SIN-GIA-Special`：稀缺绝版月付机，极高溢价（+¥265.00）；
     - `FRA-Storage-4C8G-Quarterly`：季付大盘鸡；
     - `ICN-Optimized-2C4G-SemiAnnual`：半年付云主机；
     - `LAX-Light-1C512M`：仅剩 3 天即将到期的月付低价机；
     - `HK-CMI-Unmetered`：不限流量高带宽实例；
     - `LON-Global-2C2G`：美元原币结算（$）外币机；
     - `TPE-Hinet-Static-1C1G`：原生 IP 但状态为 [IP阻断]（沉底验证）；
     - `EDGE-Test-Expired`：已过期的边缘测试卡片；
     - `TYO-EPYC-8C16G-Annual`：年付生产高配云主机；
  3. **交互式工具栏**：
     - `🌓 切换明暗主题`：实时在亮色与暗色模式间切换，验证 Tailwind HSL 配色；
     - `🧪 运行回归测试`：在浏览器端一键调用导出 API 执行断言；
     - `🔄 重新加载页面` / `⚙️ 控制门户` / `📄 API JSON` 快捷跳转。

---

## 🧪 自动化回归测试套件 (Test Suite)

项目配备独立的 Node.js 自动化回归测试套件 `test-regression.js`，涵盖 9 大测试维度共 **47 项严密断言**。

### 运行测试
```bash
node userscripts/isvoro-marketplace-tool/test-regression.js
```

### 测试维度与断言覆盖

```text
════════════════════════════════════════════════════════════════
🧪 开始执行 Isvoro 二手交易市场插件 (v1.0.0) 全量自动化回归测试
════════════════════════════════════════════════════════════════

📌 测试套件: 1. 模块导出与基础契约验证
  ✅ [PASS] 正确导出了核心数据结构与状态机 STATE
  ✅ [PASS] 导出了全部必备的纯计算与判定函数

📌 测试套件: 2. IP 状态探测流水线与清洗防御测试
  ✅ [PASS] 准确识别常见正常 IP 状态标记
  ✅ [PASS] 准确命中所有形式的 IP 阻断与污染（正向测试）
  ✅ [PASS] 准确将无数据或检测异常归入风险阻断态沉底
  ✅ [PASS] 防御误杀清洗：严禁将含“防火墙/锁价/锁单/不阻断/未阻断”误判为被墙
  ✅ [PASS] 边缘与空值安全防御

📌 测试套件: 3. 续费价格与周期解析测试
  ✅ [PASS] 正确解析月付续费规格 (1个月 / 30天)
  ✅ [PASS] 正确解析季付续费规格 (3个月 / 90天)
  ✅ [PASS] 正确解析半年付续费规格 (6个月 / 180天)
  ✅ [PASS] 正确解析年付续费规格 (12个月 / 365天)
  ✅ [PASS] 正确解析周付与日付规格
  ✅ [PASS] 多币种识别：支持 CNY (¥), USD ($), EUR (€), GBP (£)
  ✅ [PASS] 异常输入容错

📌 测试套件: 4. 到期时间解析测试
  ✅ [PASS] 标准格式：YYYY-MM-DD HH:mm
  ✅ [PASS] 带秒格式：YYYY-MM-DD HH:mm:ss
  ✅ [PASS] 斜杠分隔与中文格式：YYYY/MM/DD 与 YYYY年MM月DD日
  ✅ [PASS] ISO 8601 标准字符串：2026-11-20T18:00:00Z
  ✅ [PASS] 纯日期格式（无时分秒自动置为 00:00:00）
  ✅ [PASS] 非法时间安全返回 null

📌 测试套件: 5. 售价与流量存量解析测试
  ✅ [PASS] 售价准确提取（过滤货币符号与千分位）
  ✅ [PASS] 流量字节数多单位解析 (B, KB, MB, GB, TB)
  ✅ [PASS] 流量剩余比例计算：150 GB / 1000 GB (剩余 85.0%)
  ✅ [PASS] 流量剩余比例计算：大盘鸡 1.2 TB / 5120 GB (1.2 TB / 5 TB = 76.0% 剩余)
  ✅ [PASS] 不限流量场景准确识别
  ✅ [PASS] 流量异常容错（已用大于总量防护）

📌 测试套件: 6. 科学剩余价值估值模型测试
  ✅ [PASS] 大额倒贴捡漏机器评估 (HK 1001: 续费45/月, 剩27天, 售价25)
  ✅ [PASS] 严重高溢价机器评估 (SIN 1004: 续费60/月, 剩17天, 售价299)
  ✅ [PASS] 平价流转机器评估 (售价等于剩余价值)
  ✅ [PASS] 已过期机器评估 (到期时间在过去)
  ✅ [PASS] 外币结算机型正确流转货币符号 ($)

📌 测试套件: 7. 6 维科学排序与 1 亿权重沉底机制测试
  ✅ [PASS] 排序模式 [bonus]: 被墙机器得分必须至少比所有正常机器大 9000 万分，绝对沉底
  ✅ [PASS] 排序模式 [discount]: 被墙机器得分必须至少比所有正常机器大 9000 万分，绝对沉底
  ✅ [PASS] 排序模式 [renew]: 被墙机器得分必须至少比所有正常机器大 9000 万分，绝对沉底
  ✅ [PASS] 排序模式 [daily]: 被墙机器得分必须至少比所有正常机器大 9000 万分，绝对沉底
  ✅ [PASS] 排序模式 [traffic]: 被墙机器得分必须至少比所有正常机器大 9000 万分，绝对沉底
  ✅ [PASS] 排序模式 [default]: 被墙机器得分必须至少比所有正常机器大 9000 万分，绝对沉底
  ✅ [PASS] 正常机器在 [bonus] 模式下：倒贴最多的机器严格排在前面 (score 越小排越前)
  ✅ [PASS] 正常机器在 [discount] 模式下：打折力度最大的机器严格排在前面
  ✅ [PASS] 正常机器在 [renew] 模式下：月均续费最低的机器严格排在前面
  ✅ [PASS] 正常机器在 [traffic] 模式下：剩余流量比例最高的机器严格排在前面

📌 测试套件: 8. 智能多维筛选器逻辑测试
  ✅ [PASS] hideBlocked: 仅隐藏被阻断 IP 机器，保留全部正常 IP 机器
  ✅ [PASS] onlyBonus: 仅保留倒贴机器 (deltaP < -0.01)，隐藏溢价与平价机器
  ✅ [PASS] cycleFilter: 准确按照月付/季付/半年付/年付分类过滤

📌 测试套件: 9. mock-marketplace.html 仿真卡片全量解析验证
  ✅ [PASS] mock-marketplace.html 存在且包含标准 app 容器与卡片网格
  ✅ [PASS] 从 mock-marketplace.html 中正则提取并验证全量 12 张卡片
  ✅ [PASS] 12 张仿真卡片与 mock-marketplace-data.json 数据契约 100% 对齐

════════════════════════════════════════════════════════════════
🎉 全部测试执行完毕: 总计 47 项 | 通过 47 项 | 失败 0 项
════════════════════════════════════════════════════════════════
```

---

## 📄 许可证与开源协议

本项目基于 **MIT License** 授权许可开源。
如需了解关于 DOM 拓扑和算法模型的详细数学推导，请参阅 `docs/` 目录中的规格规范文档。
