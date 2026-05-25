"use client";

import useSWR from "swr";
import classes from "./AdminManageClinicPage.module.css";
import { IClinic } from "./AdminManageClinicsPage";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import ClinicInfoTab from "./ClinicInfoTab";
import ClinicDepartmentsTab from "./ClinicDepartmentsTab";
import ClinicDoctorsTab from "./ClinicDoctorsTab";
import ClinicUserTab from "./ClinicUserTab";
import List from "../UI/List";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteClinicPopup from "./DeleteClinicPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";

const AdminManageClinicPage = () => {
  const params = useParams<{ nodeId: string }>();

  const { data, error, mutate } = useSWR<IClinic>(
    params ? `${API}/auto/clinic/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            items={[
              {
                title: "اطلاعات",
                icon: <InfoIcon />,
                id: "Info",
                content: <ClinicInfoTab clinic={data} mutate={mutate} />,
              },
              {
                title: "یوزر",
                content: <ClinicUserTab node={data} mutate={mutate} />,

                icon: <InfoIcon />,
                id: "User",
              },
              {
                title: "دپارتمان ها",
                icon: <InfoIcon />,
                id: "Departments",
                content: <ClinicDepartmentsTab clinic={data} />,
              },
              {
                title: "پزشکان",
                icon: <InfoIcon />,
                content: <ClinicDoctorsTab clinic={data} />,
                id: "Doctors",
              },
              {
                title: "عملیات",
                icon: <InfoIcon />,
                id: "Actions",
                content: (
                  <List>
                    <Button
                      onClick={() =>
                        setPopup(
                          "DeleteClinic",
                          <DeleteClinicPopup
                            node={data}
                            mutate={() => push(adminPath("/clinic"))}
                          />,
                        )
                      }
                      variant="Error"
                      //TODO:Clean up coroutine to remove departments and doctor department relations server side
                    >
                      حذف کامل این کلینیک
                    </Button>
                  </List>
                ),
              },
            ]}
            name="AdminManageClinic"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageClinicPage;
