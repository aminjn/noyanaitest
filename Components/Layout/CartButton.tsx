import useSWR from "swr";
import useProgress from "../Hooks/useProgress";
import useUser from "../Hooks/useUser";
import LineBagIcon from "../Icons/LinebagIcon";
import IconWithCountButton from "../UI/IconWithCountButton";
import Ixon from "../UI/Ixon";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { Dispatch, SetStateAction, useState } from "react";
import dynamic from "next/dynamic";

// the cart (with checkout and its map) loads when it is opened, not with
// every page's header
const CartModal = dynamic(() => import("./CartModal"), { ssr: false });
import classes from "./CartButton.module.css";

const CartButton = ({
  isOpen,
  open,
  close,
}: {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}) => {
  const { user } = useUser();

  const { data } = useSWR<number>(`${API}/cart/size`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  if (!user) return null;
  return (
    <div className={classes.main}>
      <IconWithCountButton count={data} onClick={() => open()}>
        <LineBagIcon />
      </IconWithCountButton>
      {isOpen && <CartModal close={close} />}
    </div>
  );
};

export default CartButton;
