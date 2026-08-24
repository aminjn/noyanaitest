"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IParaClinic } from "@/Components/Layout/ParaClinicPanelLayout";
import useSWR from "swr";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import CreateForm from "../UI/CreateForm";
import { getUserLabel } from "../Lib/LabelGetters";
import { IUser } from "@/Components/Hooks/useUser";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import useProgress from "@/Components/Hooks/useProgress";
import PopupCard from "@/Components/UI/PopupCard";
import OrderEditor from "../UI/OrderEditor";

const CreateParaClinicPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  const push = useProgress();

  return (
    <PopupCard>
      <CreateForm<IParaClinic>
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/paraClinic`,
          method: "POST",
          successCb: (data) => {
            mutate();
            if (!data) return;
            push(
              adminPath(
                `/paraClinic/${(data as { data: { data: IParaClinic } }).data.data._id}`,
              ),
            );
            closePopup();
          },
        }}
        renderer={{
          name: { title: "نام", type: "text" },
          active: { title: "فعال", type: "bool" },
          order: { title: "رتبه", type: "number" },
          user: {
            title: "کاربر",
            type: "nodes",
            multi: false,
            getOptionLabel: (node) => getUserLabel(node as IUser),
            getOptionValue: (node) => (node as IUser)._id,
            path: `${API}/auto/user`,
          },
        }}
      />
    </PopupCard>
  );
};

const AdminManageParaClinicsPage = () => {
  const { data, error, mutate } = useSWR<
    IParaClinic<{ User: Record<never, never> }>[]
  >(`${API}/auto/paraClinic`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <WithTitle
      title="پاراکلینیک ها"
      actions={[
        {
          title: "جدید",
          action: () =>
            setPopup(
              "CreateParaClinic",
              <CreateParaClinicPopup mutate={mutate} />,
            ),
        },
      ]}
    >
      {!!data && (
        <Table
          data={data}
          name="AdminManageParaClinics"
          renderer={{
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            order: {
              name: "رتبه",
              value: (node) => node.order,
              filter: "Number",
              component: (node) => (
                <OrderEditor
                  value={node.order}
                  modelName="paraClinic"
                  _id={node._id}
                  mutate={mutate}
                />
              ),
            },
            active: {
              name: "فعال",
              value: (node) => booleanToValue[`${node.active}`],
              component: (node) => <BooleanToIcon value={node.active} />,
              filter: "Set",
            },
            user: {
              name: "کاربر",
              filter: "Text",
              value: (node) => node.user?.phone || "ندارد",
              component: (node) =>
                node.user ? (
                  <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                    {node.user.phone}
                  </InlineLink>
                ) : (
                  "ندارد"
                ),
            },
            actions: {
              name: "عملیات",
              component: (node) => (
                <TableActions>
                  <IconLink href={adminPath(`/paraClinic/${node._id}`)}>
                    <EyeIcon />
                  </IconLink>
                </TableActions>
              ),
            },
          }}
        />
      )}
    </WithTitle>
  );
};

export default AdminManageParaClinicsPage;
