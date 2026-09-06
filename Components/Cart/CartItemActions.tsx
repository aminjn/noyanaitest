import useCart from "../Hooks/useCart";
import MinusIcon from "../Icons/MinusIcon";
import PlusIcon from "../Icons/PlusIcon";
import Ixon from "../UI/Ixon";
import { txsMedium } from "../UI/Typography";
import classes from "./CartItemActions.module.css";
import { CartRow } from "./CartPage";
const CartItemActions = ({ row }: { row: CartRow }) => {
  const { isLoading, mutateCartItem } = useCart();
  return (
    <div className={classes.qtyBox}>
      <button
        type="button"
        className={classes.qtyBtn}
        disabled={isLoading}
        onClick={() =>
          mutateCartItem({ item: row.itemId, amount: 1, model: row.model })
        }
      >
        <Ixon width="1rem">
          <PlusIcon />
        </Ixon>
      </button>
      <span className={`${classes.qty} ${txsMedium}`}>{row.qty}</span>
      <button
        type="button"
        className={classes.qtyBtn}
        disabled={isLoading}
        onClick={() =>
          mutateCartItem({ item: row.itemId, amount: -1, model: row.model })
        }
      >
        <Ixon width="1rem">
          <MinusIcon />
        </Ixon>
      </button>
    </div>
  );
};

export default CartItemActions;
