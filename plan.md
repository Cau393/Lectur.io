Aura Learning Platform - 4-Hour MVP Blueprint

This document serves as the architectural blueprint for Aura. Save as plan.md in your project root.



0. MVP Features (Scope for 4 Hours)







Feature



In Scope



Notes





Auth (Supabase)



Yes



Email/password minimal





Add Subject form



Yes



Input + create subject





Syllabus AI generation



Yes



1h:20m class blocks via Vercel AI SDK





Classroom Hub grid



Yes



List user's subjects





Subject Detail roadmap



Yes



Classes, topics, homework preview





Homework AI generation



Yes



Per-class, stored in DB





Active Class page



Yes



Play from start (no resume)





OpenAI Realtime / WebRTC



Yes



Live voice class (simplified)





Social Hub



Yes



Mocked UI only





Resume / ProgressState



No



Out of scope



1. Database Schema (Supabase)

Tables Overview (Simplified - No ProgressState)

erDiagram
    profiles ||--o{ subjects : "creates"
    subjects ||--o{ classes : "contains"
    
    profiles {
        uuid id PK
        text email
        text full_name
        timestamptz created_at
    }
    
    subjects {
        uuid id PK
        uuid user_id FK
        text name
        text slug
        timestamptz created_at
    }
    
    classes {
        uuid id PK
        uuid subject_id FK
        int order_index
        text title
        jsonb topics
        text homework_markdown
        int duration_minutes
        timestamptz created_at
    }

Table Definitions

**profiles**







Column



Type



Constraints





id



uuid



PK, FK to auth.users.id





email



text



NOT NULL





full_name



text









created_at



timestamptz



default now()

**subjects**







Column



Type



Constraints





id



uuid



PK, default gen_random_uuid()





user_id



uuid



FK to profiles.id, NOT NULL





name



text



NOT NULL





slug



text



UNIQUE per user





created_at



timestamptz



default now()

**classes**







Column



Type



Constraints





id



uuid



PK, default gen_random_uuid()





subject_id



uuid



FK to subjects.id, ON DELETE CASCADE





order_index



int



NOT NULL





title



text



NOT NULL





topics



jsonb



Array of strings





homework_markdown



text



Nullable until generated





duration_minutes



int



Default 80





created_at



timestamptz



default now()

RLS: Users only access their own subjects and related classes.



2. Application Architecture and Routing

App Router Folder Structure (Simplified)

app/
├── layout.tsx
├── page.tsx                   # Landing; if auth redirect to /dashboard
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/
│   ├── layout.tsx             # Sidebar (Dashboard, Classroom Hub, Social Hub mocked)
│   ├── dashboard/
│   │   └── page.tsx           # Add Subject form
│   └── classroom/
│       ├── page.tsx           # Grid of subjects
│       └── [subjectId]/
│           ├── page.tsx       # Roadmap: classes, topics, homework
│           └── [classId]/
│               └── page.tsx   # Active Class: Play from start, WebRTC voice
├── api/
│   ├── syllabus/route.ts      # POST: Vercel AI SDK generateText + structured output
│   └── homework/route.ts      # POST: Vercel AI SDK generateText
└── globals.css

Route Summary







Route



Purpose





/



Landing; auth → redirect /dashboard





/dashboard



Add Subject input + Sidebar with Social Hub (mocked)





/classroom



Grid of user's subjects





/classroom/[subjectId]



Roadmap: classes, topics, homework preview





/classroom/[subjectId]/[classId]



Active Class: Play button, WebRTC voice, slides (start from beginning only)

Sidebar





Dashboard, Classroom Hub, Social Hub (mocked with dummy data)



3. AI Generation (Vercel AI SDK)

Dependencies: ai, @ai-sdk/openai, zod

All LLM calls use Vercel AI SDK (no direct OpenAI REST calls).

Syllabus Generation (/api/syllabus/route.ts)

Use generateText from ai with openai from @ai-sdk/openai. For structured JSON, use the AI SDK Output API with Zod schema.

Prompt: Break down subjectName into an 80-min-per-class syllabus. Each class: 5-8 topics, foundational to advanced. Output schema: { classes: [{ order_index, title, topics, duration_minutes: 80 }] }.

Flow: POST with { subjectName } → generate → insert subjects + classes in Supabase → return subject ID.

Homework Generation (/api/homework/route.ts)

Use generateText for markdown. Engineered prompt:

Context: You are an expert educational designer building a curriculum for a highly motivated student. The student has just completed a 1-hour and 20-minute class on [Insert Topic].
Task: Design a challenging homework assignment that requires critical thinking, problem-solving, and synthesis of the material, rather than simple memorization.
Constraints: The assignment must take roughly 45 minutes to complete. Include a real-world scenario or case study they must analyze. Do not ask simple multiple-choice or definition questions. Output the assignment in strict Markdown format.
Ethics/Engagement: Ensure the scenario is engaging, inclusive, and free of bias.

Flow: POST with { classId } → fetch class title/topics → inject into prompt → Vercel AI SDK generateText → update classes.homework_markdown → return.



4. 4-Hour Implementation Split

Developer 1: Frontend Engineer (~1h 20m per hour block)







Time



Tasks





Hour 1



Scaffold Next.js 15, Tailwind, shadcn/ui; (dashboard)/layout.tsx with Sidebar (Dashboard, Classroom Hub, Social Hub mocked); login/signup pages





Hour 2



Dashboard page: "Add Subject" form + submit to /api/syllabus; Classroom Hub: grid of subjects (fetch from Supabase)





Hour 3



Subject Detail page: roadmap of classes, topics, homework preview; "Generate Homework" button per class





Hour 4



Active Class page: slide UI, Play button (no resume); WebRTC voice embed; Social Hub mocked content; polish and loading states

Developer 2: Backend – Supabase & AI (Syllabus)







Time



Tasks





Hour 1



Supabase project: create profiles, subjects, classes; RLS; auth helpers





Hour 2



/api/syllabus route: Vercel AI SDK generateText + structured output; parse and insert subject + classes





Hour 3



Supabase client utilities; subject/class fetch helpers; connect frontend to real data





Hour 4



Error handling; edge cases; support frontend QA

Developer 3: Backend – Homework & WebRTC







Time



Tasks





Hour 1



/api/homework route: Vercel AI SDK generateText with engineered prompt; update classes.homework_markdown





Hour 2



OpenAI Realtime API setup; WebRTC client code for live voice; expose minimal API or client integration points





Hour 3



Wire homework generation to Subject Detail; wire WebRTC to Active Class page





Hour 4



Integration testing; fix bugs; support frontend polish

Sync Points





0:00 – All: Agree on schema and routes. FE starts scaffolding; BE1 starts Supabase; BE2 starts homework route.



1:00 – FE has layout + auth; BE1 has DB + syllabus route. Integrate "Add Subject" flow.



2:00 – FE has Classroom Hub + Subject Detail; BE2 has homework + WebRTC skeleton. Full flow test.



3:00 – FE builds Active Class; all fix integration bugs.



4:00 – Demo run, final polish.



5. File Reference Summary







File



Owner





app/(dashboard)/layout.tsx



Frontend





app/(dashboard)/dashboard/page.tsx



Frontend





app/classroom/page.tsx



Frontend





app/classroom/[subjectId]/page.tsx



Frontend





app/classroom/[subjectId]/[classId]/page.tsx



Frontend





app/api/syllabus/route.ts



Backend 1





app/api/homework/route.ts



Backend 2





lib/supabase/



Backend 1





WebRTC / Realtime integration



Backend 2

