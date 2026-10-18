import Link from "@/Components/i18n/Link";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import { getServerContent, getServerLocale } from "@/Components/i18n/serverContent";
import { intlLocale } from "@/Components/i18n/locales";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { ContentKey } from "@/Components/Enums/contentKeys";
import {
  DirectoryData,
  directoryFacetPath,
  normalizeDirectoryData,
} from "@/Components/Directory/directoryTypes";
import WizardHeroAsk from "./WizardHeroAsk";
import { t3xlBold, tlgBold, tmdBold, tmdRegular, tsmMedium, tsmRegular, txsMedium } from "../UI/Typography";
import classes from "./WizardLanding.module.css";

// The smart diagnosis page as a search entry (2026-10): the chat itself is
// behind a login and was all a crawler saw, so /wizard never ranked. Like
// Ada, Symptomate and WebMD's symptom checker, the page now opens on
// server-rendered content: an H1 with the question box (typing starts the
// check, login only when sending), how it works, links into the symptom
// directory (common symptoms, body parts) and an FAQ with its FAQPage data.
// The chat replaces it once the visitor is signed in.
const STEPS: [ContentKey, ContentKey][] = [
  ["wizLandStep1T", "wizLandStep1D"],
  ["wizLandStep2T", "wizLandStep2D"],
  ["wizLandStep3T", "wizLandStep3D"],
];
const FAQ: [ContentKey, ContentKey][] = [
  ["wizLandQ1", "wizLandA1"],
  ["wizLandQ2", "wizLandA2"],
  ["wizLandQ3", "wizLandA3"],
  ["wizLandQ4", "wizLandA4"],
];

const WizardLanding = async () => {
  const [getContent, raw] = await Promise.all([
    getServerContent(),
    getPublicData<Partial<DirectoryData>>("directory/symptom?page=1").catch(() => undefined),
  ]);
  const numbers = new Intl.NumberFormat(intlLocale[getServerLocale()]);
  const directory = normalizeDirectoryData(raw, "symptom");
  const symptoms = (directory?.data || []).filter((s) => s && s.name).slice(0, 24);
  const parts = (directory?.facets.parts || []).filter((p) => p && p.name && p.count > 0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(([q, a]) => ({
      "@type": "Question",
      name: getContent(q),
      acceptedAnswer: { "@type": "Answer", text: getContent(a) },
    })),
  };

  return (
    <div className={classes.main}>
      <JsonLdSchema schema={faqSchema} />
      <section className={classes.hero}>
        <span className={`${classes.badge} ${txsMedium}`}>{getContent("wizLandBadge")}</span>
        <h1 className={`${classes.title} ${t3xlBold}`}>{getContent("wizLandTitle")}</h1>
        <p className={`${classes.lead} ${tmdRegular}`}>{getContent("wizLandLead")}</p>
        <WizardHeroAsk
          placeholder={getContent("wizLandPlaceholder")}
          start={getContent("wizLandStart")}
          examplesLabel={getContent("wizLandExamples")}
          examples={[getContent("wizLandEx1"), getContent("wizLandEx2"), getContent("wizLandEx3")]}
        />
        <p className={`${classes.trust} ${txsMedium}`}>{getContent("wizLandTrust")}</p>
      </section>

      <p className={`${classes.emergency} ${tsmRegular}`} role="note">
        {getContent("wizLandEmergency")}
      </p>

      <section className={classes.section}>
        <h2 className={`${classes.h2} ${tlgBold}`}>{getContent("wizLandHowTitle")}</h2>
        <ol className={classes.steps}>
          {STEPS.map(([t, d], i) => (
            <li key={t} className={classes.step}>
              <span className={`${classes.stepNo} ${tmdBold}`}>{numbers.format(i + 1)}</span>
              <h3 className={`${classes.stepTitle} ${tmdBold}`}>{getContent(t)}</h3>
              <p className={`${classes.stepText} ${tsmRegular}`}>{getContent(d)}</p>
            </li>
          ))}
        </ol>
      </section>

      {!!symptoms.length && (
        <section className={classes.section}>
          <div className={classes.sectionHead}>
            <h2 className={`${classes.h2} ${tlgBold}`}>{getContent("wizLandSymptomsTitle")}</h2>
            <Link href="/symptom" className={`${classes.more} ${tsmMedium}`}>
              {getContent("wizLandAllSymptoms")}
            </Link>
          </div>
          <ul className={classes.chips}>
            {symptoms.map((s) => (
              <li key={s._id}>
                <Link href={`/symptom/${s.slug || s._id}`} className={`${classes.chip} ${tsmMedium}`}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!parts.length && (
        <section className={classes.section}>
          <h2 className={`${classes.h2} ${tlgBold}`}>{getContent("wizLandPartsTitle")}</h2>
          <ul className={classes.chips}>
            {parts.map((p) => (
              <li key={p._id}>
                <Link
                  href={directoryFacetPath("symptom", "part", p.slug || p._id)}
                  className={`${classes.chip} ${classes.partChip} ${tsmMedium}`}
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={classes.section}>
        <h2 className={`${classes.h2} ${tlgBold}`}>{getContent("wizLandFaqTitle")}</h2>
        <div className={classes.faq}>
          {FAQ.map(([q, a], i) => (
            <details key={q} className={classes.faqItem} open={i === 0}>
              <summary className={`${classes.faqQ} ${tmdBold}`}>{getContent(q)}</summary>
              <p className={`${classes.faqA} ${tsmRegular}`}>{getContent(a)}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WizardLanding;
