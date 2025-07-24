"use client";

import useSWR from "swr";
import classes from "./AdminManageSpecialitiesPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import { MongoDoc } from "@/Components/Hooks/useUser";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import NewSpecialityPopup from "./NewSpecialityPopup";
import WithTitle from "../UI/WithTitle";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import Garbageicon from "@/Components/Icons/GarbageIcon";
import DeleteSpecialityPopup from "./DeletSpecialityPopup";
import InlineLink from "../UI/InlineLink";

export interface ISpeciality extends MongoDoc {
  name?: string;
  slug?: string;
  image?: string;
  isHome: boolean;
  order: number;
  summary?: string;
  active: boolean;
}

const AdminManageSpecialitiesPage = () => {
  const { data, error, mutate } = useSWR<ISpeciality[]>(
    `${API}/auto/speciality`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="تخصص ها"
          actions={[
            {
              title: "جدید",
              action: () => setPopup("NewSpeciality", <NewSpecialityPopup />),
            },
          ]}
        >
          <Table
            name="AdminManageSpecialities"
            renderer={{
              name: {
                value: (node) => node.name,
                name: "نام",
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/speciality/${node._id}`)}>
                    {node.name}
                  </InlineLink>
                ),
              },
              slug: {
                name: "اسلاگ",
                value: (node) => node.slug,
                filter: "Text",
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
              },
              isHome: {
                name: "نمایش در خانه",
                value: (node) => booleanToValue[`${node.isHome}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.isHome} />,
              },
              active: {
                name: "فعال است؟",
                value: (node) => booleanToValue[`${node.active}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.active} />,
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      variant="Info"
                      href={adminPath(`/speciality/${node._id}`)}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteSpeciality",
                          <DeleteSpecialityPopup node={node} mutate={mutate} />
                        )
                      }
                      variant="Danger"
                    >
                      <Garbageicon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
            data={data}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageSpecialitiesPage;
