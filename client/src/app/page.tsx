import LoginExperience from "@/features/auth/components/LoginExperience";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string | string[] }>;
}) {
  const query = await searchParams;
  const workspaceValue = Array.isArray(query.workspace) ? query.workspace[0] : query.workspace;
  const initialWorkspace = String(workspaceValue || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  return <LoginExperience initialWorkspace={initialWorkspace} />;
}
