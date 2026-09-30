import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";
import HandleLoading from "./HandleLoading";
import WithTitle from "./WithTitle";
import DeleteShitPopup from "./DeleteShitPopup";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { ta } from "@/Components/Admin/i18n/adminText";
import { ReactNode } from "react";

const NodeManager = <T,>({
  modelName,
  getTitle,
  content,
  deleteBackTo,
}: {
  modelName: string;
  getTitle: (node: T) => string;
  content: (args: { node: T; mutate: () => unknown }) => ReactNode;
  // admin path to open after the record is deleted (e.g. "/service?tab=packages");
  // when set, the header gets a «حذف» action behind a confirmation
  deleteBackTo?: string;
}) => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<T>(
    `${API}/auto/${modelName}/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );
  const { setPopup } = usePopup();
  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={getTitle(data) || ta("بدون نام")}
          actions={
            deleteBackTo
              ? [
                  {
                    title: ta("حذف"),
                    danger: true,
                    action: () =>
                      setPopup(
                        `Delete-${modelName}`,
                        <DeleteShitPopup
                          modelName={modelName}
                          nodeId={nodeId}
                          mutate={() => push(adminPath(deleteBackTo))}
                        />,
                      ),
                  },
                ]
              : undefined
          }
        >
          {content({ node: data, mutate })}
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default NodeManager;
