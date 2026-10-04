"use client";
import { useEffect } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import useDebounce from "../Hooks/useDebounce";
import useProgress from "../Hooks/useProgress";
import { useIntlLocale } from "../i18n/navigation";
import { ContentKey } from "../Enums/contentKeys";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import ListPageIntro from "../UI/ListPage/ListPageIntro";
import ListPageSearch from "../UI/ListPage/ListPageSearch";
import ListPageList from "../UI/ListPage/ListPageList";
import ListPageCategorySelector from "../UI/ListPage/ListPageCategorySelector";
import BigAd from "../UI/ListPage/BigAd";
import SmallAd from "../UI/ListPage/SmallAd";
import DiseaseCard from "../Disease/DiseaseCard";
import DrugCard from "../Drug/DrugCard";
import SymptomCard from "../Symptom/SymptomCard";
import { IDrug, ISymptom } from "../Admin/Disease/AdminManageDiseasesPage";
import DirectoryFunnel from "./DirectoryFunnel";
import AlphabetIndex from "./AlphabetIndex";
import BodyMap from "./BodyMap";
import {
  DirectoryData,
  DirectoryFacetType,
  DirectoryKind,
  directoryFacetPath,
} from "./directoryTypes";

const k = (key: string) => key as ContentKey;

// the existing list pages' texts (title, legend, intro, search, ads)
const listTexts: Record<
  DirectoryKind,
  { title: ContentKey; legend: ContentKey; introTitle: ContentKey; intro: ContentKey; search: ContentKey; ads: [string, string]; itemWidth: string }
> = {
  disease: {
    title: "diseasesListTitle",
    legend: "diseasesListLegend",
    introTitle: "diseasesListIntroTitle",
    intro: "diseasesListIntroDescription",
    search: "searchInDiseases",
    ads: ["diseases1", "diseases2"],
    itemWidth: "22.8125rem",
  },
  drug: {
    title: "drugsListTitle",
    legend: "drugsListLegend",
    introTitle: "drugsListIntroTitle",
    intro: "drugsListIntroDescription",
    search: "searchInDrugs",
    ads: ["drugs1", "drugs2"],
    itemWidth: "22.8125rem",
  },
  symptom: {
    title: "symptomsListTitle",
    legend: "symptomsListLegend",
    introTitle: "symptomsListIntroTitle",
    intro: "symptomsListIntroDescription",
    search: "searchInSymptoms",
    ads: ["symptoms1", "symptoms2"],
    itemWidth: "16.875rem",
  },
};

// the heading of a facet page, e.g. «بیماری‌های قلب», «داروهای نسخه‌ای»
const facetTitleKey: Record<DirectoryKind, Partial<Record<DirectoryFacetType, string>>> = {
  disease: {
    letter: "directoryDiseasesByLetter",
    part: "directoryDiseasesOfPart",
    speciality: "directoryDiseasesOfSpeciality",
    category: "directoryDiseasesOfCategory",
  },
  drug: { letter: "directoryDrugsByLetter", class: "directoryDrugsOfClass" },
  symptom: {
    letter: "directorySymptomsByLetter",
    part: "directorySymptomsOfPart",
    category: "directorySymptomsOfCategory",
  },
};

const DirectoryPage = ({ data, search }: { data: DirectoryData; search?: string }) => {
  const getContent = useScopedLocale();
  const intl = useIntlLocale();
  const { kind, active, facets } = data;
  const texts = listTexts[kind];
  const listTitle = getContent(texts.title);

  const statusLabel = (value: string) =>
    getContent(k(value === "rx" ? "drugStatusRx" : "drugStatusOtc"));
  const activeName = !active
    ? ""
    : active.type === "status"
      ? statusLabel(active.value)
      : active.type === "letter"
        ? active.value
        : active.node?.name || active.value;

  const title = !active
    ? search
      ? getContent(k("directorySearchTitle"), [search])
      : listTitle
    : active.type === "status"
      ? getContent(k(active.value === "rx" ? "directoryDrugsRx" : "directoryDrugsOtc"))
      : getContent(k(facetTitleKey[kind][active.type] || "directoryDiseasesOfCategory"), [activeName]);

  const basePath = active ? directoryFacetPath(kind, active.type, active.value) : `/${kind}`;

  // the global search of this directory (its root), as the old list did
  const [query, setQuery] = useDebounce({ initialValue: "" });
  const push = useProgress();
  useEffect(() => {
    if (query) push(`/${kind}?search=${encodeURIComponent(query)}`);
  }, [query, push, kind]);

  const is = (type: DirectoryFacetType) => (row: { _id: string; slug?: string }) =>
    active?.type === type && active.value === (row.slug || row._id);
  const hrefOf = (type: DirectoryFacetType) => (row: { _id: string; slug?: string }) =>
    directoryFacetPath(kind, type, row.slug || row._id);
  const facetRow = (
    type: DirectoryFacetType,
    rows: { _id: string; name?: string; slug?: string }[] | undefined,
    label: string,
  ) =>
    !!rows?.length && (
      <ListPageCategorySelector
        categories={rows}
        basePath={`/${kind}`}
        title={label}
        hrefOf={hrefOf(type)}
        isActive={is(type)}
        allHref={`/${kind}`}
        allActive={!active}
      />
    );

  // the AI check opens with the visitor's context already typed
  const aiPrompt =
    active?.type === "part"
      ? getContent(k("aiPrefillPart"), [activeName])
      : undefined;
  const speciality =
    active?.type === "speciality" && active.node
      ? active.node
      : data.funnel.speciality || null;

  const trail = [
    { title: getContent("home"), target: "/" },
    { title: listTitle, target: `/${kind}` },
    ...(active ? [{ title, target: basePath }] : []),
  ];

  return (
    <ListPageLayout trail={trail}>
      <ListPageHeader
        title={title}
        legend={
          active || search
            ? getContent(k("directoryCount"), [data.count.toLocaleString(intl)])
            : getContent(texts.legend)
        }
      />
      {!active && !search && (
        <ListPageIntro title={getContent(texts.introTitle)} description={getContent(texts.intro)} />
      )}
      <DirectoryFunnel aiPrompt={aiPrompt} speciality={speciality} compact />
      <BigAd position={texts.ads[0] as Parameters<typeof BigAd>[0]["position"]} />
      <ListPageSearch onChange={(e) => setQuery(e.target.value)} placeholder={getContent(texts.search)} />
      <AlphabetIndex
        kind={kind}
        letters={data.letters}
        active={active?.type === "letter" ? active.value : undefined}
        title={getContent(k("directoryAtoZ"))}
      />
      {kind === "symptom" && !!facets.parts?.length && (
        <BodyMap
          parts={facets.parts}
          active={active?.type === "part" ? active.value : undefined}
          title={getContent(k("directoryBodyMapTitle"))}
        />
      )}
      {kind === "disease" && facetRow("part", facets.parts, getContent(k("directoryByPart")))}
      {kind === "disease" && facetRow("speciality", facets.specialities, getContent(k("directoryBySpeciality")))}
      {kind !== "drug" && facetRow("category", facets.categories, getContent(k("directoryByCategory")))}
      {kind === "drug" && facetRow("class", facets.classes, getContent(k("directoryByClass")))}
      {kind === "drug" &&
        facetRow(
          "status",
          (facets.statuses || []).map((s) => ({ _id: s.value, slug: s.value, name: statusLabel(s.value) })),
          getContent(k("directoryByStatus")),
        )}
      <ListPageList
        itemWidth={texts.itemWidth}
        pagination={{
          currentPage: data.page,
          pagesCount: data.pagesCount,
          makePath: (page) => {
            const params = new URLSearchParams();
            if (page > 1) params.set("page", String(page));
            if (search) params.set("search", search);
            const qs = params.toString();
            return qs ? `${basePath}?${qs}` : basePath;
          },
        }}
      >
        {data.data.map((node) =>
          kind === "disease" ? (
            <DiseaseCard key={node._id} node={node as Parameters<typeof DiseaseCard>[0]["node"]} />
          ) : kind === "drug" ? (
            <DrugCard key={node._id} node={node as IDrug<{ Tag: Record<never, never> }>} />
          ) : (
            <SymptomCard key={node._id} node={node as ISymptom} />
          ),
        )}
      </ListPageList>
      <SmallAd position={texts.ads[1] as Parameters<typeof SmallAd>[0]["position"]} />
    </ListPageLayout>
  );
};

export default DirectoryPage;
