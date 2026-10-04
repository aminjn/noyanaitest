"use client";

import { useParams } from "next/navigation";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import { IDrug } from "../Disease/AdminManageDiseasesPage";
import { API } from "@/Components/config";
import InfoIcon from "@/Components/Icons/InfoIcon";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import DeleteDrugPopup from "./DeleetDrugPopup";
import { adminPath } from "@/Components/helpers/adminPath";
import { IDrugTag } from "../DrugTag/AdminManageDrugTagsPage";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminRecordEditor from "../UI/AdminRecordEditor";

// one form for a drug, new or existing (Components/Admin/UI/
// AdminRecordEditor): details and the medical sections, saved together
const AdminManageDrugPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { setPopup } = usePopup();
  const push = useProgress();
  const details = ta("جزئیات");

  return (
    <AdminRecordEditor<IDrug>
      segment="drug"
      path="/drug"
      nodeId={nodeId}
      newTitle={ta("داروی جدید")}
      titleOf={(node) => node.name || ""}
      actions={(node) => [
        {
          title: ta("حذف"),
          danger: true,
          action: () =>
            setPopup(
              "DeleteDrug",
              <DeleteDrugPopup mutate={() => push(adminPath(`/drug`))} node={node} />,
            ),
        },
      ]}
      renderer={{
                      name: { section: details, type: "text", title: ta("نام"), required: true },
                      summary: { section: details, type: "text", title: ta("خلاصه") },
                      description: { section: details, type: "area", title: ta("توضیحات") },
                      order: { section: details, type: "number", title: ta("رتبه") },
                      slug: { section: details, type: "text", title: ta("اسلاگ") },
                      image: { section: details, type: "image", title: ta("تصویر") },
                      brand: { section: details, type: "text", title: ta("برند") },
                      tag: { section: details,
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
                      sameAs: { section: details,
                        type: "nodes",
                        title: ta("مشابهات"),
                        path: `${API}/auto/drug`,
                        getOptionLabel: (node) =>
                          (node as IDrug).name || ta("بدون نام"),
                        getOptionValue: (node) => (node as IDrug)._id,
                        getDefaultValue: (inp) => inp.sameAs,
                        multi: true,
                      },
                      aiSummary: { section: details, type: "rtf", title: ta("خلاصه AI") },
                      content: { section: details, type: "rtf", title: ta("محتوا") },
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
      extraTabs={(node) => [
        {
          title: ta("سئو"),
          icon: <InfoIcon />,
          id: "Meta",
          content: <PageMetaEditor resourceType="/drug/[slug]" slug={node.slug} />,
        },
        {
          id: "translations",
          title: ta("ترجمه‌ها"),
          content: <AdminContentTranslationPage segment="drug" />,
        },
      ]}
    />
  );
};

export default AdminManageDrugPage;
