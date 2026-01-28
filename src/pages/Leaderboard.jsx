import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { supabase } from '../services/supabase';
import { ArrowLeft, Trophy, Crown, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // 1. Check if current user is admin
                const { data: currentUserProfile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                const adminStatus = currentUserProfile?.is_admin || false;
                setIsAdmin(adminStatus);

                // 2. Fetch all profiles for the leaderboard
                const { data: allProfiles, error } = await supabase
                    .from('profiles')
                    .select('id, email, display_name, total_points, is_admin')
                    .order('total_points', { ascending: false })
                    .limit(50); // Top 50

                if (error) throw error;
                setProfiles(allProfiles || []);

            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const getDisplayName = (profile) => {
        // Rule: Admins see everything
        if (isAdmin) {
            return (
                <span>
                    {profile.display_name || 'No Name'}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        ({profile.email}) {profile.is_admin && '🛡️'}
                    </span>
                </span>
            );
        }

        // Rule: Regular users see themselves
        if (profile.id === user.id) {
            return "You";
        }

        // Rule: Everyone else is anonymous
        // We simulate a stable anonymous name using the ID
        const shortId = profile.id.substring(0, 4).toUpperCase();
        return `Adventurer ${shortId}`;
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Leaderboard...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', marginRight: '1rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy className="text-yellow-500" /> Leaderboard
                </h1>
            </header>

            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                {profiles.map((profile, index) => {
                    const isCurrentUser = profile.id === user.id;
                    let rankIcon = null;
                    if (index === 0) rankIcon = <Crown size={20} color="#FFD700" fill="#FFD700" />;
                    else if (index === 1) rankIcon = <Crown size={20} color="#C0C0C0" />;
                    else if (index === 2) rankIcon = <Crown size={20} color="#CD7F32" />;

                    return (
                        <div key={profile.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            backgroundColor: isCurrentUser ? 'rgba(58, 163, 114, 0.1)' : 'transparent'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '30px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: index < 3 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    {index + 1}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {rankIcon || <User size={18} color="var(--text-muted)" />}
                                    <span style={{ fontWeight: isCurrentUser ? 'bold' : 'normal', color: isCurrentUser ? 'var(--color-primary)' : 'inherit' }}>
                                        {getDisplayName(profile)}
                                    </span>
                                </div>
                            </div>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-reward)' }}>
                                {profile.total_points} pts
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Leaderboard;
