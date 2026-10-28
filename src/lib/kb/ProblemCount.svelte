<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket, type Problem } from '#lib/kb/problems';

  // A count inside a sentence: one problem's reports, or (no problem) every report in the ticket.
  let { ticket, problem }: { ticket: number; problem?: Problem } = $props();

  const groups = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const n = $derived(
    groups.filter((g) => !problem || g.problem === problem).reduce((sum, g) => sum + g.ids.length, 0),
  );
</script>

<strong>{n}</strong>
