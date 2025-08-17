# PocketTherapy: Product Requirements Document

## Product Vision Summary

PocketTherapy is a mobile-first mental health app that delivers bite-sized CBT (Cognitive Behavioral Therapy) exercises to Gen Z users (18–25) experiencing anxiety and stress. The app functions as a personal anxiety coach, providing instant relief through mood tracking, personalized coping exercises, and daily check-ins, targeting the 85% of Gen Z who report weekly anxiety but cannot access traditional therapy due to cost and availability barriers.

## Table of Contents
- [Problem Statement & Opportunity](#problem-statement--opportunity)
- [Target User Personas](#target-user-personas)
- [User Stories & Acceptance Criteria](#user-stories--acceptance-criteria)
- [Constraints & Considerations](#constraints--considerations)
- [Technical Specification](#technical-specification)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Required Integrations](#required-integrations)

## 1. Problem Statement & Opportunity

### Problem
85% of Gen Z report weekly anxiety, but therapy access is limited by:
- **Cost**: $120+/session
- **Wait times**: 3–6 months
- **Social stigma**: Privacy concerns
- **Existing solutions**: Too expensive (Headspace/Calm) or lack personalization for acute anxiety moments

### Opportunity
- **Market size**: $4.2B mental health app market growing 25% annually
- **User behavior**: Gen Z spending 4.5 hours/day on phones yet reporting highest loneliness levels
- **Gap**: Clear need for affordable, immediate anxiety relief tools

### Market Sizing
- **Primary**: 50M Gen Z users in US/India with reported anxiety
- **Serviceable**: 15M smartphone users willing to pay for mental health apps
- **Initial target**: 100K early adopters in first year

## 2. Target User Personas

### Primary: Aanya (College Anxiety)
- **Demographics**: 18–23, first-year student, urban India
- **Pain Points**: Exam anxiety spikes, 5-month counselor waitlists, social media judgment
- **Behaviors**: TikTok study-tok consumer, Discord study servers member
- **Quote**: "I wish therapy tips popped up like Insta stories"
- **JTBD**: Get immediate anxiety relief during study stress without human interaction

### Secondary: Diego (Career Starter)
- **Demographics**: 22–26, entry-level designer, US metros
- **Pain Points**: $120+/session therapy cost, late-night overthinking, privacy needs
- **Behaviors**: Reddit r/Anxiety lurker, lo-fi YouTube listener
- **Quote**: "I want CBT drills without talking to strangers"
- **JTBD**: Build anxiety management skills on budget with flexible timing

### Tertiary: Zara (Working Student)
- **Demographics**: 19–24, retail shift lead, no insurance
- **Pain Points**: Shift stress, scheduling chaos, financial constraints
- **Behaviors**: Instagram Reels consumer, Snapchat daily user
- **Quote**: "I do grounding exercises in restroom breaks"
- **JTBD**: Quick stress relief techniques during work breaks

## 3. User Stories & Acceptance Criteria

### Epic 1: Daily Mood Management
**As a** stressed Gen Z user  
**I want to** quickly log my emotional state  
**So that** I can get personalized anxiety relief exercises

#### Acceptance Criteria
- Mood check-in completes in <30 seconds
- 5-emoji scale with optional trigger tags
- Immediate exercise recommendations post-check-in
- Crisis detection with appropriate resource escalation

#### Success Metrics
- **Engagement**: 50% of MAU complete mood check-ins
- **Session Length**: 3–5 minutes average
- **Retention**: 40% Day-7, 25% Day-30
- **Feature Usage**: >70% use SOS button within first week

#### Business Metrics
- **Conversion Rate**: 8% free-to-paid within 30 days
- **Exercise Completion**: 60% complete suggested exercises
- **User Satisfaction**: 4.2+ app store rating
- **Crisis Support**: Appropriate escalation for self-harm indicators

## 4. Constraints & Considerations

### Budget Constraints
- **Development**: $5K initial budget (solo developer + tools)
- **Operations**: $500/month (Supabase + OpenAI + hosting)
- **Strategy**: Bootstrap to revenue before external funding

### Time Constraints
- **MVP Launch**: 8 weeks development
- **App Store Approval**: 2–3 weeks
- **Beta Testing**: 2 weeks with 50 users
- **Total Timeline**: 12-13 weeks to public launch

### Compliance Requirements
- **Privacy**: GDPR, CCPA compliance via Supabase
- **Health**: Clear disclaimers — not a medical device
- **Content**: Moderation system for user-generated content
- **Crisis**: Escalation protocols for self-harm mentions

### Platform Constraints
- **Platforms**: iOS/Android simultaneous launch via React Native
- **Offline**: Core breathing exercises work offline
- **Performance**: Low-bandwidth optimization for emerging markets
- **Accessibility**: WCAG 2.1 AA compliance

## 5. Technical Specification

### Architecture Overview
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend** | React Native + Expo | Single codebase, native performance, large community |
| **Backend** | Supabase (PostgreSQL + Edge Functions) | Real-time database, built-in auth, edge functions |
| **AI Layer** | OpenAI GPT-3.5 Turbo | Proven AI safety, structured outputs, cost-effective |
| **Deployment** | EAS Build + App Store/Play Store | Simplified deployment, OTA updates, managed services |

### Core Features
1. **Mood Tracking**: 5-emoji scale with trigger tags and notes
2. **Exercise Library**: Breathing, grounding, and cognitive exercises
3. **SOS Mode**: Immediate crisis support with breathing exercises
4. **Personalization**: AI-powered exercise recommendations
5. **Offline Support**: Core features work without internet
6. **Progress Insights**: Weekly mood trends and patterns

## 6. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email string UNIQUE,
  created_at timestamp DEFAULT now(),
  onboarding_completed boolean DEFAULT false,
  timezone string,
  notification_preferences jsonb
);
```

### Mood Logs Table
```sql
CREATE TABLE mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  mood_score integer CHECK (mood_score >= 1 AND mood_score <= 5),
  triggers text[],
  timestamp timestamp DEFAULT now(),
  notes text,
  synced boolean DEFAULT false
);
```

### Exercises Table
```sql
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title string NOT NULL,
  type exercise_type NOT NULL, -- breathing, grounding, cognitive
  content text NOT NULL,
  duration_minutes integer,
  difficulty difficulty_level, -- beginner, intermediate, advanced
  offline_capable boolean DEFAULT true
);
```

### User Exercise Logs Table
```sql
CREATE TABLE user_exercise_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  exercise_id uuid REFERENCES exercises(id),
  completed boolean DEFAULT false,
  effectiveness_rating integer CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  completed_at timestamp DEFAULT now()
);
```

## 7. API Endpoints

### Authentication
- `POST /auth/signup` — User registration with email/OTP
- `POST /auth/login` — User login
- `POST /auth/logout` — User logout
- `GET /auth/user` — Get current user profile

### Mood Management
- `POST /mood/log` — Create mood entry with triggers and notes
- `GET /mood/history` — Get user mood history with pagination
- `GET /mood/analytics` — Get mood patterns and insights

### Exercise System
- `GET /exercises/recommended` — Get personalized exercise recommendations
- `POST /exercises/complete` — Mark exercise as completed with rating
- `GET /exercises/library` — Get all available exercises with filtering

### AI Integration
- `POST /ai/personalized-exercise` — Generate custom exercise based on mood
- `POST /ai/mood-analysis` — Analyze mood patterns for insights

## 8. Required Integrations

### Core Services
- **Expo Notifications API**: Push notifications for gentle reminders
- **Supabase Auth**: User authentication and session management
- **OpenAI API**: AI-powered recommendations and content generation
- **AsyncStorage**: Local data persistence for offline functionality

### Optional Integrations (Future)
- **Stripe**: Payment processing for premium features
- **Apple HealthKit**: Health data integration
- **Google Fit**: Fitness data integration
- **Campus SSO APIs**: University authentication systems

## 9. Success Metrics

### User Engagement
- **Daily Active Users**: 30% of registered users
- **Session Duration**: 3-5 minutes average
- **Feature Adoption**: 70% use SOS within first week

### Business Metrics
- **User Acquisition**: 100K users in first year
- **Conversion Rate**: 8% free-to-paid within 30 days
- **Retention**: 40% Day-7, 25% Day-30
- **App Store Rating**: 4.2+ stars

### Mental Health Impact
- **Exercise Completion**: 60% complete suggested exercises
- **Mood Improvement**: Measurable improvement in user-reported mood scores
- **Crisis Support**: Appropriate escalation and resource provision

This PRD serves as the foundational document for PocketTherapy's development, ensuring alignment between product vision, technical implementation, and user needs.
