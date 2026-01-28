-- Add missing policy to allow users to UN-COMPLETE (delete) their own tasks
create policy "Users can un-complete their own tasks."
  on user_tasks for delete
  using ( auth.uid() = user_id );
