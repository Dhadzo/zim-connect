# ZimConnect - Dating Platform for Zimbabweans in USA

## Overview

ZimConnect is a React-based dating platform specifically designed for the Zimbabwean community living in the United States. The application allows users to create profiles, discover potential matches, communicate through messaging, and build meaningful connections within their cultural community. Built with modern web technologies including React, TypeScript, Supabase, and Zustand for state management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: React Router DOM v7 for client-side navigation and protected routes
- **Styling**: Tailwind CSS with custom configuration for professional design system using Roboto fonts
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: Zustand for lightweight, centralized state management across authentication, UI, and profile stores
- **Data Fetching**: TanStack React Query v5 for server state management, caching, and real-time data synchronization

### State Management Pattern
- **useAuthStore**: Handles user authentication, session persistence, and login/logout states
- **useUIStore**: Manages modal states, active tabs, selected items, and search/filter states
- **useProfileStore**: Caches profile data, discovered profiles, and optimistic updates

### Component Architecture
- **Responsive Layout**: Mobile-first design with responsive navigation (bottom nav for mobile, sidebar for desktop)
- **Modal System**: Centralized modal management through Zustand store for profile editing, settings, chat, and video calls
- **Protected Routes**: Authentication guards that redirect unauthenticated users and handle profile completion flow
- **Real-time Components**: Live chat interface with message synchronization and typing indicators

### Data Management
- **React Query Integration**: Custom hooks for profiles, matches, messages, and user settings with optimistic updates
- **Caching Strategy**: 5-minute stale time for queries with 10-minute garbage collection
- **Real-time Updates**: Supabase real-time subscriptions for matches, messages, likes, and notifications
- **Optimistic Updates**: Immediate UI feedback for user actions like liking profiles and sending messages

### User Experience Features
- **Profile Discovery**: Swipe-style interface with filtering by age, location, interests, and preferences
- **Matching System**: Mutual like system with immediate match notifications and chat activation
- **Location-based Search**: State and city filtering using comprehensive US location database
- **Media Management**: Photo upload and carousel system for profile galleries
- **Profile Completion**: Guided setup process with completion indicators and validation

## External Dependencies

### Backend Services
- **Supabase**: Primary backend-as-a-service providing PostgreSQL database, real-time subscriptions, authentication, and file storage
- **Authentication Providers**: Support for email/password, Google OAuth, and Facebook OAuth through Supabase Auth

### Third-party Libraries
- **UI Components**: Lucide React for consistent iconography across the application
- **Development Tools**: ESLint with TypeScript support, Prettier integration, and strict type checking
- **Fonts**: Google Fonts integration for Roboto, Inter, and Poppins font families

### Database Schema Dependencies
- **Core Tables**: profiles, matches, messages, likes, notifications, user_settings tables
- **Location Data**: city_coordinates table for US states and cities with geographic data
- **Media Storage**: Supabase Storage buckets for user photos and profile images

### API Integrations
- **Real-time Subscriptions**: PostgreSQL triggers and Supabase real-time for live updates
- **File Upload**: Supabase Storage API for image uploads with automatic optimization
- **Geolocation Services**: Location-based matching and distance calculations using coordinate data