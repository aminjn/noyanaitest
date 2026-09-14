import { redirect } from "next/navigation";

// Old dynamic-segment pagination route, retired 2026-09 in favor of query-param
// pagination on app/doctors/page.tsx (matches the app/disease convention).
// Kept as a redirect - rather than deleted outright - so any bookmarked or
// indexed /doctors/N links keep working. TODO: this folder can be deleted
// outright once nothing links to /doctors/[page] anymore (couldn't delete it
// directly here - the sandbox shell was unreachable this session).
const DoctorsListPageRedirect = async ({
  params,
}: {
  params: Promise<{ page: string }>;
}) => {
  const { page } = await params;
  redirect(`/doctors?page=${encodeURIComponent(page)}`);
};

export default DoctorsListPageRedirect;
