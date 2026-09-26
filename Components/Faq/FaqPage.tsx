"use client";
import { useMemo, useState } from "react";
import { IFaq } from "../Admin/Faq/AdminManageFaqsPage";
import { IFaqCategory } from "../Admin/faqCategory/AdminManageFaqCategoriesPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Badge from "../UI/Badge";
import classes from "./FaqPage.module.css";
import Button from "../UI/Button";
import ListPageSearch from "../UI/ListPage/ListPageSearch";
import { FaqItem } from "../Home/HomeFaqs";
import { tbaseMedium, tsmMedium, txlDemiBold } from "../UI/Typography";
import BreadCrump from "../UI/BreadCrump";
import Link from "@/Components/i18n/Link";

const NS: ContentNamespace[] = ["common", "faqPage"];

export type FaqPageProps = { data: IFaq[]; categories: IFaqCategory[] };
const FaqPage = ({ categories, data }: FaqPageProps) => {
  const getContent = useScopedLocale(NS);

  const [filter, setFilter] = useState<IFaqCategory | null>(null);

  const [query, setQuery] = useState<string>("");

  const filtered = useMemo<IFaq[]>(
    () =>
      data
        .filter((el) => !filter || el.category === filter._id)
        .filter(
          (el) => el.question?.includes(query) || el.answer?.includes(query),
        ),
    [data, filter, query],
  );

  return (
    <div className={classes.main}>
      <BreadCrump
        trail={[
          { title: "صفحه اصلی", target: "/" },
          { title: "سوالات متداول", target: "/faq" },
        ]}
        className={classes.crump}
      />
      <Badge
        color="Primary"
        size="XXL"
        mode="Outline"
        radius="High"
        className={classes.badge}
      >
        FAQ
      </Badge>
      <h1 className={`${classes.h1} ${txlDemiBold}`}>
        {getContent("frequentlyAskedQuestions")}
      </h1>
      <legend className={`${classes.legend} ${tbaseMedium}`}>
        <span>{getContent("faqLegendPre")}</span>{" "}
        <Link className={classes.legendLink} href={"/contact"}>
          {getContent("faqLegendLink")}
        </Link>{" "}
        <span>{getContent("faqLegendPost")}</span>
      </legend>
      {!!categories.length && (
        <div className={classes.categories}>
          <button
            onClick={() => setFilter(null)}
            className={`${classes.category} ${!filter ? classes.activeCategory : ""} ${tsmMedium}`}
          >
            {getContent("all")}
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setFilter(category)}
              className={`${classes.category} ${filter?._id === category._id ? classes.activeCategory : ""} ${tsmMedium}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
      <ListPageSearch
        onChange={(e) => setQuery(e.target.value)}
        placeholder={getContent("searchInFaq")}
        className={classes.search}
      />
      <ul className={classes.list}>
        {filtered.map((el) => (
          <FaqItem key={el._id} node={el} />
        ))}
      </ul>
    </div>
  );
};

export default FaqPage;
