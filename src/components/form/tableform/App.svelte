<script lang="ts">
  import TableForm from './TableForm.svelte';
  let data = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12]
  ];
  let values = [1, 10];

  let dp = [1, ' - ', 2];
  let keyIdx = 0;
</script>

<TableForm bind:data {dp} {keyIdx} {values} />
