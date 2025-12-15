import { MeClientPage } from './MeClientPage'

async function getGithubData(username: string) {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      { next: { revalidate: 3600 * 24 } } // Revalidate every 24 hours
    )
    if (!res.ok) return []
    const json = await res.json()
    return json.contributions ?? []
  } catch (e) {
    console.error('Failed to fetch github data server side', e)
    return []
  }
}

export default async function MePage() {
  const githubData = await getGithubData('minorcell')

  return <MeClientPage githubData={githubData} />
}
