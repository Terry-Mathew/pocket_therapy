# PocketTherapy Database Schema

This document outlines the database schema for PocketTherapy, designed for privacy-first mental health data storage with Row Level Security (RLS).

## 🏗️ Architecture Overview

### Design Principles:
- **Privacy First**: All user data protected by RLS policies
- **Local-First**: Supports offline-first architecture with sync
- **Scalable**: Designed to handle growth from MVP to full platform
- **Secure**: Google OAuth authentication with secure session management
- **Compliant**: Structured for HIPAA-like privacy requirements

### Environment Setup:
- **Development**: For local development and testing
- **Production**: For app store releases and live users

## 📊 Database Tables

### 1. Users Table (`users`)

Stores user account information and authentication data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  google_id TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_last_active ON users(last_active_at);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow user creation during signup
CREATE POLICY "Allow user creation" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. User Profiles Table (`user_profiles`)

Stores user preferences, settings, and onboarding data.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT id FROM users WHERE id = user_profiles.user_id)
  );
```

### 3. Mood Logs Table (`mood_logs`)

Stores daily mood check-ins with triggers and notes.

```sql
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mood_level INTEGER NOT NULL CHECK (mood_level >= 1 AND mood_level <= 5),
  triggers TEXT[] DEFAULT '{}',
  note TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one mood log per user per day
  UNIQUE(user_id, DATE(logged_at))
);

-- Indexes
CREATE INDEX idx_mood_logs_user_id ON mood_logs(user_id);
CREATE INDEX idx_mood_logs_logged_at ON mood_logs(logged_at);
CREATE INDEX idx_mood_logs_mood_level ON mood_logs(mood_level);
CREATE INDEX idx_mood_logs_user_date ON mood_logs(user_id, DATE(logged_at));

-- RLS Policies
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own mood logs" ON mood_logs
  FOR ALL USING (auth.uid() = user_id);
```

### 4. Exercises Table (`exercises`)

Stores the library of therapeutic exercises.

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('breathing', 'grounding', 'cognitive')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_seconds INTEGER NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  audio_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_duration ON exercises(duration_seconds);
CREATE INDEX idx_exercises_active ON exercises(is_active);

-- RLS Policies
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read exercises
CREATE POLICY "Authenticated users can read exercises" ON exercises
  FOR SELECT USING (auth.role() = 'authenticated');
```

### 5. User Exercise Logs Table (`user_exercise_logs`)

Tracks user exercise sessions and ratings.

```sql
CREATE TABLE user_exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_exercise_logs_user_id ON user_exercise_logs(user_id);
CREATE INDEX idx_user_exercise_logs_exercise_id ON user_exercise_logs(exercise_id);
CREATE INDEX idx_user_exercise_logs_started_at ON user_exercise_logs(started_at);
CREATE INDEX idx_user_exercise_logs_completed ON user_exercise_logs(completed_at);

-- RLS Policies
ALTER TABLE user_exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exercise logs" ON user_exercise_logs
  FOR ALL USING (auth.uid() = user_id);
```

### 6. Sync Queue Table (`sync_queue`)

Manages offline data synchronization.

```sql
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  data JSONB,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);

-- RLS Policies
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sync queue" ON sync_queue
  FOR ALL USING (auth.uid() = user_id);
```

## 🔒 Row Level Security (RLS) Policies

### Security Principles:
1. **User Isolation**: Users can only access their own data
2. **Public Content**: Exercises are readable by all authenticated users
3. **Admin Access**: System administrators have full access (separate policies)
4. **Guest Protection**: Guest users have no database access (local-only)

### Policy Examples:

```sql
-- Example: Mood logs are completely private
CREATE POLICY "mood_logs_user_isolation" ON mood_logs
  FOR ALL USING (auth.uid() = user_id);

-- Example: Exercises are public content
CREATE POLICY "exercises_public_read" ON exercises
  FOR SELECT USING (auth.role() = 'authenticated');

-- Example: User profiles with additional checks
CREATE POLICY "user_profiles_secure_access" ON user_profiles
  FOR ALL USING (
    auth.uid() = user_id AND 
    auth.role() = 'authenticated'
  );
```

## 🔄 Database Functions

### 1. Update Timestamp Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (apply to all relevant tables)
```

### 2. Mood Analytics Function

```sql
CREATE OR REPLACE FUNCTION get_mood_analytics(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  average_mood NUMERIC,
  mood_trend TEXT,
  common_triggers TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(mood_level), 2) as average_mood,
    CASE 
      WHEN AVG(mood_level) > 3.5 THEN 'positive'
      WHEN AVG(mood_level) < 2.5 THEN 'concerning'
      ELSE 'neutral'
    END as mood_trend,
    ARRAY_AGG(DISTINCT unnest(triggers)) as common_triggers
  FROM mood_logs 
  WHERE user_id = p_user_id 
    AND logged_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📱 Mobile Considerations

### Offline-First Design:
- All user data cached locally using AsyncStorage
- Sync queue manages data synchronization
- Graceful degradation when offline
- Conflict resolution for concurrent edits

### Performance Optimizations:
- Proper indexing for common queries
- Pagination for large datasets
- Efficient RLS policies
- Connection pooling

## 🔐 Security Considerations

### Authentication:
- Google OAuth integration
- JWT token management
- Session persistence
- Automatic token refresh

### Data Protection:
- All tables have RLS enabled
- User data isolation enforced
- Audit logging for sensitive operations
- Regular security reviews

### Privacy Compliance:
- User data deletion capabilities
- Data retention policies
- Export functionality
- Consent management

## 🚀 Deployment

### Environment Setup:
1. Create Supabase projects (development and production)
2. Run migration scripts in order
3. Configure authentication providers
4. Set up RLS policies
5. Test with sample data

### Migration Strategy:
- Version-controlled SQL migrations
- Rollback capabilities
- Zero-downtime deployments
- Data validation checks

This schema provides a solid foundation for PocketTherapy's privacy-first, scalable mental health platform.
