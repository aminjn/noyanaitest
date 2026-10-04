"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import Link from "@/Components/i18n/Link";
import { API } from "@/Components/config";
import classes from "../../Accounting.module.css";
import crm from "../Crm.module.css";
import s from "./Service.module.css";
import { useBizFormat } from "../../bizShared";
import { CrmContext } from "../crmShared";
import { useRouter } from "@/Components/i18n/navigation";
import { Badge, ConfirmButton, listOf, useCall, useCrm, useCrmText, useGet, useWhen } from "./svc";

// «آموزش و دستورالعمل‌ها» (2026-10), nexxacrm's crm/knowledge: the centre's
// own procedures for its team - admission, insurance paperwork,
// sterilisation, dispensing - in categories made inline from the article
// form. The team reads the published ones; drafts are for whoever manages
// the CRM.

type Category = { _id: string; name: string; articles?: number };
type Article = {
  _id: string;
  title: string;
  content?: string;
  category?: { _id: string; name: string } | null;
  published: boolean;
  views: number;
  updatedAt: string;
  quizzes?: { _id: string; title: string }[];
};

const ArticlePopup = ({ article, onDone }: { article?: Article; onDone: (id?: string) => unknown }) => {
  const t = useCrmText();
  const { api } = useCrm();
  const { closePopup } = usePopup();
  const base = { title: article?.title || "", content: article?.content || "", category: article?.category?._id || null, published: !!article?.published };
  return (
    <PopupCard title={t(article ? "crmeEditArticle" : "crmeNewArticle")}>
      <CreateForm<typeof base>
        defaultValue={base}
        renderer={{
          title: { type: "text", title: t("crmeArticleTitle"), required: true },
          category: {
            type: "nodes",
            title: t("crmeCategory"),
            path: `${API}${api}/kb/categories`,
            getOptionLabel: (n) => (n as Category).name,
            getOptionValue: (n) => (n as Category)._id,
            getDefaultValue: (n) => n.category,
            clearable: true,
            creatable: { path: `${API}${api}/kb/categories` },
          },
          content: { type: "area", title: t("crmeArticleBody"), required: true },
          published: { type: "bool", title: t("crmePublished") },
        }}
        hookProps={{
          method: article ? "PATCH" : "POST",
          path: `${API}${api}/kb/articles${article ? `/${article._id}` : ""}`,
          parser: "JSON",
          mutator: (inp) => ({ ...base, ...inp }),
          successCb: (r) => {
            closePopup("CrmeArticle");
            onDone((r as { data?: { _id?: string } })?.data?._id);
          },
        }}
        onCancel={() => closePopup("CrmeArticle")}
      />
    </PopupCard>
  );
};

const ArticleList = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { canWrite, panel } = ctx;
  const call = useCall();
  const { setPopup } = usePopup();
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const cats = useGet<Category[]>("/kb/categories", (d) => listOf<Category>((d as { data?: unknown })?.data));
  const params = new URLSearchParams();
  if (cat) params.set("category", cat);
  if (q.trim()) params.set("q", q.trim());
  const { data, error, mutate } = useGet<Article[]>(`/kb/${canWrite ? "manage/" : ""}articles?${params}`, (d) => listOf<Article>(d));
  const open = () => setPopup("CrmeArticle", <CrmContext.Provider value={ctx}><ArticlePopup onDone={() => { mutate(); cats.mutate(); }} /></CrmContext.Provider>);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.filters}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("crmeSearchArticles")} />
          <div className={crm.chips}>
            <button type="button" className={`${crm.chip} ${!cat ? crm.chipOn : ""}`} onClick={() => setCat("")}>
              {t("all")}
            </button>
            {listOf<Category>(cats.data).map((c) => (
              <span key={c._id} className={s.row}>
                <button type="button" className={`${crm.chip} ${cat === c._id ? crm.chipOn : ""}`} onClick={() => setCat(c._id)}>
                  {c.name} ({f.money(c.articles || 0)})
                </button>
                {canWrite && cat === c._id && (
                  <ConfirmButton className={crm.linkDanger} onConfirm={async () => { if (await call("DELETE", `/kb/categories/${c._id}`)) { setCat(""); cats.mutate(); mutate(); } }}>
                    {t("crmeDeleteCategory")}
                  </ConfirmButton>
                )}
              </span>
            ))}
          </div>
        </div>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={open}>
            {t("crmeNewArticle")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (!data.length ? (
            <p className={classes.empty}>{t("crmeNoArticles")}</p>
          ) : (
            <Table
              data={data}
              name="CrmKnowledge"
              renderer={{
                title: { name: t("crmeArticleTitle"), value: (a) => a.title, filter: "Text", component: (a) => <Link href={`${panel}/crm/knowledge/${a._id}`}>{a.title}</Link> },
                category: { name: t("crmeCategory"), value: (a) => a.category?.name || "", filter: "Set" },
                published: {
                  name: t("crmeStatus"),
                  value: (a) => t(a.published ? "crmePublished" : "crmeDraft"),
                  filter: "Set",
                  component: (a) => <Badge tone={a.published ? "ok" : "muted"}>{t(a.published ? "crmePublished" : "crmeDraft")}</Badge>,
                },
                views: { name: t("crmeViews"), value: (a) => a.views, filter: "Number" },
                updatedAt: { name: t("crmeUpdated"), value: (a) => new Date(a.updatedAt), filter: "Date" },
              }}
            />
          ))}
      </HandleLoading>
    </section>
  );
};

const ArticleView = ({ id }: { id: string }) => {
  const t = useCrmText();
  const w = useWhen();
  const ctx = useCrm();
  const { canWrite, panel } = ctx;
  const call = useCall();
  const router = useRouter();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useGet<Article | null>(`/kb/${canWrite ? "manage/" : ""}articles/${id}`, (d) => (d && typeof d === "object" ? (d as Article) : null));
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <article className={classes.card}>
          <div className={classes.cardHead}>
            <div className={s.stack}>
              <Link href={`${panel}/crm/knowledge`} className={crm.linkButton}>
                {t("back")}
              </Link>
              <h2 className={classes.cardTitle}>{data.title}</h2>
              <span className={classes.muted}>
                {data.category?.name ? `${data.category.name} · ` : ""}
                {t("crmeUpdatedAt", [w.at(data.updatedAt)])} · {t("crmeViewsN", [String(data.views)])}
              </span>
            </div>
            {canWrite && (
              <div className={s.row}>
                {!data.published && <Badge tone="muted">{t("crmeDraft")}</Badge>}
                <button
                  type="button"
                  className={classes.ghost}
                  onClick={() => setPopup("CrmeArticle", <CrmContext.Provider value={ctx}><ArticlePopup article={data} onDone={() => mutate()} /></CrmContext.Provider>)}
                >
                  {t("bizEdit")}
                </button>
                <ConfirmButton onConfirm={async () => (await call("DELETE", `/kb/articles/${id}`)) && router.push(`${panel}/crm/knowledge`)}>{t("bizDelete")}</ConfirmButton>
              </div>
            )}
          </div>
          <div className={s.article}>{data.content}</div>
          {!!data.quizzes?.length && (
            <div className={s.row}>
              <span className={classes.muted}>{t("crmeQuizzesOfArticle")}</span>
              {data.quizzes.map((q) => (
                <Link key={q._id} href={`${panel}/crm/quizzes/${q._id}`} className={crm.chip}>
                  {q.title}
                </Link>
              ))}
            </div>
          )}
        </article>
      )}
    </HandleLoading>
  );
};

const CrmKnowledge = ({ id }: { id?: string }) => (id ? <ArticleView id={id} /> : <ArticleList />);

export default CrmKnowledge;
