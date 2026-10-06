import { useMemo, useState } from "react";
import { ParaClinicPageProps } from "./ParaClinicPage";
import classes from "./ParaClinicTests.module.css";
import { ITestCategory } from "../Admin/TestCategory/AdminManageTestCategoriesPage";
import { ITest } from "../Admin/Test/AdminManageTestsPage";
import FilterCsr from "../Clinic/FilterCsr";
import ListPageSearch from "../UI/ListPage/ListPageSearch";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Ixon from "../UI/Ixon";
import FlaskIcon from "../Icons/FlaskIcon";
import ClockIcon from "../Icons/ClockIcon";
import Badge from "../UI/Badge";
import { currencize } from "../helpers/currencize";
import { IParaClinicTest } from "../Admin/ParaClinic/AdminManageParaClinicPage";
import useCart from "../Hooks/useCart";
import Button from "../UI/Button";
import MinusIcon from "../Icons/MinusIcon";
import PlusIcon from "../Icons/PlusIcon";
import { tbaseBold, tsmMedium, txsRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "paraClinicPage"];

const TestItem = ({
  node,
}: {
  node: IParaClinicTest<{ Test: { Category: Record<never, never> } }>;
}) => {
  const getContent = useScopedLocale(NS);
  const { cart, mutateCartItem, removeCartItem } = useCart();

  const inCart = useMemo<boolean>(
    () => !!cart?.tests.find((el) => el.item._id === node._id)?.qty,
    [cart?.tests, node._id],
  );

  return (
    <div className={classes.item}>
      <div className={`${classes.itemIcon} glassIcon tone-teal`}>
        <Ixon width="1.5rem">
          <FlaskIcon />
        </Ixon>
      </div>
      <div className={classes.itemContent}>
        <span className={`${classes.itemName} ${tsmMedium}`}>
          {node.test.name}
        </span>
        <div className={classes.itemFooter}>
          {!!node.readyTime && (
            <div className={classes.readyTime}>
              <Ixon width="1rem">
                <ClockIcon />
              </Ixon>
              <span className={txsRegular}>{node.readyTime}</span>
            </div>
          )}
          {!!node.test.category && (
            <Badge color="Disabled" mode="Fill" size="XL" radius="High">
              {node.test.category.name}
            </Badge>
          )}
        </div>
      </div>
      <div className={classes.itemTail}>
        <span className={`${classes.price} ${tbaseBold}`}>
          {getContent("xToman", [currencize(node.price)])}
        </span>
        <Button
          variant={inCart ? "Error" : "Primary"}
          mode="Fill"
          radius="High"
          size="M"
          onClick={() =>
            inCart
              ? removeCartItem({ item: node._id, model: "tests" })
              : mutateCartItem({ item: node._id, model: "tests" })
          }
          tailIcon={inCart ? <MinusIcon /> : <PlusIcon />}
        >
          {getContent(inCart ? "remove" : "add")}
        </Button>
      </div>
    </div>
  );
};

const ParaClinicTests = ({ data }: ParaClinicPageProps) => {
  const categories = useMemo<ITestCategory[]>(() => {
    return data.tests
      .map((el) => el.test.category)
      .filter(Boolean)
      .filter(
        (el, i, arr) => i === arr.findIndex((e) => e?._id === el?._id),
      ) as ITestCategory[];
  }, [data.tests]);

  const [query, setQuery] = useState<string>("");

  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo<IParaClinicTest[]>(
    () =>
      data.tests
        .filter((el) => !filter || filter === el.test.category?._id)
        .filter((el) => el.test.name?.includes(query)),
    [data.tests, filter, query],
  );

  const getContent = useScopedLocale(NS);

  if (!data.tests.length) return null;
  return (
    <div className={classes.main} id="Tests" >
      <div className={classes.header}>
        <ListPageSearch
          placeholder={getContent("searchInTests")}
          onChange={(e) => setQuery(e.target.value)}
          className={classes.search}
        />
        <FilterCsr
          options={categories.map((el) => ({
            title: el.name || "",
            value: el._id,
          }))}
          filter={filter}
          setFilter={setFilter}
        />
      </div>
      <div className={classes.list}>
        {filtered.map((test) => (
          <TestItem key={test._id} node={test} />
        ))}
      </div>
    </div>
  );
};

export default ParaClinicTests;
