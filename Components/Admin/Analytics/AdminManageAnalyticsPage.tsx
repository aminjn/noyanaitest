"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import WithTitle from "../UI/WithTitle";
import Box from "../UI/Box";
import DataPair from "../UI/DataPair";
import classes from "./AdminManageAnalyticsPage.module.css";

export interface IAnalyticsTotals {
  totalVisits: number;
  totalRecords: number;
  uniqueVisitors: number;
  uniquePages: number;
}

export interface IPageAnalytic {
  page: string;
  totalVisits: number;
  uniqueVisitors: number;
  lastVisitedAt: Date;
}

export interface IAnalyticsVisitorIdentity extends MongoDoc {
  visitorId: string;
  user?: { _id: string; phone: string; username?: string };
}

export interface IAnalyticsPageVisit extends MongoDoc {
  identity?: IAnalyticsVisitorIdentity;
  page: string;
  visitedAt: Date;
  lastVisitedAt: Date;
  count: number;
}

export interface IAnalyticsSummary {
  totals: IAnalyticsTotals;
  pages: IPageAnalytic[];
  recent: IAnalyticsPageVisit[];
}

const visitorLabel = (node: IAnalyticsPageVisit): string =>
  node.identity?.user?.phone ||
  node.identity?.user?.username ||
  (node.identity?.visitorId ? `مهمان (${node.identity.visitorId.slice(0, 8)})` : "ناشناس");

const AdminManageAnalyticsPage = () => {
  const { data, error } = useSWR<IAnalyticsSummary>(
    `${API}/analytics/summary`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.stats}>
            <Box className={classes.stat}>
              <DataPair title="مجموع بازدید ها" value={data.totals.totalVisits} />
            </Box>
            <Box className={classes.stat}>
              <DataPair
                title="بازدیدکننده‌های یکتا"
                value={data.totals.uniqueVisitors}
              />
            </Box>
            <Box className={classes.stat}>
              <DataPair
                title="صفحات بازدید شده"
                value={data.totals.uniquePages}
              />
            </Box>
            <Box className={classes.stat}>
              <DataPair
                title="تعداد رکورد ها"
                value={data.totals.totalRecords}
              />
            </Box>
          </div>

          <WithTitle title="پربازدیدترین صفحات">
            <Table
              name="AdminAnalyticsTopPages"
              data={data.pages}
              renderer={{
                page: {
                  name: "صفحه",
                  value: (node) => node.page,
                  filter: "Text",
                },
                totalVisits: {
                  name: "تعداد بازدید",
                  value: (node) => node.totalVisits,
                  filter: "Number",
                },
                uniqueVisitors: {
                  name: "بازدیدکننده‌ی یکتا",
                  value: (node) => node.uniqueVisitors,
                  filter: "Number",
                },
                lastVisitedAt: {
                  name: "آخرین بازدید",
                  value: (node) => new Date(node.lastVisitedAt),
                  filter: "Date",
                },
              }}
            />
          </WithTitle>

          <WithTitle title="بازدید های اخیر">
            <Table
              name="AdminAnalyticsRecentVisits"
              data={data.recent}
              renderer={{
                page: {
                  name: "صفحه",
                  value: (node) => node.page,
                  filter: "Text",
                },
                visitor: {
                  name: "بازدیدکننده",
                  value: (node) => visitorLabel(node),
                  filter: "Text",
                },
                count: {
                  name: "تعداد",
                  value: (node) => node.count,
                  filter: "Number",
                },
                visitedAt: {
                  name: "اولین بازدید",
                  value: (node) => new Date(node.visitedAt),
                  filter: "Date",
                },
                lastVisitedAt: {
                  name: "آخرین بازدید",
                  value: (node) => new Date(node.lastVisitedAt),
                  filter: "Date",
                },
              }}
            />
          </WithTitle>
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminManageAnalyticsPage;
