'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ZoomImage } from '@/components/ZoomImage'
import { GitHubHeatmap } from '@/components/GitHubHeatmap'
import { meContent } from '@/lib/site-content'
import type { Activity } from 'react-activity-calendar'

export function MeClientPage() {
  const [githubData, setGithubData] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://github-contributions-api.jogruber.de/v4/minorcell?y=last')
      .then((res) => res.json())
      .then((data) => {
        setGithubData(data.contributions || [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pixel-green)] font-pixel text-[10px] text-white uppercase tracking-wider">
          <span>ABOUT</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl text-[var(--pixel-dark)] tracking-wider">
          {meContent.title}
        </h1>
      </div>

      {/* Profile Card */}
      <div className="pixel-border mb-8 bg-white">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative w-32 h-32 pixel-border border-[var(--pixel-cyan)] bg-white">
                <ZoomImage
                  src={meContent.avatar}
                  alt="mCell 头像"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-medium text-[var(--pixel-dark)] mb-2">
                {meContent.name}
              </h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                {meContent.headline}
                {meContent.bio.map((line) => (
                  <span key={line}>
                    <br />
                    {line}
                  </span>
                ))}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {meContent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs border border-[var(--border)] text-[var(--muted-foreground)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                <span className="text-[var(--muted-foreground)]">
                  主业: <span className="text-[var(--pixel-dark)]">{meContent.role}</span>
                </span>
                <span className="text-[var(--muted-foreground)]">
                  位置: <span className="text-[var(--pixel-dark)]">{meContent.location}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-pixel text-sm text-[var(--pixel-dark)] tracking-wider">技术栈</h2>
          <div className="flex-1 h-1 bg-gradient-to-r from-[var(--pixel-purple)] to-transparent" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {meContent.skills.map((skill) => (
            <div key={skill.name} className="pixel-border p-4 bg-white">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[var(--pixel-dark)]">{skill.name}</span>
                <span className="text-sm text-[var(--pixel-cyan)] font-pixel">{skill.level}%</span>
              </div>
              <div className="h-3 bg-[var(--muted)] border border-[var(--border)]">
                <motion.div
                  className="h-full transition-all duration-1000"
                  style={{ backgroundColor: skill.color, width: `${skill.level}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-[var(--muted-foreground)] mt-4 text-center">
          * 百分比代表熟练度和使用频率，不完全准确，仅供参考
        </p>
      </div>

      {/* Social Links */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-pixel text-sm text-[var(--pixel-dark)] tracking-wider">联系方式</h2>
          <div className="flex-1 h-1 bg-gradient-to-r from-[var(--pixel-blue)] to-transparent" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {meContent.socials.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-4 p-4 pixel-border hover:border-[var(--pixel-cyan)] transition-all hover:translate-x-1 group bg-white"
              data-pixel-click
            >
              <span className="w-10 h-10 flex items-center justify-center bg-[var(--pixel-blue)] text-white font-pixel text-[10px] group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <div className="flex-1">
                <div className="text-[var(--pixel-dark)] font-medium">{item.label}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{item.note}</div>
              </div>
              <span className="text-[var(--pixel-cyan)] group-hover:text-[var(--pixel-yellow)] transition-colors">
                &gt;
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* GitHub Heatmap */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-pixel text-sm text-[var(--pixel-dark)] tracking-wider">GitHub 活动</h2>
          <div className="flex-1 h-1 bg-gradient-to-r from-[var(--pixel-green)] to-transparent" />
        </div>

        <div className="pixel-border p-4 bg-white">
          {loading ? (
            <div className="text-center py-8 text-[var(--muted-foreground)]">
              加载中...
            </div>
          ) : (
            <GitHubHeatmap
              username="minorcell"
              initialData={githubData}
              compact
              className="mt-0"
            />
          )}
        </div>
      </div>
    </div>
  )
}
