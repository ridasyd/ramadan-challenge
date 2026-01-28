import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchTasks = async () => {
        try {
            setLoading(true);

            // 1. Fetch active tasks for today:
            // Condition: active_date = Today OR (is_recurring = true AND day_of_week = Today's Index)

            const todayStr = new Date().toISOString().split('T')[0];
            const dayOfWeek = new Date().getDay();

            const { data: allTasks, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .or(`active_date.eq.${todayStr},and(is_recurring.eq.true,day_of_week.eq.${dayOfWeek})`);

            if (tasksError) throw tasksError;

            // 2. Fetch completions for the current user
            let completedTaskIds = new Set();
            if (user) {
                const { data: completions, error: completionsError } = await supabase
                    .from('user_tasks')
                    .select('task_id')
                    .eq('user_id', user.id);

                if (completionsError) throw completionsError;
                completedTaskIds = new Set(completions.map(c => c.task_id));
            }

            // 3. Merge data
            const tasksWithStatus = allTasks.map(task => ({
                ...task,
                completed: completedTaskIds.has(task.id)
            }));

            setTasks(tasksWithStatus);
        } catch (error) {
            console.error('Error fetching tasks:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = async (taskId, points, isCompleted) => {
        if (!user) return;

        try {
            if (isCompleted) {
                // UN-COMPLETE TASK

                // 1. Remove from user_tasks
                const { error: deleteError } = await supabase
                    .from('user_tasks')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('task_id', taskId);

                if (deleteError) throw deleteError;

                // 3. Decrement points (add negative)
                await supabase.rpc('increment_points', {
                    row_id: user.id,
                    points_to_add: -points
                });

                // 4. Update local state
                setTasks(prev => prev.map(t =>
                    t.id === taskId ? { ...t, completed: false } : t
                ));

            } else {
                // COMPLETE TASK

                // 1. Insert into user_tasks
                const { error: completeError } = await supabase
                    .from('user_tasks')
                    .insert([{ user_id: user.id, task_id: taskId }]);

                if (completeError) {
                    if (completeError.code === '23505') return;
                    throw completeError;
                }

                // 3. Increment points
                await supabase.rpc('increment_points', {
                    row_id: user.id,
                    points_to_add: points
                });

                // 2. Update local state
                setTasks(prev => prev.map(t =>
                    t.id === taskId ? { ...t, completed: true } : t
                ));
            }
        } catch (error) {
            console.error('Error toggling task:', error.message);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    return { tasks, loading, toggleTask, refreshTasks: fetchTasks };
};
