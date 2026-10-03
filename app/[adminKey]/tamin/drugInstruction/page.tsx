import { redirect } from "next/navigation";

// one tab of the Tamin catalogs page since 2026-10
const Page = ({ params }: { params: { adminKey: string } }) =>
  redirect(`/${params.adminKey}/tamin?tab=drugInstruction`);

export default Page;
