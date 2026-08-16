import useSWR from "swr";
import useProgress from "../Hooks/useProgress";
import useUser from "../Hooks/useUser";
import LineBagIcon from "../Icons/LinebagIcon";
import IconWithCountButton from "../UI/IconWithCountButton";
import Ixon from "../UI/Ixon";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";

const CartButton = () => {
  const { user } = useUser();

  const { data } = useSWR<number>(`${API}/cart/size`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const push = useProgress();

  if (!user) return null;
  return (
    <IconWithCountButton count={data} onClick={() => push("/cart")}>
      <LineBagIcon />
    </IconWithCountButton>
  );
};

export default CartButton;
