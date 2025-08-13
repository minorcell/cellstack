#!/bin/bash
# CellStack Sitemap 自动更新脚本

echo "🔄 更新sitemap.xml..."

# 获取当前时间
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S+08:00")

# 更新sitemap中的lastmod时间
sed -i.bak "s/<lastmod>.*<\/lastmod>/<lastmod>$TIMESTAMP<\/lastmod>/g" docs/public/sitemap.xml

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
