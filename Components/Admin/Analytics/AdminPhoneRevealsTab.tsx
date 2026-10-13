"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import WithTitle from "../UI/WithTitle";
import Box from "../UI/Box";
import DataPair from "../UI/DataPair";
import Link from "@/Components/i18n/Link";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminManageAnalyticsPage.module.css";

type Kind = "doctor" | "clinic" | "hospital" | "pharmacy" | "paraClinic";

type Report = {
  days: number;
  totals: { reveals: number; visitors: number; targets: number };
  perTarget: { _id: string; kind: Kind; target: string; name?: string; slug?: string; reveals: number; visitors: number; last: string }[];
  perDay: { _id: string; date: string; count: number }[];
  recent: {
    _id: string;
    kind: Kind;
    name?: string;
    slug?: string;
    source?: string;
    device?: string;
    visitor?: string;
    user?: { phone?: string; username?: string };
    createdAt: string;
  }[];
};

const kindLabel = (k: Kind) =>
  ({
    doctor: ta("پزشک"),
    clinic: ta("کلینیک"),
    hospital: ta("بیمارستان"),
    pharmacy: ta("داروخانه"),
    paraClinic: ta("پاراکلینیک"),
  })[k] || k;

const publicPath: Record<Kind, string> = {
  doctor: "/dr",
  clinic: "/clinic",
  hospital: "/hospital",
  pharmacy: "/pharmacy",
  paraClinic: "/paraClinic",
};

const deviceLabel = (d?: string) =>
  d === "mobile" ? ta("موبایل") : d === "tablet" ? ta("تبلت") : ta("دسکتاپ");

// «نمایش شماره تماس» (2026-10): every reveal of a profile's number on the
// public site - totals, the profiles patients call most, and the latest
// reveals (backend phoneRevealController.getPhoneRevealReport)
const AdminPhoneRevealsTab = () => {
  const { data, error } = useSWR<Report>(`${API}/analytics/phone-reveals?days=30`, (url: string) =>
    fetcher<{ data: Report }>({ url }).then((res) => res.data),
  );
  const nameCell = (row: { kind: Kind; name?: string; slug?: string; target?: string }) =>
    row.slug ? (
      <Link href={`${publicPath[row.kind]}/${row.slug}`} target="_blank">
        {row.name || row.slug}
      </Link>
    ) : (
      row.name || "-"
    );
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.stats}>
            <Box className={classes.stat}>
              <DataPair title={ta("دفعات نمایش شماره")} value={data.totals?.reveals ?? 0} />
            </Box>
            <Box className={classes.stat}>
              <DataPair title={ta("بازدیدکننده‌ی یکتا")} value={data.totals?.visitors ?? 0} />
            </Box>
            <Box className={classes.stat}>
              <DataPair title={ta("پروفایل‌ها")} value={data.totals?.targets ?? 0} />
            </Box>
          </div>
          <WithTitle title={`${ta("بیشترین نمایش شماره")} · ${ta("در ${1} روز اخیر", [String(data.days)])}`}>
            <Table
              name="AdminPhoneRevealsTop"
              data={Array.isArray(data.perTarget) ? data.perTarget : []}
              renderer={{
                name: { name: ta("پروفایل"), value: (row) => row.name || "-", component: (row) => nameCell(row), filter: "Text" },
                kind: { name: ta("نوع"), value: (row) => kindLabel(row.kind), filter: "Text" },
                reveals: { name: ta("تعداد نمایش"), value: (row) => row.reveals, filter: "Number" },
                visitors: { name: ta("بازدیدکننده‌ی یکتا"), value: (row) => row.visitors, filter: "Number" },
                last: { name: ta("آخرین نمایش"), value: (row) => new Date(row.last), filter: "Date" },
              }}
            />
          </WithTitle>
          <WithTitle title={ta("نمایش‌های اخیر")}>
            <Table
              name="AdminPhoneRevealsRecent"
              data={Array.isArray(data.recent) ? data.recent : []}
              renderer={{
                name: { name: ta("پروفایل"), value: (row) => row.name || "-", component: (row) => nameCell(row), filter: "Text" },
                kind: { name: ta("نوع"), value: (row) => kindLabel(row.kind), filter: "Text" },
                user: {
                  name: ta("کاربر"),
                  value: (row) =>
                    row.user?.phone || row.user?.username || (row.visitor ? ta("مهمان (${1})", [row.visitor]) : ta("ناشناس")),
                  filter: "Text",
                },
                device: { name: ta("دستگاه"), value: (row) => deviceLabel(row.device), filter: "Text" },
                source: { name: ta("صفحه"), value: (row) => row.source || "-", filter: "Text" },
                createdAt: { name: ta("زمان"), value: (row) => new Date(row.createdAt), filter: "Date" },
              }}
            />
          </WithTitle>
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminPhoneRevealsTab;
