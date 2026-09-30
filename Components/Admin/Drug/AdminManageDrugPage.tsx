"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { IDrug } from "../Disease/AdminManageDiseasesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import DeleteDrugPopup from "./DeleetDrugPopup";
import { adminPath } from "@/Components/helpers/adminPath";
import { IDrugTag } from "../DrugTag/AdminManageDrugTagsPage";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageDrugPage = () => {
  const { nodeId } = useParams();
  const { data, error, mutate } = useSWR<IDrug>(
    nodeId ? `${API}/auto/drug/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={data.name || ta("بدون نام")}
          actions={[
            {
              title: ta("حذف"),
              danger: true,
              action: () =>
                setPopup(
                  "DeleteDrug",
                  <DeleteDrugPopup
                    mutate={() => push(adminPath(`/drug`))}
                    node={data}
                  />,
                ),
            },
          ]}
        >
          <TabSystem
            name="AdminManageDrug"
            items={[
              {
                title: ta("جزئیات"),
                id: "Info",
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    hookProps={{
                      method: "POST",
                      path: `${API}/auto/drug/${data._id}`,
                      successCb: () => mutate(),
                    }}
                    defaultValue={data}
                    renderer={{
                      name: { type: "text", title: ta("نام") },
                      summary: { type: "text", title: ta("خلاصه") },
                      description: { type: "area", title: ta("توضیحات") },
                      order: { type: "number", title: ta("رتبه") },
                      slug: { type: "text", title: ta("اسلاگ") },
                      image: { type: "image", title: ta("تصویر") },
                      brand: { type: "text", title: ta("برند") },
                      tag: {
                        type: "nodes",
                        multi: false,
                        title: ta("تگ"),
                        getOptionLabel: (node) =>
                          (node as IDrugTag).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as IDrugTag)._id,
                        path: `${API}/auto/drugTag`,
                        creatable: { path: `${API}/auto/drugTag` },
                        getDefaultValue: (inp) => inp.tag,
                      },
                      sameAs: {
                        type: "nodes",
                        title: ta("مشابهات"),
                        path: `${API}/auto/drug`,
                        getOptionLabel: (node) =>
                          (node as IDrug).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as IDrug)._id,
                        getDefaultValue: (inp) => inp.sameAs,
                        multi: true,
                      },
                      aiSummary: { type: "rtf", title: ta("خلاصه AI") },
                      content: { type: "rtf", title: ta("محتوا") },
                    }}
                  />
                ),
              },
              {
                title: ta("اطلاعات پزشکی"),
                icon: <InfoIcon />,
                id: "More",
                content: (
                  <CreateForm
                    defaultValue={data}
                    layout="sections"
                    hookProps={{
                      method: "POST",
                      path: `${API}/auto/drug/${data._id}`,
                      successCb: () => mutate(),
                    }}
                    renderer={{
                      alternateName: {
                        type: "text",
                        title: ta("نام دیگر"),
                        section: ta("مشخصات دارو"),
                      },
                      activeIngridient: {
                        type: "text",
                        title: ta("ماده مؤثره"),
                        section: ta("مشخصات دارو"),
                      },
                      dosageForm: {
                        type: "text",
                        title: ta("شکل دارویی"),
                        section: ta("مشخصات دارو"),
                      },
                      drugUnit: {
                        type: "text",
                        title: ta("واحد"),
                        section: ta("مشخصات دارو"),
                      },
                      identifier: {
                        type: "text",
                        title: ta("شناسه"),
                        section: ta("مشخصات دارو"),
                      },
                      prescriptionStatus: {
                        type: "text",
                        title: ta("وضعیت نسخه"),
                        section: ta("مشخصات دارو"),
                      },
                      dosage: {
                        type: "text",
                        title: ta("دوز مصرفی"),
                        section: ta("مصرف و تجویز"),
                      },
                      adminstrationRoute: {
                        type: "text",
                        title: ta("راه مصرف"),
                        section: ta("مصرف و تجویز"),
                      },
                      prescribingInfo: {
                        type: "area",
                        title: ta("اطلاعات تجویز"),
                        section: ta("مصرف و تجویز"),
                      },
                      clinicalPharmacology: {
                        type: "area",
                        title: ta("فارماکولوژی بالینی"),
                        section: ta("مصرف و تجویز"),
                      },
                      overdosage: {
                        type: "area",
                        title: ta("مصرف بیش از حد"),
                        section: ta("مصرف و تجویز"),
                      },
                      sideEffects: {
                        type: "area",
                        title: ta("عوارض جانبی"),
                        section: ta("هشدار ها"),
                      },
                      warning: {
                        type: "area",
                        title: ta("هشدار"),
                        section: ta("هشدار ها"),
                      },
                      pregnancyWarning: {
                        type: "area",
                        title: ta("هشدار بارداری"),
                        section: ta("هشدار ها"),
                      },
                      breastfeedingWarning: {
                        type: "area",
                        title: ta("هشدار شیردهی"),
                        section: ta("هشدار ها"),
                      },
                      alcoholWarning: {
                        type: "area",
                        title: ta("هشدار الکل"),
                        section: ta("هشدار ها"),
                      },
                      foodWarning: {
                        type: "area",
                        title: ta("هشدار غذایی"),
                        section: ta("هشدار ها"),
                      },
                    }}
                  />
                ),
              },
              {
                title: ta("سئو"),
                icon: <InfoIcon />,
                id: "Meta",
                content: (
                  <PageMetaEditor resourceType="/drug/[slug]" slug={data.slug} />
                ),
              },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="drug" />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDrugPage;
