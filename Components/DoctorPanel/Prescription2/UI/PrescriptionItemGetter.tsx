import classes from "./PrescriptionItemGetter.module.css";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import usePrescription from "../Store/usePrescription";
import useSWR from "swr";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { ITaminServiceType } from "@/Components/Admin/Tamin/ServiceType/AdminManageTaminServiceTypesPage";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import Form from "@/Components/UI/Form";
import { Fragment, ReactNode, useCallback, useState } from "react";
import { ITaminService } from "@/Components/Admin/Tamin/Service/AdminManageTaminServicesPage";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import FancySelect from "@/Components/UI/FancySelect";
import { IFavoriteDrug } from "../../Prescription/Create/Items/Drug/DrugGetter";
import { nanoid } from "nanoid";
import FavoriteDrug from "../../Prescription/Create/Items/Drug/FavoriteDrug";
import Counter from "@/Components/UI/Counter";
import { clamp } from "@/Components/helpers/lib";
import InstructionGetter from "../../Prescription/Create/Items/Drug/InstructionGetter";
import AmountGetter from "../../Prescription/Create/Items/Drug/AmountGetter";
import DateInput from "@/Components/UI/DateInput";
import AreaInput from "@/Components/UI/AreaInput";
import Button from "@/Components/UI/Button";
import useNotification from "@/Components/Hooks/useNotification";
import {
  newPrescription2ItemId,
  PrescCtxItem,
} from "../Store/DoctorPrescriptionContext";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionCreate"];

const ItemGetter = ({ srvType }: { srvType: number }) => {
  const [query, setQuery] = useState<string>("");

  const { data: favorites, mutate } = useSWR<
    IFavoriteDrug<{
      Amount: Record<never, never>;
      Drug: Record<never, never>;
      Instruction: Record<never, never>;
      Usage: Record<never, never>;
    }>[]
  >(
    null,
    // `${API}/doctor/presc/drug`
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { data, isLoading } = useSWR<ITaminService[]>(
    query.length > 0
      ? { url: `${API}/doctor/presc/drug`, query, srvType }
      : null,
    ({
      url,
      query,
      srvType,
    }: {
      url: string;
      query: string;
      srvType: number;
    }) =>
      fetcher({
        url,
        method: "POST",
        payload: { query, srvType: String(srvType).padStart(2, "0") },
      }).then((res) => res.data),
    { keepPreviousData: true },
  );

  const getContent = useScopedLocale(LOCALE_NS);

  const { setWorking, working } = usePrescription();

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
              service: fav.drug,
              timesADay: fav.amount,
              drugInstruction: fav.instruction,
              qty: fav.qty,
              dose: fav.description,
            });
          } else {
            setWorking((prev) => ({
              ...prev,
              service: data?.find((el) => el._id === e),
            }));
          }
        }}
        defaultValue={working.service?.srvName}
      />
      {/* <FavoriteDrug mutate={mutate} /> */}
    </div>
  );
};

const DRUG_ID = [1];

const WITH_DATE_DO = [2, 3, 4, 5, 6, 7, 8, 9, 11, 15, 20, 99];

const Tab = ({ node }: { node: ITaminServiceType }) => {
  const { working, setWorking, setItems, setView } = usePrescription();

  const getContent = useScopedLocale(LOCALE_NS);

  const pushNotification = useNotification();

  const onAdd = useCallback(() => {
    if (!working.service)
      return pushNotification(
        getContent("draftingEmptyPrescriptionErrorMessage"),
        "Warn",
      );
    if (!working.qty) return pushNotification(getContent("checkInput"), "Warn");
    if (Number(working.service.srvType) === 1) {
      if (!working.drugInstruction || !working.timesADay)
        return pushNotification(getContent("checkInput"), "Warn");
    }
    setItems((prev) => {
      const clone = [...prev];
      const index = clone.findIndex((el) => el._id === working._id);
      if (index === -1) {
        clone.push(working as PrescCtxItem);
      } else {
        clone.splice(index, 1, working as PrescCtxItem);
      }
      return clone;
    });
    setView((prev) => ({ ...prev, preview: working.service?.srvType || "" }));
    setWorking({ _id: newPrescription2ItemId() });
  }, [getContent, pushNotification, setItems, setWorking, working, setView]);

  return (
    <Form className={classes.tab}>
      <ItemGetter srvType={node.srvType || 0} />
      <div className={classes.fields}>
        <Counter
          value={working.qty || 0}
          title={getContent("drugCount")}
          onTick={(tick) =>
            setWorking((prev) => ({
              ...prev,
              qty: clamp(1, (prev.qty || 0) + tick, Number.MAX_SAFE_INTEGER),
            }))
          }
          onChange={(e) =>
            setWorking((prev) => ({
              ...prev,
              qty: clamp(1, e, Number.MAX_SAFE_INTEGER),
            }))
          }
        />
        {!!DRUG_ID.includes(node.srvType || 0) && (
          <Fragment>
            <InstructionGetter />
            <AmountGetter />
          </Fragment>
        )}
        {!!WITH_DATE_DO.includes(node.srvType || 0) && (
          <DateInput
            title={getContent("testDoDate")}
            onChange={(e) => setWorking((prev) => ({ ...prev, dateDo: e }))}
            defaultValue={working.dateDo}
            className={classes.date}
          />
        )}
      </div>
      <AreaInput
        title={getContent("description")}
        onChange={(e) =>
          setWorking((prev) => ({ ...prev, dose: e.target.value }))
        }
      />
      <div className={classes.actions}>
        <Button
          onClick={() =>
            setWorking({ _id: `${nanoid()}${new Date().getTime()}` })
          }
        >
          {getContent("startAgain")}
        </Button>
        <Button onClick={() => onAdd()}>{getContent("addDrug")}</Button>
      </div>
    </Form>
  );
};

const PrescriptionItemGetter = () => {
  const { data, error } = useSWR<ITaminServiceType[]>(
    `${API}/doctor/taminSrvType`,
    (url: string) =>
      fetcher({ url }).then((res) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res.data.filter((el: any) => el.srvType !== "16"),
      ),
  );

  const { view, setView, readOnly } = usePrescription();

  if (readOnly) return null;
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <ClientTabSystem
          viewState={[
            view.form,
            (v) => setView((prev) => ({ ...prev, form: v })),
          ]}
          items={data
            .sort((a, b) => Number(a.srvType) - Number(b.srvType))
            .map((el) => ({
              id: el._id,
              title: el.srvTypeDes,
              content: <Tab node={el} />,
            }))}
        />
      )}
    </HandleLoading>
  );
};

export default PrescriptionItemGetter;
