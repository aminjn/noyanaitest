import DirectoryRoute, {
  directoryMetadata,
  DirectorySearchParams,
} from "@/Components/Directory/DirectoryRoute";

// the disease directory by part (Components/Directory)
type Props = {
  params: { value: string };
  searchParams: DirectorySearchParams;
};

export const generateMetadata = ({ params, searchParams }: Props) =>
  directoryMetadata("disease", "part", params.value, searchParams);

const Page = ({ params, searchParams }: Props) => (
  <DirectoryRoute kind="disease" type="part" value={params.value} searchParams={searchParams} />
);

export default Page;
