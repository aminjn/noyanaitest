"use client";

import useSWR from "swr";
import classes from "./AdminManageOldDiseasesPage.module.css";
import { IOldDisease } from "../Doctor/AdminManageOldDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";
import OrderEditor from "../../UI/OrderEditor";

const AdminManageOldDiseasesPage = () => {
  const { data, error, mutate } = useSWR<IOldDisease[]>(
    `${API}/old/disease`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          name="AdminManageOldDiseases"
          renderer={{
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            genderSpecific: {
              name: "مختص جنسیت",
              value: (node) => node.genderSpecific,
              filter: "Set",
            },
            naturalProgression: {
              name: "روند طبیعی",
              value: (node) => node.naturalProgression,
              filter: "Set",
            },
            order: {
              name: "رتبه",
              value: (node) => node.order,
              filter: "Number",
              component: (node) => (
                <OrderEditor
                  value={node.order}
                  _id={node._id}
                  mutate={mutate}
                  modelName="disease"
                />
              ),
            },
            _id: { name: "شناسه", value: (node) => node._id, filter: "Text" },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldDiseasesPage;
