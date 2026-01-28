import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error } = isSignUp
                ? await signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username
                        }
                    }
                })
                : await signIn({ email, password });

            if (error) throw error;

            if (isSignUp) {
                // 0. Pre-check username availability (optional optimization, but good UX)
                if (username.length < 3) throw new Error("Username must be at least 3 characters");

                // 1. Check if user is actually new or existing (duplicate sign-up with session)
                if (data.user && data.session) {
                    const createdAt = new Date(data.user.created_at).getTime();
                    const now = new Date().getTime();

                    // If newly created (within last 1 min), try to set the username
                    if (now - createdAt < 60000) {
                        // RETRY LOGIC: Wait for the Trigger to create the profile
                        let profileExists = false;
                        let retries = 0;

                        while (!profileExists && retries < 10) {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('id')
                                .eq('id', data.user.id)
                                .single();

                            if (profile) {
                                profileExists = true;
                            } else {
                                // Wait 500ms
                                await new Promise(resolve => setTimeout(resolve, 500));
                                retries++;
                            }
                        }

                        if (profileExists) {
                            const { error: profileError } = await supabase
                                .from('profiles')
                                .update({ username: username })
                                .eq('id', data.user.id);

                            if (profileError) {
                                if (profileError.code === '23505') throw new Error("Username already taken! Please choose another.");
                                console.error("Profile update error:", profileError);
                            }
                        } else {
                            console.error("Timeout waiting for profile creation trigger.");
                            // User continues with default username (user_xxxx), can change later in Profile
                        }
                    }

                    if (now - createdAt > 10000) {
                        setError('Account already exists! Logging you in...');
                        setTimeout(() => navigate('/'), 2000);
                        return;
                    }
                }

                // If user exists but NO session
                if (data.user && !data.session) {
                    setError('Confirmation email sent! (If you already have an account, this means you need to Log In instead).');
                } else {
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '16px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: 'var(--shadow-card)',
                border: '1px solid var(--border-subtle)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                    {isSignUp ? 'Join the Quest' : 'Welcome Back'}
                </h2>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--color-danger)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-subtle)',
                                backgroundColor: 'var(--bg-app)',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>



                    {isSignUp && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} // Force lowercase/safe chars
                                placeholder="unique_username"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    backgroundColor: 'var(--bg-app)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Lowercase letters, numbers, and underscores only.</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: '0.25rem', fontWeight: 'bold' }}>⚠️ Username cannot be changed once set!</p>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-subtle)',
                                backgroundColor: 'var(--bg-app)',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            width: '100%',
                            padding: '0.875rem',
                            backgroundColor: 'var(--color-primary)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'background-color 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Log In')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    {' '}
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            fontWeight: '600',
                            textDecoration: 'underline'
                        }}
                    >
                        {isSignUp ? 'Log In' : 'Sign Up'}
                    </button>
                </p>
            </div >
        </div >
    );
};

export default Login;
