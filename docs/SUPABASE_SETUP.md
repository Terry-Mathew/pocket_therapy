# 🚀 Supabase Setup Guide for PocketTherapy

This guide walks you through setting up Supabase backend for PocketTherapy with Google OAuth authentication and privacy-first database design.

## 📋 Prerequisites

- Supabase account (free tier available)
- Google Cloud Console account
- Basic understanding of SQL and authentication flows

## 🏗️ Step 1: Create Supabase Projects

### Development Project

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com](https://supabase.com)
   - Sign in or create an account

2. **Create Development Project**
   - Click "New Project"
   - Organization: Select or create your organization
   - Name: `PocketTherapy Development`
   - Database Password: Generate a strong password (save it securely)
   - Region: Choose closest to your location
   - Pricing Plan: Free (sufficient for development)

3. **Save Development Credentials**
   - Go to Settings > API
   - Copy the Project URL and anon/public key
   - Save these for your `.env` file

### Production Project

1. **Create Production Project**
   - Click "New Project" again
   - Name: `PocketTherapy Production`
   - Use a different, strong database password
   - Same region as development
   - Pricing Plan: Free initially (upgrade as needed)

2. **Save Production Credentials**
   - Copy Project URL and anon/public key
   - Keep these separate from development credentials

## 🔐 Step 2: Configure Google OAuth

### Google Cloud Console Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project: "PocketTherapy"
   - Enable Google+ API (or Google Identity API)

2. **Create OAuth 2.0 Credentials**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Configure consent screen first if prompted

3. **Configure OAuth Consent Screen**
   - User Type: External (for public app)
   - App Name: "PocketTherapy"
   - User Support Email: Your email
   - App Domain: Your app domain (can be localhost for development)
   - Authorized Domains: Add your domains
   - Scopes: email, profile, openid

4. **Create Client IDs**
   
   **For Web Application:**
   - Application Type: Web Application
   - Name: "PocketTherapy Web"
   - Authorized Redirect URIs:
     - Development: `https://your-dev-project.supabase.co/auth/v1/callback`
     - Production: `https://your-prod-project.supabase.co/auth/v1/callback`

   **For iOS:**
   - Application Type: iOS
   - Name: "PocketTherapy iOS"
   - Bundle ID: `com.yourcompany.pockettherapy`

   **For Android:**
   - Application Type: Android
   - Name: "PocketTherapy Android"
   - Package Name: `com.yourcompany.pockettherapy`
   - SHA-1 Certificate Fingerprint: (get from Expo/development keystore)

### Supabase OAuth Configuration

1. **Configure in Development Project**
   - Go to Authentication > Settings > Auth Providers
   - Enable Google provider
   - Enter Google Client ID and Client Secret
   - Save configuration

2. **Configure in Production Project**
   - Repeat the same process
   - Use the same Google OAuth credentials (or create separate ones)

## 🗄️ Step 3: Set Up Database Schema

### Run Database Migrations

1. **Connect to Development Database**
   - Go to SQL Editor in Supabase dashboard
   - Copy the SQL from `docs/DATABASE_SCHEMA.md`
   - Run each table creation script

2. **Create Tables in Order**
   ```sql
   -- 1. Users table
   CREATE TABLE users (...);
   
   -- 2. User profiles table
   CREATE TABLE user_profiles (...);
   
   -- 3. Mood logs table
   CREATE TABLE mood_logs (...);
   
   -- 4. Exercises table
   CREATE TABLE exercises (...);
   
   -- 5. User exercise logs table
   CREATE TABLE user_exercise_logs (...);
   
   -- 6. Sync queue table
   CREATE TABLE sync_queue (...);
   ```

3. **Set Up Row Level Security**
   - Enable RLS on all tables
   - Create security policies
   - Test with sample data

4. **Create Database Functions**
   - Add update timestamp triggers
   - Create mood analytics functions
   - Set up data cleanup procedures

5. **Repeat for Production**
   - Run the same migrations on production database
   - Verify all tables and policies are identical

## 🔧 Step 4: Configure Environment Variables

### Create Environment File

1. **Copy Example File**
   ```bash
   cp .env.example .env
   ```

2. **Fill in Supabase Credentials**
   ```env
   # Development
   EXPO_PUBLIC_SUPABASE_DEV_URL=https://your-dev-project.supabase.co
   EXPO_PUBLIC_SUPABASE_DEV_ANON_KEY=your-dev-anon-key
   
   # Production
   EXPO_PUBLIC_SUPABASE_PROD_URL=https://your-prod-project.supabase.co
   EXPO_PUBLIC_SUPABASE_PROD_ANON_KEY=your-prod-anon-key
   ```

3. **Add Google OAuth Credentials**
   ```env
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your-ios-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-android-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your-web-client-id.apps.googleusercontent.com
   ```

### Security Notes

- Never commit `.env` file to version control
- Use different credentials for development and production
- Rotate keys regularly
- Monitor API usage for unauthorized access

## 🧪 Step 5: Test the Setup

### Test Database Connection

1. **Start Development Server**
   ```bash
   npm start
   ```

2. **Test Supabase Connection**
   - Check browser console for connection logs
   - Verify no authentication errors
   - Test basic database queries

### Test Google OAuth

1. **Test OAuth Flow**
   - Implement basic login button
   - Test Google OAuth redirect
   - Verify user creation in database
   - Check session persistence

2. **Test Guest Mode**
   - Verify guest user creation
   - Test local data storage
   - Test guest-to-authenticated upgrade

### Test Row Level Security

1. **Create Test Users**
   - Create multiple test accounts
   - Verify data isolation
   - Test unauthorized access attempts

2. **Verify Policies**
   - Users can only see their own data
   - Exercises are publicly readable
   - Sync queue is user-specific

## 📊 Step 6: Seed Initial Data

### Add Exercise Content

1. **Create Sample Exercises**
   ```sql
   INSERT INTO exercises (title, description, category, difficulty, duration_seconds, steps) VALUES
   ('4-7-8 Breathing', 'Calming breathing technique', 'breathing', 'beginner', 240, '[...]'),
   ('5-4-3-2-1 Grounding', 'Sensory grounding exercise', 'grounding', 'beginner', 300, '[...]'),
   ('Thought Reframing', 'Cognitive restructuring exercise', 'cognitive', 'intermediate', 600, '[...]');
   ```

2. **Verify Exercise Access**
   - Test exercise retrieval
   - Verify filtering by category
   - Check difficulty levels

### Test Data Sync

1. **Test Offline Functionality**
   - Create mood logs offline
   - Verify sync queue population
   - Test sync when back online

2. **Test Conflict Resolution**
   - Create conflicting data
   - Verify resolution strategies
   - Check data integrity

## 🚀 Step 7: Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema matches development
- [ ] RLS policies tested and verified
- [ ] Google OAuth configured for production domains
- [ ] SSL certificates valid
- [ ] Backup strategy in place

### Deployment Steps

1. **Update Production Database**
   - Run final migrations
   - Seed production exercises
   - Verify all functions work

2. **Configure Production OAuth**
   - Update redirect URLs
   - Test OAuth flow in production
   - Verify session management

3. **Monitor and Test**
   - Set up monitoring alerts
   - Test critical user flows
   - Monitor error rates and performance

## 🔍 Troubleshooting

### Common Issues

**OAuth Redirect Errors:**
- Check redirect URLs match exactly
- Verify domain configuration
- Check OAuth consent screen setup

**Database Connection Issues:**
- Verify environment variables
- Check network connectivity
- Validate API keys

**RLS Policy Problems:**
- Test policies with sample data
- Check user authentication state
- Verify policy syntax

### Getting Help

- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Google OAuth Guide: [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
- PocketTherapy Issues: Create issue in project repository

## 📈 Next Steps

After successful setup:

1. **Implement Authentication UI**
   - Create login/signup screens
   - Add Google OAuth buttons
   - Implement guest mode option

2. **Build Data Services**
   - Create mood tracking service
   - Implement exercise service
   - Add sync queue management

3. **Test User Flows**
   - Complete authentication flow
   - Test mood logging
   - Verify exercise completion tracking

Your Supabase backend is now ready to support PocketTherapy's privacy-first mental health platform!
