"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, Search } from "lucide-react";
import { EmptyState } from "./ui";
import { faqCategories, questions } from "@/data/faq";

function Filters<T extends string>({ values, selected, onSelect, label }: {
  values: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  label: string;
}) {
  return (
    <div className="filters" role="group" aria-label={label}>
      {values.map((value) =>
        <button type="button" key={value} aria-pressed={selected === value} onClick={() => onSelect(value)}>
          {value}
          {selected === value && <span className="filter-sparkle sparkle" aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}

function Accordion({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <details className="accordion">
      <summary>{heading}<ChevronDown size={19} aria-hidden="true" /></summary>
      <div className="accordion-body">{children}</div>
    </details>
  );
}

export function FaqBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All topics" | typeof faqCategories[number]>("All topics");
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = questions.filter(({ question, answer, category: topic }) =>
    (category === "All topics" || category === topic) &&
    terms.every((term) => `${question} ${answer} ${topic}`.toLowerCase().includes(term))
  );

  return (
    <>
      <label className="search-label" htmlFor="faq-search">Search questions</label>
      <div className="search-field">
        <Search size={19} aria-hidden="true" />
        <input
          id="faq-search"
          name="faq-search"
          type="search"
          autoComplete="off"
          placeholder="Try “Discord”, “refund”, or “hosting”"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <Filters values={["All topics", ...faqCategories]} selected={category} onSelect={setCategory} label="FAQ topic" />
      <p className="result-count" role="status">{results.length} {results.length === 1 ? "question" : "questions"}</p>
      {results.length ? (
        <div className="accordion-list">
          {results.map(({ id, question, answer }) => (
            <Accordion key={id} heading={question}><p>{answer}</p></Accordion>
          ))}
        </div>
      ) : <EmptyState title="No matching questions">Try a different search or select All topics.</EmptyState>}
    </>
  );
}

