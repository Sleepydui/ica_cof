import { Suspense } from "react";
import AllPapers from "@/app/components/AllPapers";

export default function Home() {
  return (
    <main className="p-6">
      <Suspense fallback={<div>加载中...</div>}>
        <AllPapers />
      </Suspense>
    </main>
  );
}
