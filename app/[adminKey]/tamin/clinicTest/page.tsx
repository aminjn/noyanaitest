import { redirect } from "next/navigation";

// one tab of the Tamin test page since 2026-10
const Page = ({ params }: { params: { adminKey: string } }) =>
  redirect(`/${params.adminKey}/tamin/test?tab=clinicTest`);

export default Page;
