"use client";

import { useState } from "react";
import WithTitle from "../UI/WithTitle";
import Box from "../UI/Box";
import Input from "@/Components/UI/Input";
import SelectInput from "@/Components/UI/SelectInput";
import AreaInput from "@/Components/UI/AreaInput";
import Button from "@/Components/UI/Button";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useNotification from "@/Components/Hooks/useNotification";
import { ta } from "@/Components/Admin/i18n/adminText";

// Internal, admin-only debug tool for Lib/snappClient.ts on noyanai-back
// (2026-09) - not part of any real business flow. Two independent testers:
// a raw console that pokes any Snapp endpoint directly (POST /admin/snapp/test)
// and a section that exercises the real pharmacy delivery-dispatch logic
// (POST/GET /admin/snapp/delivery) against any pharmacy/order pair, without
// needing to log in as that pharmacy. Kept as plain Persian strings rather
// than contentKeys entries, matching the other admin-only debug pages
// (Components/Admin/Ollama/AdminManageOllamaModels.tsx) rather than the
// customer-facing convention.
const snappTestActionOptions: Record<string, string> = {
  get balance() {
  return ta("موجودی حساب (balance)");
},
  get price() {
  return ta("استعلام قیمت سفر (price)");
},
  get requestRide() {
  return ta("ثبت درخواست سفر (requestRide)");
},
  get activeRides() {
  return ta("سفرهای فعال (activeRides)");
},
  get refreshRide() {
  return ta("بروزرسانی سفر با hri (refreshRide)");
},
  get rideStatus() {
  return ta("وضعیت سفر با hri (rideStatus)");
},
  get cancelRide() {
  return ta("لغو سفر با hri (cancelRide)");
},
  get rideHistory() {
  return ta("تاریخچه سفرها (rideHistory)");
},
  get financialHistory() {
  return ta("تاریخچه مالی (financialHistory)");
},
  get payment() {
  return ta("ایجاد پرداخت (payment)");
},
};

const responseBoxStyle = {
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-all" as const,
  marginTop: "1rem",
  maxHeight: "24rem",
  overflow: "auto",
};

const AdminSnappTestPage = () => {
  const pushNotification = useNotification();

  // ---- Raw console ----
  const [action, setAction] = useState<string>("balance");
  const [payloadText, setPayloadText] = useState<string>("{}");
  const [consolePayload, setConsolePayload] = useState<{
    action: string;
    payload: unknown;
  } | null>(null);
  const [consoleResponse, setConsoleResponse] = useState<unknown>(null);

  const runConsoleAction = () => {
    let payload: unknown = {};
    if (payloadText.trim()) {
      try {
        payload = JSON.parse(payloadText);
      } catch {
        pushNotification(ta("ورودی JSON معتبر نیست"), "Error");
        return;
      }
    }
    setConsoleResponse(null);
    setConsolePayload({ action, payload });
  };

  // ---- Delivery dispatch tester ----
  const [pharmacyId, setPharmacyId] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<"GET" | "POST" | null>(
    null,
  );
  const [deliveryResponse, setDeliveryResponse] = useState<unknown>(null);

  const startDelivery = (method: "GET" | "POST") => {
    if (!pharmacyId.trim() || !orderId.trim()) {
      pushNotification(ta("شناسه داروخانه و شناسه سفارش الزامی است"), "Warn");
      return;
    }
    setDeliveryResponse(null);
    setDeliveryMethod(method);
  };

  return (
    <WithTitle title={ta("تست اتصال اسنپ")}>
      <Box style={{ marginBottom: "1rem" }}>
        <SelectInput
          title={ta("عملیات")}
          options={snappTestActionOptions}
          defaultValue={action}
          onChange={(e) => setAction(e.target.value)}
        />
        <AreaInput
          title={ta("ورودی (JSON)")}
          defaultValue={payloadText}
          onChange={(e) => setPayloadText(e.target.value)}
        />
        <Button
          onClick={runConsoleAction}
          isLoading={!!consolePayload}
          style={{ marginTop: "1rem" }}
        >
          {ta("اجرا")}
        </Button>
        {consoleResponse !== null && (
          <pre style={responseBoxStyle}>
            {JSON.stringify(consoleResponse, null, 2)}
          </pre>
        )}
      </Box>

      <Box>
        <Input
          title={ta("شناسه داروخانه (pharmacyId)")}
          onChange={(e) => setPharmacyId(e.target.value)}
        />
        <Input
          title={ta("شناسه سفارش (orderId)")}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <Button
            onClick={() => startDelivery("POST")}
            isLoading={deliveryMethod === "POST"}
          >
            {ta("ارسال درخواست پیک")}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => startDelivery("GET")}
            isLoading={deliveryMethod === "GET"}
          >
            {ta("بروزرسانی وضعیت")}
          </Button>
        </div>
        {deliveryResponse !== null && (
          <pre style={responseBoxStyle}>
            {JSON.stringify(deliveryResponse, null, 2)}
          </pre>
        )}
      </Box>

      <Act
        path={consolePayload ? `${API}/admin/snapp/test` : null}
        method="POST"
        payload={consolePayload || undefined}
        onDone={(status, result) => {
          setConsolePayload(null);
          setConsoleResponse(
            status ? result : { error: ta("درخواست با خطا مواجه شد") },
          );
        }}
      />

      <Act
        path={
          deliveryMethod === "POST"
            ? `${API}/admin/snapp/delivery`
            : deliveryMethod === "GET"
              ? `${API}/admin/snapp/delivery?pharmacyId=${encodeURIComponent(
                  pharmacyId,
                )}&orderId=${encodeURIComponent(orderId)}`
              : null
        }
        method={deliveryMethod || "GET"}
        payload={
          deliveryMethod === "POST" ? { pharmacyId, orderId } : undefined
        }
        onDone={(status, result) => {
          setDeliveryMethod(null);
          setDeliveryResponse(
            status ? result : { error: ta("درخواست با خطا مواجه شد") },
          );
        }}
      />
    </WithTitle>
  );
};

export default AdminSnappTestPage;
