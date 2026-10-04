import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// the Ollama models are part of «تنظیمات سیستم ← هوش مصنوعی» (2026-10)
const LegacyOllamaAdmin = () => redirect(`/${adminKey}/appConfig?tab=ai`);

export default LegacyOllamaAdmin;
