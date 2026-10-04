import { permanentRedirect } from "next/navigation";
import DirectoryRoute, {
  directoryMetadata,
  DirectorySearchParams,
} from "@/Components/Directory/DirectoryRoute";

// the symptom directory: A to Z and its facets (Components/Directory)
type Props = { searchParams: DirectorySearchParams & { category?: string } };

export const generateMetadata = ({ searchParams }: Props) =>
  directoryMetadata("symptom", undefined, undefined, searchParams);

const Page = ({ searchParams }: Props) => {
  // the old ?category= filter has its own URL now
  if (searchParams.category)
    permanentRedirect(`/symptom/category/${encodeURIComponent(searchParams.category)}`);
  return <DirectoryRoute kind="symptom" searchParams={searchParams} />;
};

export default Page;
