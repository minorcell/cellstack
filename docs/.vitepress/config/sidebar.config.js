/**
 * 侧边栏配置
 * 分为五个主要分类：AI、网络、语言、运维、性能优化
 */
export const sidebar = {
  // AI 分类
  "/topics/ai/": [
    {
      text: "AI 认知",
      collapsed: false,
      items: [
        { text: "长期以来我对 LLM 的误解", link: "/topics/ai/misunderstanding_llm" },
      ],
    },
    {
      text: "提示词工程",
      collapsed: false,
      items: [
        { text: "提示工程入门指南", link: "/topics/ai/prompt_engineering_getting_started" },
      ],
    },
    {
      text: "Agent 架构",
      collapsed: false,
      items: [
        { text: "Agent ReAct and Loop", link: "/topics/ai/agent_react_and_loop" },
        { text: "Agent = LLM + Tools", link: "/topics/ai/agent_is_llm_plus_tools" },
        { text: "Agents.md 又是什么", link: "/topics/ai/what_is_agents_md" },
        { text: "Sub-agent 模式详解和实践", link: "/topics/ai/claude_code_sub_agent" },
      ],
    },
  ],

  // 网络分类
  "/topics/network/": [
    {
      text: "网络协议",
      collapsed: false,
      items: [
        { text: "深度剖析 WebSocket", link: "/topics/network/websocket" },
        { text: "HTTP 状态码详解（15个核心）", link: "/topics/network/http_status_codes_guide_15_core" },
      ],
    },
  ],

  // 语言分类
  "/topics/language/": [
    {
      text: "JavaScript",
      collapsed: false,
      items: [
        { text: "前端新手学习指南", link: "/topics/language/frontend_beginner_guide_2025" },
        { text: "JS 运行机制详解", link: "/topics/language/javascript_event_loop" },
        { text: "JS 的多线程能力", link: "/topics/language/javascript_multithreading_worker" },
        { text: "IndexedDB 完整指南", link: "/topics/language/indexeddb_complete_guide" },
      ],
    },
    {
      text: "前端框架",
      collapsed: false,
      items: [
        { text: "Vue 样式工程实践", link: "/topics/language/vue_style_management_engineering_practice" },
      ],
    },
    {
      text: "可视化开发",
      collapsed: false,
      items: [
        { text: "Gsap 入门指南", link: "/topics/language/gsap_getting_started_guide" },
        { text: "GSAP ScrollTrigger 详解", link: "/topics/language/gsap_scrolltrigger" },
        { text: "ECharts 入门指南", link: "/topics/language/echarts_getting_started_guide" },
      ],
    },
    {
      text: "Go 语言",
      collapsed: false,
      items: [
        { text: "Go 并发编程", link: "/topics/language/go_concurrency_sleep_to_select" },
      ],
    },
  ],

  // 运维分类
  "/topics/devops/": [
    {
      text: "容器化技术",
      collapsed: false,
      items: [
        { text: "Docker 入门指南", link: "/topics/devops/docker_getting_started" },
        { text: "Docker 进阶指南", link: "/topics/devops/docker_advanced_guide" },
      ],
    },
    {
      text: "Linux 运维",
      collapsed: false,
      items: [
        { text: "50 个命令行工具", link: "/topics/devops/linux_command_line_50_core_tools" },
      ],
    },
    {
      text: "工程化实践",
      collapsed: false,
      items: [
        { text: "项目配置管理之路", link: "/topics/devops/project_configuration_management_best_practices" },
      ],
    },
  ],

  // 性能优化分类
  "/topics/performance/": [
    {
      text: "算法优化",
      collapsed: false,
      items: [
        { text: "深入浅出哈希算法", link: "/topics/performance/hash_algorithm_complete_guide" },
      ],
    },
  ],

  // 保留原有的其他侧边栏配置
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
