"use client";

import { useEffect, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import DateInput from "@/Components/UI/DateInput";
import Link from "@/Components/i18n/Link";
import classes from "../../Accounting.module.css";
import crm from "../Crm.module.css";
import s from "./Service.module.css";
import { isoDay, useBizFormat } from "../../bizShared";
import { CrmContext } from "../crmShared";
import { Badge, ConfirmButton, listOf, TeamOptions, useCall, useCrm, useCrmText, useGet, useMine, useTeamName } from "./svc";

// «آزمون کارکنان» (2026-10), nexxacrm's crm/knowledge/quizzes: quizzes on
// the centre's procedures, given to the whole team or one member with a
// due date, marked on the server (the right answers never reach the page),
// and a printable certificate for a pass.

type MyQuiz = {
  _id: string;
  title: string;
  description?: string;
  passScore: number;
  questions: number;
  assigned: boolean;
  dueDate?: string | null;
  attempts: number;
  bestScore: number | null;
  passedAttempt: string | null;
  // archived after it was passed: the certificate stays, the quiz is not taken again
  archived?: boolean;
};
type TakeQuiz = { _id: string; title: string; description?: string; passScore: number; questions: { _id: string; text: string; options: string[]; multi: boolean }[] };
type Question = { text: string; options: string[]; correct: number[] };
type Quiz = {
  _id: string;
  title: string;
  description?: string;
  article?: { _id: string; title: string } | string | null;
  passScore: number;
  active: boolean;
  questions: Question[];
  assignments?: number;
  attempts?: number;
  passes?: number;
  archived?: boolean;
};
type Status = { userId: string; name: string; status: "passed" | "attempted" | "pending"; bestScore: number | null; dueDate: string | null };
type Certificate = { quiz: string; name: string; score: number; passScore: number; org: string; at: string; code: string; archived?: boolean };

const statusKey = { passed: "crmeQzPassed", attempted: "crmeQzAttempted", pending: "crmeQzPending" } as const;

export const CertificatePopup = ({ attemptId, manage }: { attemptId: string; manage?: boolean }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { data, error } = useGet<Certificate | null>(`/quiz-attempts/${attemptId}/certificate${manage ? "/manage" : ""}`, (d) => (d && typeof d === "object" ? (d as Certificate) : null));
  return (
    <PopupCard title={t("crmeCertificate")}>
      <div className={classes.popup}>
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <>
              <div className={s.certificate}>
                <span className={classes.muted}>{data.org}</span>
                <span className={s.certTitle}>{t("crmeCertificate")}</span>
                <span>{t("crmeCertFor")}</span>
                <span className={s.certName}>{data.name}</span>
                <span>{t("crmeCertText", [data.quiz, f.money(data.score)])}</span>
                <span className={classes.muted}>
                  {f.date(data.at)} · <bdi dir="ltr">{data.code}</bdi>
                </span>
              </div>
              {data.archived && <p className={`${s.hint} ${s.noPrint}`}>{t("crmeCertArchived")}</p>}
              <div className={`${classes.actions} ${s.noPrint}`}>
                <button type="button" className={classes.primary} onClick={() => window.print()}>
                  {t("crmePrint")}
                </button>
              </div>
            </>
          )}
        </HandleLoading>
      </div>
    </PopupCard>
  );
};

// the quiz as the team member takes it
const TakeQuizView = ({ id }: { id: string }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const call = useCall();
  const ctx = useCrm();
  const { setPopup } = usePopup();
  const { data, error } = useGet<TakeQuiz | null>(`/quizzes/${id}/take`, (d) => (d && typeof d === "object" ? (d as TakeQuiz) : null));
  const [answers, setAnswers] = useState<number[][]>([]);
  const [result, setResult] = useState<{ _id: string; score: number; passed: boolean; correctCount: number; total: number } | null>(null);
  useEffect(() => setAnswers(listOf<TakeQuiz["questions"][number]>(data?.questions).map(() => [])), [data]);
  const pick = (qi: number, oi: number, multi: boolean) =>
    setAnswers((a) => a.map((x, i) => (i !== qi ? x : multi ? (x.includes(oi) ? x.filter((y) => y !== oi) : [...x, oi]) : [oi])));
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <div className={s.stack}>
              <Link href={`${ctx.panel}/crm/quizzes`} className={crm.linkButton}>
                {t("back")}
              </Link>
              <h2 className={classes.cardTitle}>{data.title}</h2>
              {data.description && <p className={s.hint}>{data.description}</p>}
              <span className={classes.muted}>{t("crmePassScoreN", [f.money(data.passScore)])}</span>
            </div>
          </div>
          {result ? (
            <div className={s.stack}>
              <div className={s.result}>
                <Badge tone={result.passed ? "ok" : "bad"}>{t(result.passed ? "crmeQzPassed" : "crmeQzFailed")}</Badge>
                <p>{t("crmeScoreLine", [f.money(result.score), String(result.correctCount), String(result.total)])}</p>
              </div>
              <div className={s.row}>
                {result.passed && (
                  <button type="button" className={classes.primary} onClick={() => setPopup("CrmeCert", <CrmContext.Provider value={ctx}><CertificatePopup attemptId={result._id} /></CrmContext.Provider>)}>
                    {t("crmeCertificate")}
                  </button>
                )}
                <button type="button" className={classes.ghost} onClick={() => { setResult(null); setAnswers(data.questions.map(() => [])); }}>
                  {t("crmeTryAgain")}
                </button>
              </div>
            </div>
          ) : (
            <div className={s.stack}>
              {data.questions.map((q, qi) => (
                <fieldset key={q._id} className={s.question}>
                  <legend className={s.strong}>
                    {qi + 1}. {q.text}
                  </legend>
                  {q.multi && <span className={s.hint}>{t("crmeMulti")}</span>}
                  {q.options.map((o, oi) => (
                    <label key={oi} className={s.option}>
                      <input type={q.multi ? "checkbox" : "radio"} name={`q${qi}`} checked={!!answers[qi]?.includes(oi)} onChange={() => pick(qi, oi, q.multi)} />
                      {o}
                    </label>
                  ))}
                </fieldset>
              ))}
              <div className={classes.actions}>
                <button
                  type="button"
                  className={classes.primary}
                  disabled={answers.some((a) => !a.length)}
                  onClick={async () => setResult((await call<typeof result>("POST", `/quizzes/${id}/attempt`, { answers }, false)) || null)}
                >
                  {t("crmeSubmitQuiz")}
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </HandleLoading>
  );
};

const QuizEditor = ({ quiz, onDone }: { quiz?: Quiz; onDone: () => unknown }) => {
  const t = useCrmText();
  const call = useCall();
  const { closePopup } = usePopup();
  const articles = useGet<{ _id: string; title: string }[]>("/kb/manage/articles", (d) => listOf<{ _id: string; title: string }>(d));
  const [title, setTitle] = useState(quiz?.title || "");
  const [description, setDescription] = useState(quiz?.description || "");
  const [passScore, setPassScore] = useState(quiz?.passScore ?? 70);
  const [article, setArticle] = useState(typeof quiz?.article === "object" ? quiz?.article?._id || "" : quiz?.article || "");
  const [questions, setQuestions] = useState<Question[]>(quiz?.questions?.length ? quiz.questions : [{ text: "", options: ["", ""], correct: [0] }]);
  const setQ = (i: number, patch: Partial<Question>) => setQuestions((x) => x.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const valid = title.trim().length >= 2 && questions.every((q) => q.text.trim() && q.options.filter((o) => o.trim()).length >= 2 && q.correct.length);
  const save = async () => {
    const payload = {
      title,
      description: description || null,
      passScore,
      article: article || null,
      questions: questions.map((q) => ({ text: q.text, options: q.options.map((o) => o.trim()).filter(Boolean), correct: q.correct.filter((c) => q.options[c]?.trim()) })),
    };
    if (await call(quiz ? "PATCH" : "POST", `/quizzes${quiz ? `/${quiz._id}` : ""}`, payload)) {
      closePopup("CrmeQuiz");
      onDone();
    }
  };
  return (
    <PopupCard title={t(quiz ? "crmeEditQuiz" : "crmeNewQuiz")}>
      <div className={classes.popup}>
        <div className={s.stepFields}>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeQuizTitle")}
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
          </label>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeQuizDesc")}
            <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
          </label>
          <label className={classes.field}>
            {t("crmePassScore")}
            <input type="number" min={0} max={100} dir="ltr" value={passScore} onChange={(e) => setPassScore(Number(e.target.value) || 0)} />
          </label>
          <label className={classes.field}>
            {t("crmeQuizArticle")}
            <select value={article} onChange={(e) => setArticle(e.target.value)}>
              <option value="">—</option>
              {listOf<{ _id: string; title: string }>(articles.data).map((a) => (
                <option key={a._id} value={a._id}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className={s.hint}>{t("crmeCorrectHint")}</p>
        {questions.map((q, i) => (
          <div key={i} className={s.question}>
            <div className={s.between}>
              <span className={s.strong}>{t("crmeQuestionN", [String(i + 1)])}</span>
              {questions.length > 1 && (
                <button type="button" className={crm.linkDanger} onClick={() => setQuestions((x) => x.filter((_, j) => j !== i))}>
                  {t("bizDelete")}
                </button>
              )}
            </div>
            <input value={q.text} onChange={(e) => setQ(i, { text: e.target.value })} maxLength={500} placeholder={t("crmeQuestionText")} />
            {q.options.map((o, oi) => (
              <div key={oi} className={s.option}>
                <input
                  type="checkbox"
                  checked={q.correct.includes(oi)}
                  aria-label={t("crmeCorrect")}
                  onChange={() => setQ(i, { correct: q.correct.includes(oi) ? q.correct.filter((c) => c !== oi) : [...q.correct, oi] })}
                />
                <input
                  value={o}
                  maxLength={300}
                  placeholder={t("crmeOptionN", [String(oi + 1)])}
                  onChange={(e) => setQ(i, { options: q.options.map((x, j) => (j === oi ? e.target.value : x)) })}
                />
                {q.options.length > 2 && (
                  <button
                    type="button"
                    className={crm.linkDanger}
                    onClick={() => setQ(i, { options: q.options.filter((_, j) => j !== oi), correct: q.correct.filter((c) => c !== oi).map((c) => (c > oi ? c - 1 : c)) })}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {q.options.length < 8 && (
              <button type="button" className={crm.linkButton} onClick={() => setQ(i, { options: [...q.options, ""] })}>
                {t("crmeAddOption")}
              </button>
            )}
          </div>
        ))}
        <div className={s.row}>
          <button type="button" className={classes.ghost} onClick={() => setQuestions((x) => [...x, { text: "", options: ["", ""], correct: [0] }])}>
            {t("crmeAddQuestion")}
          </button>
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup("CrmeQuiz")}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={!valid} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const QuizManage = ({ quizId, onDone }: { quizId: string; onDone: () => unknown }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const call = useCall();
  const ctx = useCrm();
  const nameOf = useTeamName();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useGet<{ quiz: Quiz; assignments: { _id: string; scope: "all" | "user"; user?: string; dueDate?: string }[]; status: Status[] } | null>(
    `/quizzes/${quizId}`,
    (d) => (d && typeof d === "object" ? (d as never) : null),
  );
  const [scope, setScope] = useState<"all" | "user">("all");
  const [user, setUser] = useState("");
  const [due, setDue] = useState<Date | null>(null);
  return (
    <PopupCard title={data?.quiz?.title || t("crmeQuiz")}>
      <div className={classes.popup}>
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <>
              <div className={s.row}>
                <button
                  type="button"
                  className={classes.ghost}
                  onClick={() => setPopup("CrmeQuiz", <CrmContext.Provider value={ctx}><QuizEditor quiz={data.quiz} onDone={() => { mutate(); onDone(); }} /></CrmContext.Provider>)}
                >
                  {t("bizEdit")}
                </button>
                <button type="button" className={classes.ghost} onClick={async () => { if (await call("POST", `/quizzes/${quizId}/toggle`)) { mutate(); onDone(); } }}>
                  {t(data.quiz.active ? "crmeDeactivate" : "crmeActivate")}
                </button>
              </div>
              <h3 className={classes.cardTitle}>{t("crmeAssign")}</h3>
              <div className={s.stepFields}>
                <label className={classes.field}>
                  {t("crmeAssignTo")}
                  <select value={scope} onChange={(e) => setScope(e.target.value as "all" | "user")}>
                    <option value="all">{t("crmeWholeTeam")}</option>
                    <option value="user">{t("crmeOneMember")}</option>
                  </select>
                </label>
                {scope === "user" && (
                  <label className={classes.field}>
                    {t("crmeMember")}
                    <select value={user} onChange={(e) => setUser(e.target.value)}>
                      <TeamOptions none="crmeChoose" />
                    </select>
                  </label>
                )}
                <div className={classes.field}>
                  <DateInput title={t("crmeDueDate")} onChange={(d) => setDue(d)} />
                </div>
              </div>
              <button
                type="button"
                className={classes.primary}
                disabled={scope === "user" && !user}
                onClick={async () => {
                  if (await call("POST", `/quizzes/${quizId}/assign`, { scope, ...(scope === "user" ? { user } : {}), ...(due ? { dueDate: isoDay(due) } : {}) })) {
                    mutate();
                    onDone();
                  }
                }}
              >
                {t("crmeAssign")}
              </button>
              {data.assignments.length > 0 && (
                <ul className={crm.miniList}>
                  {data.assignments.map((a) => (
                    <li key={a._id} className={s.between}>
                      <span>
                        {a.scope === "all" ? t("crmeWholeTeam") : nameOf(a.user)}
                        {a.dueDate ? ` · ${t("crmeUntil", [f.date(a.dueDate)])}` : ""}
                      </span>
                      <ConfirmButton onConfirm={async () => { if (await call("DELETE", `/quiz-assignments/${a._id}`)) { mutate(); onDone(); } }}>{t("bizDelete")}</ConfirmButton>
                    </li>
                  ))}
                </ul>
              )}
              <h3 className={classes.cardTitle}>{t("crmeWhoTook")}</h3>
              {!data.status.length ? (
                <p className={classes.empty}>{t("crmeNoAssign")}</p>
              ) : (
                <ul className={crm.miniList}>
                  {data.status.map((st) => (
                    <li key={st.userId} className={s.between}>
                      <span>
                        {st.name || "—"}
                        {st.dueDate ? <span className={classes.muted}> · {t("crmeUntil", [f.date(st.dueDate)])}</span> : null}
                      </span>
                      <span className={s.row}>
                        {st.bestScore !== null && <span className={classes.muted}>{t("crmeBestN", [f.money(st.bestScore)])}</span>}
                        <Badge tone={st.status === "passed" ? "ok" : st.status === "attempted" ? "warn" : "muted"}>{t(statusKey[st.status])}</Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </HandleLoading>
      </div>
    </PopupCard>
  );
};

const QuizList = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { canWrite, panel } = ctx;
  const call = useCall();
  const { setPopup } = usePopup();
  const { mutate: mutateMine } = useMine();
  const mine = useGet<MyQuiz[]>("/quizzes/mine", (d) => listOf<MyQuiz>(d));
  // the archived ones under their own filter
  const [archived, setArchived] = useState(false);
  const all = useGet<Quiz[]>(canWrite ? `/quizzes${archived ? "?archived=1" : ""}` : null, (d) => listOf<Quiz>(d));
  const refresh = () => {
    mine.mutate();
    all.mutate();
    mutateMine();
  };
  const wrap = (n: React.ReactNode) => <CrmContext.Provider value={ctx}>{n}</CrmContext.Provider>;
  return (
    <div className={s.stack}>
      <section className={classes.card}>
        <h2 className={classes.cardTitle}>{t("crmeMyQuizzes")}</h2>
        <HandleLoading data={!!mine.data} error={mine.error}>
          {!!mine.data &&
            (!mine.data.length ? (
              <p className={classes.empty}>{t("crmeNoQuizzes")}</p>
            ) : (
              <ul className={crm.miniList}>
                {mine.data.map((q) => (
                  <li key={q._id} className={s.between}>
                    <span className={s.stack}>
                      <span className={s.strong}>{q.title}</span>
                      <span className={classes.muted}>
                        {t("crmeQuestionsN", [String(q.questions)])} · {t("crmePassScoreN", [f.money(q.passScore)])}
                        {q.dueDate ? ` · ${t("crmeUntil", [f.date(q.dueDate)])}` : ""}
                        {q.bestScore !== null ? ` · ${t("crmeBestN", [f.money(q.bestScore)])}` : ""}
                      </span>
                    </span>
                    <span className={s.row}>
                      {q.archived && <Badge tone="muted">{t("crmeArchived")}</Badge>}
                      {q.assigned && !q.passedAttempt && !q.archived && <Badge tone="warn">{t("crmeQzPending")}</Badge>}
                      {q.passedAttempt ? (
                        <button type="button" className={classes.ghost} onClick={() => setPopup("CrmeCert", wrap(<CertificatePopup attemptId={q.passedAttempt!} />))}>
                          {t("crmeCertificate")}
                        </button>
                      ) : null}
                      {!q.archived && (
                        <Link href={`${panel}/crm/quizzes/${q._id}`} className={classes.primary}>
                          {t("crmeTakeQuiz")}
                        </Link>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
        </HandleLoading>
      </section>
      {canWrite && (
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <h2 className={classes.cardTitle}>{t("crmeManageQuizzes")}</h2>
            <div className={classes.segmented} role="tablist">
              {[false, true].map((a) => (
                <button key={String(a)} type="button" role="tab" aria-selected={archived === a} className={archived === a ? classes.on : ""} onClick={() => setArchived(a)}>
                  {t(a ? "crmeArchived" : "crmeCurrent")}
                </button>
              ))}
            </div>
            <button type="button" className={classes.primary} onClick={() => setPopup("CrmeQuiz", wrap(<QuizEditor onDone={refresh} />))}>
              {t("crmeNewQuiz")}
            </button>
          </div>
          <HandleLoading data={!!all.data} error={all.error}>
            <Table
              data={listOf<Quiz>(all.data)}
              name="CrmQuizzes"
              renderer={{
                title: { name: t("crmeQuizTitle"), value: (q) => q.title, filter: "Text" },
                questions: { name: t("crmeQuestions"), value: (q) => q.questions?.length || 0, filter: "Number" },
                active: {
                  name: t("crmeStatus"),
                  value: (q) => t(q.archived ? "crmeArchived" : q.active ? "crmeActive" : "crmInactive"),
                  filter: "Set",
                  component: (q) => <Badge tone={q.active && !q.archived ? "ok" : "muted"}>{t(q.archived ? "crmeArchived" : q.active ? "crmeActive" : "crmInactive")}</Badge>,
                },
                assignments: { name: t("crmeAssignments"), value: (q) => q.assignments || 0, filter: "Number" },
                passes: { name: t("crmeQzPassed"), value: (q) => `${q.passes || 0} / ${q.attempts || 0}` },
                actions: {
                  name: t("crmeActions"),
                  component: (q) =>
                    q.archived ? (
                      <button type="button" className={classes.ghost} onClick={async () => (await call("POST", `/quizzes/${q._id}/restore`)) && refresh()}>
                        {t("crmeRestore")}
                      </button>
                    ) : (
                      <span className={s.row}>
                        <button type="button" className={classes.ghost} onClick={() => setPopup("CrmeQuizManage", wrap(<QuizManage quizId={q._id} onDone={refresh} />))}>
                          {t("crmeManage")}
                        </button>
                        <ConfirmButton onConfirm={async () => (await call("DELETE", `/quizzes/${q._id}`)) && refresh()}>{t("crmeArchive")}</ConfirmButton>
                      </span>
                    ),
                },
              }}
            />
          </HandleLoading>
        </section>
      )}
    </div>
  );
};

const CrmQuizzes = ({ id }: { id?: string }) => (id ? <TakeQuizView id={id} /> : <QuizList />);

export default CrmQuizzes;
