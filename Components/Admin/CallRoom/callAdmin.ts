import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";

// Labels shared by the admin call list and call record (2026-10).

export const callStatusDict: Record<string, string> = {
  get ringing() {
    return ta("در حال زنگ");
  },
  get active() {
    return ta("در جریان");
  },
  get ended() {
    return ta("پایان‌یافته");
  },
  get cancelled() {
    return ta("لغو شده");
  },
};

export const callEventDict: Record<string, string> = {
  get created() {
    return ta("ایجاد شد");
  },
  get invited() {
    return ta("دعوت شد");
  },
  get ringing() {
    return ta("زنگ خورد");
  },
  get answered() {
    return ta("پاسخ داد");
  },
  get rejected() {
    return ta("رد کرد");
  },
  get joined() {
    return ta("وارد شد");
  },
  get left() {
    return ta("خارج شد");
  },
  get kicked() {
    return ta("اخراج شد");
  },
  get missed() {
    return ta("بی‌پاسخ ماند");
  },
  get muted() {
    return ta("صدا بسته شد");
  },
  get unmuted() {
    return ta("صدا باز شد");
  },
  get videoOff() {
    return ta("تصویر خاموش شد");
  },
  get videoOn() {
    return ta("تصویر روشن شد");
  },
  get screenShareStarted() {
    return ta("اشتراک صفحه شروع شد");
  },
  get screenShareStopped() {
    return ta("اشتراک صفحه پایان یافت");
  },
  get recordingStarted() {
    return ta("ضبط شروع شد");
  },
  get recordingStopped() {
    return ta("ضبط متوقف شد");
  },
  get ended() {
    return ta("تماس پایان یافت");
  },
  get cancelled() {
    return ta("تماس لغو شد");
  },
};

export const participantStatusDict: Record<string, string> = {
  get invited() {
    return ta("دعوت‌شده");
  },
  get joined() {
    return ta("حاضر");
  },
  get left() {
    return ta("خارج‌شده");
  },
  get kicked() {
    return ta("اخراج‌شده");
  },
  get rejected() {
    return ta("ردکرده");
  },
  get missed() {
    return ta("بی‌پاسخ");
  },
};

export const recordingStatusDict: Record<string, string> = {
  get recording() {
    return ta("در حال ضبط");
  },
  get processing() {
    return ta("در حال پردازش");
  },
  get ready() {
    return ta("آماده");
  },
  get failed() {
    return ta("ناموفق");
  },
};

// seconds -> "1:05:09" / "5:09"; a missing duration is a dash
export const formatDuration = (seconds?: number | null) => {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) return "—";
  const num = adminNumberFormat({ minimumIntegerDigits: 2 });
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h
    ? `${adminNumberFormat().format(h)}:${num.format(m)}:${num.format(s)}`
    : `${adminNumberFormat().format(m)}:${num.format(s)}`;
};
