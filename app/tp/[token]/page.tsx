import { Metadata } from "next";
import PublicPlanPage from "@/Components/CrmPublic/PublicPlanPage";

// a centre's own link to one person: never indexed
export const metadata: Metadata = { robots: { index: false, follow: false } };

const Page = ({ params }: { params: { token: string } }) => <PublicPlanPage token={params.token} />;

export default Page;
