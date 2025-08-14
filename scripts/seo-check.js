#!/usr/bin/env node
// CellStack 自动化SEO检查脚本
// 用于构建时验证SEO配置的完整性

const fs = require('fs');
const path = require('path');

class SEOChecker {
  constructor() {
    this.siteUrl = 'https://stack.mcell.top';
    this.docsPath = path.join(__dirname, '../docs');
    this.publicPath = path.join(this.docsPath, 'public');
    this.configPath = path.join(this.docsPath, '.vitepress/config.js');
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  // 主检查流程
  async runChecks() {
    console.log('🔍 CellStack SEO 自动化检查启动...\n');

    this.checkConfigFile();
    this.checkRequiredFiles();
    this.checkSitemap();
    this.checkRobotsTxt();
    this.checkManifest();
    this.checkFavicons();
    this.validateMetaTags();
    this.checkStructuredData();

    this.printResults();
    return this.errors.length === 0;
  }

  // 检查VitePress配置文件
  checkConfigFile() {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.errors.push('VitePress配置文件不存在');
        return;
      }

      const configContent = fs.readFileSync(this.configPath, 'utf8');

      // 检查必要的SEO配置
      const requiredConfigs = [
        { key: 'title:', description: '站点标题' },
        { key: 'description:', description: '站点描述' },
        { key: 'sitemap:', description: '站点地图配置' },
        { key: 'og:title', description: 'Open Graph标题' },
        { key: 'og:description', description: 'Open Graph描述' },
        { key: 'twitter:card', description: 'Twitter卡片' },
        { key: 'application/ld+json', description: '结构化数据' }
      ];

      requiredConfigs.forEach(config => {
        if (configContent.includes(config.key)) {
          this.successes.push(`✓ ${config.description}配置已找到`);
        } else {
          this.warnings.push(`⚠️ 建议添加${config.description}配置`);
        }
      });

      // 检查域名配置
      if (configContent.includes(this.siteUrl)) {
        this.successes.push('✓ 正确的域名配置');
      } else {
        this.errors.push(`❌ 配置文件中未找到正确的域名: ${this.siteUrl}`);
      }

      // 检查favicon配置
      if (configContent.includes('logo.svg')) {
        this.successes.push('✓ favicon配置正确');
      } else {
        this.warnings.push('⚠️ favicon配置可能需要更新');
      }

    } catch (error) {
      this.errors.push(`配置文件检查失败: ${error.message}`);
    }
  }

  // 检查必要文件
  checkRequiredFiles() {
    const requiredFiles = [
      { path: 'robots.txt', critical: true },
      { path: 'sitemap.xml', critical: true },
      { path: 'manifest.json', critical: false },
      { path: 'logo.svg', critical: true },
      { path: 'browserconfig.xml', critical: false },
      { path: 'google-site-verification.html', critical: false },
      { path: 'baidu_verify.html', critical: false }
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(this.publicPath, file.path);
      if (fs.existsSync(filePath)) {
        this.successes.push(`✓ ${file.path} 文件存在`);
      } else {
        if (file.critical) {
          this.errors.push(`❌ 缺少关键文件: ${file.path}`);
        } else {
          this.warnings.push(`⚠️ 建议添加文件: ${file.path}`);
        }
      }
    });
  }

  // 检查sitemap.xml
  checkSitemap() {
    const sitemapPath = path.join(this.publicPath, 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) {
      this.errors.push('❌ sitemap.xml 文件不存在');
      return;
    }

    try {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

      // 检查必要的URL
      const requiredUrls = [
        `${this.siteUrl}/`,
        `${this.siteUrl}/language-basics/`,
        `${this.siteUrl}/engineering-practice/`,
        `${this.siteUrl}/blog/`
      ];

      requiredUrls.forEach(url => {
        if (sitemapContent.includes(url)) {
          this.successes.push(`✓ sitemap包含: ${url}`);
        } else {
          this.warnings.push(`⚠️ sitemap缺少URL: ${url}`);
        }
      });

      // 检查XML格式
      if (sitemapContent.includes('<?xml version="1.0"') && sitemapContent.includes('<urlset')) {
        this.successes.push('✓ sitemap.xml 格式正确');
      } else {
        this.errors.push('❌ sitemap.xml 格式不正确');
      }

      // 检查最后修改时间格式
      const lastmodPattern = /<lastmod>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      if (lastmodPattern.test(sitemapContent)) {
        this.successes.push('✓ sitemap lastmod 时间格式正确');
      } else {
        this.warnings.push('⚠️ 建议使用ISO 8601格式的lastmod时间');
      }

    } catch (error) {
      this.errors.push(`sitemap.xml 检查失败: ${error.message}`);
    }
  }

  // 检查robots.txt
  checkRobotsTxt() {
    const robotsPath = path.join(this.publicPath, 'robots.txt');
    if (!fs.existsSync(robotsPath)) {
      this.errors.push('❌ robots.txt 文件不存在');
      return;
    }

    try {
      const robotsContent = fs.readFileSync(robotsPath, 'utf8');

      // 检查必要配置
      const requiredRobotConfigs = [
        'User-agent: *',
        'Allow: /',
        `Sitemap: ${this.siteUrl}/sitemap.xml`,
        `Host: ${this.siteUrl.replace('https://', '')}`
      ];

      requiredRobotConfigs.forEach(config => {
        if (robotsContent.includes(config)) {
          this.successes.push(`✓ robots.txt 包含: ${config}`);
        } else {
          this.warnings.push(`⚠️ robots.txt 缺少: ${config}`);
        }
      });

      // 检查是否允许重要路径
      const importantPaths = ['/language-basics/', '/engineering-practice/', '/blog/'];
      importantPaths.forEach(pathItem => {
        if (robotsContent.includes(`Allow: ${pathItem}`) || robotsContent.includes('Allow: /')) {
          this.successes.push(`✓ robots.txt 允许爬取: ${pathItem}`);
        } else {
          this.warnings.push(`⚠️ robots.txt 未明确允许: ${pathItem}`);
        }
      });

    } catch (error) {
      this.errors.push(`robots.txt 检查失败: ${error.message}`);
    }
  }

  // 检查manifest.json
  checkManifest() {
    const manifestPath = path.join(this.publicPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      this.warnings.push('⚠️ manifest.json 文件不存在');
      return;
    }

    try {
      const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // 检查必要字段
      const requiredFields = ['name', 'short_name', 'description', 'start_url', 'display', 'theme_color', 'background_color', 'icons'];

      requiredFields.forEach(field => {
        if (manifestContent[field]) {
          this.successes.push(`✓ manifest包含: ${field}`);
        } else {
          this.warnings.push(`⚠️ manifest缺少: ${field}`);
        }
      });

      // 检查图标配置
      if (manifestContent.icons && manifestContent.icons.length > 0) {
        const hasSimpleLogo = manifestContent.icons.some(icon =>
          icon.src.includes('logo.svg')
        );
        if (hasSimpleLogo) {
          this.successes.push('✓ manifest图标配置正确');
        } else {
          this.warnings.push('⚠️ manifest图标未使用logo.svg');
        }
      }

    } catch (error) {
      this.errors.push(`manifest.json 检查失败: ${error.message}`);
    }
  }

  // 检查favicon文件
  checkFavicons() {
    const logoPath = path.join(this.publicPath, 'logo.svg');

    if (fs.existsSync(logoPath)) {
      this.successes.push('✓ logo.svg 文件存在');

      // 检查SVG内容
      try {
        const svgContent = fs.readFileSync(logoPath, 'utf8');
        if (svgContent.includes('<svg') && svgContent.includes('viewBox')) {
          this.successes.push('✓ SVG logo 格式正确');
        } else {
          this.warnings.push('⚠️ SVG logo 格式可能有问题');
        }
      } catch (error) {
        this.errors.push(`SVG logo 检查失败: ${error.message}`);
      }
    } else {
      this.errors.push('❌ logo.svg 文件不存在');
    }
  }

  // 验证meta标签（通过配置文件）
  validateMetaTags() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');

      // 检查关键meta标签
      const criticalMetas = [
        { tag: 'viewport', critical: true },
        { tag: 'theme-color', critical: true },
        { tag: 'description', critical: true },
        { tag: 'og:title', critical: true },
        { tag: 'og:description', critical: true },
        { tag: 'og:url', critical: true },
        { tag: 'twitter:card', critical: false }
      ];

      criticalMetas.forEach(meta => {
        if (configContent.includes(meta.tag)) {
          this.successes.push(`✓ ${meta.tag} meta标签配置正确`);
        } else {
          if (meta.critical) {
            this.errors.push(`❌ 缺少关键meta标签: ${meta.tag}`);
          } else {
            this.warnings.push(`⚠️ 建议添加meta标签: ${meta.tag}`);
          }
        }
      });

    } catch (error) {
      this.errors.push(`Meta标签检查失败: ${error.message}`);
    }
  }

  // 检查结构化数据
  checkStructuredData() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');

      // 检查JSON-LD结构化数据
      const structuredDataTypes = [
        { type: 'WebSite', description: '网站基础信息' },
        { type: 'EducationalOrganization', description: '教育机构信息' }
      ];

      structuredDataTypes.forEach(data => {
        if (configContent.includes(`"@type": "${data.type}"`)) {
          this.successes.push(`✓ ${data.description} 结构化数据配置正确`);
        } else {
          this.warnings.push(`⚠️ 建议添加 ${data.description} 结构化数据`);
        }
      });

      // 检查域名配置
      if (configContent.includes(this.siteUrl)) {
        this.successes.push('✓ 结构化数据中域名配置正确');
      } else {
        this.errors.push('❌ 结构化数据中域名配置错误');
      }

    } catch (error) {
      this.errors.push(`结构化数据检查失败: ${error.message}`);
    }
  }

  // 打印检查结果
  printResults() {
    console.log('\n📊 SEO 检查结果报告\n');
    console.log('='.repeat(50));

    if (this.successes.length > 0) {
      console.log('\n✅ 通过的检查项:');
      this.successes.forEach(success => console.log(`   ${success}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告项 (建议优化):');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ 错误项 (必须修复):');
      this.errors.forEach(error => console.log(`   ${error}`));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`总结: ${this.successes.length} 项通过, ${this.warnings.length} 项警告, ${this.errors.length} 项错误`);

    if (this.errors.length === 0) {
      console.log('🎉 SEO配置检查通过！网站已为搜索引擎优化！');
    } else {
      console.log('🔧 请修复上述错误后重新检查。');
    }

    console.log('\n💡 提示: 构建完成后可以使用以下工具进一步验证:');
    console.log('   - Google PageSpeed Insights');
    console.log('   - Google Search Console');
    console.log('   - 百度站长平台');
    console.log('   - Lighthouse SEO审计');
    console.log(`   - 在线SEO检测: https://www.seoptimer.com/stack.mcell.top`);
  }

  // 生成SEO检查清单
  generateChecklist() {
    const checklist = `
# CellStack SEO 优化清单

## 📋 基础SEO配置
- [${this.hasConfig('title') ? 'x' : ' '}] 页面标题优化 (30-60字符)
- [${this.hasConfig('description') ? 'x' : ' '}] Meta描述优化 (120-160字符)
- [${this.hasConfig('og:title') ? 'x' : ' '}] Open Graph配置
- [${this.hasConfig('twitter:card') ? 'x' : ' '}] Twitter Cards配置
- [${fs.existsSync(path.join(this.publicPath, 'robots.txt')) ? 'x' : ' '}] robots.txt文件
- [${fs.existsSync(path.join(this.publicPath, 'sitemap.xml')) ? 'x' : ' '}] sitemap.xml文件

## 🖼️ 媒体优化
- [${fs.existsSync(path.join(this.publicPath, 'logo.svg')) ? 'x' : ' '}] favicon配置
- [ ] 图片alt属性检查
- [ ] 图片压缩优化
- [ ] WebP格式支持

## 📱 移动端优化
- [${this.hasConfig('viewport') ? 'x' : ' '}] viewport meta标签
- [${this.hasConfig('theme-color') ? 'x' : ' '}] 主题色配置
- [${fs.existsSync(path.join(this.publicPath, 'manifest.json')) ? 'x' : ' '}] PWA manifest
- [ ] 移动端友好性测试

## 🔍 结构化数据
- [${this.hasConfig('application/ld+json') ? 'x' : ' '}] JSON-LD结构化数据
- [${this.hasConfig('WebSite') ? 'x' : ' '}] 网站信息Schema
- [${this.hasConfig('EducationalOrganization') ? 'x' : ' '}] 教育机构Schema
- [ ] 面包屑导航Schema
- [ ] 文章页面Schema

## ⚡ 性能优化
- [ ] 图片懒加载
- [ ] 关键资源预加载
- [ ] 代码分割优化
- [ ] CDN配置
- [ ] 缓存策略

## 🔗 外部验证
- [ ] Google Search Console验证
- [ ] 百度站长平台验证
- [ ] Bing Webmaster Tools验证
- [ ] Google Analytics配置
- [ ] 百度统计配置

## 📊 监控工具
- [ ] 设置Google Search Console
- [ ] 配置Core Web Vitals监控
- [ ] 设置页面加载性能监控
- [ ] 搜索排名监控

---
生成时间: ${new Date().toLocaleString('zh-CN')}
站点地址: ${this.siteUrl}
    `.trim();

    console.log('\n📋 生成完整SEO优化清单:\n');
    console.log(checklist);

    // 保存到文件
    const checklistPath = path.join(__dirname, '../docs/SEO-CHECKLIST.md');
    fs.writeFileSync(checklistPath, checklist);
    console.log(`\n💾 清单已保存到: ${checklistPath}`);

    return checklist;
  }

  // 辅助方法：检查配置是否存在
  hasConfig(key) {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      return configContent.includes(key);
    } catch {
      return false;
    }
  }

  // 生成sitemap更新脚本
  generateSitemapUpdateScript() {
    const script = `#!/bin/bash
# CellStack Sitemap 自动更新脚本

echo "🔄 更新sitemap.xml..."

# 获取当前时间
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S+08:00")

# 更新sitemap中的lastmod时间
sed -i.bak "s/<lastmod>.*<\\/lastmod>/<lastmod>$TIMESTAMP<\\/lastmod>/g" docs/public/sitemap.xml

echo "✅ sitemap.xml 已更新时间戳: $TIMESTAMP"

# 验证XML格式
if command -v xmllint &> /dev/null; then
    echo "🔍 验证XML格式..."
    if xmllint --noout docs/public/sitemap.xml; then
        echo "✅ sitemap.xml 格式验证通过"
    else
        echo "❌ sitemap.xml 格式验证失败"
        exit 1
    fi
else
    echo "⚠️ 未安装xmllint，跳过XML格式验证"
fi

echo "🎉 sitemap更新完成！"
`;

    const scriptPath = path.join(__dirname, 'update-sitemap.sh');
    fs.writeFileSync(scriptPath, script);
    fs.chmodSync(scriptPath, '755');

    console.log(`\n🔧 sitemap更新脚本已生成: ${scriptPath}`);
    console.log('使用方法: ./scripts/update-sitemap.sh');
  }
}

// 主执行函数
async function main() {
  const checker = new SEOChecker();

  try {
    const passed = await checker.runChecks();

    // 生成检查清单
    checker.generateChecklist();

    // 生成sitemap更新脚本
    checker.generateSitemapUpdateScript();

    console.log('\n🛠️  SEO工具使用指南:');
    console.log('1. 开发时运行: npm run seo:check');
    console.log('2. 部署前运行: npm run seo:validate');
    console.log('3. 在浏览器控制台使用: window.CellStackSEO.generateReport()');

    // 返回状态码
    process.exit(passed ? 0 : 1);

  } catch (error) {
    console.error('❌ SEO检查过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 如果作为主脚本运行
if (require.main === module) {
  main();
}

module.exports = { SEOChecker };
