import { Suspense } from "react";
import AllSessions from "@/app/components/AllSessions";

export default function SessionsPage() {
  return (
    <main className="p-6">
      <Suspense fallback={<div>加载中...</div>}>
        <AllSessions />
      </Suspense>
    </main>
  );
}


