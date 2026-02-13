import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { useLanguage } from '../services/LanguageContext';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar, Repeat, MessageSquare, X } from 'lucide-react';
import AdminCalendar from '../components/AdminCalendar';
import LanguageToggle from '../components/LanguageToggle';

const Admin = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Helper for local YYYY-MM-DD
    const getLocalYYYYMMDD = (d = new Date()) => {
        const offset = d.getTimezoneOffset();
        const local = new Date(d.getTime() - (offset * 60 * 1000));
        return local.toISOString().split('T')[0];
    };

    // Quest Form States
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [description, setDescription] = useState('');
    const [descriptionDe, setDescriptionDe] = useState('');
    const [points, setPoints] = useState(10);
    const [isRecurring, setIsRecurring] = useState(false);
    const [activeDate, setActiveDate] = useState(getLocalYYYYMMDD());
    const [dayOfWeek, setDayOfWeek] = useState(new Date().getDay()); // 0=Sun, 1=Mon...

    // Quote Form States
    const [quoteContent, setQuoteContent] = useState('');
    const [quoteContentDe, setQuoteContentDe] = useState('');
    const [quoteAuthor, setQuoteAuthor] = useState('');

    // Data List State
    const [allTasks, setAllTasks] = useState([]);
    const [allQuotes, setAllQuotes] = useState([]);

    // Modal State
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                if (!user) {
                    // Wait for auth to initialize? 
                    // For now, just redirect if definitely no user
                    console.log("No user found, redirecting");
                    navigate('/login');
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (!data?.is_admin) {
                    console.warn("User is not admin");
                    // We let the Render handle the 'Access Denied' message now
                } else {
                    console.log("Admin verified");
                    setIsAdmin(true);
                    await Promise.all([fetchAllTasks(), fetchAllQuotes()]);
                }
            } catch (err) {
                console.error("Admin check failed:", err);
                alert("Error: " + err.message);
            } finally {
                setLoading(false);
            }
        };
        checkAdmin();
    }, [user, navigate]);

    const fetchAllTasks = async () => {
        // Fetch ALL tasks now for calendar
        const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (data) setAllTasks(data);
    };

    const fetchAllQuotes = async () => {
        // Fetch ALL quotes now for calendar
        const { data } = await supabase.from('daily_quotes').select('*').order('created_at', { ascending: false });
        if (data) setAllQuotes(data);
    };

    const startEditTask = (task) => {
        setEditingTaskId(task.id);
        setDescription(task.description);
        setDescriptionDe(task.description_de || '');
        setPoints(task.points);
        setIsRecurring(task.is_recurring);
        if (task.active_date) setActiveDate(task.active_date);
        if (task.day_of_week !== null) setDayOfWeek(task.day_of_week);

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingTaskId(null);
        setDescription('');
        setDescriptionDe('');
        setPoints(10);
        setIsRecurring(false);
        setActiveDate(getLocalYYYYMMDD());
    };

    const handleCreateOrUpdateTask = async (e) => {
        e.preventDefault();
        try {
            const taskData = {
                description,
                description_de: descriptionDe,
                points,
                is_recurring: isRecurring,
                active_date: isRecurring ? null : activeDate,
                day_of_week: isRecurring ? dayOfWeek : null
            };

            if (editingTaskId) {
                // UPDATE
                const { error } = await supabase.from('tasks').update(taskData).eq('id', editingTaskId);
                if (error) throw error;
                alert('Quest Updated!');
                setEditingTaskId(null);
            } else {
                // CREATE
                const { error } = await supabase.from('tasks').insert([taskData]);
                if (error) throw error;
                alert('Quest Created!');
            }

            // Reset form and refresh list
            setDescription('');
            setDescriptionDe('');
            setPoints(10);
            fetchAllTasks();

        } catch (error) {
            console.error(error);
            alert('Error saving task: ' + error.message);
        }
    };

    const handleCreateQuote = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('daily_quotes').insert([{
                content: quoteContent,
                content_de: quoteContentDe,
                author: quoteAuthor,
                active_date: activeDate // Reusing activeDate state for simplicity
            }]);
            if (error) throw error;

            setQuoteContent('');
            setQuoteContentDe('');
            setQuoteAuthor('');
            alert('Quote Created!');
            fetchAllQuotes();
        } catch (error) {
            console.error(error);
            alert('Error creating quote: ' + error.message);
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Delete this quest?')) return;
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (!error) fetchAllTasks();
    };

    const handleDeleteQuote = async (id) => {
        if (!window.confirm('Delete this quote?')) return;
        const { error } = await supabase.from('daily_quotes').delete().eq('id', id);
        if (!error) fetchAllQuotes();
    };

    if (loading) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h2>Verifying Quest Master Credentials...</h2>
            <p>Please wait.</p>
        </div>
    );

    if (!isAdmin) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-danger)' }}>
            <h2>Access Denied</h2>
            <p>You do not have permission to view this page.</p>
            <button
                onClick={() => navigate('/')}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', cursor: 'pointer' }}
            >
                Return Home
            </button>
        </div>
    );

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', marginRight: '1rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{t('admin_dashboard')}</h1>
                <div style={{ marginLeft: 'auto' }}>
                    <LanguageToggle />
                </div>
            </header>

            {/* CALENDAR VIEW */}
            <div style={{ marginBottom: '2rem' }}>
                <AdminCalendar
                    tasks={allTasks}
                    quotes={allQuotes}
                    onDayClick={(date) => {
                        setSelectedDate(date);
                        // Pre-fill active date in forms to this selection
                        setActiveDate(getLocalYYYYMMDD(date));
                        // If it's a weekday, also pre-select that day for recurring
                        setDayOfWeek(date.getDay());
                        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top if forms are there
                    }}
                />
            </div>

            {/* DAY INSPECTOR / EDITOR */}
            {selectedDate && (
                <div style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '2px solid var(--color-primary)',
                    position: 'relative',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    <button
                        onClick={() => {
                            setSelectedDate(null);
                            cancelEdit();
                        }}
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>

                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Editing: {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* LEFT: QUEST FORM for selected date */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                                <Plus size={18} /> {editingTaskId ? t('edit_quest') : t('add_quest')}
                            </h3>
                            {/* Re-using the same form logic but wrapped here for context */}
                            <form onSubmit={handleCreateOrUpdateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* ... Same fields ... */}
                                {/* Simplified projection for brevity in this specific view, or just re-render full form */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t('description')}</label>
                                    <input required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (English)" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t('description_de')}</label>
                                    <input value={descriptionDe} onChange={(e) => setDescriptionDe(e.target.value)} placeholder="Beschreibung (German)" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Points</label>
                                        <input type="number" required value={points} onChange={(e) => setPoints(parseInt(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Type</label>
                                        <select value={isRecurring ? 'recurring' : 'oneoff'} onChange={(e) => setIsRecurring(e.target.value === 'recurring')} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)' }}>
                                            <option value="oneoff">{t('one_off')} (This Date)</option>
                                            <option value="recurring">{t('recurring')} (Every {selectedDate.toLocaleDateString(undefined, { weekday: 'long' })})</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {editingTaskId ? t('update_quest') : t('save_quest')}
                                </button>
                            </form>

                            {/* LIST EXISTING FOR THIS DAY */}
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Existing Quests on this Day:</h4>
                                {allTasks.filter(t => (t.is_recurring && t.day_of_week === selectedDate.getDay()) || (!t.is_recurring && t.active_date === getLocalYYYYMMDD(selectedDate))).map(t => (
                                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.5rem 0' }}>
                                        <span>{t.is_recurring && <Repeat size={12} style={{ marginRight: 4 }} />} {t.description}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => startEditTask(t)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                                            <button onClick={() => handleDeleteTask(t.id)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>Del</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: QUOTE FORM for selected date */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-reward)' }}>
                                <MessageSquare size={18} /> Quote for {selectedDate.toLocaleDateString()}
                            </h3>
                            <form onSubmit={handleCreateQuote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <textarea required value={quoteContent} onChange={(e) => setQuoteContent(e.target.value)} placeholder="Quote Content (English)" rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                                <textarea value={quoteContentDe} onChange={(e) => setQuoteContentDe(e.target.value)} placeholder="Zitat Inhalt (German)" rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                                <input value={quoteAuthor} onChange={(e) => setQuoteAuthor(e.target.value)} placeholder="Author" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                                <button type="submit" style={{ padding: '0.75rem', backgroundColor: 'var(--color-reward)', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Save Quote
                                </button>
                            </form>
                            {/* LIST EXISTING QUOTE */}
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                                {allQuotes.filter(q => q.active_date === getLocalYYYYMMDD(selectedDate)).map(q => (
                                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.5rem 0', fontStyle: 'italic' }}>
                                        <span>"{q.content}" - {q.author}</span>
                                        <button onClick={() => handleDeleteQuote(q.id)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FALLBACK LISTS (Still useful for seeing everything linearly if needed, or we can hide them) */}
            <details style={{ marginBottom: '2rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <summary>View All Lists (Legacy View)</summary>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>

                    {/* --- LEFT COLUMN: QUESTS --- */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>All Quests</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {allTasks.map(task => (
                                    <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '500' }}>{task.description}</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {task.points} pts • {task.is_recurring ? `Every ${days[task.day_of_week]}` : new Date(task.active_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => startEditTask(task)}
                                                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: QUOTES --- */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>All Quotes</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {allQuotes.map(quote => (
                                    <div key={quote.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div>
                                            <p style={{ margin: 0, fontStyle: 'italic' }}>"{quote.content.substring(0, 40)}{quote.content.length > 40 ? '...' : ''}"</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {new Date(quote.active_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button onClick={() => handleDeleteQuote(quote.id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </details>
        </div>
    );
};

export default Admin;
