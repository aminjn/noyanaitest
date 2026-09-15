import ClientTabSystem, {
  ClientTabSystemItems,
} from "@/Components/UI/ClientTabSystem";
import classes from "./CartabelNodePageTabs.module.css";
const CartableNodePageTabs = ({ tabs }: { tabs: ClientTabSystemItems }) => {
  return (
    <div className={classes.main} id="TABS">
      <ClientTabSystem items={tabs} />
    </div>
  );
};

export default CartableNodePageTabs;
