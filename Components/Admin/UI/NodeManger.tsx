import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";
import HandleLoading from "./HandleLoading";
import WithTitle from "./WithTitle";
import { ReactNode } from "react";

const NodeManager = <T,>({
  modelName,
  getTitle,
  content,
}: {
  modelName: string;
  getTitle: (node: T) => string;
  content: (args: { node: T; mutate: () => unknown }) => ReactNode;
}) => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<T>(
    `${API}/auto/${modelName}/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getTitle(data)}>
          {content({ node: data, mutate })}
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default NodeManager;
