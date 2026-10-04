import DirectoryRoute, {
  directoryMetadata,
  DirectorySearchParams,
} from "@/Components/Directory/DirectoryRoute";

// the drug directory by class (Components/Directory)
type Props = {
  params: { value: string };
  searchParams: DirectorySearchParams;
};

export const generateMetadata = ({ params, searchParams }: Props) =>
  directoryMetadata("drug", "class", params.value, searchParams);

const Page = ({ params, searchParams }: Props) => (
  <DirectoryRoute kind="drug" type="class" value={params.value} searchParams={searchParams} />
);

export default Page;
