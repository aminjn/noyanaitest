"use client";

import useSWR from "swr";
import classes from "./AdminManageAccessLevelsPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import CreateAccessLevelPopup from "./CreateAccessLevelPopup";
import Table from "../UI/Table";
import { IUser, MongoDoc } from "@/Components/Hooks/useUser";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteAccessLevelPopup from "./DeleteAccessLevelPopup";
import {
  IUserAccessLevel,
  UserAccessLevelPopulation,
} from "./AccessLevelAdminsTab";
import { ta } from "@/Components/Admin/i18n/adminText";

export const accessOperations = [
  "readAll",
  "readOne",
  "write",
  "update",
  "delete",
] as const;

export type AccessOperation = (typeof accessOperations)[number];

export const accessLevelOperationsDict: { [key in AccessOperation]: string } = {
  get delete() {
  return ta("حذف");
},
  get readAll() {
  return ta("خواندن همه");
},
  get readOne() {
  return ta("خواندن یکی");
},
  get update() {
  return ta("به روز رسانی");
},
  get write() {
  return ta("نوشتن");
},
};

type Access = { [key in AccessOperation]?: boolean };

export const accessLevelModels = [
  "BecomeDoctorRequest",
  "BecomeClinicRequest",
  "BecomePharmacyRequest",
  "BecomeInsuranceRequest",
  "Blog",
  "BlogCategory",
  "BlogMedia",
  "Comment",
  "DoctorProfile",
  "InlineAdvertisement",
  "Sepciality",
  "TextContent",
  "User",
  "Clinic",
  "ClinicDepartment",
  "ClinicDoctor",
  "DoctorJoinClinic",
  "ClinicAdditionRequest",
  "Insurance",
  "InsuranceAdditionRequest",
  "Pharmacy",
  "CallRoom",
  "Redirection",
  "ShortLink",
  "Disease",
  "Drug",
  "Symptom",
  "Part",
  "DoctorFaq",
  "Hospital",
  "HospitalDepartment",
  "HospitalDoctor",
  "DoctorJoinHospital",
  "HospitalAdditionRequest",
  "BecomeHospitalRequest",
  "ParaClinic",
  "BecomeParaClinicRequest",
  "PharmacyAdditionRequest",
  "Faq",
  // support and operations (2026-10 audit), same list as the backend's
  // Models/AccessLevel.ts
  "Ticket",
  "ContactRequest",
  "DoctorFeedback",
  "Service",
  "Product",
  "Test",
  "BookingDescription",
  "Notification",
  "Advertisement",
  "PageMeta",
  "Reservation",
  "Order",
  "Finance",
] as const;

export type AccessLevelModel = (typeof accessLevelModels)[number];

export const accessLevelModelDict: { [key in AccessLevelModel]: string } = {
  get BecomeDoctorRequest() {
  return ta("درخواست پزشک شدن");
},
  get BecomeClinicRequest() {
  return ta("درخواست کلینیک شدن");
},
  get BecomeInsuranceRequest() {
  return ta("درخواست بیمه شدن");
},
  get BecomePharmacyRequest() {
  return ta("درخواست داروخانه شدن");
},
  get Blog() {
  return ta("مقالات");
},
  get BlogCategory() {
  return ta("دسته بندی مقالات");
},
  get BlogMedia() {
  return ta("مولتی مدیا وبلاگ");
},
  get Comment() {
  return ta("نظرات");
},
  get DoctorProfile() {
  return ta("پروفایل پزشک");
},
  get InlineAdvertisement() {
  return ta("تبلیغات خطی");
},
  get Sepciality() {
  return ta("تخصص ها");
},
  get TextContent() {
  return ta("دیکشنری");
},
  get User() {
  return ta("کاربر");
},
  get Clinic() {
  return ta("کلینیک");
},
  get ClinicDepartment() {
  return ta("دپارتمان کلینیک");
},
  get ClinicDoctor() {
  return ta("ارتباط بین پزشک و کلینیک");
},
  get DoctorJoinClinic() {
  return ta("درخواست عضویت پزشکان در کلینیک");
},
  get ClinicAdditionRequest() {
  return ta("درخواست اضافه شدن کلینیک");
},
  get Insurance() {
  return ta("بیمه");
},
  get InsuranceAdditionRequest() {
  return ta("درخواست اضافه شدن بیمه");
},
  get Pharmacy() {
  return ta("داروخانه و آزمایشگاه");
},
  get CallRoom() {
  return ta("تماس");
},
  get ShortLink() {
  return ta("لینک کوتاه");
},
  get Redirection() {
  return ta("انتقالات");
},
  get Disease() {
  return ta("بیماری");
},
  get Drug() {
  return ta("دارو");
},
  get Symptom() {
  return ta("علائم");
},
  get Part() {
  return ta("اعضای بدن");
},
  get DoctorFaq() {
  return ta("سوالات متداول پزشکان");
},
  get Hospital() {
  return ta("بیمارستان");
},
  get HospitalDepartment() {
  return ta("دپارتمان بیمارستان");
},
  get HospitalDoctor() {
  return ta("ارتباط بین پزشک و بیمارستان");
},
  get DoctorJoinHospital() {
  return ta("درخواست عضویت پزشکان در بیمارستان");
},
  get HospitalAdditionRequest() {
  return ta("درخواست اضافه شدن بیمارستان");
},
  get BecomeHospitalRequest() {
  return ta("درخواست بیمارستان شدن");
},
  get ParaClinic() {
  return ta("پاراکلینیک");
},
  get BecomeParaClinicRequest() {
  return ta("درخواست پاراکلینیک شدن");
},
  get PharmacyAdditionRequest() {
  return ta("درخواست اضافه شدن داروخانه");
},
  get Faq() {
    return ta("سوالات متداول");
  },
  get Ticket() {
    return ta("تیکت‌های پشتیبانی");
  },
  get ContactRequest() {
    return ta("پیام‌های تماس با ما");
  },
  get DoctorFeedback() {
    return ta("نظرات تاییدشده‌ی ویزیت");
  },
  get Service() {
    return ta("خدمات");
  },
  get Product() {
    return ta("محصولات");
  },
  get Test() {
    return ta("آزمایش‌ها");
  },
  get BookingDescription() {
    return ta("توضیحات رزرو");
  },
  get Notification() {
    return ta("اعلان‌ها");
  },
  get Advertisement() {
    return ta("بنرهای تبلیغاتی");
  },
  get PageMeta() {
    return ta("متادیتای صفحات");
  },
  get Reservation() {
    return ta("نوبت‌ها");
  },
  get Order() {
    return ta("سفارش‌ها");
  },
  get Finance() {
    return ta("مالی");
  },
};

type AccessLevelPopuplation = { AdminsPopulated?: UserAccessLevelPopulation };

export type IAccessLevel<
  T extends AccessLevelPopuplation = AccessLevelPopuplation
> = MongoDoc & {
  name: string;
} & {
  [key in AccessLevelModel]?: Access;
} & (T["AdminsPopulated"] extends UserAccessLevelPopulation
    ? {
        admins: IUserAccessLevel<T["AdminsPopulated"]>[];
      }
    : { admins?: never });

const AdminManageAccessLevelsPage = () => {
  const { data, error, mutate } = useSWR<IAccessLevel[]>(
    `${API}/auto/accesslevel`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("سطوح دسترسی")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "CreateAccessLevel",
                  <CreateAccessLevelPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            name="AdminManageAccessLevels"
            data={data}
            renderer={{
              name: {
                name: ta("نام"),
                component: (node) => (
                  <InlineLink href={adminPath(`/accesslevel/${node._id}`)}>
                    {node.name || node._id}
                  </InlineLink>
                ),
                value: (node) => node.name,
                filter: "Text",
              },
              ...accessLevelModels.reduce(
                (acc, model) => ({
                  ...acc,
                  [model]: {
                    name: accessLevelModelDict[model],
                    value: (node: IAccessLevel) =>
                      accessOperations
                        .filter((op) => node[model]?.[op])
                        .map((op) => accessLevelOperationsDict[op])
                        .join(" - "),
                    filter: "Multi",
                  },
                }),
                {}
              ),
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/accesslevel/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteAccessLevel",
                          <DeleteAccessLevelPopup mutate={mutate} node={node} />
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageAccessLevelsPage;
