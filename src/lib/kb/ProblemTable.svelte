<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket } from '#lib/kb/problems';

  // `tickets`: problem → where it is tracked now (a link), written by the page.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, string> } = $props();

  const all = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket).length);
</script>

<p class="sum">
  <strong>{all.length}</strong> reports in #{ticket} ({rows} rows in the export, {rows - all.length} of them repeats) ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.ids.length}</td>
        <td class="small">{g.tenants.length <= 3 ? g.tenants.join(', ') : g.tenants.length}</td>
        <td class="small">{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if tickets[g.problem]}<a href={tickets[g.problem]}>{tickets[g.problem].split('/').pop()?.replace(/^/, '#')}</a>
          {:else}<span class="none">none</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .small { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
</style>
