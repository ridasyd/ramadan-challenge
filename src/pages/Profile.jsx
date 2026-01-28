import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Flame, ArrowLeft, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
                setNewName(data.display_name || '');
            } catch (error) {
                console.error('Error fetching profile:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleSaveName = async () => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ display_name: newName })
                .eq('id', user.id);

            if (error) throw error;

            setProfile(prev => ({ ...prev, display_name: newName }));
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating name:', error.message);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <Link to="/" style={{ marginRight: '1rem', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                    <ArrowLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '1.5rem' }}>Your Profile</h1>
            </header>

            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-card)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
                marginBottom: '2rem'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        {profile?.email?.[0].toUpperCase()}
                    </span>
                </div>

                {isEditing ? (
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Display Name"
                            style={{
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-subtle)',
                                fontSize: '1rem'
                            }}
                        />
                        <button onClick={handleSaveName} style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>Save</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{profile?.display_name || 'Adventurer'}</h2>
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                        >
                            Edit
                        </button>
                    </div>
                )}

                <p style={{ color: 'var(--text-muted)', margin: 0 }}>@{profile?.username || 'user'}</p>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', marginTop: '0.25rem' }}>{profile?.email}</h2>

                {profile?.is_admin && (
                    <button
                        onClick={() => navigate('/admin')}
                        style={{
                            padding: '0.5rem 1rem',
                            marginBottom: '1rem',
                            backgroundColor: 'var(--bg-app)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)'
                        }}
                    >
                        <Shield size={16} /> Open Quest Maker
                    </button>
                )}

                <button
                    onClick={() => navigate('/leaderboard')}
                    style={{
                        padding: '0.5rem 1rem',
                        marginBottom: '1rem',
                        marginLeft: '0.5rem',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        color: 'var(--text-main)'
                    }}
                >
                    <Trophy size={16} color="var(--color-reward)" /> Leaderboard
                </button>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Member since {new Date(user?.created_at).toLocaleDateString('en-GB').replace(/\//g, '.')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Trophy size={32} color="var(--color-reward)" />
                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{profile?.total_points || 0}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Points</span>
                </div>

                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Flame size={32} color="#F97316" />
                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{profile?.current_streak || 0}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Day Streak</span>
                </div>
            </div>
        </div>
    );
};

export default Profile;
