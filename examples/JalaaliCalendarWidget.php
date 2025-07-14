<?php

namespace App\Filament\Widgets;

use Saade\FilamentFullCalendar\Widgets\FullCalendarWidget;
use Saade\FilamentFullCalendar\Data\EventData;

class JalaaliCalendarWidget extends FullCalendarWidget
{
    /**
     * Enable Jalaali calendar support
     */
    public function config(): array
    {
        return [
            'jalaali' => true,
        ];
    }

    /**
     * Return events for the calendar
     */
    public function fetchEvents(array $fetchInfo): array
    {
        // Example events - in a real application, you would fetch from your database
        return [
            EventData::make()
                ->id(1)
                ->title('جلسه کاری')
                ->start('2024-01-15 10:00:00')
                ->end('2024-01-15 11:00:00')
                ->backgroundColor('#3b82f6')
                ->textColor('#ffffff'),
            
            EventData::make()
                ->id(2)
                ->title('ملاقات با مشتری')
                ->start('2024-01-16 14:00:00')
                ->end('2024-01-16 15:30:00')
                ->backgroundColor('#10b981')
                ->textColor('#ffffff'),
            
            EventData::make()
                ->id(3)
                ->title('جلسه تیمی')
                ->start('2024-01-17 09:00:00')
                ->end('2024-01-17 10:30:00')
                ->backgroundColor('#f59e0b')
                ->textColor('#ffffff'),
        ];
    }
}
