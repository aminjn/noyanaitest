import DirectoryRoute, {
  directoryMetadata,
  DirectorySearchParams,
} from "@/Components/Directory/DirectoryRoute";

// the symptom directory by letter (Components/Directory)
type Props = {
  params: { value: string };
  searchParams: DirectorySearchParams;
};

export const generateMetadata = ({ params, searchParams }: Props) =>
  directoryMetadata("symptom", "letter", params.value, searchParams);

const Page = ({ params, searchParams }: Props) => (
  <DirectoryRoute kind="symptom" type="letter" value={params.value} searchParams={searchParams} />
);

export default Page;
