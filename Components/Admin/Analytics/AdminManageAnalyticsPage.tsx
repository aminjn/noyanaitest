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
import { ta } from "@/Components/Admin/i18n/adminText";

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
  (node.identity?.visitorId ? ta("مهمان (${1})", [node.identity.visitorId.slice(0, 8)]) : ta("ناشناس"));

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
              <DataPair title={ta("مجموع بازدید ها")} value={data.totals?.totalVisits ?? 0} />
            </Box>
            <Box className={classes.stat}>
              <DataPair
                title={ta("بازدیدکننده‌های یکتا")}
                value={data.totals?.uniqueVisitors ?? 0}
              />
            </Box>
            <Box className={classes.stat}>
              <DataPair
                title={ta("صفحات بازدید شده")}
                value={data.totals?.uniquePages ?? 0}
              />
            </Box>
            <Box className={classes.stat}>
              <DataPair
                title={ta("تعداد رکورد ها")}
                value={data.totals?.totalRecords ?? 0}
              />
            </Box>
          </div>

          <WithTitle title={ta("پربازدیدترین صفحات")}>
            <Table
              name="AdminAnalyticsTopPages"
              data={data.pages}
              renderer={{
                page: {
                  name: ta("صفحه"),
                  value: (node) => node.page,
                  filter: "Text",
                },
                totalVisits: {
                  name: ta("تعداد بازدید"),
                  value: (node) => node.totalVisits,
                  filter: "Number",
                },
                uniqueVisitors: {
                  name: ta("بازدیدکننده‌ی یکتا"),
                  value: (node) => node.uniqueVisitors,
                  filter: "Number",
                },
                lastVisitedAt: {
                  name: ta("آخرین بازدید"),
                  value: (node) => new Date(node.lastVisitedAt),
                  filter: "Date",
                },
              }}
            />
          </WithTitle>

          <WithTitle title={ta("بازدید های اخیر")}>
            <Table
              name="AdminAnalyticsRecentVisits"
              data={data.recent}
              renderer={{
                page: {
                  name: ta("صفحه"),
                  value: (node) => node.page,
                  filter: "Text",
                },
                visitor: {
                  name: ta("بازدیدکننده"),
                  value: (node) => visitorLabel(node),
                  filter: "Text",
                },
                count: {
                  name: ta("تعداد"),
                  value: (node) => node.count,
                  filter: "Number",
                },
                visitedAt: {
                  name: ta("اولین بازدید"),
                  value: (node) => new Date(node.visitedAt),
                  filter: "Date",
                },
                lastVisitedAt: {
                  name: ta("آخرین بازدید"),
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
