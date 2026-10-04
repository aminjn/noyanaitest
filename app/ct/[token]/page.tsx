import { Metadata } from "next";
import PublicContractPage from "@/Components/CrmPublic/PublicContractPage";

// a centre's own link to one person: never indexed
export const metadata: Metadata = { robots: { index: false, follow: false } };

const Page = ({ params }: { params: { token: string } }) => <PublicContractPage token={params.token} />;

export default Page;
