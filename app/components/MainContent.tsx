export default function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 sm:px-6 md:px-8">
      <div className="w-full">{children}</div>
    </div>
  );
}


