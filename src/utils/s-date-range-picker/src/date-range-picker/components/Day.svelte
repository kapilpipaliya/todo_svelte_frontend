<script lang="js">
  import { createEventDispatcher } from 'svelte';
  import { addDays, addMonths, addWeeks, isSameDay, subDays, subMonths, subWeeks } from 'date-fns';
  import { localeFormat } from '../utils';

  export let day;
  export let monthIndicator;

  let mouseDownDate = null;

  const dispatchEvent = createEventDispatcher();

  const getEl = date => document.querySelector(`[data-date="${localeFormat(date, 'yyyy-MM-dd')}"]`);
  // Enter should submit / apply the selection, not activate a button.
  const onKeydown = (e, date) => {
    let newDate = date;

    switch (e.code) {
      case 'Enter':
      case 'NumpadEnter':
        dispatchEvent('apply');
        return;
      case 'Space':
        dispatchEvent('selection', date);
        return;
      case 'ArrowUp':
        newDate = subWeeks(date, 1);
        break;
      case 'ArrowDown':
        newDate = addWeeks(date, 1);
        break;
      case 'ArrowRight':
        newDate = addDays(date, 1);
        break;
      case 'ArrowLeft':
        newDate = subDays(date, 1);
        break;
      case 'PageDown':
        newDate = subMonths(date, 1);
        break;
      case 'PageUp':
        newDate = addMonths(date, 1);
        break;
      case 'Escape':
        dispatchEvent('cancel');
        return;
      default:
        return;
    }

    /** @todo Flip page when focusing on an element that isn't visible */
    // Graceful failure until page flipping functionality is implemented.
    if (!getEl(newDate)) {
      // Handle page flipping if the element isn't found
      return;
    }

    dispatchEvent('hover', newDate);
    getEl(newDate).focus();
  };

  const onMouseUp = (e, date) => {
    if (e.button === 0 && !isSameDay(date, mouseDownDate)) {
      dispatchEvent('selection', date);
      // Set the focus state to the last selected date.
      // This happens automatically via a "click", but not on "mouseup"
      getEl(date).focus();
    }
    mouseDownDate = null;
  };

  const onMouseDown = (e, date) => {
    // Only continue if the left mouse button was clicked
    if (e.button === 0) {
      mouseDownDate = date;
      dispatchEvent('selection', date);
    }
  };
</script>

<div class="date_range_day_wrap">
  <div
    class="s-day"
    class:disabled={day.isDisabled}
    class:end-date={day.isEndDate}
    class:today={day.isToday}
    class:next-month={day.isNextMonth}
    class:prev-month={day.isPrevMonth}
    class:start-date={day.isStartDate}
    class:weekend={day.isWeekend}
    class:within-selection={day.isWithinSelection}
    role="gridcell">
    <button
      aria-disabled={day.isDisabled}
      aria-label={localeFormat(day.date, 'EEEE, MMMM dd, yyyy')}
      class="cell"
      class:muted={day.isNextMonth || day.isPrevMonth}
      disabled={day.isDisabled}
      data-date={localeFormat(day.date, 'yyyy-MM-dd')}
      on:keydown={e => onKeydown(e, day.date)}
      on:mouseenter={() => dispatchEvent('hover', day.date)}
      on:mousedown={e => onMouseDown(e, day.date)}
      on:mouseup={e => onMouseUp(e, day.date)}
      title={localeFormat(day.date, 'EEEE, MMMM dd, yyyy')}
      type="button">
      {#if monthIndicator}
        <span class="month-indicator">{localeFormat(day.date, 'MMM')}</span>
      {/if}
      {localeFormat(day.date, 'd')}
    </button>
  </div>
</div>
