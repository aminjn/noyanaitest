import OfflinePage from "@/Components/Offline/OfflinePage";

// Served by the service worker (public/service-worker.js) when a page can't
// load with no network. Kept out of search results.
export const metadata = { robots: { index: false, follow: false } };

const Offline = () => <OfflinePage />;

export default Offline;
