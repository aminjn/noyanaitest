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
import LocationIcon from "@/Components/Icons/LocationIcon";
import PointPicker from "../UI/PointPicker";
import useForm from "@/Components/Hooks/useForm";
import Form from "@/Components/UI/Form";
import FormActions from "../UI/FormActions";

const ClinicLocationManager = ({
  node,
  mutate,
}: {
  node: IClinic;
  mutate: () => unknown;
}) => {
  const { setInput, submit, isLoading } = useForm<{ coords: [number, number] }>(
    {
      path: `${API}/auto/clinic/${node._id}`,
      method: "POST",
      hasProblem: (inp) => (!inp.coords ? "یک موقعیت را انتخاب کنید" : false),
      mutator: (inp) => ({
        location: { type: "Point", coordinates: inp.coords },
      }),
      successCb: () => mutate(),
    },
  );

  return (
    <Form>
      <PointPicker
        onChange={(e) => setInput((prev) => ({ ...prev, coords: e }))}
        defaultValue={node.location?.coordinates}
      />
      <FormActions>
        <Button type="submit" onClick={submit} isLoading={isLoading}>
          تایید
        </Button>
      </FormActions>
    </Form>
  );
};

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
                title: "لوکیشن",
                id: "GEO",
                icon: <LocationIcon />,
                content: <ClinicLocationManager mutate={mutate} node={data} />,
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
