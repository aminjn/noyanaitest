import { permanentRedirect } from "next/navigation";

// /drug/status without a value: the directory itself
const Page = () => permanentRedirect("/drug");

export default Page;
