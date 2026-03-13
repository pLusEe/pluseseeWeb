# pluseseeWeb 项目说明

本文档基于仓库当前代码，概述项目用途、架构与潜在风险，便于快速理解与后续维护。

## 1. 这个项目在干嘛
- 这是一个基于 Next.js App Router 的设计师作品集网站。
- 首页展示一个 3D 作品环形画廊（鼠标与滚轮交互），并提供 AI 聊天区作为互动入口。
- 提供一个 `/admin` 管理后台，可上传作品图片与信息，并写入本地 JSON 数据文件。
- 提供三个 API 路由：
  - `/api/portfolio`：读取/新增/删除作品数据（JSON 文件）。
  - `/api/upload`：上传图片到 `public/uploads`。
  - `/api/chat`：调用 ModelScope 的 OpenAI 兼容接口（Qwen3）。

## 2. 技术栈与运行方式
- 前端：React 19 + Next.js 16（App Router）
- 动画：Framer Motion
- 样式：CSS Modules + 全局 CSS（同时存在 Tailwind 配置但未见使用）
- 数据：本地 JSON 文件 `src/data/portfolio.json`
- 运行脚本：`npm run dev` / `npm run build` / `npm run start`

## 3. 代码架构（目录与职责）
- `src/app`
  - `layout.js`：全局布局与顶栏导航，加载自定义鼠标指针。
  - `page.js`：首页逻辑，加载作品数据并渲染 3D 环形展示与 AI 聊天区。
  - `admin/page.js`：作品管理后台，上传图片、创建、删除作品。
  - `api/portfolio/route.js`：作品数据读写（JSON 文件）。
  - `api/upload/route.js`：上传图片到 `public/uploads`。
  - `api/chat/route.js`：转发聊天请求到 ModelScope。
- `src/components`
  - `RingCarousel.js`：主页面 3D 环形作品展示（鼠标/滚轮交互）。
  - `AIChatSection.js`：AI 对话区（打字机效果）。
  - `CustomCursor.js`：自定义鼠标样式。
  - `Carousel3D.js` / `RingGallery.js` / `Gallery.js`：其他展示方案（目前未被首页引用）。
  - `AIChat.js`：另一套聊天 UI（目前未被引用）。
- `src/data/portfolio.json`：作品数据源。
- `public/works_img`：静态作品图。
- `public/uploads`：后台上传后的图。

## 4. 关键数据流与页面流程
1. 首页加载后请求 `/api/portfolio`，拿到 `src/data/portfolio.json` 的作品列表。
2. 作品列表传入 `RingCarousel`，按环形 + 3D 方式展示。
3. `/admin` 页面提交时：
   - 先上传图片到 `/api/upload`，返回 `public/uploads` 下的 URL。
   - 再调用 `/api/portfolio` 写入/删除 JSON 数据。
4. AI 聊天区调用 `/api/chat`，由服务器向 ModelScope API 转发。

## 5. 隐藏的可能缺陷与风险点
以下是“看起来正常、但上线后可能出问题”的部分：

### 5.1 数据与部署层面的风险
- 本地 JSON 写入方式不适合 Serverless 或只读文件系统。
  - 生产部署在 Vercel 等平台时，`src/data/portfolio.json` 通常不可写。
  - 即使可写，多实例写入也会互相覆盖。
- JSON 文件写入没有锁与冲突处理。
  - 同时多人提交或短时间内多次写入会出现丢数据风险。

### 5.2 安全风险
- 管理后台无鉴权。
  - `/admin` 与 `/api/portfolio`、`/api/upload` 完全开放，任何访问者都可上传或删除作品。
- 上传接口没有类型/大小限制。
  - 可上传任意文件，容易被滥用。
- `/api/chat` 没有速率限制与调用次数控制。
  - 暴露 API Key，易被刷爆额度。

### 5.3 数据一致性与类型问题
- `portfolio.json` 中初始 `id` 是字符串，新建作品的 `id` 是数字（`Date.now()`）。
  - 若后续把 id 当字符串或数字比较，可能出现删除/查找失败或排序异常。
- 删除接口仅用 `POST` 且无校验。
  - 未区分权限与来源，误删无法恢复。

### 5.4 用户体验与可维护性隐患
- 多处中文文本出现乱码（疑似编码问题）。
  - 已在 `page.js` / `admin/page.js` / `portfolio.json` 看到“乱码汉字”。
  - 这会直接在页面显示异常，且后期编辑更困难。
- 轮播组件对滚轮事件强制 `preventDefault`。
  - 在某些设备或嵌入场景可能造成页面滚动“卡住”。
- 未使用的组件较多（`AIChat.js` / `Carousel3D.js` / `RingGallery.js` / `Gallery.js`）。
  - 会增加维护成本与混淆。

## 6. 你可以从这些文件开始看（快速入口）
- 首页逻辑：`src/app/page.js`
- 3D 作品展示：`src/components/RingCarousel.js`
- AI 聊天区：`src/components/AIChatSection.js`
- 后台管理：`src/app/admin/page.js`
- 数据读写 API：`src/app/api/portfolio/route.js`
- 上传 API：`src/app/api/upload/route.js`
- 聊天 API：`src/app/api/chat/route.js`
- 数据文件：`src/data/portfolio.json`

---
如果你希望，我可以继续：
1. 输出一版“改造建议清单”（含优先级）
2. 把管理后台改为带鉴权
3. 把数据存储迁移到数据库（SQLite、Supabase、PlanetScale 等）
