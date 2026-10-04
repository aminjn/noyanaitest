import { permanentRedirect } from "next/navigation";

// /disease/category without a value: the directory itself
const Page = () => permanentRedirect("/disease");

export default Page;
