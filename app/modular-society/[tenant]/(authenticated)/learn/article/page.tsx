import { redirect } from "next/navigation";

export default function ArticleIndexPage() {
  redirect("/learn?type=article");
}
