-- ============================================
-- FTWOS Performance Optimization for 10 Users
-- ============================================
-- Run this in Supabase SQL Editor
-- Optimizes database for fast queries with 10 concurrent users

-- ============================================
-- 1. CREATE ESSENTIAL INDEXES
-- ============================================

-- Invoices - Most queried table
CREATE INDEX IF NOT EXISTS idx_invoices_user_date 
  ON invoices(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_status 
  ON invoices(status) WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_client 
  ON invoices(client_id) WHERE client_id IS NOT NULL;

-- Tasks - High frequency queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_status 
  ON tasks(user_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_due_date 
  ON tasks(due_date) WHERE due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_priority 
  ON tasks(priority) WHERE priority IS NOT NULL;

-- Clients - Frequent lookups
CREATE INDEX IF NOT EXISTS idx_clients_user 
  ON clients(user_id);

CREATE INDEX IF NOT EXISTS idx_clients_name 
  ON clients(name);

-- Time Entries - Time tracking queries
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date 
  ON time_entries(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_time_entries_project 
  ON time_entries(project_id) WHERE project_id IS NOT NULL;

-- Expenses - Financial queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_date 
  ON expenses(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_category 
  ON expenses(category) WHERE category IS NOT NULL;

-- ============================================
-- 2. ANALYZE TABLES FOR QUERY PLANNER
-- ============================================

ANALYZE invoices;
ANALYZE tasks;
ANALYZE clients;
ANALYZE time_entries;
ANALYZE expenses;

-- ============================================
-- 3. OPTIMIZE RLS POLICIES
-- ============================================

-- Ensure RLS is enabled on all tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate optimized versions)
DROP POLICY IF EXISTS "Users see own invoices" ON invoices;
DROP POLICY IF EXISTS "Users see own tasks" ON tasks;
DROP POLICY IF EXISTS "Users see own clients" ON clients;
DROP POLICY IF EXISTS "Users see own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users see own expenses" ON expenses;

-- Create optimized RLS policies
CREATE POLICY "Users see own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own time entries" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own time entries" ON time_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 4. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get user's recent invoices (cached)
CREATE OR REPLACE FUNCTION get_recent_invoices(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  invoice_number TEXT,
  client_id UUID,
  amount NUMERIC,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.invoice_number,
    i.client_id,
    i.amount,
    i.status,
    i.created_at
  FROM invoices i
  WHERE i.user_id = p_user_id
  ORDER BY i.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user's task summary
CREATE OR REPLACE FUNCTION get_task_summary(p_user_id UUID)
RETURNS TABLE (
  total_tasks BIGINT,
  completed_tasks BIGINT,
  pending_tasks BIGINT,
  overdue_tasks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_tasks,
    COUNT(*) FILTER (WHERE status = 'pending' AND due_date < NOW())::BIGINT as overdue_tasks
  FROM tasks
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get revenue summary
CREATE OR REPLACE FUNCTION get_revenue_summary(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_revenue NUMERIC,
  paid_revenue NUMERIC,
  pending_revenue NUMERIC,
  invoice_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(amount), 0) as total_revenue,
    COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) as paid_revenue,
    COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as pending_revenue,
    COUNT(*)::BIGINT as invoice_count
  FROM invoices
  WHERE user_id = p_user_id
    AND created_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 5. VACUUM AND OPTIMIZE
-- ============================================

-- Vacuum tables to reclaim space and update statistics
VACUUM ANALYZE invoices;
VACUUM ANALYZE tasks;
VACUUM ANALYZE clients;
VACUUM ANALYZE time_entries;
VACUUM ANALYZE expenses;

-- ============================================
-- 6. PERFORMANCE MONITORING VIEWS
-- ============================================

-- Create view for slow queries (admin only)
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100 -- queries taking more than 100ms on average
ORDER BY mean_time DESC
LIMIT 20;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('invoices', 'tasks', 'clients', 'time_entries', 'expenses')
ORDER BY tablename, indexname;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('invoices', 'tasks', 'clients', 'time_entries', 'expenses')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- NOTES
-- ============================================

/*
Performance Targets for 10 Users:
- Query response time: < 100ms
- Index hit ratio: > 95%
- Cache hit ratio: > 90%
- Connection pool: 10 connections max
- Memory usage: < 500MB

After running this script:
1. Monitor query performance in Supabase dashboard
2. Check slow query log
3. Adjust indexes based on actual usage patterns
4. Run VACUUM ANALYZE weekly

To test performance:
EXPLAIN ANALYZE SELECT * FROM invoices WHERE user_id = 'your-user-id' ORDER BY created_at DESC LIMIT 10;
*/

