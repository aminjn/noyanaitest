import classes from "./BecomeOrganizationForm.module.css";
import { API } from "../config";
import useForm from "../Hooks/useForm";
import Form from "../UI/Form";
import { BecomeOrgConfig } from "./becomeOrgs";
import Input from "../UI/Input";
import useUser, { userRoles } from "../Hooks/useUser";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import DateInput from "../UI/DateInput";
import FilesInput from "../Admin/UI/FilesInput";
import AreaInput from "../UI/AreaInput";
import ImageInput from "../UI/ImageInput";
import Button from "../UI/Button";
import usePopup from "../Hooks/usePopup";
import LogoutPopup from "../Popups/LogoutPopup";
import { useEffect, useMemo } from "react";
import Ixon from "../UI/Ixon";
import ClockIcon from "../Icons/ClockIcon";
import ClockSolidIcon from "../Icons/ClockSolidIcon";
import { txlBold } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "becomeSomething"];

type BecomeOrgInput = {
  name: string;
  siamCode: string;
  nationalId: string;
  licenseNumber: string;
  certificateDate: Date;
  certificateFile?: File;
  description?: string;
};

type BecomeRequest = {
  name: string;
  siamCode?: string;
  nationalId?: string;
  licenseNumber?: string;
  certificateDate: Date;
  certificateFile?: string;
  description?: string;
};

const BecomeOrganizationForm = ({
  org,
  mutate,
  pending,
  rejected,
  rejectReason,
}: {
  org: BecomeOrgConfig;
  mutate: () => unknown;
  // an open request: the form is shown read-only
  pending?: BecomeRequest;
  // the last request was declined: the form is editable again, prefilled
  rejected?: BecomeRequest;
  // why it was declined (the admin writes it in the requests queue)
  rejectReason?: string;
}) => {
  const getContent = useScopedLocale(NS);
  // an insurer names its Central Insurance licence; a centre its siam code
  // and national id
  const complete = (input: Partial<BecomeOrgInput>) =>
    !!input.name &&
    !!input.certificateDate &&
    !!input.certificateFile &&
    (org.licenseNumber ? !!input.licenseNumber?.trim() : !!input.nationalId && !!input.siamCode);

  const { input, isLoading, setInput, submit } = useForm<BecomeOrgInput>({
    path: `${API}${org.apiBase}`,
    method: "POST",
    successCb: () => mutate(),
    hasProblem: (input) => (!complete(input) ? getContent("checkInput") : false),
  });

  // a declined request is resubmitted from its old values: seed them into
  // the form state (the inputs only show them as defaults)
  // (keyed by content: the page builds a new object on every render)
  const rejectedKey = rejected ? JSON.stringify(rejected) : "";
  useEffect(() => {
    if (!rejectedKey) return;
    const values = JSON.parse(rejectedKey) as Record<string, unknown>;
    setInput((prev) => ({
      ...(Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== undefined && v !== null),
      ) as Partial<BecomeOrgInput>),
      ...prev,
    }));
  }, [rejectedKey, setInput]);

  const { user } = useUser();

  const { setPopup } = usePopup();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isOk = useMemo<boolean>(() => complete(input), [input, org.licenseNumber]);

  return (
    <div className={classes.container}>
      {!!pending && (
        <div className={classes.pending}>
          <div className={`${classes.icon} glassIcon tone-amber`}>
            <Ixon width="1.5rem">
              <ClockSolidIcon />
            </Ixon>
          </div>
          <h2 className={`${classes.title} ${txlBold}`}>
            {getContent("pendingApplicationTitle")}
          </h2>
          <p className={classes.legend}>
            {getContent("pendingApplicationLegend")}
          </p>
        </div>
      )}
      {!pending && !!rejected && (
        <div className={classes.pending}>
          <h2 className={`${classes.title} ${txlBold}`}>
            {getContent("rejectedApplicationTitle")}
          </h2>
          {rejectReason?.trim() ? (
            <p className={classes.legend}>
              {getContent("rejectedApplicationReason", [rejectReason.trim()])}
            </p>
          ) : (
            <p className={classes.legend}>
              {getContent("rejectedApplicationLegend")}
            </p>
          )}
        </div>
      )}
      <Form
        className={classes.main}
        onSubmit={() => {
          if (pending) return;
          submit();
        }}
      >
        <div className={classes.row}>
          <Input
            title={getContent("phoneNumber")}
            readOnly
            defaultValue={user?.phone}
          />
        </div>
        {org.licenseNumber ? (
          <div className={classes.row}>
            <Input
              title={getContent("insurerLicenseNumber")}
              readOnly={!!pending || isLoading}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, licenseNumber: e.target.value }))
              }
              required
              defaultValue={(pending || rejected)?.licenseNumber}
            />
          </div>
        ) : (
          <div className={classes.row}>
            <Input
              title={getContent("siamCode")}
              readOnly={!!pending || isLoading}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, siamCode: e.target.value }))
              }
              required
              defaultValue={(pending || rejected)?.siamCode}
            />
            {/* the organization's national ID, not the applicant's own code
                (two identical "national code" fields sat side by side, the
                read-only one always empty) */}
            <Input
              title={getContent("orgNationalId")}
              readOnly={!!pending || isLoading}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, nationalId: e.target.value }))
              }
              required
              defaultValue={(pending || rejected)?.nationalId}
            />
          </div>
        )}
        <div className={classes.row}>
          <Input
            title={getContent("organizationName")}
            readOnly={!!pending || isLoading}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            defaultValue={(pending || rejected)?.name}
          />
          <DateInput
            title={getContent("certificateDate")}
            readOnly={!!pending || isLoading}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, certificateDate: e }))
            }
            defaultValue={(pending || rejected)?.certificateDate}
          />
        </div>
        <div className={classes.row}>
          <ImageInput
            required
            readOnly={!!pending || isLoading}
            onChange={(e) =>
              setInput((prev) => ({
                ...prev,
                certificateFile: e.target.files?.[0],
              }))
            }
            title={getContent("certificateFile")}
            defaultValue={(pending || rejected)?.certificateFile}
          />
        </div>
        <div className={classes.row}>
          <AreaInput
            readOnly={!!pending || isLoading}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, description: e.target.value }))
            }
            title={getContent("description")}
            defaultValue={(pending || rejected)?.description}
          />
        </div>
        {!!pending ? (
          <div className={classes.pendingActions}>
            <Button
              tailIcon={<ClockIcon />}
              size="L"
              radius="High"
              variant="Disable"
              mode="Fill"
            >
              {getContent("enterDashboard")}
            </Button>
            <Button
              href="/"
              size="L"
              radius="High"
              variant="Primary"
              mode="Outline"
            >
              {getContent("goHomePage")}
            </Button>
          </div>
        ) : (
          <div className={classes.actions}>
            <Button
              onClick={() => setPopup("Logout", <LogoutPopup />)}
              variant="Primary"
              mode="Outline"
              radius="High"
              size="L"
              type="button"
            >
              {getContent("logoutOrChangeNumber")}
            </Button>
            <Button
              type="submit"
              variant={isOk ? "Primary" : "Disable"}
              mode="Fill"
              size="L"
              radius="High"
              isLoading={isLoading}
            >
              {getContent("confirmInformation")}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};

export default BecomeOrganizationForm;
