export default function About() {
  return (
    <section className="max-w-3xl space-y-4">
      <h1 className="text-3xl font-semibold">About</h1>
      <p className="text-base leading-relaxed">
        This website displays the annual ICA conference data (2003-2018) which contains 27,466 papers, 21,038 authors, and 4,935 sessions.
      </p>
      <p className="text-base leading-relaxed">
        The data come from the
        <a className="text-blue-600 ml-1" href="https://www.icahdq.org/page/annual-conference" target="_blank" rel="noreferrer">
          official website of ICA
        </a>
        .
      </p>
    </section>
  );
}


