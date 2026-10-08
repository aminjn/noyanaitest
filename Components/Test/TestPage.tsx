"use client";

import Link from "@/Components/i18n/Link";
import { ITest } from "../Admin/Test/AdminManageTestsPage";
import { IParaClinic } from "../Layout/ParaClinicPanelLayout";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { useIntlLocale } from "../i18n/navigation";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageList from "../UI/ListPage/ListPageList";
import ListPageCategorySelector from "../UI/ListPage/ListPageCategorySelector";
import CentreCard from "../UI/CentreCard";
import TestCard from "./TestCard";
import FlaskIcon from "../Icons/FlaskIcon";
import Ixon from "../UI/Ixon";
import Badge from "../UI/Badge";
import { tbaseMedium, tlgMedium, tsmMedium, tsmRegular } from "../UI/Typography";
import classes from "./TestPage.module.css";

const NS: ContentNamespace[] = ["common", "testPage"];

type Named = { _id: string; name?: string; slug?: string };

export type TestPageOffer = {
  _id: string;
  price?: number;
  readyTime?: string;
  takesOrders?: boolean;
  paraClinic?: IParaClinic<{
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }> & { averageScore?: number; reviewCount?: number };
};

export type TestPageProps = {
  data: ITest<{ Category: Record<never, never> }>;
  offers?: TestPageOffer[];
  cities?: Named[];
  city?: Named | null;
  sort?: "price" | "rating";
  // the "best rated" order is offered once some lab has reviews
  rated?: boolean;
  related?: ITest<{ Category: Record<never, never> }>[];
};

// One lab test's page (2026-10): what it is, how to prepare and the labs
// that offer it - cheapest first, or best rated - each with its price, ready
// time and add-to-cart, narrowed by city. The labs are the shared lab card
// (the same one the lab list shows for "labs offering this test").
const TestPage = ({ data, offers, cities, city, sort = "price", rated, related }: TestPageProps) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = new Intl.NumberFormat(intlTag);

  const list = (Array.isArray(offers) ? offers : []).filter(
    (o) => !!o?._id && !!o.paraClinic?._id,
  );
  const cityList = Array.isArray(cities) ? cities.filter((c) => !!c?._id && !!c.name) : [];
  const relatedList = Array.isArray(related) ? related.filter((t) => !!t?._id) : [];
  const prices = list.map((o) => Number(o.price)).filter((p) => p > 0);
  const lowest = prices.length ? Math.min(...prices) : 0;
  const self = `/test/${encodeURIComponent(data.slug || data._id)}`;
  const category = data.category && typeof data.category === "object" ? data.category : null;

  // a filter link keeps the other one (city + sort)
  const href = (next: { city?: string | null; sort?: string | null }) => {
    const params = new URLSearchParams();
    const c = next.city === undefined ? city?._id : next.city;
    const s = next.sort === undefined ? sort : next.sort;
    if (c) params.append("city", c);
    if (s && s !== "price") params.append("sort", s);
    const q = params.toString();
    return q ? `${self}?${q}` : self;
  };

  return (
    <ListPageLayout
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("tests"), target: "/test" },
        { title: data.name || "", target: self },
      ]}
    >
      <header className={classes.hero}>
        <div className={`${classes.icon} glassIcon tone-amber`}>
          <Ixon width="1.75rem">
            <FlaskIcon />
          </Ixon>
        </div>
        <div className={classes.heroText}>
          <h1 className={`${classes.title} ${tlgMedium}`}>{data.name}</h1>
          {!!data.summary && <p className={`${classes.summary} ${tsmRegular}`}>{data.summary}</p>}
          <div className={classes.facts}>
            {!!category?.name && (
              <Link href={`/test?category=${encodeURIComponent(category.slug || category._id)}`}>
                <Badge color="Primarylight" radius="High" mode="Fill" size="L">
                  {category.name}
                </Badge>
              </Link>
            )}
            {lowest > 0 && (
              <span className={`${classes.fact} ${tsmMedium}`}>
                {getContent("testFromPrice", [num.format(lowest)])}
              </span>
            )}
            {!!list.length && (
              <span className={`${classes.fact} ${tsmMedium}`}>
                {getContent("testLabsCount", [num.format(list.length)])}
              </span>
            )}
          </div>
        </div>
      </header>

      {(!!data.description || !!data.preparation) && (
        <div className={classes.info}>
          {!!data.description && (
            <section className={classes.card}>
              <h2 className={`${classes.h2} ${tbaseMedium}`}>{getContent("testAboutTitle")}</h2>
              <p className={`${classes.text} ${tsmRegular}`}>{data.description}</p>
            </section>
          )}
          {!!data.preparation && (
            <section className={classes.card}>
              <h2 className={`${classes.h2} ${tbaseMedium}`}>{getContent("testPreparationTitle")}</h2>
              <p className={`${classes.text} ${tsmRegular}`}>{data.preparation}</p>
            </section>
          )}
        </div>
      )}

      <section className={classes.labs} id="labs">
        <h2 className={`${classes.h2} ${tbaseMedium}`}>
          {getContent("labsOfferingTestX", [data.name || ""])}
        </h2>
        {cityList.length > 1 || city ? (
          <ListPageCategorySelector
            basePath={self}
            title={getContent("city")}
            categories={cityList}
            hrefOf={(c) => href({ city: c._id })}
            isActive={(c) => c._id === city?._id}
            allHref={href({ city: null })}
            allActive={!city}
          />
        ) : null}
        {!!rated && list.length > 1 && (
          <ListPageCategorySelector
            basePath={self}
            noIcon
            title={getContent("sortBy")}
            categories={[
              { _id: "price", name: getContent("cheapest") },
              { _id: "rating", name: getContent("Best") },
            ]}
            hrefOf={(c) => href({ sort: c._id })}
            isActive={(c) => c._id === sort}
            allHref={null}
          />
        )}
        {list.length ? (
          <ListPageList itemWidth="24.0625rem" pagination={{ currentPage: 1, pagesCount: 1, makePath: () => self }}>
            {list.map((offer) => (
              <CentreCard
                as="li"
                kind="paraClinic"
                key={offer._id}
                node={offer.paraClinic!}
                offer={{
                  _id: offer._id,
                  price: offer.price,
                  readyTime: offer.readyTime,
                  takesOrders: offer.takesOrders,
                }}
              />
            ))}
          </ListPageList>
        ) : (
          <p className={`${classes.empty} ${tsmRegular}`}>{getContent("testNoLabs")}</p>
        )}
      </section>

      {!!relatedList.length && (
        <section className={classes.related}>
          <h2 className={`${classes.h2} ${tbaseMedium}`}>{getContent("relatedTests")}</h2>
          <ul className={classes.relatedList}>
            {relatedList.map((node) => (
              <TestCard key={node._id} node={node} />
            ))}
          </ul>
        </section>
      )}
    </ListPageLayout>
  );
};

export default TestPage;
