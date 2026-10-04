"use client";

import { ReactNode } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import HandleLoading from "./HandleLoading";
import WithTitle from "./WithTitle";
import TabSystem from "./TabSystem";
import CreateForm, { FormRenderer } from "./CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

// One record, one form, one save (2026-10). "New" opens this same page
// (`<path>/new`) with every field - not a name-only popup followed by a
// second page - and an existing record is edited in the same single form,
// its parts as tabs of that form (the `section` of each field) instead of
// several forms each with its own save button. Tabs that need the saved
// record (SEO, translations) appear once it exists. The pattern of the
// leaders' back-offices (Doctolib Pro, Shopify admin): one editor, one
// "Save".
const AdminRecordEditor = <T extends { _id: string }>({
  segment,
  path,
  nodeId,
  newTitle,
  titleOf,
  renderer,
  extraTabs,
  actions,
  readOnly,
}: {
  // the /auto segment, e.g. "disease"
  segment: string;
  // the admin path of the list, e.g. "/disease"
  path: string;
  // the record id, or "new"
  nodeId: string;
  newTitle: string;
  titleOf: (node: T) => string;
  renderer: FormRenderer<T>;
  // tabs that need the saved record (SEO, translations...)
  extraTabs?: (
    node: T,
  ) => { id: string; title: string; content: ReactNode; icon?: ReactNode }[];
  actions?: (
    node: T,
  ) => { title: string; action: () => unknown; danger?: boolean }[];
  // an admin whose role may read but not update this model
  readOnly?: boolean;
}) => {
  const isNew = nodeId === "new";
  const push = useProgress();
  const { data, error, mutate } = useSWR<T>(
    !isNew && nodeId ? `${API}/auto/${segment}/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const form = (
    <CreateForm<T, { data: { data: { _id: string } } }>
      key={isNew ? "new" : data?._id}
      layout="tabs"
      readOnly={readOnly}
      defaultValue={isNew ? undefined : data}
      hookProps={{
        path: isNew
          ? `${API}/auto/${segment}`
          : `${API}/auto/${segment}/${nodeId}`,
        method: "POST",
        successCb: (result) => {
          if (!isNew) return mutate();
          const id = result?.data?.data?._id;
          // the record exists now: the same editor, with its other tabs
          if (id) push(adminPath(`${path}/${id}`));
        },
      }}
      renderer={renderer}
    />
  );

  if (isNew)
    return (
      <WithTitle title={newTitle}>
        <p style={{ marginBottom: "1rem", lineHeight: 1.9 }}>
          {ta(
            "همه‌ی بخش‌ها را در همین فرم پر کنید و یک‌بار «ثبت» را بزنید. سئو و ترجمه‌ها بعد از ثبت باز می‌شوند.",
          )}
        </p>
        {form}
      </WithTitle>
    );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={titleOf(data) || ta("بدون نام")}
          actions={actions?.(data)}
        >
          {extraTabs ? (
            <TabSystem
              name={`AdminRecord-${segment}`}
              items={[
                { id: "record", title: ta("اطلاعات"), content: form },
                ...extraTabs(data),
              ]}
            />
          ) : (
            form
          )}
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminRecordEditor;
