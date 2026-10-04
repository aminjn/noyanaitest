import { permanentRedirect } from "next/navigation";

// /disease/letter without a value: the directory itself
const Page = () => permanentRedirect("/disease");

export default Page;
