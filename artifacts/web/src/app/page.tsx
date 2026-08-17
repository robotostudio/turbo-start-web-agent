import { MdxContent } from "@/components/content/mdx-content";
import { getEntry } from "@/lib/content/loader";

export default async function Home() {
  const entry = getEntry("pages", "home");
  return <MdxContent source={entry.body} />;
}
