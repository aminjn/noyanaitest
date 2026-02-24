import { useContext, useState } from "react";
import classes from "./LabItemGetter.module.css";
import useSWR from "swr";
import { ITaminService } from "@/Components/Admin/Tamin/Service/AdminManageTaminServicesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import FancySelect from "@/Components/UI/FancySelect";
import FavoriteButton from "../Drug/FavoriteButton";
import useLocale from "@/Components/Hooks/useLocale";
import PrescriptionContext from "../../../PrescriptionContext";

const LabItemGetter = () => {
  const [query, setQuery] = useState<string>("");

  const { data, isLoading } = useSWR<ITaminService[]>(
    query.length > 0
      ? { url: `${API}/doctor/presc/drug`, query, srvType: "02" }
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

  const getContent = useLocale();

  const { workingLab, setWorkingLab } = useContext(PrescriptionContext);

  return (
    <div className={classes.main}>
      <FancySelect
        onInputChange={(e) => setQuery(e.trim())}
        placeholder={getContent("searchForTestName")}
        title={getContent("testName")}
        isLoading={isLoading}
        options={data?.map((el) => ({
          title: el.srvName || "",
          value: el._id,
        }))}
        onChange={(e) =>
          setWorkingLab((prev) => ({
            ...prev,
            item: data?.find((el) => el._id === e),
          }))
        }
        defaultValue={workingLab.item?.srvName}
      />
      <FavoriteButton />
    </div>
  );
};

export default LabItemGetter;
