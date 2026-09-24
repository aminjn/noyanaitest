import {
  categorizedDoctorActions,
  doctorActionCategories,
} from "@/Components/Enums/actions/doctorActions";
import {
  categorizedClinicActions,
  clinicActionCategories,
} from "@/Components/Enums/actions/clinicActions";
import {
  categorizedInsuranceActions,
  insuranceActionCategories,
} from "@/Components/Enums/actions/insuranceActions";
import {
  categorizedPharmacyActions,
  pharmacyActionCategories,
} from "@/Components/Enums/actions/pharmacyActions";
import {
  categorizedParaClinicActions,
  paraClinicActionCategories,
} from "@/Components/Enums/actions/paraClinicActions";
import {
  categorizedHospitalActions,
  hospitalActionCategories,
} from "@/Components/Enums/actions/hospitalActions";
import classes from "./MutateSecretaryAccessLevelPopup.module.css";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Input from "@/Components/UI/Input";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import ToggleInput from "@/Components/UI/ToggleInput";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import TableBox from "@/Components/UI/TableBox";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { Acl, NodeWithAcl } from "../Request/CreateSecretaryRequestPopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "secretaryManager"];

// Per-panel access-level tab groupings, each owned by that panel's own
// Components/Enums/actions/*.tsx file (which is itself kept in sync with the
// matching *Acl.ts action array on noyanai-back). Every node type is fully
// populated as of 2026-08 — previously only "doctor" had real categories
// here, so the other four panels' access-level create/edit/preview popups
// rendered no toggles at all.
export const categoriesAclMap: Record<NodeWithAcl, readonly ContentKey[]> = {
  doctor: doctorActionCategories,
  clinic: clinicActionCategories,
  insurance: insuranceActionCategories,
  pharmacy: pharmacyActionCategories,
  paraClinic: paraClinicActionCategories,
  hospital: hospitalActionCategories,
};

export const categorizedAclMap: Record<
  NodeWithAcl,
  Readonly<Record<string, readonly ContentKey[]>>
> = {
  doctor: categorizedDoctorActions,
  clinic: categorizedClinicActions,
  insurance: categorizedInsuranceActions,
  pharmacy: categorizedPharmacyActions,
  paraClinic: categorizedParaClinicActions,
  hospital: categorizedHospitalActions,
};

const MutateSecretaryAccessLevelPopup = ({
  mutate,
  node,
  name,
}: {
  node?: Acl<string[], unknown>;
  mutate: () => unknown;
  name: NodeWithAcl;
}) => {
  const { closePopup } = usePopup();

  const { isLoading, setInput, submit, input } = useForm<
    Record<string, unknown>
  >({
    path: `${API}/acl/${name}/acl${!!node ? `/${node._id}` : ""}`,
    method: "POST",
    successCb: () => {
      mutate();
      closePopup();
    },
  });

  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <PopupCard>
      <TableBox
        className={classes.main}
        title={getContent(!!node ? "editAccessLevel" : "createAccessLevel")}
      >
        <Input
          title={getContent("name")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, name: e.target.value }))
          }
          readOnly={isLoading}
          defaultValue={node?.name}
        />
        <ClientTabSystem
          items={categoriesAclMap[name].map((category) => ({
            id: category,
            title: getContent(category),
            content: (
              <div className={classes.list}>
                {categorizedAclMap[name][category].map((action) => (
                  <ToggleInput
                    title={getContent(action)}
                    key={action}
                    readOnly={isLoading}
                    value={
                      input[action] === undefined
                        ? !!node?.[action]
                        : !!input[action]
                    }
                    onChange={() =>
                      setInput((prev) => ({
                        ...prev,
                        [action]:
                          prev[action] === undefined
                            ? !node?.[action]
                            : !prev[action],
                      }))
                    }
                  />
                ))}
              </div>
            ),
          }))}
        />
        <FormActions className={classes.actions}>
          <Button onClick={submit}>{getContent("submit")}</Button>
          <Button variant="Error" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
        </FormActions>
      </TableBox>
    </PopupCard>
  );
};

export default MutateSecretaryAccessLevelPopup;
