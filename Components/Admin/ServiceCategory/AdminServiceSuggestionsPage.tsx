"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Button from "@/Components/UI/Button";
import PopupCard from "@/Components/UI/PopupCard";
import MultiSelectInputServer from "@/Components/UI/MultiSelectInputServer";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import HandleLoading from "../UI/HandleLoading";
import InlineLink from "../UI/InlineLink";
import WithTitle from "../UI/WithTitle";
import Table, { TableRenderer } from "../UI/Table";
import TableActions from "../UI/TableActions";
import FormActions from "../UI/FormActions";
import { ta } from "@/Components/Admin/i18n/adminText";
import { adminPath } from "@/Components/helpers/adminPath";
import { IServiceCategory } from "./AdminManageServiceCategoriesPage";
import classes from "./AdminServiceSuggestionsPage.module.css";

type Suggestion = IServiceCategory & { doctorCount?: number };

type Doctor = { _id: string; firstName?: string; lastName?: string };

const doctorOf = (row: Suggestion): Doctor | null =>
  row.suggestedBy && typeof row.suggestedBy === "object" && row.suggestedBy._id
    ? row.suggestedBy
    : null;

// merge a suggestion into a reviewed entry: its doctors (and any service or
// package filed under it) move to that entry, the suggestion is removed
const MergeServicePopup = ({
  node,
  mutate,
}: {
  node: Suggestion;
  mutate: () => unknown;
}) => {
  const [target, setTarget] = useState<IServiceCategory | null>(null);
  const [busy, setBusy] = useState(false);
  const { closePopup } = usePopup();
  const push = useNotification();
  const merge = async () => {
    if (busy) return;
    if (!target) {
      push(ta("خدمت مقصد را انتخاب کنید"), "Error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetcher({
        url: `${API}/admin/serviceCatalog/${node._id}/merge`,
        method: "POST",
        bodyParser: "JSON",
        payload: { into: target._id },
      });
      const doctors = Number(res?.data?.doctors) || 0;
      push(
        ta("ادغام شد؛ ${1} پزشک به «${2}» منتقل شدند.", [
          doctors,
          target.title || "",
        ]),
        "Success",
      );
      await mutate();
      closePopup();
    } catch (e) {
      push(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PopupCard title={ta("ادغام «${1}» در خدمت موجود", [node.title || ""])}>
      <div className={classes.popupBody}>
        <p>
          {ta(
            "پزشکانی که این خدمت را دارند به خدمت انتخاب‌شده منتقل می‌شوند و این پیشنهاد حذف می‌شود.",
          )}
        </p>
        <MultiSelectInputServer<IServiceCategory>
          multi={false}
          value={target ? [target] : []}
          placeholder={ta("خدمت تأییدشده را جست‌وجو کنید")}
          path={`${API}/public/search/serviceCategory`}
          getOption={(n) => ({ title: n.title || n._id, value: n._id })}
          onChange={(e) => setTarget(e[0] || null)}
        />
        <FormActions>
          <Button isLoading={busy} onClick={merge}>
            {ta("ادغام")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {ta("انصراف")}
          </Button>
        </FormActions>
      </div>
    </PopupCard>
  );
};

// «پیشنهادهای پزشکان»: services doctors added from their profile, live on
// their own page, waiting to join the global lists (filters, header search).
// One-way actions only: approve, or merge into an existing entry.
const AdminServiceSuggestionsPage = () => {
  const hasAccess = useAccessLevel();
  const canReview = hasAccess("Service", "update");
  const { setPopup } = usePopup();
  const push = useNotification();
  const [busyId, setBusyId] = useState("");
  const { data, error, mutate } = useSWR<Suggestion[]>(
    `${API}/admin/serviceCatalog/pending`,
    (url: string) =>
      fetcher({ url }).then((res) => {
        const list = res?.data?.data;
        return Array.isArray(list)
          ? (list as Suggestion[]).filter(
              (r) => r && typeof r === "object" && r._id,
            )
          : [];
      }),
  );

  const approve = async (node: Suggestion) => {
    if (busyId) return;
    setBusyId(node._id);
    try {
      await fetcher({
        url: `${API}/admin/serviceCatalog/${node._id}/approve`,
        method: "POST",
        bodyParser: "JSON",
        payload: {},
      });
      push(
        ta("«${1}» تأیید شد و در فهرست خدمات سایت آمد.", [node.title || ""]),
        "Success",
      );
      await mutate();
    } catch (e) {
      push(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusyId("");
    }
  };

  const renderer: TableRenderer<Suggestion> = {
    title: {
      name: ta("نام خدمت"),
      filter: "Text",
      value: (n) => n.title || "",
    },
    suggestedBy: {
      name: ta("پیشنهاد پزشک"),
      filter: "Text",
      value: (n) => {
        const d = doctorOf(n);
        return d ? `${d.firstName || ""} ${d.lastName || ""}`.trim() : "";
      },
      component: (n) => {
        const d = doctorOf(n);
        if (!d) return "—";
        return (
          <InlineLink href={adminPath(`/doctorprofile/${d._id}`)}>
            {`${d.firstName || ""} ${d.lastName || ""}`.trim() ||
              ta("بدون نام")}
          </InlineLink>
        );
      },
    },
    doctorCount: {
      name: ta("تعداد پزشکان"),
      filter: "Number",
      value: (n) => Number(n.doctorCount) || 0,
    },
    actions: {
      name: ta("عملیات"),
      // two labelled buttons side by side
      width: 300,
      component: (n) =>
        canReview ? (
          <TableActions>
            <Button
              variant="Success"
              size="S"
              isLoading={busyId === n._id}
              onClick={() => approve(n)}
            >
              {ta("تأیید")}
            </Button>
            <Button
              variant="Neutral"
              size="S"
              onClick={() =>
                setPopup(
                  "MergeServiceSuggestion",
                  <MergeServicePopup node={n} mutate={mutate} />,
                )
              }
            >
              {ta("ادغام در خدمت موجود")}
            </Button>
          </TableActions>
        ) : null,
    },
  };

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("پیشنهادهای پزشکان")}
          description={ta(
            "خدماتی که پزشکان از پروفایل خود افزوده‌اند. در صفحه‌ی همان پزشک دیده می‌شوند؛ پس از تأیید، در فیلتر نوبت‌دهی و جست‌وجوی سایت هم می‌آیند. اگر تکراری‌اند، در خدمت موجود ادغامشان کنید.",
          )}
        >
          <Table
            name="AdminServiceSuggestions"
            data={data}
            renderer={renderer}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminServiceSuggestionsPage;
