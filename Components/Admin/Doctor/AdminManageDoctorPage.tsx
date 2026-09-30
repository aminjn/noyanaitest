"use client";

import { useParams } from "next/navigation";
import classes from "./AdminManageDoctorPage.module.css";
import useSWR from "swr";
import { API } from "@/Components/config";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import { IDoctor } from "./AdminManageDoctorsPage";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import AdminManageDoctorGalleryTab from "./AdminManageDoctorGalleryTab";
import AdminManageDoctorInfoTab from "./AdminManageDoctorInfoTab";

import { fetcher } from "@/Components/helpers/fetcher";
import AdminManageDoctorActionsTab from "./AdminManageDoctorActionsTab";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { ta } from "@/Components/Admin/i18n/adminText";
const AdminManageDoctorPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IDoctor<{
      SpecialityPopulated: Record<never, never>;
      SpecialitiesPopulated: Record<never, never>;
    }>
  >(params ? `${API}/auto/doctor/${params.nodeId}` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManageDoctor"
            items={[
              {
                title: ta("اطلاعات"),
                icon: <InfoIcon />,
                id: "Info",
                content: (
                  <AdminManageDoctorInfoTab node={data} mutate={mutate} />
                ),
              },
              ...(hasAccess("GalleryItem", "readAll")
                ? [
                    {
                      title: ta("گالری"),
                      id: "Gallery",
                      content: <AdminManageDoctorGalleryTab node={data} />,
                      icon: <InfoIcon />,
                    },
                  ]
                : []),
              {
                title: ta("متادیتا"),
                id: "Meta",
                icon: <InfoIcon />,
                content: (
                  <PageMetaEditor
                    resourceType="/doctor/[slug]"
                    slug={data.slug}
                  />
                ),
              },
              {
                title: ta("عملیات"),
                id: "Actions",
                icon: <InfoIcon />,
                content: <AdminManageDoctorActionsTab node={data} />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDoctorPage;
