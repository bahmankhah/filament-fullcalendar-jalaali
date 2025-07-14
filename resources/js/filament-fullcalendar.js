import { Calendar } from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import multiMonthPlugin from '@fullcalendar/multimonth'
import scrollGridPlugin from '@fullcalendar/scrollgrid'
import timelinePlugin from '@fullcalendar/timeline'
import adaptivePlugin from '@fullcalendar/adaptive'
import resourcePlugin from '@fullcalendar/resource'
import resourceDayGridPlugin from '@fullcalendar/resource-daygrid'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import rrulePlugin from '@fullcalendar/rrule'
import momentPlugin from '@fullcalendar/moment'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'
import locales from '@fullcalendar/core/locales-all'
import moment from 'moment'
import 'moment-jalaali'

// Helper function to format Jalaali dates
function formatJalaaliDate(date, format) {
    return moment(date).format(format);
}

// Helper function to get Jalaali calendar configuration
function getJalaaliConfig(jalaali) {
    if (!jalaali) return {};
    
    return {
        // Configure moment to use Jalaali calendar
        viewClassNames: 'jalaali-calendar',
        // Custom title formatter for Jalaali calendar
        titleFormat: function(date) {
            return moment(date.start).format('jMMMM jYYYY');
        },
        // Custom day header formatter for week view
        dayHeaderFormat: function(date) {
            const dayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
            return dayNames[moment(date).day()];
        },
        // Custom event time formatter
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
        },
        // Custom navigation buttons
        customButtons: {
            prev: {
                text: '‹',
                click: function(arg) {
                    arg.view.calendar.prev();
                }
            },
            next: {
                text: '›',
                click: function(arg) {
                    arg.view.calendar.next();
                }
            },
            today: {
                text: 'امروز',
                click: function(arg) {
                    arg.view.calendar.today();
                }
            }
        },
        // Override month names and day names for Jalaali
        locale: 'fa',
        direction: 'rtl',
        // Custom view configurations
        views: {
            dayGridMonth: {
                // Custom month view configuration
                dayHeaderFormat: function(date) {
                    const dayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
                    return dayNames[moment(date).day()];
                },
                titleFormat: function(date) {
                    return moment(date.start).format('jMMMM jYYYY');
                }
            },
            dayGridWeek: {
                titleFormat: function(date) {
                    const startWeek = moment(date.start).format('jD jMMMM');
                    const endWeek = moment(date.end).format('jD jMMMM jYYYY');
                    return `${startWeek} - ${endWeek}`;
                }
            },
            dayGridDay: {
                titleFormat: function(date) {
                    return moment(date.start).format('dddd، jD jMMMM jYYYY');
                }
            }
        },
        // Custom date formatting
        dayCellContent: function(arg) {
            return moment(arg.date).format('jD');
        }
    };
}

export default function fullcalendar({
    locale,
    plugins,
    schedulerLicenseKey,
    timeZone,
    config,
    editable,
    selectable,
    eventClassNames,
    eventContent,
    eventDidMount,
    eventWillUnmount,
    jalaali,
}) {
    return {
        init() {
            // Configure moment for Jalaali calendar if enabled
            if (jalaali) {
                moment.locale('fa');
                moment.loadPersian({
                    usePersianDigits: false,
                    dialect: 'persian-modern'
                });
            }
            
            // Get Jalaali specific configuration
            const jalaaliConfig = getJalaaliConfig(jalaali);
            
            /** @type Calendar */
            const calendar = new Calendar(this.$el, {
                headerToolbar: {
                    'left': 'prev,next today',
                    'center': 'title',
                    'right': 'dayGridMonth,dayGridWeek,dayGridDay',
                },
                plugins: plugins.map(plugin => availablePlugins[plugin]),
                locale: jalaali ? 'fa' : locale,
                schedulerLicenseKey,
                timeZone,
                editable,
                selectable,
                ...config,
                ...jalaaliConfig,
                locales,
                eventClassNames,
                eventContent,
                eventDidMount,
                eventWillUnmount,
                events: (info, successCallback, failureCallback) => {
                    this.$wire.fetchEvents({ start: info.startStr, end: info.endStr, timezone: info.timeZone })
                        .then(successCallback)
                        .catch(failureCallback)
                },
                eventClick: ({ event, jsEvent }) => {
                    jsEvent.preventDefault()

                    if (event.url) {
                        const isNotPlainLeftClick = e => (e.which > 1) || (e.altKey) || (e.ctrlKey) || (e.metaKey) || (e.shiftKey)
                        return window.open(event.url, (event.extendedProps.shouldOpenUrlInNewTab || isNotPlainLeftClick(jsEvent)) ? '_blank' : '_self')
                    }

                    this.$wire.onEventClick(event)
                },
                eventDrop: async ({ event, oldEvent, relatedEvents, delta, oldResource, newResource, revert }) => {
                    const shouldRevert = await this.$wire.onEventDrop(event, oldEvent, relatedEvents, delta, oldResource, newResource)

                    if (typeof shouldRevert === 'boolean' && shouldRevert) {
                        revert()
                    }
                },
                eventResize: async ({ event, oldEvent, relatedEvents, startDelta, endDelta, revert }) => {
                    const shouldRevert = await this.$wire.onEventResize(event, oldEvent, relatedEvents, startDelta, endDelta)

                    if (typeof shouldRevert === 'boolean' && shouldRevert) {
                        revert()
                    }
                },
                dateClick: ({ dateStr, allDay, view, resource }) => {
                    if (!selectable) return;
                    this.$wire.onDateSelect(dateStr, null, allDay, view, resource)
                },
                select: ({ startStr, endStr, allDay, view, resource }) => {
                    if (!selectable) return;
                    this.$wire.onDateSelect(startStr, endStr, allDay, view, resource)
                },
            })

            calendar.render()

            window.addEventListener('filament-fullcalendar--refresh', () => calendar.refetchEvents())
            window.addEventListener('filament-fullcalendar--prev', () => calendar.prev())
            window.addEventListener('filament-fullcalendar--next', () => calendar.next())
            window.addEventListener('filament-fullcalendar--today', () => calendar.today())
            window.addEventListener('filament-fullcalendar--goto', (event) => calendar.gotoDate(event.detail.date))
        },
    }
}

const availablePlugins = {
    'interaction': interactionPlugin,
    'dayGrid': dayGridPlugin,
    'timeGrid': timeGridPlugin,
    'list': listPlugin,
    'multiMonth': multiMonthPlugin,
    'scrollGrid': scrollGridPlugin,
    'timeline': timelinePlugin,
    'adaptive': adaptivePlugin,
    'resource': resourcePlugin,
    'resourceDayGrid': resourceDayGridPlugin,
    'resourceTimeline': resourceTimelinePlugin,
    'resourceTimeGrid': resourceTimeGridPlugin,
    'rrule': rrulePlugin,
    'moment': momentPlugin,
    'momentTimezone': momentTimezonePlugin,
}
