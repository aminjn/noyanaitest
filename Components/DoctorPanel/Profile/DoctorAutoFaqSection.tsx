import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import IconButton from "@/Components/Admin/UI/IconButton";
import Badge from "@/Components/UI/Badge";
import Button from "@/Components/UI/Button";
import Link from "@/Components/i18n/Link";
import EditIcon from "@/Components/Icons/EditIcon";
import EyeIcon from "@/Components/Icons/EyeIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import { useIntlLocale, useListSeparator } from "@/Components/i18n/navigation";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import {
  applyAutoFaqOverrides,
  AutoFaqOverride,
  buildDoctorFaq,
  DoctorFaqFacts,
  doctorDisplayName,
  MAX_AUTO_FAQ,
  MergedAutoFaq,
} from "@/Components/Seo/autoFaq";
import EditAutoFaqPopup from "./EditAutoFaqPopup";
import classes from "./DoctorAutoFaqSection.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelProfile"];

type AutoFaqResponse = {
  enabled: boolean;
  facts: DoctorFaqFacts;
  hashes: Record<string, string>;
  overrides: AutoFaqOverride[];
  doctor: { _id: string; firstName?: string; lastName?: string; slug?: string };
};

// The automatic questions of the doctor's public page (2026-10,
// Components/Seo/autoFaq.ts), worded exactly as the page words them, with
// what the doctor can change: the wording (question / answer), hide or
// show, the order, and back to automatic. Only the changes are stored, so
// an untouched item keeps following the data (a new fee, a new office, the
// next free time); a rewritten answer whose facts changed since shows
// "your data changed - update this answer?".
const DoctorAutoFaqSection = () => {
  const { data, error, mutate } = useSWR<AutoFaqResponse>(`${API}/doctor/faq/auto`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  const getContent = useScopedLocale(NS);
  const intl = useIntlLocale();
  const sep = useListSeparator();
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState<string | null>(null);

  const items = useMemo<MergedAutoFaq[]>(() => {
    if (!data || typeof data !== "object") return [];
    const drafts = buildDoctorFaq(data.facts, data.doctor || {}, { t: getContent, intl, sep });
    return applyAutoFaqOverrides(drafts, data.overrides, data.hashes);
  }, [data, getContent, intl, sep]);
  // what the public page shows: the visible ones, at most MAX_AUTO_FAQ
  const shownKeys = useMemo(
    () => new Set(items.filter((i) => !i.hidden).slice(0, MAX_AUTO_FAQ).map((i) => i.key)),
    [items],
  );

  const run = async (key: string, req: Parameters<typeof fetcher>[0]) => {
    setBusy(key);
    try {
      await fetcher(req);
      await mutate();
    } catch (err) {
      pushNotification((err as Error)?.message || getContent("unknownErrorOccured"), "Error");
    } finally {
      setBusy(null);
    }
  };
  const save = (key: string, payload: Record<string, unknown>) =>
    run(key, { url: `${API}/doctor/faq/auto/${key}`, method: "PUT", bodyParser: "JSON", payload });
  const reset = (key: string) => run(key, { url: `${API}/doctor/faq/auto/${key}`, method: "DELETE" });
  const move = (index: number, delta: -1 | 1) => {
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    const keys = items.map((i) => i.key);
    [keys[index], keys[to]] = [keys[to], keys[index]];
    run(items[index].key, {
      url: `${API}/doctor/faq/auto/order`,
      method: "PUT",
      bodyParser: "JSON",
      payload: { keys },
    });
  };

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          style={{ boxShadow: "none" }}
          title={getContent("afqPanelTitle")}
          description={getContent("afqPanelLegend")}
        >
          {data.enabled === false && <p className={classes.notice}>{getContent("afqPanelOff")}</p>}
          {!items.length ? (
            <p className={classes.empty}>{getContent("afqPanelEmpty")}</p>
          ) : (
            <ol className={classes.list}>
              {items.map((item, index) => (
                <li
                  key={item.key}
                  className={`${classes.item} ${item.hidden ? classes.itemHidden : ""}`}
                  aria-busy={busy === item.key}
                >
                  <div className={classes.head}>
                    <h4 className={classes.question}>{item.question}</h4>
                    <div className={classes.badges}>
                      {item.edited && (
                        <Badge color="Info" mode="Outline" radius="High">
                          {getContent("afqEdited")}
                        </Badge>
                      )}
                      {(item.hidden || !shownKeys.has(item.key)) && (
                        <Badge color="Warning" mode="Outline" radius="High">
                          {getContent("afqHiddenBadge")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className={classes.answer}>{item.answer}</p>
                  {item.stale && (
                    <div className={classes.stale} role="status">
                      <p className={classes.staleText}>{getContent("afqStale")}</p>
                      <p className={classes.staleAuto}>
                        <b>{getContent("afqCurrentAuto")}:</b> {item.autoAnswer}
                      </p>
                      <div className={classes.staleActions}>
                        <Button size="S" mode="Fill" radius="High" onClick={() => reset(item.key)}>
                          {getContent("afqResetAuto")}
                        </Button>
                        <Button
                          size="S"
                          mode="Outline"
                          radius="High"
                          onClick={() => save(item.key, { customAnswer: item.answer })}
                        >
                          {getContent("afqKeepMine")}
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className={classes.actions}>
                    <IconButton
                      title={getContent("afqEditItem")}
                      onClick={() =>
                        setPopup(
                          "EditAutoFaq",
                          <EditAutoFaqPopup item={item} mutate={mutate} />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      title={getContent(item.hidden ? "afqShowItem" : "afqHideItem")}
                      variant={item.hidden ? "Success" : "Neutral"}
                      onClick={() => save(item.key, { hidden: !item.hidden })}
                    >
                      <EyeIcon />
                    </IconButton>
                    <IconButton
                      title={getContent("afqMoveUp")}
                      variant="Neutral"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className={classes.up}
                    >
                      <ChevronIcon />
                    </IconButton>
                    <IconButton
                      title={getContent("afqMoveDown")}
                      variant="Neutral"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                      className={classes.down}
                    >
                      <ChevronIcon />
                    </IconButton>
                    {item.edited && !item.stale && (
                      <Button size="S" mode="Inline" radius="High" onClick={() => reset(item.key)}>
                        {getContent("afqResetAuto")}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {!!data.doctor?.slug && (
            <Link href={`/dr/${data.doctor.slug}#dr-faq`} className={classes.pageLink} target="_blank">
              {getContent("afqTitle", [
                doctorDisplayName({ t: getContent, intl, sep }, data.doctor.firstName, data.doctor.lastName),
              ])}
            </Link>
          )}
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default DoctorAutoFaqSection;
