# Aura Learning Platform - Feature Documentation

This document provides detailed explanations of each feature in the Aura Learning Platform, describing what users can do with each feature.

## Table of Contents

1. [Authentication Feature](#1-authentication-feature)
2. [Add Subject Feature](#2-add-subject-feature)
3. [Syllabus AI Generation Feature](#3-syllabus-ai-generation-feature)
4. [Classroom Hub](#4-classroom-hub)
5. [Subject Detail Roadmap](#5-subject-detail-roadmap)
6. [Homework AI Generation Feature](#6-homework-ai-generation-feature)
7. [Active Class Page](#7-active-class-page)
8. [Live Voice Class Feature](#8-live-voice-class-feature)
9. [Social Hub](#9-social-hub)

---

## 1. Authentication Feature

### Overview
An authentication system that allows users to sign up and log in to the application. It provides simple email/password authentication using Supabase.

### What Users Can Do

#### Sign Up (New Account Registration)
- **Create an account with email and password**
  - Enter email address
  - Set password
  - A profile is automatically created when the account is created
  - After creation, users are redirected to the dashboard

#### Login
- **Log in with an existing account**
  - Enter registered email address and password
  - After successful authentication, users are redirected to the dashboard
  - Authentication state is managed by session

#### Authentication State Management
- **Automatic redirects**
  - Unauthenticated users can access the landing page (`/`)
  - Authenticated users are automatically redirected to the dashboard (`/dashboard`)
  - When accessing pages that require authentication, unauthenticated users are redirected to the login page

### Technical Details
- **Authentication Provider**: Supabase Auth
- **Authentication Method**: Email/password (minimal configuration)
- **Data Storage**: User information is stored in Supabase's `profiles` table
- **Security**: Row Level Security (RLS) ensures users can only access their own data

---

## 2. Add Subject Feature

### Overview
A feature that allows users to add subjects they want to learn, with AI automatically generating a syllabus. This feature is available from the dashboard page.

### What Users Can Do

#### Adding Subjects
- **Create a new learning subject by entering a subject name**
  - Access the dashboard page (`/dashboard`)
  - Enter a subject name in the "Add Subject" form (e.g., "Python Basics", "Data Structures and Algorithms")
  - Click the submit button
  - AI automatically generates a syllabus (see "Syllabus AI Generation Feature" for details)
  - After generation is complete, the new subject appears in the Classroom Hub

#### Subject Management
- **View a list of subjects you've created**
  - View all your subjects in the Classroom Hub
  - Each subject is managed independently
  - Each subject contains multiple classes (lessons)

### User Flow
1. Access the dashboard page
2. Enter the name of the subject you want to learn in the "Subject Name" input field
3. Click the "Add" or "Create" button
4. A loading state is displayed (AI is generating the syllabus)
5. After generation is complete, redirect to Classroom Hub or show a notification

### Technical Details
- **API Endpoint**: `/api/syllabus` (POST)
- **Request Format**: `{ subjectName: string }`
- **Processing Flow**: 
  1. Receive subject name
  2. AI generates syllabus
  3. Save data to `subjects` and `classes` tables in Supabase
  4. Return the generated subject ID

---

## 3. Syllabus AI Generation Feature

### Overview
A feature that automatically generates an 80-minute-per-class syllabus (learning plan) when a subject name is entered. Each class contains 5-8 topics, structured progressively from foundational to advanced levels.

### What Users Can Do

#### Automatic Syllabus Generation
- **Automatically generate a complete learning plan from a subject name**
  - Simply enter a subject name, and AI generates an appropriate syllabus
  - Each class is designed for 80 minutes (1 hour 20 minutes) of learning time
  - Each class contains 5-8 topics
  - Topics are arranged progressively from foundational to advanced levels

#### Viewing Generated Syllabus
- **View the generated syllabus on the subject detail page**
  - View the title and topic list for each class
  - Class order (order_index) is displayed
  - Learning time (80 minutes) for each class is displayed

### Example of Generated Content

**Input**: "Python Basics"

**Example Generated Syllabus**:
- **Class 1**: Python Introduction
  - Topics: What is Python, Environment Setup, Hello World, Variables and Data Types, Basic Operators
- **Class 2**: Control Structures
  - Topics: If statements, For loops, While loops, List comprehensions, Exception handling
- **Class 3**: Functions and Modules
  - Topics: Function definition, Arguments and return values, Scope, Module imports, Standard library
- ...(continues)

### Technical Details
- **AI SDK**: Vercel AI SDK
- **LLM**: OpenAI (via @ai-sdk/openai)
- **Structured Output**: Structured JSON output using Zod schema
- **Output Schema**: 
  ```typescript
  {
    classes: [{
      order_index: number,
      title: string,
      topics: string[],
      duration_minutes: 80
    }]
  }
  ```
- **Prompt**: Break down subject name into an 80-min-per-class syllabus, with 5-8 topics per class (foundational to advanced)

---

## 4. Classroom Hub

### Overview
A page that displays a list of all subjects created by the user. Subjects are displayed in a grid format, and clicking on a subject navigates to its detail page.

### What Users Can Do

#### Viewing Subject List
- **View all subjects you've created**
  - Access the Classroom Hub page (`/classroom`)
  - Subjects are displayed in a grid format
  - Each subject card displays the subject name
  - Basic information such as creation date may be displayed

#### Selecting Subjects and Viewing Details
- **Click on a subject to navigate to its detail page**
  - Clicking on a subject card navigates to that subject's detail page (`/classroom/[subjectId]`)
  - On the detail page, you can view all classes, topics, and homework for that subject

#### Navigation
- **Access Classroom Hub from the sidebar**
  - The sidebar has a "Classroom Hub" menu item
  - Clicking navigates to the Classroom Hub page

### Information Displayed
- **Subject Name**: The subject name entered by the user
- **Number of Subjects**: Total number of subjects created by the user
- **Subject Cards**: Card-style UI representing each subject

### Technical Details
- **Route**: `/classroom`
- **Data Fetching**: Fetch user's `subjects` from Supabase
- **Filtering**: RLS ensures only subjects belonging to the logged-in user are displayed
- **UI**: Responsive grid layout

---

## 5. Subject Detail Roadmap

### Overview
A page that displays detailed information about a specific subject. You can view all classes included in that subject, topics for each class, and homework previews.

### What Users Can Do

#### Viewing Class List
- **View all classes included in the subject**
  - Each class title is displayed
  - Class order (1st, 2nd, etc.) is displayed
  - Learning time (80 minutes) for each class is displayed

#### Viewing Topics
- **View topics to be learned in each class**
  - Expand or click on a class to view its topic list
  - Each class contains 5-8 topics
  - Topic order can also be viewed

#### Homework Preview
- **Preview homework for each class**
  - For classes with generated homework, a preview is displayed
  - For classes without generated homework, a "Generate Homework" button is displayed
  - Homework is displayed in Markdown format

#### Generating Homework
- **Generate homework for each class**
  - Click the "Generate Homework" button
  - AI generates homework based on that class's content
  - After generation is complete, the homework is displayed (see "Homework AI Generation Feature" for details)

#### Starting a Class
- **Start a class and begin learning**
  - Click on a class or click the "Start" button
  - Navigate to the Active Class page (`/classroom/[subjectId]/[classId]`)
  - Take the actual class (voice and slides) there

### Information Displayed
- **Subject Name**: Name of the selected subject
- **Class List**: 
  - Class number/order
  - Class title
  - Learning time
  - Topic list
  - Homework status (generated/not generated)
- **Homework Preview**: A portion of generated homework is displayed

### User Flow
1. Select a subject from Classroom Hub
2. View class list on subject detail page
3. View topics for each class
4. Generate homework as needed
5. Start a class and begin learning

### Technical Details
- **Route**: `/classroom/[subjectId]`
- **Data Fetching**: Fetch specific `subject` and its related `classes` from Supabase
- **Homework Generation API**: `/api/homework` (POST)
- **UI**: Hierarchical roadmap-style display

---

## 6. Homework AI Generation Feature

### Overview
A feature that automatically generates homework for each class based on that class's content using AI. Homework is designed to promote critical thinking, problem-solving, and synthesis of material.

### What Users Can Do

#### Generating Homework
- **Generate homework for each class**
  - Click the "Generate Homework" button on the subject detail page
  - AI generates homework based on that class's title and topics
  - Generation may take several seconds to tens of seconds
  - After generation is complete, homework is displayed in Markdown format

#### Viewing Generated Homework
- **Read and understand the generated homework**
  - Homework is previewed on the subject detail page
  - May also be viewable on the Active Class page
  - Displayed in formatted Markdown

#### Homework Content
- **Receive high-quality learning assignments**
  - Content that promotes critical thinking rather than simple memorization
  - Assignments that develop problem-solving skills
  - Assignments that promote synthesis of learning material
  - Includes real-world scenarios or case studies
  - Approximately 45 minutes to complete

### Characteristics of Generated Homework

#### Content Quality
- **No multiple-choice or definition questions**
- **Includes real-world scenarios or case studies**
- **Requires critical thinking**
- **Develops problem-solving skills**
- **Promotes synthesis of learning material**

#### Volume and Time
- **Approximately 45 minutes to complete**
- **Designed with appropriate difficulty level**

#### Ethics and Engagement
- **Engaging and interesting content**
- **Inclusive and unbiased content**
- **Accommodates students with diverse backgrounds**

### Technical Details
- **API Endpoint**: `/api/homework` (POST)
- **Request Format**: `{ classId: string }`
- **AI SDK**: Vercel AI SDK
- **Output Format**: Markdown
- **Data Storage**: Saved in `classes.homework_markdown` field
- **Prompt Design**:
  - Context: As an expert educational designer building a curriculum for highly motivated students
  - Task: Design challenging homework that requires critical thinking, problem-solving, and synthesis
  - Constraints: Approximately 45 minutes to complete, include real-world scenarios, avoid multiple-choice questions
  - Ethics: Engaging, inclusive, and unbiased content

---

## 7. Active Class Page

### Overview
A page where users actually take classes. It provides slide UI and live voice classes using WebRTC. Classes play from the beginning, and resuming from the middle is not possible (MVP constraint).

### What Users Can Do

#### Starting a Class
- **Start a class and begin learning**
  - Select a class from the subject detail page
  - Click the "Start" or "Play" button
  - Navigate to the Active Class page
  - The class automatically starts

#### Viewing Slides
- **View class slides**
  - Slide UI is displayed
  - Can navigate slides forward and backward (assumed)
  - Each slide displays class content

#### Taking Voice Classes
- **Take classes with live voice**
  - Real-time voice using WebRTC is played
  - Voice classes using OpenAI Realtime API
  - Voice and slides progress in sync

#### Class Progress
- **Take the class from start to finish**
  - Classes play from the beginning
  - Cannot resume from the middle (MVP constraint)
  - Take the entire class (80 minutes)

### Limitations (MVP)
- **No resume feature**: If a class is interrupted, it will play from the beginning next time
- **No progress saving**: No record is kept of which classes have been completed
- **Simple UI**: Only basic slide and voice playback features

### Information Displayed
- **Class Title**: Title of the class currently being taken
- **Slides**: Slides representing class content
- **Voice Player**: Playback controls for live voice
- **Progress**: Class progress may be displayed

### User Flow
1. Select a class from the subject detail page
2. Click the "Start" button
3. Navigate to the Active Class page
4. Class automatically starts
5. Take the class with slides and voice
6. Complete the class until the end

### Technical Details
- **Route**: `/classroom/[subjectId]/[classId]`
- **Voice Technology**: OpenAI Realtime API / WebRTC
- **UI**: Slide UI + voice player
- **State Management**: Manages class start state

---

## 8. Live Voice Class Feature

### Overview
A feature that provides real-time voice classes using OpenAI Realtime API and WebRTC. AI explains class content through voice.

### What Users Can Do

#### Taking Real-Time Voice Classes
- **Take AI-powered voice classes**
  - Voice automatically plays on the Active Class page
  - AI explains class content through voice
  - Voice is generated and played in real-time

#### Voice Control
- **Control voice playback**
  - May be able to control voice with play/pause buttons
  - May be able to adjust volume
  - Voice quality may have slight latency due to real-time generation

### Technical Characteristics

#### Real-Time Generation
- **Uses OpenAI Realtime API**
  - Voice is generated in real-time
  - Low-latency voice streaming using WebRTC
  - Voice is generated based on class content

#### Simplified Version (MVP)
- **Basic features only**
  - Voice playback functionality
  - Synchronization with slides (assumed)
  - Advanced features (recording, speed adjustment, etc.) may not be included

### Technical Details
- **API**: OpenAI Realtime API
- **Communication Protocol**: WebRTC
- **Integration**: Embedded in Active Class page
- **Client Code**: WebRTC client code is implemented

---

## 9. Social Hub

### Overview
A hub that provides social features. However, in the MVP, only mock UI is provided, and actual functionality is not implemented.

### What Users Can Do (MVP Limitations)

#### Viewing UI
- **View Social Hub UI**
  - Access "Social Hub" from the sidebar
  - Social Hub page is displayed
  - Dummy data is displayed

#### Feature Limitations
- **Actual features are not available**
  - User interaction features are not implemented
  - Community features are not implemented
  - Sharing features are not implemented
  - Placeholder for future feature expansion

### Future Features (Expected)
The following features may be added in the future:
- **User Interaction**: Connect with other learners
- **Learning Sharing**: Share learning progress and achievements
- **Communities**: Subject-specific communities
- **Discussions**: Discussions about classes and homework
- **Study Groups**: Support for group learning

### Technical Details
- **Implementation Status**: Mock UI only
- **Data**: Uses dummy data
- **Route**: Accessible from sidebar (route not confirmed)

---

## Summary

Aura Learning Platform is an AI-powered learning platform. The main features are as follows:

1. **Subject Creation**: Simply enter a subject name, and AI automatically generates a syllabus
2. **Structured Learning**: Systematic learning plan with 80-minute classes
3. **AI-Generated Homework**: Automatically generates high-quality homework for each class
4. **Live Voice Classes**: Learn with real-time voice classes
5. **Progress Management**: Manage your subjects and classes

The MVP implements basic features, and social features and progress tracking features are planned for future additions.
