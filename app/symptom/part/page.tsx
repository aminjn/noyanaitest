import { permanentRedirect } from "next/navigation";

// /symptom/part without a value: the directory itself
const Page = () => permanentRedirect("/symptom");

export default Page;
