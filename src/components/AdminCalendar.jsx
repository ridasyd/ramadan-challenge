import React from 'react';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, isToday
} from 'date-fns';
import { Calendar as CalIcon, Repeat, Quote, CheckCircle2 } from 'lucide-react';

const AdminCalendar = ({ tasks, quotes, onDayClick }) => {
    const currentDate = new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getDayContent = (day) => {
        // Note: formatting 'day' with yyyy-MM-dd uses local time by default in date-fns/format
        // mimicking the behavior we want (00:00 local time -> YYYY-MM-DD local)
        const dateStr = format(day, 'yyyy-MM-dd');

        // 1. Recurring Tasks for this day of week
        const recurringTasks = tasks.filter(t => t.is_recurring && t.day_of_week === day.getDay());

        // 2. One-off Tasks for this specific date
        const oneOffTasks = tasks.filter(t => !t.is_recurring && t.active_date === dateStr);

        // 3. Quote for this day
        const dayQuote = quotes.find(q => q.active_date === dateStr);

        return { recurringTasks, oneOffTasks, dayQuote };
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalIcon size={20} /> Campaign Schedule: {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Repeat size={14} /> Recurring</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={14} /> One-off</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Quote size={14} /> Quote</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'var(--border-subtle)', gap: '1px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{ padding: '0.5rem', textAlign: 'center', backgroundColor: 'var(--bg-app)', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                        {day}
                    </div>
                ))}

                {calendarDays.map(day => {
                    const { recurringTasks, oneOffTasks, dayQuote } = getDayContent(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => onDayClick(day)}
                            style={{
                                backgroundColor: isCurrentMonth ? 'var(--bg-card)' : 'rgba(0,0,0,0.2)',
                                minHeight: '100px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                position: 'relative',
                                opacity: isCurrentMonth ? 1 : 0.5,
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-app)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isCurrentMonth ? 'var(--bg-card)' : 'rgba(0,0,0,0.2)'}
                        >
                            <div style={{
                                textAlign: 'right',
                                fontSize: '0.8rem',
                                marginBottom: '0.5rem',
                                color: isDayToday ? 'var(--color-primary)' : 'inherit',
                                fontWeight: isDayToday ? 'bold' : 'normal'
                            }}>
                                {format(day, 'd')}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {recurringTasks.map(t => (
                                    <div key={t.id} style={{ fontSize: '0.7rem', backgroundColor: 'rgba(58, 163, 114, 0.1)', color: 'var(--color-primary)', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        <Repeat size={10} /> {t.description}
                                    </div>
                                ))}
                                {oneOffTasks.map(t => (
                                    <div key={t.id} style={{ fontSize: '0.7rem', backgroundColor: 'rgba(217, 119, 6, 0.1)', color: 'var(--color-reward)', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {t.description}
                                    </div>
                                ))}
                                {dayQuote && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
                                        <Quote size={12} fill="currentColor" opacity={0.5} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminCalendar;
