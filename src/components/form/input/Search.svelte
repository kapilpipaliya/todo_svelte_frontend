<script lang="ts">
  import Label from '../Label.svelte';
  export let name;
  export let required;
  export let disabled;
  export let value;
  export let props = {};
  export let placeholder = '';
  export let dom = null;
  export let error = '';
</script>

<Label {name} />
<input {name} bind:this={dom} type="search" bind:value {required} autocomplete={false} {placeholder} {disabled} {...props} />
{#if error}
  <span>{error}</span>
{/if}
