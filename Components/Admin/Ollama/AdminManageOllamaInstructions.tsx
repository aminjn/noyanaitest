import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import useSWR, { mutate } from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import Table from "../UI/Table";
import FormatDate, { dateToString } from "@/Components/UI/FormatDate";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import OrderEditor from "../UI/OrderEditor";

export type BotInstructionPopulation = Population<Record<never, never>>;

export interface IBotInstruction<
  T extends BotInstructionPopulation = BotInstructionPopulation,
> extends MongoDoc {
  content: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

const MutateBotInstructionPopup = ({
  mutate,
  node,
}: {
  node?: IBotInstruction;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm
        onCancel={() => {
          closePopup();
        }}
        defaultValue={node}
        hookProps={{
          path: `${API}/auto/botInstruction${!!node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{
          order: { title: "رتبه", type: "number" },
          isActive: { title: "فعال", type: "bool" },
          content: { title: "دستور", type: "area" },
        }}
      />
    </PopupCard>
  );
};

const DeleteBotInstructionPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IBotInstruction;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        message="آیا از حذف این آیتم مطمئنید؟"
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/botInstruction/${node._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

const AdminManageOllamaInstructions = () => {
  const { data, error, mutate } = useSWR<IBotInstruction[]>(
    `${API}/auto/botInstruction`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="دستورالعمل ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateBotInstruction",
                  <MutateBotInstructionPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageBotInstructions"
            renderer={{
              createdAt: {
                name: "زمان ایجاد",
                value: (node) => new Date(node.createdAt),
                component: (node) => <FormatDate value={node.createdAt} />,
                filter: "Date",
              },
              content: {
                name: "دستور",
                value: (node) => node.content,
                filter: "Text",
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    _id={node._id}
                    value={node.order}
                    modelName="botInstruction"
                    mutate={mutate}
                  />
                ),
              },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateBotInstruction",
                          <MutateBotInstructionPopup
                            mutate={mutate}
                            node={node}
                          />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteBotInstruction",
                          <DeleteBotInstructionPopup
                            mutate={mutate}
                            node={node}
                          />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageOllamaInstructions;
