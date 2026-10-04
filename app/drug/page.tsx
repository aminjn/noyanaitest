import { permanentRedirect } from "next/navigation";
import DirectoryRoute, {
  directoryMetadata,
  DirectorySearchParams,
} from "@/Components/Directory/DirectoryRoute";

// the drug directory: A to Z and its facets (Components/Directory)
type Props = { searchParams: DirectorySearchParams & { category?: string } };

export const generateMetadata = ({ searchParams }: Props) =>
  directoryMetadata("drug", undefined, undefined, searchParams);

const Page = ({ searchParams }: Props) => {
  return <DirectoryRoute kind="drug" searchParams={searchParams} />;
};

export default Page;
