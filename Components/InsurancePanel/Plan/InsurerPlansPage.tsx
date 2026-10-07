"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import PopupCard from "@/Components/UI/PopupCard";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import InsurerTariffsTab from "./InsurerTariffsTab";

const NS: ContentNamespace[] = ["common", "insurerPanel"];

type Plan = {
  _id: string;
  name?: string;
  price?: number;
  features?: string[];
  isActive?: boolean;
  isPopular?: boolean;
  order?: number;
};

// The insurer's own plans (2026-10): name, premium and what each covers;
// "shown on the site" puts it on the insurer's public page.
const PlanFormPopup = ({ plan, onDone }: { plan?: Plan; onDone: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  return (
    <PopupCard title={plan ? plan.name || getContent("insPlans") : getContent("insNewPlan")}>
      <CreateForm<Plan>
        defaultValue={plan}
        onCancel={() => closePopup()}
        hookProps={{
          path: plan ? `${API}/insurance/plan/${plan._id}` : `${API}/insurance/plan`,
          method: plan ? "PATCH" : "POST",
          parser: "JSON",
          successCb: () => {
            closePopup();
            onDone();
          },
        }}
        renderer={{
          name: { type: "text", title: getContent("insPlanName"), required: true },
          price: { type: "number", title: getContent("insPlanPrice") },
          features: { type: "strings", title: getContent("insPlanFeatures") },
          isActive: { type: "bool", title: getContent("insPlanActive") },
          isPopular: { type: "bool", title: getContent("insPlanPopular") },
        }}
      />
    </PopupCard>
  );
};

const InsurerPlansPage = () => {
  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<Plan[]>(`${API}/insurance/plan`, (url: string) =>
    fetcher({ url }).then((res) => (Array.isArray(res.data) ? res.data : [])),
  );
  useBreadCrump([
    { title: getContent("dashboard"), target: "/insurancepanel" },
    { title: getContent("insPlans"), target: "/insurancepanel/plan" },
  ]);

  const remove = async (id: string) => {
    try {
      await fetcher({ url: `${API}/insurance/plan/${id}`, method: "DELETE" });
      mutate();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    }
  };

  const plans = (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={getContent("insPlans")}
          actions={[
            {
              title: getContent("insNewPlan"),
              action: () => setPopup("InsurerPlan", <PlanFormPopup onDone={() => mutate()} />),
            },
          ]}
        >
          <Table
            name="InsurerPlans"
            data={data}
            renderer={{
              name: { name: getContent("insPlanName"), value: (n) => n.name || "", filter: "Text" },
              price: {
                name: getContent("insPlanPrice"),
                value: (n) => n.price || 0,
                component: (n) => currencize(n.price || 0),
                filter: "Number",
              },
              features: {
                name: getContent("insPlanFeatures"),
                value: (n) => (Array.isArray(n.features) ? n.features.join("، ") : ""),
                filter: "Text",
              },
              isActive: {
                name: getContent("insPlanActive"),
                value: (n) => (n.isActive ? "✓" : "—"),
                filter: "Set",
              },
              actions: {
                name: getContent("actions"),
                component: (n) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup("InsurerPlan", <PlanFormPopup plan={n} onDone={() => mutate()} />)
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton variant="Danger" onClick={() => remove(n._id)}>
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

  // (2026-10) the plans and their tariffs, one page: a tariff is "what a
  // plan pays for a visit"
  return (
    <ClientTabSystem
      items={[
        { id: "Plans", title: getContent("insPlans"), content: plans },
        { id: "Tariffs", title: getContent("insTariffs"), content: <InsurerTariffsTab /> },
      ]}
    />
  );
};

export default InsurerPlansPage;
