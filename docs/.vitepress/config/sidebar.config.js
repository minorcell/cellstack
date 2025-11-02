/**
 * 侧边栏配置
 * 各个专题和页面的侧边栏导航
 */
export const sidebar = {
  "/topics/ai/": [
    {
      text: "AI",
      items: [
        { text: "Agent ReAct and Loop", link: "/topics/ai/agent_react_and_loop" },
        { text: "Agent = LLM + Tools", link: "/topics/ai/agent_is_llm_plus_tools" },
        { text: "Agents.md 又是什么", link: "/topics/ai/what_is_agents_md" },
        { text: "长期以来我对 LLM 的误解", link: "/topics/ai/misunderstanding_llm" },
        { text: "Sub-agent 模式详解和实践", link: "/topics/ai/claude_code_sub_agent" },
        { text: "提示工程入门指南", link: "/topics/ai/prompt_engineering_getting_started" },
      ],
    },
  ],

  "/topics/client/": [
    {
      text: "客户端",
      items: [
        { text: "ECharts 万字入门指南", link: "/topics/client/echarts_getting_started_guide" },
        { text: "GSAP ScrollTrigger 详解", link: "/topics/client/gsap_scrolltrigger" },
        { text: "Gsap 入门指南", link: "/topics/client/gsap_getting_started_guide" },
        { text: "JS 的多线程能力", link: "/topics/client/javascript_multithreading_worker" },
        { text: "前端新手学习指南", link: "/topics/client/frontend_beginner_guide_2025" },
        { text: "JS 运行机制详解", link: "/topics/client/javascript_event_loop" },
        { text: "JS 异步编程入门", link: "/topics/client/javascript_async_guide_6_patterns" },
        { text: "Vue 样式工程实践", link: "/topics/client/vue_style_management_engineering_practice" },
        { text: "IndexedDB 实战指南", link: "/topics/client/indexeddb_complete_guide" },
        { text: "自动化代码规范实践指南", link: "/topics/client/vscode_eslint_plus_prettier" },
      ],
    },
  ],

  "/topics/server/": [
    {
      text: "服务端",
      items: [
        { text: "Go 并发编程", link: "/topics/server/go_concurrency_sleep_to_select" },
        { text: "深度剖析 WebSocket", link: "/topics/server/websocket" },
        { text: "深入浅出哈希算法", link: "/topics/server/hash_algorithm_complete_guide" },
      ],
    },
  ],

  "/topics/netops/": [
    {
      text: "网络与运维",
      items: [
        { text: "Docker 进阶指南", link: "/topics/netops/docker_advanced_guide" },
        { text: "Docker 入门指南", link: "/topics/netops/docker_getting_started" },
        { text: "50 个核心命令行工具", link: "/topics/netops/linux_command_line_50_core_tools" },
        { text: "项目配置管理之路", link: "/topics/netops/project_configuration_management_best_practices" },
        { text: "15 个常见的状态码详解", link: "/topics/netops/http_status_codes_guide_15_core" },
      ],
    },
  ],

  "/blog/": [
    {
      text: "博客",
      items: [
        { text: "介绍", link: "/blog/" },
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
      text: "思考",
      items: [
        { text: "关于黑话，我想说几句", link: "/me/industry_slang_my_thoughts" },
        { text: "一个技术写作者的抉择", link: "/me/technical_writer_choice_traffic_vs_value" },
        { text: "编程的演进：从指令到意图", link: "/me/programming_evolution_instruction_to_intent_ai_era" },
      ],
    },
    {
      text: "站点建设",
      items: [
        { text: "SSR订阅", link: "/me/ssr_subscription" },
        { text: "VideoEmbed 视频嵌入组件", link: "/me/video_embed_vue_component" },
        { text: "MusicEmbed 音乐嵌入组件", link: "/me/music_embed_spotify_component" }
      ],
    },
  ],

  "/transpond/": [
    {
      text: "收录",
      items: [
        { text: "介绍", link: "/transpond/" },
        { text: "写作类", link: "/transpond/curated_writing_tips_collection" },
        { text: "技术类", link: "/transpond/curated_technical_tutorials_collection" }
      ],
    },
  ],
}
