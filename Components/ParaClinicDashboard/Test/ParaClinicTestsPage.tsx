"use client";

import { Fragment, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import usePopup from "@/Components/Hooks/usePopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import PopupCard from "@/Components/UI/PopupCard";
import Act from "@/Components/UI/Act";
import PlusIcon from "@/Components/Icons/PlusIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import { ITest } from "@/Components/Admin/Test/AdminManageTestsPage";
import { IParaClinicTest } from "@/Components/Admin/ParaClinic/AdminManageParaClinicPage";

const NS: ContentNamespace[] = ["common", "paraClinicPanelTest"];

type MyParaClinicTest = IParaClinicTest<{
  Test: { Category: Record<never, never> };
}>;

type AvailableTest = ITest<{ Category: Record<never, never> }>;

// Fields a paraClinic is allowed to send when adding/editing its own ParaClinicTest.
// Ownership fields (test/paraClinic) are intentionally excluded; the backend also
// rejects them outright via a strict schema.
type ParaClinicEditableTestFields = Pick<
  IParaClinicTest,
  "price" | "readyTime"
>;

const AddMyTestPopup = ({
  test,
  mutate,
}: {
  test: AvailableTest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);
  return (
    <PopupCard>
      <CreateForm<ParaClinicEditableTestFields>
        onCancel={() => closePopup()}
        renderer={{
          price: { type: "number", title: getContent("price"), price: true },
          readyTime: { type: "text", title: getContent("readyTime") },
        }}
        hookProps={{
          path: `${API}/paraClinic/myTest`,
          method: "POST",
          decorators: { test: test._id },
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

const EditMyTestPopup = ({
  node,
  mutate,
}: {
  node: MyParaClinicTest;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);
  return (
    <PopupCard>
      <CreateForm<ParaClinicEditableTestFields>
        defaultValue={node}
        onCancel={() => closePopup()}
        renderer={{
          price: { type: "number", title: getContent("price"), price: true },
          readyTime: { type: "text", title: getContent("readyTime") },
        }}
        hookProps={{
          path: `${API}/paraClinic/myTest/${node._id}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

const DeleteMyTestPopup = ({
  node,
  mutate,
}: {
  node: MyParaClinicTest;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);
  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeleteMyTest")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/paraClinic/myTest/${node._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

const ParaClinicAvailableTestsTab = () => {
  const { data, error, mutate } = useSWR<AvailableTest[]>(
    `${API}/paraClinic/test`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setPopup } = usePopup();
  const getContent = useScopedLocale(NS);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("availableTests")}>
          <Table
            name="ParaClinicAvailableTests"
            data={data}
            renderer={{
              name: {
                name: getContent("name"),
                value: (node) => node.name,
                filter: "Text",
              },
              category: {
                name: getContent("category"),
                value: (node) =>
                  node.category
                    ? node.category.name || node.category._id
                    : getContent("unset"),
                filter: "Multi",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title={getContent("addTest")}
                      onClick={() =>
                        setPopup(
                          "AddMyTest",
                          <AddMyTestPopup test={node} mutate={mutate} />,
                        )
                      }
                    >
                      <PlusIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

const ParaClinicMyTestsTab = () => {
  const { data, error, mutate } = useSWR<MyParaClinicTest[]>(
    `${API}/paraClinic/myTest`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setPopup } = usePopup();
  const getContent = useScopedLocale(NS);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("myTests")}>
          <Table
            name="ParaClinicMyTests"
            data={data}
            renderer={{
              name: {
                name: getContent("name"),
                value: (node) => node.test.name || node.test._id,
                filter: "Text",
              },
              category: {
                name: getContent("category"),
                value: (node) =>
                  node.test.category
                    ? node.test.category.name || node.test.category._id
                    : getContent("unset"),
                filter: "Multi",
              },
              price: {
                name: getContent("price"),
                value: (node) => node.price,
                component: (node) => (node.price ? currencize(node.price) : ""),
                filter: "Number",
              },
              readyTime: {
                name: getContent("readyTime"),
                value: (node) => node.readyTime,
                filter: "Text",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "EditMyTest",
                          <EditMyTestPopup node={node} mutate={mutate} />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteMyTest",
                          <DeleteMyTestPopup node={node} mutate={mutate} />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

const ParaClinicTestsPage = () => {
  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/paraClinicPanel" },
    { title: getContent("tests"), target: "/paraClinicPanel/test" },
  ]);

  return (
    <TabSystem
      name="ParaClinicTests"
      items={[
        {
          id: "MyTests",
          title: getContent("myTests"),
          content: <ParaClinicMyTestsTab />,
        },
        {
          id: "AvailableTests",
          title: getContent("availableTests"),
          content: <ParaClinicAvailableTestsTab />,
        },
      ]}
    />
  );
};

export default ParaClinicTestsPage;
