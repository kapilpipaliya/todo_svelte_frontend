<script lang="ts">
  import { onMount, onDestroy, getContext, setContext } from 'svelte';
  import { get, writable } from 'svelte/store';
  import { Ws, ws_connected } from '../ws_events_dispatcher';
  import { is_production, ET, E, ValueType } from '../enums';
  declare let $ws_connected;
  declare let $is_production;
  import { clone } from 'rambda';
  import { Route } from '../utils/svelte-router-spa/index.ts';
  import TreeSidebar from '../components/UI/TreeSidebar.svelte';
  import UrlPattern from 'url-pattern';
  import Skeleton from '../components/UI/Skeleton.svelte';
  export let currentRoute;
  const project_id = currentRoute.namedParams.project;
  const project_id_ctx = writable(project_id);
  const project_data_ctx = writable({});
  declare let $project_data_ctx;
  setContext('project_id', project_id_ctx);
  setContext('project_data', project_data_ctx);
  const org_id = getContext('org_id');
  declare let $org_id;
  const project_ctx = getContext('project');
  declare let $project_ctx;
  let mounted = false;
  let er = '';
  let project_fetch_evt = [ET.get, E.project_list, Ws.uid];
  let items = [];
  let project_menu = [];
  let fetch_data = false;
  let fetch_menu = false;
  onMount(() => {
    mounted = true;
  });
  onDestroy(() => {
    Ws.unbind_([project_fetch_evt]);
    // be very careful: top level component unmount first.
    $project_ctx.pop();
  });
  Ws.bind$(
    project_fetch_evt,
    d => {
      const result = d.r.result;
      if (result.length == 0) {
        er = 'no project found';
      } else if (result[0]) {
        const project_data = result[0];
        $project_data_ctx = project_data;
        $project_ctx[1] = project_data;
        fetch_data = true;
        return;
      }
      er = 'cant set project data';
    },
    1
  );

  let OldMenu;

  const getMenuDataGet = d => {
    // if (isLoading) isLoading = false
    if (Array.isArray(d) && !d[0]) {
      //authorized = false
      //er = d
    }
    if (d.r) {
      items = d.r.result ?? [];
    } else if (d.n) {
    } else if (d.m) {
      d.m.result.forEach(mod => {
        const findIndex = items.findIndex(i => {
          return i._key == mod._key;
        });
        if (findIndex !== -1) {
          // start, ?deleteCount, ...items
          items.splice(findIndex, 1, mod);
        }
      });
      items = items;
    } else if (d.d) {
    }
  };
  const findIdx = name => {
    const findIndex = items.findIndex(i => {
      return i._key == name;
    });
    return findIndex;
  };
  $: {
    let idx = findIdx('project');
    if (idx > -1) {
      OldMenu = items[idx].menu;
      project_menu = processMenu(clone(OldMenu), $org_id, project_id);
    }
  }

  onDestroy(
    Ws.bindT(
      [ET.subscribe, E.menu_list, Ws.uid],
      d => {
        getMenuDataGet(d);
        fetch_menu = true;
      },
      [
        [`['project']`],
        [],
        [0, 0, 0],
        {
          type: ValueType.Object
        }
      ],
      1
    )
  );

  $: if (mounted) {
    if ($ws_connected) {
      er = '';
      if (project_id) {
        const args = [
          [null, `="${project_id}"`],
          [],
          [0, 0, 1],
          {
            col: ['_key', 'id'],
            type: ValueType.Object,
            org: $project_ctx?.[$project_ctx.length - 1]?._key ?? null
          }
        ];
        Ws.trigger([[project_fetch_evt, args]]);
      } else {
        er = 'Please Select Project';
      }
    } else {
      er = 'Reconnecting...';
    }
  }
  function processMenu(menu_, org, project) {
    if (!org) {
      er = 'org key must not be empty when processing menu';
      return [];
    }
    if (!project) {
      er = 'project key must not be empty when processing menu';
      return [];
    }
    for (let x of menu_) {
      x.path = new UrlPattern(x.path).stringify({ org, project });
      if (x.children) {
        x.children = processMenu(x.children, org, project);
      }
    }
    return menu_;
  }
  // enable this when need:
  //$: {menus = processMenu(clone(OldMenu), $org_id, project_id) }
</script>

{#if !$is_production}PROJECT LAYOUT{/if}
{JSON.stringify($project_data_ctx)}
<h4>Selected Project: {project_id}</h4>
<div style="display: flex">
  <div>
    {#if project_menu.length}
      <TreeSidebar menu={project_menu} />
    {/if}
  </div>
  {#if fetch_data && fetch_menu}
    <Route {currentRoute} />
  {:else}
    <Skeleton />
  {/if}
</div>
