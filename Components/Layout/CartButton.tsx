import useSWR from "swr";
import useProgress from "../Hooks/useProgress";
import useUser from "../Hooks/useUser";
import LineBagIcon from "../Icons/LinebagIcon";
import IconWithCountButton from "../UI/IconWithCountButton";
import Ixon from "../UI/Ixon";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { useState } from "react";
import CartModal from "./CartModal";
import classes from "./CartButton.module.css";

const CartButton = () => {
  const { user } = useUser();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data } = useSWR<number>(`${API}/cart/size`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  if (!user) return null;
  return (
    <div className={classes.main}>
      <IconWithCountButton count={data} onClick={() => setIsOpen(true)}>
        <LineBagIcon />
      </IconWithCountButton>
      {isOpen && <CartModal close={() => setIsOpen(false)} />}
    </div>
  );
};

export default CartButton;
