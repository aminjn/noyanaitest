import { Metadata } from "next";
import PublicCrmForm from "@/Components/CrmPublic/PublicCrmForm";

// a centre's own link to one person: never indexed
export const metadata: Metadata = { robots: { index: false, follow: false } };

const Page = ({ params }: { params: { slug: string } }) => <PublicCrmForm mode="request" slug={params.slug} />;

export default Page;
