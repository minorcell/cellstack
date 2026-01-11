'use client'

import { ArrowUpRight, BookOpen, Gamepad2, Github, Mail } from 'lucide-react'
import type { Activity } from 'react-activity-calendar'
import { ZoomImage } from '@/components/ZoomImage'
import { GitHubHeatmap } from '@/components/GitHubHeatmap'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@/components/ui'

const socials = [
  {
    href: 'https://github.com/minorcell',
    icon: Github,
    label: 'GitHub',
    note: '代码与实验',
  },
  {
    href: 'https://juejin.cn/user/2280829967146779',
    icon: BookOpen,
    label: '掘金',
    note: '写作与笔记',
  },
  {
    href: 'mailto:minorcell6789@gmail.com',
    icon: Mail,
    label: 'Email',
    note: '聊合作或想法',
  },
  {
    href: 'https://steamcommunity.com/profiles/76561199379749961/',
    icon: Gamepad2,
    label: 'Steam',
    note: '游戏号',
  },
]

const tags = ['Full Stack', 'DevOps', 'Prompt/Agent', 'DX']

interface MeClientPageProps {
  githubData: Activity[]
}

export function MeClientPage({ githubData }: MeClientPageProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16 space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary" className="px-3 py-1 text-xs">
          关于我
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
          mCell / minorcell
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground max-w-3xl">
          全栈工程师，偏爱 TypeScript + Go。比起炫技，更关注交付速度、可维护性、和现场体验。
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="border-border/80">
          <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-xl border border-border/70">
                <ZoomImage
                  src="https://avatars.githubusercontent.com/u/120795714"
                  alt="mCell 头像"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  写代码，也写点生活与想法。
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  做过前后端、工具链、部署与团队协作，正在把工程实践写成公开笔记。
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="rounded-full text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase text-muted-foreground">Stack</p>
                <p className="text-sm font-semibold text-foreground">
                  TypeScript / Go
                </p>
                <p className="text-sm text-muted-foreground">
                  Web · Agents · DevOps
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-muted-foreground">Focus</p>
                <p className="text-sm font-semibold text-foreground">
                  DX & 系统化
                </p>
                <p className="text-sm text-muted-foreground">
                  速度 · 可靠 · 可观察
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">联系我</CardTitle>
            <CardDescription>代码、产品、游戏都可以聊。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {socials.map((item, idx) => (
              <div key={item.href}>
                {idx > 0 && <Separator className="my-2" />}
                <Button
                  variant="ghost"
                  className="w-full justify-between px-3 py-2 text-sm"
                  asChild
                >
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={
                      item.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-2 text-foreground">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="hidden sm:inline">{item.note}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">GitHub 热力图</CardTitle>
          <CardDescription>最近一年的提交记录（每天自动更新）。</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <GitHubHeatmap
            username="minorcell"
            initialData={githubData}
            compact
            className="mt-0"
          />
        </CardContent>
      </Card>
    </div>
  )
}
