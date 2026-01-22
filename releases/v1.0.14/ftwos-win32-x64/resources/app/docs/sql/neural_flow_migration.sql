-- Neural Flow Widget Database Schema
-- Activity tracking and productivity metrics

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('task_start', 'task_complete', 'focus_session', 'break', 'context_switch', 'interruption')),
  duration INTEGER, -- in seconds
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  context_switches INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity logs"
  ON activity_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity logs"
  ON activity_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Helper function to get productivity metrics
CREATE OR REPLACE FUNCTION get_productivity_metrics(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE(
  peak_hours JSONB,
  average_focus_score NUMERIC,
  total_context_switches INTEGER,
  total_focus_time INTEGER,
  burnout_risk INTEGER,
  productivity_trend TEXT
) AS $$
DECLARE
  v_start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  v_start_date := NOW() - (p_days || ' days')::INTERVAL;
  
  RETURN QUERY
  WITH activity_data AS (
    SELECT 
      EXTRACT(HOUR FROM created_at) as hour,
      focus_score,
      context_switches,
      duration,
      created_at
    FROM activity_logs
    WHERE user_id = p_user_id
      AND created_at >= v_start_date
      AND activity_type = 'focus_session'
  ),
  hourly_scores AS (
    SELECT 
      hour,
      AVG(focus_score) as avg_score,
      COUNT(*) as session_count
    FROM activity_data
    WHERE focus_score IS NOT NULL
    GROUP BY hour
    ORDER BY avg_score DESC
    LIMIT 5
  ),
  metrics AS (
    SELECT
      COALESCE(AVG(focus_score), 0) as avg_focus,
      COALESCE(SUM(context_switches), 0) as total_switches,
      COALESCE(SUM(duration), 0) as total_time
    FROM activity_data
  ),
  trend_data AS (
    SELECT
      CASE 
        WHEN COUNT(*) > 0 THEN
          AVG(CASE WHEN created_at >= NOW() - INTERVAL '3 days' THEN focus_score ELSE NULL END) -
          AVG(CASE WHEN created_at < NOW() - INTERVAL '3 days' THEN focus_score ELSE NULL END)
        ELSE 0
      END as trend_diff
    FROM activity_data
    WHERE focus_score IS NOT NULL
  )
  SELECT
    (SELECT jsonb_agg(jsonb_build_object('hour', hour, 'score', ROUND(avg_score))) FROM hourly_scores) as peak_hours,
    ROUND((SELECT avg_focus FROM metrics)) as average_focus_score,
    (SELECT total_switches::INTEGER FROM metrics) as total_context_switches,
    (SELECT total_time::INTEGER FROM metrics) as total_focus_time,
    LEAST(100, GREATEST(0, 
      ROUND(
        ((SELECT total_switches FROM metrics) / NULLIF((SELECT COUNT(*) FROM activity_data), 0) * 10) +
        (100 - (SELECT avg_focus FROM metrics))
      )
    ))::INTEGER as burnout_risk,
    CASE
      WHEN (SELECT trend_diff FROM trend_data) > 5 THEN 'increasing'
      WHEN (SELECT trend_diff FROM trend_data) < -5 THEN 'decreasing'
      ELSE 'stable'
    END as productivity_trend;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activity with automatic timestamp
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_duration INTEGER DEFAULT NULL,
  p_focus_score INTEGER DEFAULT NULL,
  p_context_switches INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activity_logs (
    user_id,
    activity_type,
    duration,
    focus_score,
    context_switches,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_duration,
    p_focus_score,
    p_context_switches,
    p_metadata,
    NOW()
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for recent activity summary
CREATE OR REPLACE VIEW recent_activity_summary AS
SELECT 
  user_id,
  activity_type,
  COUNT(*) as count,
  AVG(focus_score) as avg_focus_score,
  SUM(duration) as total_duration,
  SUM(context_switches) as total_switches,
  DATE_TRUNC('day', created_at) as activity_date
FROM activity_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id, activity_type, DATE_TRUNC('day', created_at)
ORDER BY activity_date DESC;

-- Grant permissions
GRANT SELECT ON recent_activity_summary TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE activity_logs IS 'Stores user activity data for Neural Flow widget productivity tracking';
COMMENT ON FUNCTION get_productivity_metrics IS 'Calculates productivity metrics for a user over a specified time period';
COMMENT ON FUNCTION log_activity IS 'Helper function to log user activities with automatic timestamp';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Neural Flow migration completed successfully!';
  RAISE NOTICE 'Tables created: activity_logs';
  RAISE NOTICE 'Functions created: get_productivity_metrics, log_activity';
  RAISE NOTICE 'View created: recent_activity_summary';
END $$;

