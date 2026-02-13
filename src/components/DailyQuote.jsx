import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../services/LanguageContext';
import { Lightbulb } from 'lucide-react';

const DailyQuote = () => {
    const { language } = useLanguage();
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                // Fetch quote for TODAY
                const today = new Date().toISOString().split('T')[0];

                const { data: todayData, error } = await supabase
                    .from('daily_quotes')
                    .select('*')
                    .eq('active_date', today)
                    .maybeSingle();

                let finalQuote = todayData;

                // Fallback: Get most recent past quote if no exact match for today
                if (!finalQuote) {
                    const { data: recentData } = await supabase
                        .from('daily_quotes')
                        .select('*')
                        .lte('active_date', today) // Don't show future quotes
                        .order('active_date', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                    finalQuote = recentData;
                }

                // If still no quotes exist, use the hardcoded fallback
                if (!finalQuote) {
                    setQuote({
                        content: "The only way to do great work is to love what you do.",
                        author: "Steve Jobs"
                    });
                } else {
                    setQuote(finalQuote);
                }
            } catch (err) {
                console.error('Error fetching quote:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuote();
    }, []);

    if (loading) return null;

    return (
        <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-app)',
            border: '1px dashed var(--color-primary)',
            borderRadius: '12px',
            position: 'relative',
            textAlign: 'center'
        }}>
            <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--bg-card)',
                padding: '0 0.5rem',
                color: 'var(--color-primary)'
            }}>
                <Lightbulb size={20} fill="currentColor" />
            </div>

            <p style={{
                fontStyle: 'italic',
                fontSize: '1.1rem',
                marginBottom: '0.5rem',
                lineHeight: '1.5'
            }}>
                "{(language === 'de' && quote.content_de) ? quote.content_de : quote.content}"
            </p>
            <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                margin: 0,
                fontWeight: '500'
            }}>
                — {quote.author}
            </p>
        </div>
    );
};

export default DailyQuote;
