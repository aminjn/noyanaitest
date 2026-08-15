import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useSWR from "swr";

const GetAdditiveDrugs = () => {
  const { data } = useSWR(`${API}/pharmacy/tamin`, (url) =>
    fetcher({ url }).then((res) => res.data),
  );

  console.log(data);

  return <p>GetAdditiveDrugs</p>;
};

export default GetAdditiveDrugs;
