import { permanentRedirect } from "next/navigation";
import DirectoryRoute, {
  directoryMetadata,
  DirectorySearchParams,
} from "@/Components/Directory/DirectoryRoute";

// the disease directory: A to Z and its facets (Components/Directory)
type Props = { searchParams: DirectorySearchParams & { category?: string } };

export const generateMetadata = ({ searchParams }: Props) =>
  directoryMetadata("disease", undefined, undefined, searchParams);

const Page = ({ searchParams }: Props) => {
  // the old ?category= filter has its own URL now
  if (searchParams.category)
    permanentRedirect(`/disease/category/${encodeURIComponent(searchParams.category)}`);
  return <DirectoryRoute kind="disease" searchParams={searchParams} />;
};

export default Page;
