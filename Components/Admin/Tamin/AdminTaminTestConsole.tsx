"use client";

import { useState } from "react";
import WithTitle from "../UI/WithTitle";
import Box from "../UI/Box";
import SelectInput from "@/Components/UI/SelectInput";
import AreaInput from "@/Components/UI/AreaInput";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useNotification from "@/Components/Hooks/useNotification";

const responseBoxStyle = {
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-all" as const,
  marginTop: "1rem",
  maxHeight: "24rem",
  overflow: "auto",
};

// Generic admin-only debug tool for Controllers/adminTaminController.ts
// (2026-09) - one instance per org type (doctor/pharmacy/clinic/
// paraClinic), each pointed at that org's dispatcher endpoint
// (POST /admin/tamin/<org>/test). Not part of any real business flow.
// Mirrors Components/Admin/Snapp/AdminSnappTestPage.tsx's "raw console"
// half almost exactly (action select + JSON payload textarea + response
// viewer) - real doctor/pharmacy/clinic/paraClinic accounts can no longer
// reach Tamin at all (see Controllers/featureGateController.ts on
// noyanai-back), so this is now the only way to exercise the sandbox API.
const AdminTaminTestConsole = ({
  title,
  apiPath,
  actionOptions,
  // OAuth helper (2026-09) - only doctor/clinic have a Tamin OAuth flow
  // (getChallenge/exchangeCode actions must exist in actionOptions for
  // this to be worth turning on). Since there's no dedicated admin OAuth
  // callback page, the tester opens Tamin's authorize page manually, then
  // copy-pastes the "code" query param Tamin appends when it redirects
  // back to redirectUri - same manual round-trip as any OAuth sandbox
  // testing without a registered callback route.
  oauth,
}: {
  title: string;
  apiPath: string;
  actionOptions: Record<string, string>;
  oauth?: boolean;
}) => {
  const pushNotification = useNotification();

  const [action, setAction] = useState<string>(Object.keys(actionOptions)[0]);
  const [payloadText, setPayloadText] = useState<string>("{}");
  const [requestBody, setRequestBody] = useState<{
    action: string;
    payload: unknown;
  } | null>(null);
  const [response, setResponse] = useState<unknown>(null);

  // ---- OAuth helper state ----
  const [challenge, setChallenge] = useState<string>("");
  const [redirectUri, setRedirectUri] = useState<string>(
    "http://localhost/tamin",
  );
  const [code, setCode] = useState<string>("");
  const [oauthRequest, setOauthRequest] = useState<{
    action: string;
    payload: unknown;
  } | null>(null);

  const run = () => {
    let payload: unknown = {};
    if (payloadText.trim()) {
      try {
        payload = JSON.parse(payloadText);
      } catch {
        pushNotification("ورودی JSON معتبر نیست", "Error");
        return;
      }
    }
    setResponse(null);
    setRequestBody({ action, payload });
  };

  return (
    <WithTitle title={title}>
      {oauth && (
        <Box style={{ marginBottom: "1rem" }}>
          <Input
            title="redirect_uri"
            defaultValue={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <Button
              variant="Secondary"
              isLoading={
                !!oauthRequest && oauthRequest.action === "getChallenge"
              }
              onClick={() => {
                setChallenge("");
                setOauthRequest({ action: "getChallenge", payload: {} });
              }}
            >
              دریافت challenge
            </Button>
            {!!challenge && (
              <Button
                variant="Secondary"
                onClick={() => {
                  window.open(
                    `${process.env.TAMIN_DOMAIN}/auth/server/authorize?redirect_uri=${encodeURIComponent(
                      redirectUri,
                    )}&code_challenge=${challenge}&client_id=portal-js&response_type=code&code_challenge_method=S256`,
                    "_blank",
                  );
                }}
              >
                باز کردن صفحه احراز هویت تامین
              </Button>
            )}
          </div>
          {!!challenge && (
            <>
              <Input
                title="code (از آدرس بازگشتی تامین کپی کنید)"
                onChange={(e) => setCode(e.target.value)}
              />
              <Button
                isLoading={
                  !!oauthRequest && oauthRequest.action === "exchangeCode"
                }
                style={{ marginTop: "1rem" }}
                onClick={() => {
                  if (!code.trim()) {
                    pushNotification("ابتدا code را وارد کنید", "Warn");
                    return;
                  }
                  setOauthRequest({
                    action: "exchangeCode",
                    payload: { code, redirectUri },
                  });
                }}
              >
                تبادل کد و دریافت توکن
              </Button>
            </>
          )}
        </Box>
      )}

      <Box>
        <SelectInput
          title="عملیات"
          options={actionOptions}
          defaultValue={action}
          onChange={(e) => setAction(e.target.value)}
        />
        <AreaInput
          title="ورودی (JSON) - هر فیلدی که بفرستید جایگزین مقادیر پیش‌فرض سندباکس می‌شود"
          defaultValue={payloadText}
          onChange={(e) => setPayloadText(e.target.value)}
        />
        <Button
          onClick={run}
          isLoading={!!requestBody}
          style={{ marginTop: "1rem" }}
        >
          اجرا
        </Button>
        {response !== null && (
          <pre style={responseBoxStyle}>{JSON.stringify(response, null, 2)}</pre>
        )}
      </Box>

      <Act
        path={requestBody ? apiPath : null}
        method="POST"
        payload={requestBody || undefined}
        onDone={(status, result) => {
          setRequestBody(null);
          setResponse(status ? result : { error: "درخواست با خطا مواجه شد" });
        }}
      />

      {oauth && (
        <Act<{ data: { challenge?: string; ok?: boolean } }>
          path={oauthRequest ? apiPath : null}
          method="POST"
          payload={oauthRequest || undefined}
          onDone={(status, result) => {
            const ranAction = oauthRequest?.action;
            setOauthRequest(null);
            if (!status || !result) {
              pushNotification("درخواست با خطا مواجه شد", "Error");
              return;
            }
            if (ranAction === "getChallenge" && result.data.challenge) {
              setChallenge(result.data.challenge);
            }
            if (ranAction === "exchangeCode" && result.data.ok) {
              pushNotification("توکن با موفقیت دریافت شد", "Success");
              setCode("");
            }
          }}
        />
      )}
    </WithTitle>
  );
};

export default AdminTaminTestConsole;
