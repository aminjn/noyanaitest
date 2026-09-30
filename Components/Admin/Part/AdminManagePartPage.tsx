"use client";

import useSWR from "swr";
import { IPart } from "../Disease/AdminManageDiseasesPage";
import { useParams } from "next/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm from "../UI/CreateForm";
import List from "../UI/List";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import DeletePartPopup from "./DeletePartPopup";
import { adminPath } from "@/Components/helpers/adminPath";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManagePartPage = () => {
  const { nodeId } = useParams();
  const { data, error, mutate } = useSWR<IPart>(
    nodeId ? `${API}/auto/part/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManagePart"
            items={[
              {
                title: ta("جزئیات"),
                id: "Info",
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/part/${data._id}`,
                      method: "POST",
                      successCb: () => {
                        mutate();
                      },
                    }}
                    renderer={{
                      name: { title: ta("نام"), type: "text" },
                      order: { title: ta("رتبه"), type: "number" },
                    }}
                  />
                ),
              },
              {
                title: ta("عملیات"),
                id: "Actions",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <Button
                      onClick={() =>
                        setPopup(
                          "DeletePart",
                          <DeletePartPopup
                            node={data}
                            mutate={() => push(adminPath("/part"))}
                          />
                        )
                      }
                    >
                      {ta("حذف")}
                    </Button>
                  </List>
                ),
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManagePartPage;
