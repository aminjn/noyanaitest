import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import BecomeRequestStatus from "@/Components/_Common/BecomeStatus/BecomeRequestStatus";
import HandleLoading from "../Admin/UI/HandleLoading";
import CreateForm from "../Admin/UI/CreateForm";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "becomeParaClinic"];

export type BecomeParaClinicRequestPopulation = Population<{
  User: UserPopulation;
}>;

export interface IBecomeParaClinicRequest<
  T extends BecomeParaClinicRequestPopulation =
    BecomeParaClinicRequestPopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  createdAt: Date;
  updatedAt: Date;
  status: BecomeANodeStatus;
  rejectReason?: string;
  name: string;
  siamCode: string;
  nationalId: string;
  certificateDate: Date;
  certificateFile?: string;
  description?: string;
}

const BecomeParaClinicPage = () => {
  const { data, error, isLoading, mutate } =
    useSWR<IBecomeParaClinicRequest | null>(
      `${API}/paraClinic/request`,
      (url: string) => fetcher({ url }).then((res) => res.data),
    );

  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <HandleLoading data={!isLoading} error={error}>
      <BecomeRequestStatus
        request={data}
        form={
            <CreateForm<IBecomeParaClinicRequest>
              renderer={{
                name: { type: "text", title: getContent("name") },
                siamCode: { type: "text", title: getContent("siamCode") },
                nationalId: { type: "text", title: getContent("nationalId") },
                certificateDate: {
                  type: "date",
                  title: getContent("certificateDate"),
                },
                certificateFile: {
                  type: "image",
                  title: getContent("certificateFile"),
                },
                description: { type: "text", title: getContent("description") },
              }}
              hookProps={{
                path: `${API}/paraClinic`,
                method: "POST",
                successCb: () => {
                  mutate();
                },
              }}
            />
        }
      />
    </HandleLoading>
  );
};

export default BecomeParaClinicPage;
