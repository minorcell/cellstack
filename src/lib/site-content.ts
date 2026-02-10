import siteJson from '../../content/site/site.json'
import meJson from '../../content/site/me.json'

export interface SiteSection {
  label: string
  path: string
  description?: string
}

export interface SiteContent {
  name: string
  title: string
  url: string
  locale: string
  subtitle: string
  description: string
  keywords: string[]
  sections: SiteSection[]
  contact: {
    github?: string
    email?: string
  }
}

export interface MeSkill {
  name: string
  level: number
  color: string
}

export interface MeSocial {
  href: string
  icon: string
  label: string
  note?: string
}

export interface MeContent {
  name: string
  title: string
  avatar: string
  headline: string
  bio: string[]
  role: string
  location: string
  tags: string[]
  skills: MeSkill[]
  socials: MeSocial[]
}

export const siteContent = siteJson as SiteContent
export const meContent = meJson as MeContent
