import React from 'react';
import { useAuth } from '../services/AuthContext';
import { useTasks } from '../services/useTasks';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle } from 'lucide-react';
import DailyQuote from '../components/DailyQuote';

const Home = () => {
    const { user, signOut } = useAuth();
    const { tasks, loading, toggleTask } = useTasks();
    const [displayName, setDisplayName] = React.useState('');
    const [username, setUsername] = React.useState('');

    React.useEffect(() => {
        if (user) {
            import('../services/supabase').then(({ supabase }) => {
                supabase.from('profiles').select('username, display_name').eq('id', user.id).single()
                    .then(({ data }) => {
                        if (data?.display_name) setDisplayName(data.display_name);
                        if (data?.username) setUsername(data.username);
                    });
            });
        }
    }, [user]);

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem' }}>Daily Quest</h1>
                {user ? (
                    <button
                        onClick={signOut}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid var(--border-subtle)',
                            background: 'transparent',
                            borderRadius: '8px',
                            color: 'var(--text-muted)'
                        }}
                    >
                        Sign Out
                    </button>
                ) : (
                    <Link
                        to="/login"
                        style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        Login
                    </Link>
                )}
            </header>

            {user ? (
                <div>
                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Welcome back,</p>
                            <Link to="/profile" style={{ fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                <span>{displayName || 'Adventurer'}</span>
                                {username && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>@{username}</span>}
                            </Link>
                        </div>
                        <Link to="/profile" style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            textDecoration: 'none'
                        }}>
                            {user.email[0].toUpperCase()}
                        </Link>
                    </div>

                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-card)',
                        border: '1px solid var(--border-subtle)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Today's Quests</h2>
                            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Complete tasks to earn points!
                            </p>
                        </div>

                        <div style={{ padding: '0' }}>
                            {loading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading tasks...</div>
                            ) : tasks.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No tasks for today. Check back tomorrow!</div>
                            ) : (
                                tasks.map(task => (
                                    <div key={task.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1.25rem 1.5rem',
                                        borderBottom: '1px solid var(--border-subtle)',
                                        transition: 'background-color 0.2s',
                                        backgroundColor: task.completed ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <button
                                                onClick={() => toggleTask(task.id, task.points, task.completed)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: 0,
                                                    cursor: 'pointer',
                                                    color: task.completed ? 'var(--color-primary)' : 'var(--text-muted)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '28px',
                                                    height: '28px',
                                                    transform: 'translate(-2px, 2px)' // Nudge left/bottom as requested
                                                }}
                                            >
                                                {task.completed ? <CheckCircle size={28} fill="var(--color-primary)" color="var(--bg-card)" /> : <Circle size={28} />}
                                            </button>

                                            <div>
                                                <p style={{
                                                    margin: 0,
                                                    fontWeight: '500',
                                                    textDecoration: task.completed ? 'line-through' : 'none',
                                                    color: task.completed ? 'var(--text-muted)' : 'var(--text-main)'
                                                }}>
                                                    {task.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{
                                            fontWeight: 'bold',
                                            color: task.completed ? 'var(--text-muted)' : 'var(--color-reward)',
                                            fontSize: '0.9rem'
                                        }}>
                                            +{task.points} pts
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <DailyQuote />

                </div>
            ) : (
                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <h2>Ready to level up your life?</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Sign in to start tracking your daily quests and earning rewards.</p>
                </div>
            )}
        </div>
    );
};

export default Home;
