import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useSWR from "swr";
import HandleLoading from "./HandleLoading";
import WithTitle from "./WithTitle";
import CreateShitPopup from "./CreateShitPopup";
import { FormRenderer } from "./CreateForm";
import Table, { TableRenderer } from "./Table";

const NodesManager = <T,>({
  modelName,
  title,
  create,
  table,
}: {
  modelName: string;
  title: string;
  create?: FormRenderer<T>;
  table: (args: { mutate: () => unknown }) => TableRenderer<T>;
}) => {
  const { data, error, mutate } = useSWR<T[]>(
    `${API}/auto/${modelName}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={title}
          actions={
            create
              ? [
                  {
                    title: "جدید",
                    action: () =>
                      setPopup(
                        "CreateShit",
                        <CreateShitPopup
                          modelName={modelName}
                          title={title}
                          renderer={create}
                          mutate={mutate}
                        />,
                      ),
                  },
                ]
              : []
          }
        >
          <Table
            name={`AdminManage${modelName}s`}
            data={data}
            renderer={table({ mutate })}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default NodesManager;
