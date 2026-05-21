"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { Lightbulb, Plus, Sparkles, ThumbsUp, Trash2, Utensils } from "lucide-react";
import { formatDayLabel, getTripDays } from "@/lib/date";
import { createId } from "@/lib/id";
import { recommendSuggestions } from "@/lib/suggestions";
import type { Suggestion, SuggestionKind, TripData } from "@/lib/types";
import { Button, EmptyState, ExternalAnchor, Field, IconButton, MemberStack, Panel, cx } from "./ui";

type SuggestionsBoardProps = {
  data: TripData;
  setData: Dispatch<SetStateAction<TripData>>;
  today: string;
};

type SuggestionFormState = Omit<Suggestion, "id" | "votes" | "createdAt">;

const suggestionFilters: Array<SuggestionKind | "all"> = ["all", "activity", "restaurant"];
const categoryOptions: Record<SuggestionKind, string[]> = {
  activity: ["beach", "rainy day", "attraction", "downtime", "photo idea", "shopping", "other"],
  restaurant: ["kid-friendly", "seafood", "casual", "nice dinner", "near the beach", "needs reservation"],
};

export function SuggestionsBoard({ data, setData, today }: SuggestionsBoardProps) {
  const days = useMemo(() => getTripDays(data.trip.startDate, data.trip.endDate), [data.trip.startDate, data.trip.endDate]);
  const [mode, setMode] = useState<"ideas" | "ai">("ideas");
  const [filter, setFilter] = useState<SuggestionKind | "all">("all");
  const [form, setForm] = useState<SuggestionFormState>(() => blankSuggestion(today, data.familyMembers[0]?.name ?? "Family"));
  const recommendations = useMemo(() => recommendSuggestions(data.suggestions), [data.suggestions]);
  const filteredSuggestions = data.suggestions
    .filter((suggestion) => filter === "all" || suggestion.kind === filter)
    .sort((a, b) => b.votes.length - a.votes.length || b.createdAt.localeCompare(a.createdAt));
  const restaurantsLink = data.importantLinks.find((link) => link.category === "Restaurants");
  const attractionsLink = data.importantLinks.find((link) => link.category === "Attractions");

  function saveSuggestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();

    if (!title) {
      return;
    }

    const suggestion: Suggestion = {
      ...form,
      id: createId("suggestion"),
      title,
      category: form.category.trim() || "other",
      location: form.location.trim(),
      notes: form.notes.trim(),
      suggestedBy: form.suggestedBy.trim() || "Family",
      link: form.link.trim(),
      votes: [],
      createdAt: new Date().toISOString(),
    };

    setData((current) => ({
      ...current,
      suggestions: [suggestion, ...current.suggestions],
    }));
    setForm(blankSuggestion(form.day, form.suggestedBy));
    setMode("ideas");
  }

  function deleteSuggestion(suggestionId: string) {
    setData((current) => ({
      ...current,
      suggestions: current.suggestions.filter((suggestion) => suggestion.id !== suggestionId),
    }));
  }

  function toggleVote(suggestionId: string, memberId: string) {
    setData((current) => ({
      ...current,
      suggestions: current.suggestions.map((suggestion) =>
        suggestion.id === suggestionId
          ? {
              ...suggestion,
              votes: suggestion.votes.includes(memberId)
                ? suggestion.votes.filter((id) => id !== memberId)
                : [...suggestion.votes, memberId],
            }
          : suggestion,
      ),
    }));
  }

  function updateKind(kind: SuggestionKind) {
    setForm((current) => ({
      ...current,
      kind,
      category: categoryOptions[kind][0],
    }));
  }

  return (
    <div className="workspace-grid suggestions-workspace">
      <Panel title="Suggestions" className="workspace-main">
        <div className="section-row">
          <p className="muted">
            Collect private family ideas, vote on the ones people like, then check AI Picks for a planning read.
          </p>
          <div className="segmented-control" aria-label="Suggestions views">
            <button className={cx(mode === "ideas" && "segment-active")} onClick={() => setMode("ideas")}>
              Ideas
            </button>
            <button className={cx(mode === "ai" && "segment-active")} onClick={() => setMode("ai")}>
              <Sparkles size={15} aria-hidden="true" />
              AI Picks
            </button>
          </div>
        </div>

        {mode === "ideas" ? (
          <>
            <div className="section-row suggestion-toolbar">
              <div className="filter-row" aria-label="Suggestion filters">
                {suggestionFilters.map((item) => (
                  <button
                    key={item}
                    className={cx("filter-chip", filter === item && "filter-chip-active")}
                    onClick={() => setFilter(item)}
                  >
                    {item === "all" ? "All ideas" : item}
                  </button>
                ))}
              </div>
              <div className="inline-links">
                {restaurantsLink ? <ExternalAnchor href={restaurantsLink.url}>Restaurants guide</ExternalAnchor> : null}
                {attractionsLink ? <ExternalAnchor href={attractionsLink.url}>Attractions guide</ExternalAnchor> : null}
              </div>
            </div>

            {filteredSuggestions.length > 0 ? (
              <div className="suggestion-grid">
                {filteredSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    data={data}
                    onToggleVote={toggleVote}
                    onDelete={deleteSuggestion}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No suggestions yet"
                description="Add an activity or restaurant idea, then let the family vote."
                action={
                  <Button variant="secondary" onClick={() => setFilter("all")}>
                    <Lightbulb size={16} aria-hidden="true" />
                    Show all
                  </Button>
                }
              />
            )}
          </>
        ) : (
          <div className="ai-recommendations">
            {recommendations.length > 0 ? (
              recommendations.map((recommendation) => {
                const suggestion = data.suggestions.find((item) => item.id === recommendation.suggestionId);

                if (!suggestion) {
                  return null;
                }

                return (
                  <article key={recommendation.suggestionId} className="ai-card">
                    <div className="ai-card-main">
                      <div className="suggestion-icon" aria-hidden="true">
                        {suggestion.kind === "restaurant" ? <Utensils size={18} /> : <Lightbulb size={18} />}
                      </div>
                      <div>
                        <p className="section-kicker">{recommendation.verdict}</p>
                        <h3>{suggestion.title}</h3>
                        <p>{recommendation.rationale}</p>
                        <div className="category-row">
                          {recommendation.strengths.slice(0, 3).map((strength) => (
                            <span key={strength}>{strength}</span>
                          ))}
                        </div>
                        {recommendation.cautions.length > 0 ? (
                          <p className="ai-caution">Watch: {recommendation.cautions.join(", ")}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="score-meter" aria-label={`${recommendation.score} out of 100 recommendation score`}>
                      <strong>{recommendation.score}</strong>
                      <span>
                        <i style={{ width: `${recommendation.score}%` }} />
                      </span>
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState title="No ideas to recommend yet" description="Add a few suggestions so AI Picks can compare them." />
            )}
          </div>
        )}
      </Panel>

      <aside className="workspace-side">
        <Panel title="Add Suggestion">
          <form className="stack-form" onSubmit={saveSuggestion}>
            <div className="form-grid">
              <Field label="Type">
                <select value={form.kind} onChange={(event) => updateKind(event.target.value as SuggestionKind)}>
                  <option value="activity">Activity</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </Field>
              <Field label="Day">
                <select value={form.day} onChange={(event) => setForm((current) => ({ ...current, day: event.target.value }))}>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {formatDayLabel(day)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Title">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                {categoryOptions[form.kind].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
            </Field>
            <Field label="Why it might work">
              <textarea value={form.notes} rows={4} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            </Field>
            <Field label="Suggested by">
              <select
                value={form.suggestedBy}
                onChange={(event) => setForm((current) => ({ ...current, suggestedBy: event.target.value }))}
              >
                {data.familyMembers.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reference link">
              <input value={form.link} onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))} />
            </Field>
            <Button type="submit">
              <Plus size={16} aria-hidden="true" />
              Add suggestion
            </Button>
          </form>
        </Panel>
      </aside>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  data,
  onToggleVote,
  onDelete,
}: {
  suggestion: Suggestion;
  data: TripData;
  onToggleVote: (suggestionId: string, memberId: string) => void;
  onDelete: (suggestionId: string) => void;
}) {
  return (
    <article className="suggestion-card">
      <div className="suggestion-card-header">
        <div className="suggestion-icon" aria-hidden="true">
          {suggestion.kind === "restaurant" ? <Utensils size={18} /> : <Lightbulb size={18} />}
        </div>
        <div>
          <p className="section-kicker">{suggestion.kind} | {suggestion.category}</p>
          <h3>{suggestion.title}</h3>
          <p>{formatDayLabel(suggestion.day)} | {suggestion.location || "Location TBD"}</p>
        </div>
        <IconButton label={`Delete ${suggestion.title}`} variant="danger" onClick={() => onDelete(suggestion.id)}>
          <Trash2 size={16} aria-hidden="true" />
        </IconButton>
      </div>

      <p className="muted">{suggestion.notes || "No notes yet."}</p>
      <div className="suggestion-meta">
        <span>Suggested by {suggestion.suggestedBy}</span>
        <span>{suggestion.votes.length} vote{suggestion.votes.length === 1 ? "" : "s"}</span>
      </div>
      {suggestion.link ? <ExternalAnchor href={suggestion.link}>Reference</ExternalAnchor> : null}

      <div className="vote-panel" aria-label={`Vote on ${suggestion.title}`}>
        {data.familyMembers.map((member) => {
          const active = suggestion.votes.includes(member.id);

          return (
            <button
              key={member.id}
              className={cx("vote-button", active && "vote-button-active")}
              onClick={() => onToggleVote(suggestion.id, member.id)}
              title={`${active ? "Remove" : "Add"} ${member.name}'s vote`}
            >
              <ThumbsUp size={14} aria-hidden="true" />
              <span>{member.name}</span>
            </button>
          );
        })}
      </div>

      <MemberStack ids={suggestion.votes} members={data.familyMembers} />
    </article>
  );
}

function blankSuggestion(day: string, suggestedBy: string): SuggestionFormState {
  return {
    title: "",
    kind: "activity",
    category: "beach",
    day,
    location: "",
    notes: "",
    suggestedBy,
    link: "",
  };
}
