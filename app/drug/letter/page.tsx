import { permanentRedirect } from "next/navigation";

// /drug/letter without a value: the directory itself
const Page = () => permanentRedirect("/drug");

export default Page;
