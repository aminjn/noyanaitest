import classes from "./AdminManageOllamaModels.module.css";

import useSWR from "swr";
import WithTitle from "../UI/WithTitle";
import { Fragment, useState } from "react";
import PopupCard from "@/Components/UI/PopupCard";
import Loading from "../UI/Loading";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import Button from "@/Components/UI/Button";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type OllamaModelPopulation = Population<Record<never, never>>;

export interface IOllamaModel<
  T extends OllamaModelPopulation = OllamaModelPopulation,
> extends MongoDoc {
  name: string;
  modelName: string;
  modifiedAt: Date;
  size: number;
  digest: string;
  family: string;
  parameterSize: string;
  quantizationLevel: string;
  loaded: boolean;
}

const ModelLoadToggler = ({
  node,
  mutate,
}: {
  node: IOllamaModel;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Fragment>
      <Button onClick={() => setIsLoading(true)} isLoading={isLoading}>
        {node.loaded ? "Unload Model" : "Load Model"}
      </Button>
      <Act
        path={isLoading ? `${API}/ollama/model/${node._id}` : null}
        method={node.loaded ? "PUT" : "POST"}
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
        }}
      />
    </Fragment>
  );
};

export type ModelOptionsPopulation = Population<{
  OllamaModel: OllamaModelPopulation;
}>;
export interface IModelOptions<
  T extends ModelOptionsPopulation = ModelOptionsPopulation,
> extends MongoDoc {
  ollamaModel: T["OllamaModel"] extends OllamaModelPopulation
    ? IOllamaModel<T["OllamaModel"]>
    : string;
  numa: boolean;
  num_ctx: number;
  num_batch: number;
  num_gpu: number;
  main_gpu: number;
  low_vram: boolean;
  f16_kv: boolean;
  logits_all: boolean;
  vocab_only: boolean;
  use_mmap: boolean;
  use_mlock: boolean;
  embedding_only: boolean;
  num_thread: number;
  num_keep: number;
  seed: number;
  num_predict: number;
  top_k: number;
  top_p: number;
  tfs_z: number;
  typical_p: number;
  repeat_last_n: number;
  temperature: number;
  repeat_penalty: number;
  presence_penalty: number;
  frequency_penalty: number;
  mirostat: number;
  mirostat_tau: number;
  mirostat_eta: number;
  penalize_newline: boolean;
  stop: string[];
}

const ModelOptionsPopup = ({ model }: { model: IOllamaModel }) => {
  const { data, error, mutate } = useSWR<IModelOptions | null>(
    `${API}/ollama/settings/${model._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [isDefaulting, setIsDefaulting] = useState<boolean>();

  const { closePopup } = usePopup();
  return (
    <HandleLoading data={data !== undefined} error={error}>
      {data !== undefined && (
        <PopupCard title={ta("مدل جدید")}>
          <Button
            onClick={() => setIsDefaulting(true)}
            isLoading={isDefaulting}
          >
            Restore Defaults
          </Button>
          <div className={classes.form}>
            <CreateForm
              onCancel={() => {
                closePopup();
              }}
              hookProps={{
                path: `${API}/ollama/settings/${model._id}`,
                mutator: (inp) => ({ ...data, ...inp }),
                method: "POST",
                successCb: () => {
                  mutate();
                  closePopup();
                },
              }}
              defaultValue={data}
              renderer={{
                numa: { title: "numa", type: "bool" },
                num_ctx: { title: "Num Ctx", type: "number" },
                num_batch: { title: "Num Batch", type: "number" },
                num_gpu: { title: "Num GPU", type: "number" },
                main_gpu: { title: "Main GPU", type: "number" },
                low_vram: { title: "Low VRam", type: "bool" },
                f16_kv: { title: "f16 kv", type: "bool" },
                logits_all: { title: "logits_all", type: "bool" },
                vocab_only: { title: "Vocab Only", type: "bool" },
                use_mmap: { title: "Use MMap", type: "bool" },
                use_mlock: { title: "Use MLock", type: "bool" },
                embedding_only: { title: "Embeding Only", type: "bool" },
                num_thread: { title: "NUm Thread", type: "number" },
                num_keep: { title: "Num Keep", type: "number" },
                seed: { title: "Seed", type: "number" },
                num_predict: { title: "Num Predict", type: "number" },
                top_k: { title: "Top K", type: "number" },
                top_p: { title: "Top P", type: "number" },
                tfs_z: { title: "TFS Z", type: "number" },
                typical_p: { title: "Typical P", type: "number" },
                repeat_last_n: { title: "Repeat Last N", type: "number" },
                temperature: { title: "Temperature", type: "number" },
                repeat_penalty: { title: "Repeat Penalty", type: "number" },
                presence_penalty: { title: "Presence Penalty", type: "number" },
                frequency_penalty: {
                  title: "Frequency Penalty",
                  type: "number",
                },
                mirostat: { title: "Mirostat", type: "text" },
                mirostat_tau: { title: "Mirostat TAU", type: "number" },
                mirostat_eta: { title: "Mirostat ETA", type: "number" },
                penalize_newline: { title: "Penalize New Line", type: "bool" },
                stop: { title: "Stop", type: "strings" },
              }}
            />
          </div>
        </PopupCard>
      )}
      <Act
        path={isDefaulting ? `${API}/ollama/settings/${model._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsDefaulting(false);
          if (!status) return;
          mutate();
        }}
      />
    </HandleLoading>
  );
};

export type GlobalOllamaSettingsPopulation = Population<{
  DefaultModel: OllamaModelPopulation;
}>;
export interface IGlobalOllamaSettings<
  T extends GlobalOllamaSettingsPopulation = GlobalOllamaSettingsPopulation,
> extends MongoDoc {
  singleton: "SINGLETON";
  defaultModel?: T["DefaultModel"] extends OllamaModelPopulation
    ? IOllamaModel<T["DefaultModel"]>
    : string;
}

const GlobalOllamaSettingsPopup = () => {
  const { data, error, mutate } = useSWR<
    IGlobalOllamaSettings<{ DefaultModel: Record<never, never> }>
  >(`${API}/auto/globalOllamaSettings`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { closePopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <PopupCard title={ta("مدل جدید")}>
          <CreateForm
            defaultValue={data}
            renderer={{
              defaultModel: {
                title: "Default Model",
                type: "nodes",
                multi: false,
                path: `${API}/auto/ollamaModel`,
                getOptionLabel: (node) => (node as IOllamaModel).name,
                getOptionValue: (node) => (node as IOllamaModel)._id,
                getDefaultValue: (node) => node.defaultModel,
              },
            }}
            hookProps={{
              path: `${API}/auto/globalOllamaSettings`,
              method: "POST",
              successCb: () => {
                mutate();
                closePopup();
              },
            }}
            onCancel={() => closePopup()}
          />
        </PopupCard>
      )}
    </HandleLoading>
  );
};

const AdminManageOllamaModels = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { data, error, mutate } = useSWR<IOllamaModel[]>(
    `${API}/auto/ollamaModel`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("مدل ها")}
          actions={[
            {
              title: ta("رفرش"),
              action: () => setIsRefreshing(true),
            },
            {
              title: ta("تنظیمات"),
              action: () =>
                setPopup("GlobalOllamaSetting", <GlobalOllamaSettingsPopup />),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageOllamaModels"
            renderer={{
              name: {
                name: ta("نام"),
                value: (node) => node.name,
                filter: "Text",
              },
              loaded: {
                name: ta("بارگذاری شده"),
                value: (node) => booleanToValue[`${!!node.loaded}`],
                component: (node) => <BooleanToIcon value={!!node.loaded} />,
                filter: "Set",
              },
              family: {
                name: ta("خانواده"),
                value: (node) => node.family,
                filter: "Set",
              },
              parameterSize: {
                name: ta("تعداد پارامتر"),
                value: (node) => node.parameterSize,
                filter: "Text",
              },
              size: {
                name: ta("حجم"),
                value: (node) => node.size,
                filter: "Number",
                component: (node) =>
                  typeof node.size === "number"
                    ? `${(node.size / 1024 ** 3).toFixed(1)} GB`
                    : "—",
              },
              modifiedAt: {
                name: ta("آخرین تغییر"),
                value: (node) => new Date(node.modifiedAt),
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                width: 240,
                component: (node) => (
                  <TableActions>
                    <ModelLoadToggler
                      node={node}
                      mutate={() => setIsRefreshing(true)}
                    />
                    <Button
                      onClick={() =>
                        setPopup(
                          "ModelOptions",
                          <ModelOptionsPopup model={node} />,
                        )
                      }
                    >
                      Settings
                    </Button>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
      <Act
        path={isRefreshing ? `${API}/ollama/tags` : null}
        method="POST"
        onDone={(status, result) => {
          setIsRefreshing(false);
          if (!status) return;
          mutate();
        }}
        initMessage="Refreshing"
        successMessage="Refreshed"
      />
    </HandleLoading>
  );
};

export default AdminManageOllamaModels;
