import { useContext, useState } from "react";
import classes from "./DrugGetter.module.css";
import Input from "@/Components/UI/Input";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Ixon from "@/Components/UI/Ixon";
import StarIcon from "@/Components/Icons/StarIcon";
import useSWR from "swr";
import {
  ITaminService,
  TaminServicePopulation,
} from "@/Components/Admin/Tamin/Service/AdminManageTaminServicesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import SearchIcon from "@/Components/Icons/SearchIcon";
import { MongoDoc } from "@/Components/Hooks/useUser";
import {
  DoctorProfilePopulation,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import {
  ITaminDrugInstruction,
  TaminDrugInstructionPopulation,
} from "@/Components/Admin/Tamin/DrugInstructions/AdminManageTaminDrugInstructionsPage";
import {
  ITaminDrugAmount,
  TaminDrugAmountPopulation,
} from "@/Components/Admin/Tamin/DrugAmount/AdminManageTaminDrugAmountsPage";
import {
  ITaminDrugUsage,
  TaminDrugUsagePopulation,
} from "@/Components/Admin/Tamin/DrugUsage/AdminManageTaminDrugUsagesPage";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import FancySelect from "@/Components/UI/FancySelect";
import PrescriptionContext from "../../../PrescriptionContext";
import { nanoid } from "nanoid";
import FavoriteDrug from "./FavoriteDrug";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionDrugItem"];

export type FavoriteDrugPopulation = Population<{
  Doctor: DoctorProfilePopulation;
  Drug: TaminServicePopulation;
  Instruction: TaminDrugInstructionPopulation;
  Amount: TaminDrugAmountPopulation;
  Usage: TaminDrugUsagePopulation;
}>;

export interface IFavoriteDrug<
  T extends FavoriteDrugPopulation = FavoriteDrugPopulation,
> extends MongoDoc {
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  drug: T["Drug"] extends TaminServicePopulation
    ? ITaminService<T["Drug"]>
    : string;
  instruction: T["Instruction"] extends TaminDrugInstructionPopulation
    ? ITaminDrugInstruction<T["Instruction"]>
    : string;
  amount: T["Amount"] extends TaminDrugAmountPopulation
    ? ITaminDrugAmount<T["Amount"]>
    : string;
  usage: T["Usage"] extends TaminDrugUsagePopulation
    ? ITaminDrugUsage<T["Usage"]>
    : string;
  createdAt: Date;
  qty: number;
  description?: string;
}

const DrugGetter = () => {
  const [query, setQuery] = useState<string>("");

  const { data: favorites, mutate } = useSWR<
    IFavoriteDrug<{
      Amount: Record<never, never>;
      Drug: Record<never, never>;
      Instruction: Record<never, never>;
      Usage: Record<never, never>;
    }>[]
  >(`${API}/doctor/presc/drug`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const { data, isLoading } = useSWR<ITaminService[]>(
    query.length > 0
      ? { url: `${API}/doctor/presc/drug`, query, srvType: "01" }
      : null,
    ({
      url,
      query,
      srvType,
    }: {
      url: string;
      query: string;
      srvType: string;
    }) =>
      fetcher({ url, method: "POST", payload: { query, srvType } }).then(
        (res) => res.data,
      ),
    { keepPreviousData: true },
  );

  const getContent = useScopedLocale(LOCALE_NS);

  const { setWorking, working } = useContext(PrescriptionContext);

  const getCompContent = useScopedLocale(LOCALE_NS);

  return (
    <div className={classes.main}>
      <FancySelect
        onInputChange={(e) => setQuery(e.trim())}
        placeholder={getContent("searchDrugNameOrCode")}
        title={getContent("drugNameOrCode")}
        options={
          query
            ? data?.map((s) => ({ title: s.srvName || "", value: s._id }))
            : favorites?.map((f) => ({
                title: `${f.drug.srvName}/${f.instruction.drugInstConcept}/${
                  f.usage.drugUsageConcept
                }/${f.amount.drugAmntConcept}/${getCompContent("xUnit", [
                  f.qty.toString(),
                ])}`,
                value: f._id,
              }))
        }
        isLoading={isLoading}
        onChange={(e) => {
          const fav = favorites?.find((f) => f._id === e);
          if (fav) {
            setWorking({
              _id: `${nanoid()}${new Date().getTime()}`,
              item: fav.drug,
              amount: fav.amount,
              description: fav.description,
              instruction: fav.instruction,
              qty: fav.qty,
              usage: fav.usage,
            });
          } else {
            setWorking((prev) => ({
              ...prev,
              item: data?.find((el) => el._id === e),
            }));
          }
        }}
        defaultValue={working.item?.srvName}
      />
      <FavoriteDrug mutate={mutate} />
    </div>
  );
};

export default DrugGetter;
