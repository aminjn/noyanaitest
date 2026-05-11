import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import usePrescription from "../Store/usePrescription";
import classes from "./CreatePrescriptionItemPreview.module.css";
import { ITaminServiceType } from "@/Components/Admin/Tamin/ServiceType/AdminManageTaminServiceTypesPage";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import {
  IPrescription2Item,
  PrescCtxItem,
} from "../Store/DoctorPrescriptionContext";
import { Fragment, useMemo, useState } from "react";
import {
  t2xsDemiBold,
  t2xsRegular,
  txsMedium,
} from "@/Components/UI/Typography";
import Ixon from "@/Components/UI/Ixon";
import EditAltIcon from "@/Components/Icons/EditAltIcon";
import TrashIcon from "@/Components/Icons/TrashIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import useComplexLocale from "@/Components/Hooks/useComplexLocale";
import { dateToString } from "@/Components/UI/FormatDate";
import useLocale from "@/Components/Hooks/useLocale";

const Pair = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className={classes.pair}>
      <span className={`${classes.pairTitle} ${t2xsRegular}`}>{title}</span>
      <span className={`${classes.pairValue} ${txsMedium}`}>{value}</span>
    </div>
  );
};

const Item = ({ item }: { item: PrescCtxItem }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getCompContent = useComplexLocale();

  const { setWorking, setItems, readOnly } = usePrescription();

  const getContent = useLocale();

  return (
    <div className={classes.itemWrapper}>
      <div className={classes.item}>
        <div className={classes.itemContent}>
          <span className={`${txsMedium} ${classes.itemName}`}>
            {item.service.srvName}
          </span>
          <span
            style={{ opacity: isOpen ? 0 : 1 }}
            className={`${t2xsDemiBold} ${classes.itemDescription}`}
          >
            {`${getCompContent("xUnit", [item.qty.toString()])}${item.drugInstruction ? `/${item.drugInstruction.drugInstConcept}` : ""}${item.timesADay ? `/${item.timesADay.drugAmntConcept}` : ""}${item.dateDo ? `/${dateToString({ value: item.dateDo, time: false })}` : ""}`}
          </span>
        </div>
        <div className={classes.itemActions}>
          {!readOnly && (
            <Fragment>
              {
                <button
                  type="button"
                  onClick={() => {
                    setWorking(item);
                  }}
                  className={classes.action}
                >
                  <Ixon width="1.125rem">
                    <EditAltIcon />
                  </Ixon>
                </button>
              }
              {
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => {
                      const clone = [...prev];
                      const index = clone.findIndex(
                        (el) => el._id === item._id,
                      );
                      if (index === -1) return clone;
                      clone.splice(index, 1);
                      return clone;
                    })
                  }
                  className={classes.action}
                >
                  <Ixon width="1.125rem">
                    <TrashIcon />
                  </Ixon>
                </button>
              }
            </Fragment>
          )}
          <button
            type="button"
            className={classes.action}
            onClick={() => setIsOpen((prev) => !prev)}
            style={{ transform: `rotateZ(${isOpen ? 180 : 0}deg)` }}
          >
            <Ixon width="1.125rem">
              <ChevronIcon />
            </Ixon>
          </button>
        </div>
      </div>
      <div className={`${classes.expansion} ${isOpen ? classes.open : ""}`}>
        {[
          { title: getContent("drugCount"), value: item.qty.toString() },
          {
            title: getContent("drugInstruction"),
            value: item.drugInstruction?.drugInstConcept,
          },
          {
            title: getContent("drugAmount"),
            value: item.timesADay?.drugAmntConcept,
          },
          {
            title: getContent("dateDo"),
            value: item.dateDo
              ? dateToString({ value: item.dateDo })
              : undefined,
          },
        ].map((pair) => (
          <Fragment key={pair.title}>
            {!!pair.value ? (
              <Pair title={pair.title} value={pair.value} />
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

const Tab = ({ items }: { items: PrescCtxItem[] }) => {
  return (
    <div className={classes.list}>
      {items.map((item) => (
        <Item key={item._id} item={item} />
      ))}
    </div>
  );
};

const CreatePrescriptionItemPreview = () => {
  const { data, error } = useSWR<ITaminServiceType[]>(
    `${API}/doctor/taminSrvType`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const { items, view, setView } = usePrescription();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <ClientTabSystem
            viewState={[
              view.preview,
              (v) => setView((prev) => ({ ...prev, preview: v })),
            ]}
            items={Object.entries(
              items.reduce(
                (acc, el) => ({
                  ...acc,
                  [el.service.srvType || ""]: [
                    ...(acc[el.service.srvType || ""] || []),
                    el,
                  ],
                }),
                {} as Record<string, PrescCtxItem[]>,
              ),
            ).map(([key, value]) => ({
              id: key,
              title:
                data.find((el) => Number(el.srvType) === Number(key))
                  ?.srvTypeDes || "",
              content: <Tab items={value} />,
            }))}
          />
        </div>
      )}
    </HandleLoading>
  );
};

export default CreatePrescriptionItemPreview;
