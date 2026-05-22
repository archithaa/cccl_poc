-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Contacts
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  linkedin_url text,
  company text,
  title text,
  years_experience integer,
  location text,
  status text not null default 'not_contacted'
    check (status in ('not_contacted', 'reached_out', 'scheduled', 'completed', 'declined')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Conversations
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid not null references contacts(id) on delete cascade,
  date date,
  duration_minutes integer,
  hardest_part text,
  ai_gaps text,
  would_join_exchange text check (would_join_exchange in ('yes', 'no', 'maybe')),
  other_notes text,
  themes text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Research questions
create table research_questions (
  id uuid primary key default uuid_generate_v4(),
  question_text text not null,
  category text not null,
  sort_order integer not null default 0
);

-- Seed research questions
insert into research_questions (question_text, category, sort_order) values
  ('What has been the hardest part of this transition for you?', 'Transition', 1),
  ('How has AI changed the way your function operated before you left?', 'AI Impact', 2),
  ('What do you wish you understood better about AI tools relevant to your domain?', 'AI Gaps', 3),
  ('Is there a specific AI gap that is actively blocking you right now?', 'AI Gaps', 4),
  ('What kind of support would have made this transition easier?', 'Support Needs', 5),
  ('If there was a peer exchange — senior leaders trading domain wisdom with AI practitioners for AI fluency — would you have joined?', 'Validation', 6),
  ('What would make you trust such a community enough to participate actively?', 'Validation', 7),
  ('Who else in your network is going through something similar?', 'Network', 8);

-- Row Level Security
alter table contacts enable row level security;
alter table conversations enable row level security;
alter table research_questions enable row level security;

create policy "Authenticated full access on contacts"
  on contacts for all using (auth.role() = 'authenticated');

create policy "Authenticated full access on conversations"
  on conversations for all using (auth.role() = 'authenticated');

create policy "Authenticated read on research_questions"
  on research_questions for select using (auth.role() = 'authenticated');

-- Auto-update updated_at
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contacts_updated_at
  before update on contacts
  for each row execute procedure handle_updated_at();
