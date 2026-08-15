import useCart, { CartModel } from "../Hooks/useCart";
import useLocale from "../Hooks/useLocale";
import CartIcon from "../Icons/CartIcon";
import MinusIcon from "../Icons/MinusIcon";
import PlusIcon from "../Icons/PlusIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import classes from "./CartActions.module.css";
const CartActions = ({
  itemId,
  model,
}: {
  itemId: string;
  model: CartModel;
}) => {
  const { mutateCartItem, getItemQty } = useCart();

  const getContent = useLocale();

  return (
    <div className={classes.cart}>
      {!!getItemQty({ itemId, model }) ? (
        <div className={classes.selector}>
          <button
            className={classes.crease}
            onClick={() =>
              mutateCartItem({
                item: itemId,
                amount: 1,
                model: model,
              })
            }
          >
            <Ixon width="1rem">
              <PlusIcon />
            </Ixon>
          </button>
          <span className={classes.inCart}>
            {getItemQty({ itemId, model })}
          </span>
          <button
            className={classes.crease}
            onClick={() =>
              mutateCartItem({
                item: itemId,
                amount: -1,
                model,
              })
            }
          >
            <Ixon width="1rem">
              <MinusIcon />
            </Ixon>
          </button>
        </div>
      ) : (
        <Button
          variant="Error"
          mode="Fill"
          size="M"
          radius="Medium"
          tailIcon-={<CartIcon />}
          onClick={() =>
            mutateCartItem({
              item: itemId,
              model,
              amount: 1,
            })
          }
        >
          {getContent("addToCart")}
        </Button>
      )}
    </div>
  );
};

export default CartActions;
