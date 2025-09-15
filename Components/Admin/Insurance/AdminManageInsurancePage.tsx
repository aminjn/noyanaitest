"use client";

import useSWR from "swr";
import TabSystem from "../UI/TabSystem";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import { useParams } from "next/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm from "../UI/CreateForm";

const AdminManageInsurancePage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IInsurance>(
    params ? `${API}/auto/insurance/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManageInsurance"
            items={[
              {
                title: "جزئیات",
                id: "Info",
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    defaultValue={data}
                    renderer={{
                      name: {
                        title: "نام",
                        type: "text",
                      },
                      order: { title: "رتبه", type: "number" },
                      active: { title: "فعال", type: "bool" },
                    }}
                    hookProps={{
                      path: `${API}/auto/insurance/${data._id}`,
                      method: "POST",
                      successCb: () => {
                        mutate();
                      },
                    }}
                  />
                ),
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageInsurancePage;
