import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { FamilyMember, ScheduleType } from "@/lib/types";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("panel", className)}>
      {(title || action) && (
        <div className="panel-header">
          {title ? <h2>{title}</h2> : <span />}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return <button className={cx("button", `button-${variant}`, className)} {...props} />;
}

export function IconButton({
  label,
  variant = "ghost",
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button className={cx("icon-button", `button-${variant}`, className)} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function ExternalAnchor({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="resource-link" href={href} target="_blank" rel="noreferrer">
      <span>{children}</span>
      <ExternalLink size={15} aria-hidden="true" />
    </a>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function TypeBadge({ type }: { type: ScheduleType }) {
  return <span className={cx("type-badge", `type-${type}`)}>{type}</span>;
}

export function MemberStack({
  ids,
  members,
  max = 4,
}: {
  ids: string[];
  members: FamilyMember[];
  max?: number;
}) {
  const selected = ids
    .map((id) => members.find((member) => member.id === id))
    .filter((member): member is FamilyMember => Boolean(member));
  const visible = selected.slice(0, max);

  return (
    <div className="member-stack" aria-label={selected.map((member) => member.name).join(", ")}>
      {visible.map((member) => (
        <span key={member.id} className="member-avatar" style={{ "--member-color": member.color } as React.CSSProperties}>
          {member.avatar}
        </span>
      ))}
      {selected.length > max ? <span className="member-more">+{selected.length - max}</span> : null}
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("field", className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}
