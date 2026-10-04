import DirectoryRoute, {
  directoryMetadata,
  DirectorySearchParams,
} from "@/Components/Directory/DirectoryRoute";

// the disease directory by speciality (Components/Directory)
type Props = {
  params: { value: string };
  searchParams: DirectorySearchParams;
};

export const generateMetadata = ({ params, searchParams }: Props) =>
  directoryMetadata("disease", "speciality", params.value, searchParams);

const Page = ({ params, searchParams }: Props) => (
  <DirectoryRoute kind="disease" type="speciality" value={params.value} searchParams={searchParams} />
);

export default Page;
