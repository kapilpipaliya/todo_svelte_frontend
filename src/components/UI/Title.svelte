<script lang="ts">
  /**
   *
   * If not want to show subtitle, remove it from translation
   * This component is properly written
   */

  import { ET, E } from '../../enums';
  import { translation } from '../../translation';
  declare let $translation;
  import { view, lensPath } from 'ramda';
  export let currentRoute: {
    params?: { schema_key?: string };
    namedParams?: { schema_key?: string };
  } = {};
  let schema_key = '';
  $: {
    // get schema_key From Route params or namedParams
    if (currentRoute?.params && currentRoute?.params?.schema_key) {
      schema_key = currentRoute.params.schema_key;
    } else {
      schema_key = currentRoute?.namedParams?.schema_key ?? '';
    }
  }
  let title;
  let subtitle;
  $: title = view(lensPath([schema_key, 'title']), $translation);
  $: subtitle = view(lensPath([schema_key, 'subtitle']), $translation);
  $: type = currentRoute?.queryParams?.type ?? ''
  $: message = currentRoute?.queryParams?.message ?? ''
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>
{#if message}
  <span class={type}>{message}</span>
{/if}
{#if title}
  <div>
    <div>
      <h1>{title}</h1>
    </div>
    {#if subtitle}
      <div>
        <h2>{subtitle}</h2>
      </div>
    {/if}
  </div>
{/if}
