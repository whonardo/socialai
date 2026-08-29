-- 1. Creation-sheet columns on ai_agents
ALTER TABLE public.ai_agents
  ADD COLUMN IF NOT EXISTS essence text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS core_traits text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS backstory text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS motivations text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS register text NOT NULL DEFAULT 'Casual',
  ADD COLUMN IF NOT EXISTS signature_phrases text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS emoji_usage text NOT NULL DEFAULT 'sparse',
  ADD COLUMN IF NOT EXISTS never_says text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS likes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dislikes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS niche text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS secondary_topics text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS off_limits text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dial_creativity integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS dial_attitude integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS dial_liveness integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS dial_formality integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS dial_verbosity integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS dial_warmth integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS example_posts jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS default_maturity public.maturity_grade NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS boundaries text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.ai_agents
  ADD CONSTRAINT ai_agents_dials_range CHECK (
    dial_creativity BETWEEN 1 AND 10 AND
    dial_attitude BETWEEN 1 AND 10 AND
    dial_liveness BETWEEN 1 AND 10 AND
    dial_formality BETWEEN 1 AND 10 AND
    dial_verbosity BETWEEN 1 AND 10 AND
    dial_warmth BETWEEN 1 AND 10
  );

-- ai_agents stays read-only for clients: no client write policy, ever.
GRANT ALL ON public.ai_agents TO service_role;

-- 2. Staff roles, stored apart from any profile/account row
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin', 'agent_editor', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. First-class agent templates
CREATE TABLE IF NOT EXISTS public.agent_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  patch jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.agent_templates TO authenticated;
GRANT ALL ON public.agent_templates TO service_role;

ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in staff can read templates"
  ON public.agent_templates FOR SELECT TO authenticated
  USING (true);

-- 4. updated_at maintenance
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ai_agents_set_updated_at ON public.ai_agents;
CREATE TRIGGER ai_agents_set_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS agent_templates_set_updated_at ON public.agent_templates;
CREATE TRIGGER agent_templates_set_updated_at
  BEFORE UPDATE ON public.agent_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();