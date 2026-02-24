import useSWR from "swr";
import classes from "./ReplaceDrugPopup.module.css";
import { fetcher } from "@/Components/helpers/fetcher";
import { API } from "@/Components/config";
const ReplaceDrugPopup = () => {
  const {} = useSWR(`${API}/pharmacy/drug`, (url: string) =>
    fetcher({ url, method: "POST" }).then((res) => console.log(res)),
  );
  return <p>ReplaceDrugPopup</p>;
};

export default ReplaceDrugPopup;
