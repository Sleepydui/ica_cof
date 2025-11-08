import { Suspense } from "react";
import AllAuthors from "@/app/components/AllAuthors";

export default function AuthorsPage() {
  return (
    <main className="p-6">
      <Suspense fallback={<div>加载中...</div>}>
        <AllAuthors />
      </Suspense>
    </main>
  );
}


