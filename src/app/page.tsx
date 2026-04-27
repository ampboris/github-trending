import { RepoGrid } from '@/components/RepoGrid';
import { getInitialRepos } from '@/lib/getInitialRepos';

export default async function Home() {
  const initialRepos = await getInitialRepos();

  return <RepoGrid initialRepos={initialRepos} />;
}
