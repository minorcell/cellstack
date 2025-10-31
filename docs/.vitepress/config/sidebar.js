/**
 * 侧边栏配置
 */

module.exports = {
  sidebar: {
    "/blog/": [
      {
        text: "博客",
        items: [
          { text: "介绍", link: "/blog/" },
        ],
      },
      {
        text: "思考",
        items: [
          { text: "关于"黑话"，我想说几句", link: "/blog/2025/16_slang" },
          { text: "一个技术写作者的抉择", link: "/blog/2025/14_whywrite" },
          { text: "编程的演进：从指令到意图", link: "/blog/2025/13_codeinfeature" },
        ]
      },
      {
        text: "AI 工程",
        items: [
          { text: "Agent = LLM + Tools", link: "/blog/2025/26_agent_is_llm_plus_tools" },
          { text: "Agents.md 又是什么", link: "/blog/2025/24_agents" },
          { text: "长期以来我对 LLM 的误解", link: "/blog/2025/23_llm01" },
          { text: "Sub-agent 模式详解和实践", link: "/blog/2025/12_subagent" },
          { text: "提示工程入门指南", link: "/blog/2025/11_prompt" },
        ],
      },
      {
        text: "客户端",
        items: [
          { text: "为博客添加 RSS 订阅", link: "/blog/2025/25_rss" },
          { text: "ECharts 万字入门指南", link: "/blog/2025/22_echarts" },
          { text: "GSAP ScrollTrigger 详解", link: "/blog/2025/21_gsap02" },
          { text: "Gsap 入门指南", link: "/blog/2025/20_gsap01" },
          { text: "JS 的多线程能力", link: "/blog/2025/19_jsworker" },
          { text: "前端新手学习指南", link: "/blog/2025/15_frontendlearn" },
          { text: "JS 运行机制详解", link: "/blog/2025/10_jssync" },
          { text: "JS 异步编程入门", link: "/blog/2025/03_jsprintnum" },
          { text: "Vue 样式工程实践", link: "/blog/2025/01_vuestyle" },
          { text: "IndexedDB 实战指南", link: "/blog/2024/01_indexdb" },
          { text: "自动化代码规范实践指南", link: "/blog/2025/02_vscodeformat" },
        ],
      },
      {
        text: "服务端",
        items: [
          { text: "Go 并发编程", link: "/blog/2025/09_goprintnum" },
          { text: "深度剖析 WebSocket", link: "/blog/2025/08_ws" },
          { text: "深入浅出哈希算法", link: "/blog/2025/06_hash" },
        ],
      },
      {
        text: "安全与网络",
        items: [
          { text: "15 个常见的状态码详解", link: "/blog/2025/04_httpcode" },
        ],
      },
      {
        text: "系统运维",
        items: [
          { text: "Docker 进阶指南", link: "/blog/2025/18_dockersecond" },
          { text: "Docker 入门指南", link: "/blog/2025/17_dockerfirst" },
          { text: "50 个核心命令行工具", link: "/blog/2025/07_linuxcmd" },
          { text: "项目配置管理之路", link: "/blog/2025/05_projectconfig" },
        ],
      },
    ],
    "/me/": [
      {
        text: "关于我",
        items: [
          { text: "介绍", link: "/me/" }
        ],
      },
      {
        text: "站点建设",
        items: [
          { text: "技术写作的单线结构法则", link: "/me/01_write" },
          { text: "VideoEmbed 视频嵌入组件", link: "/me/03_videoembed" },
          { text: "MusicEmbed 音乐嵌入组件", link: "/me/02_musicembed" }
        ],
      },
    ],
    "/transpond/": [
      {
        text: "收录",
        items: [
          { text: "介绍", link: "/transpond/" },
          { text: "写作类", link: "/transpond/01_write" },
          { text: "技术类", link: "/transpond/02_tech" }
        ],
      },
    ],
  },
};
