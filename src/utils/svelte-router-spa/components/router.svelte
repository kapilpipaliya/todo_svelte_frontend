<script lang="ts">
  import { onMount } from 'svelte';

  import { SpaRouter } from '../spa_router';
  import Route from './route.svelte';
  import { activeRoute } from '../store';

  export let routes = [];
  export let options = {};

  onMount(async function() {
    await SpaRouter(routes, document.location.href, options).setActiveRoute();
  });
</script>

<Route currentRoute={$activeRoute} />
