// The problems a ticket really holds, counted the desk's way (CauseTable): every report sits under
// the cause its tenant gives it (causes.ts). A report the desk read as a one-day move
// (desk-notes.json) is no swap, so neither fix closes it: it is its own problem too, counted again
// on top of where it is filed.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day move' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  ids: string[];
  tenants: string[];
  firstSeen: string;
  lastSeen: string;
  // Problems these reports are also counted under (the one-day moves: where the desk filed them).
  alsoIn: Problem[];
};

function group(problem: Problem, rs: Report[], alsoIn: Problem[] = []): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    ids: rs.map((r) => r.id).sort(),
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    alsoIn,
  };
}

// One id, one report.
export function ticketReports(reports: Report[], ticket: number): Report[] {
  return uniqueById(reports).filter((r) => r.mergedInto === ticket);
}

export function splitTicket(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const merged = ticketReports(reports, ticket);
  const byCause = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = causeOf(r, tenantOf(r)) ?? 'unplaced';
    byCause.set(p, [...(byCause.get(p) ?? []), r]);
  }
  const groups = [...byCause.entries()].map(([p, rs]) => group(p, rs));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const filedUnder = [...new Set(moved.map((r) => causeOf(r, tenantOf(r)) ?? 'unplaced'))];
    groups.push(group('one-day move', moved, filedUnder));
  }
  return groups.sort((a, b) => b.ids.length - a.ids.length);
}
