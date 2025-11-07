import { NextResponse, NextRequest } from "next/server";
import { getPublicData } from "./Components/helpers/getPublicData";
import { IShortLink } from "./Components/Admin/ShortLink/AdminManageShortLinksPage";
import { IRedirection } from "./Components/Admin/Redirection/AdminManageRedirectionsPage";

const middleware = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith("/l/")) {
    const match = pathname.match(/^\/l\/([^/]+)$/);
    if (match) {
      const token = match[1];
      const data = await getPublicData<IShortLink>(`/shortlink/${token}`);
      if (data) {
        return NextResponse.redirect(data.target, 301);
      }
    }
  }
  const data = await getPublicData<IRedirection | null>(
    `/redirect?path=${pathname}`
  );
  if (data) return NextResponse.redirect(data.current, data.statusCode);
};

export default middleware;
