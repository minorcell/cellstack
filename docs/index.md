---
layout: home
hero:
  name: "CellStack"
  text: "工程师的技术笔记"
  tagline: "从零到落地，涵盖前端、后端、DevOps 工程实践"
  image:
    src: /logo.svg
    alt: CellStack 手绘插图
  actions:
    - text: 预览博客
      link: /blog/
---

<div class="home-content">

## 什么是 CellStack

这里不仅仅是技术文档的堆砌，而是一个有温度的知识分享平台。我相信技术应该是**简洁而优雅**的，就像这个网站的设计一样。

### 核心理念

简洁至上 — 复杂的概念用最简单的方式表达。

实践导向 — 每个知识点都来自真实项目经验。

持续更新 — 技术变化，知识库也在不断完善。

</div>

<style>
.home-content {
  max-width: 768px;
  margin: 4rem auto 0;
  padding: 0 2rem;
  color: var(--vp-c-text-1);
}

.home-content h2 {
  font-size: 2rem;
  font-weight: 600;
  margin: 3rem 0 1.5rem 0;
  text-align: center;
  letter-spacing: -0.02em;
  border: none;
}

.home-content h3 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 2.5rem 0 1rem 0;
  color: var(--vp-c-brand-1);
}

.home-content p {
  font-size: 1.125rem;
  line-height: 1.8;
  margin: 1.5rem 0;
  text-align: center;
  color: var(--vp-c-text-2);
}

/* 响应式设计 */
@media (max-width: 960px) {
  .custom-hero {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
    padding: 3rem 1rem;
  }

  .hero-content {
    flex-direction: column;
    gap: 2rem;
  }

  .hero-illustration {
    flex: none;
  }

  .main-illustration {
    width: 250px;
    height: 300px;
  }
}

@media (max-width: 960px) {
  .VPHomeHero .container {
    flex-direction: column !important;
    text-align: center !important;
    gap: 2rem !important;
  }

  .VPHomeHero .image {
    order: -1 !important;
    flex: none !important;
  }

  .VPHomeHero .main {
    max-width: none !important;
  }
}

@media (max-width: 768px) {
  .home-content {
    padding: 0 1rem;
    margin-top: 2rem;
  }

  .home-content h2 {
    font-size: 1.75rem;
  }

  .home-content p {
    font-size: 1rem;
  }

  .VPHomeHero .container {
    padding: 2rem 1rem !important;
  }

  .VPHomeHero .image {
    flex: 0 0 280px !important;
  }

  .VPHomeHero .image img,
  .VPHomeHero .image svg {
    width: 280px;
    height: 200px;
  }
}
</style>
