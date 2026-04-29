


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_url
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "module_scope" "text" DEFAULT 'lovespark'::"text" NOT NULL,
    "title" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "context" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ai_messages_role_check" CHECK (("role" = ANY (ARRAY['system'::"text", 'user'::"text", 'assistant'::"text"])))
);


ALTER TABLE "public"."ai_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "assessment_type" "text" NOT NULL,
    "status" "text" DEFAULT 'completed'::"text" NOT NULL,
    "version" "text",
    "answers" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "score_payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "assessments_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'completed'::"text", 'archived'::"text"]))),
    CONSTRAINT "assessments_type_check" CHECK (("assessment_type" = ANY (ARRAY['relationship_intelligence_score'::"text", 'growth_mindset'::"text", 'intimacy_connection'::"text", 'attachment_style'::"text", 'communication_pattern'::"text", 'conflict_pattern'::"text", 'custom'::"text"])))
);


ALTER TABLE "public"."assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."check_ins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "week_number" integer,
    "responses" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "score_before" "jsonb",
    "score_after" "jsonb",
    "insights_generated" "jsonb",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."check_ins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "provider" "text" DEFAULT 'paddle'::"text" NOT NULL,
    "plan_code" "text",
    "plan_name" "text",
    "status" "text" DEFAULT 'inactive'::"text" NOT NULL,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false NOT NULL,
    "external_customer_id" "text",
    "external_subscription_id" "text",
    "payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['inactive'::"text", 'trialing'::"text", 'active'::"text", 'past_due'::"text", 'canceled'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."current_subscription" AS
 SELECT DISTINCT ON ("user_id") "id",
    "user_id",
    "provider",
    "plan_code",
    "plan_name",
    "status",
    "current_period_start",
    "current_period_end",
    "cancel_at_period_end",
    "external_customer_id",
    "external_subscription_id",
    "created_at",
    "updated_at"
   FROM "public"."subscriptions"
  ORDER BY "user_id", "updated_at" DESC;


ALTER VIEW "public"."current_subscription" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "module_scope" "text" DEFAULT 'lovespark'::"text" NOT NULL,
    "insight_type" "text",
    "pillar" "text",
    "title" "text" NOT NULL,
    "content" "text",
    "actionable" boolean DEFAULT false NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone,
    CONSTRAINT "insights_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"])))
);


ALTER TABLE "public"."insights" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."latest_assessments" AS
 SELECT DISTINCT ON ("user_id", "assessment_type") "id",
    "user_id",
    "assessment_type",
    "status",
    "version",
    "answers",
    "score_payload",
    "created_at",
    "updated_at"
   FROM "public"."assessments"
  WHERE ("status" = 'completed'::"text")
  ORDER BY "user_id", "assessment_type", "created_at" DESC;


ALTER VIEW "public"."latest_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "question_key" "text" NOT NULL,
    "response_value" "text",
    "response_payload" "jsonb",
    "module_scope" "text" DEFAULT 'lovespark'::"text" NOT NULL,
    "captured_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."onboarding_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "full_name" "text",
    "avatar_url" "text",
    "timezone" "text",
    "onboarding_completed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "module_scope" "text" DEFAULT 'lovespark'::"text" NOT NULL,
    "recommendation_type" "text",
    "title" "text" NOT NULL,
    "body" "text",
    "why_this" "text",
    "do_now" "text",
    "estimated_time_minutes" integer,
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "horizon" "text" DEFAULT 'today'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "source_assessment_id" "uuid",
    "source_insight_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    CONSTRAINT "recommendations_horizon_check" CHECK (("horizon" = ANY (ARRAY['now'::"text", 'today'::"text", 'this_week'::"text", 'longer_term'::"text"]))),
    CONSTRAINT "recommendations_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "recommendations_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text", 'dismissed'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."state_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "energy_score" numeric(5,2),
    "stress_score" numeric(5,2),
    "recovery_score" numeric(5,2),
    "emotional_state_score" numeric(5,2),
    "cognitive_load_score" numeric(5,2),
    "relational_state_score" numeric(5,2),
    "confidence_payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."state_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "goal_type" "text" NOT NULL,
    "priority" smallint,
    "module_hint" "text" DEFAULT 'lovespark'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_goals_goal_type_check" CHECK (("goal_type" = ANY (ARRAY['better_relationships'::"text", 'better_communication'::"text", 'deeper_connection'::"text", 'conflict_navigation'::"text", 'emotional_understanding'::"text", 'intimacy'::"text", 'self_understanding'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."user_goals" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ai_conversations"
    ADD CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_messages"
    ADD CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."check_ins"
    ADD CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."insights"
    ADD CONSTRAINT "insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_responses"
    ADD CONSTRAINT "onboarding_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."state_snapshots"
    ADD CONSTRAINT "state_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_goals"
    ADD CONSTRAINT "user_goals_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_ai_conversations_updated_at" ON "public"."ai_conversations" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_ai_conversations_user_id" ON "public"."ai_conversations" USING "btree" ("user_id");



CREATE INDEX "idx_ai_messages_conversation_id" ON "public"."ai_messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_ai_messages_created_at" ON "public"."ai_messages" USING "btree" ("created_at");



CREATE INDEX "idx_ai_messages_user_id" ON "public"."ai_messages" USING "btree" ("user_id");



CREATE INDEX "idx_assessments_created_at" ON "public"."assessments" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_assessments_type" ON "public"."assessments" USING "btree" ("assessment_type");



CREATE INDEX "idx_assessments_user_id" ON "public"."assessments" USING "btree" ("user_id");



CREATE INDEX "idx_check_ins_created_at" ON "public"."check_ins" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_check_ins_user_id" ON "public"."check_ins" USING "btree" ("user_id");



CREATE INDEX "idx_insights_created_at" ON "public"."insights" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_insights_module_scope" ON "public"."insights" USING "btree" ("module_scope");



CREATE INDEX "idx_insights_user_id" ON "public"."insights" USING "btree" ("user_id");



CREATE INDEX "idx_onboarding_responses_question_key" ON "public"."onboarding_responses" USING "btree" ("question_key");



CREATE INDEX "idx_onboarding_responses_user_id" ON "public"."onboarding_responses" USING "btree" ("user_id");



CREATE INDEX "idx_recommendations_created_at" ON "public"."recommendations" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_recommendations_status" ON "public"."recommendations" USING "btree" ("status");



CREATE INDEX "idx_recommendations_user_id" ON "public"."recommendations" USING "btree" ("user_id");



CREATE INDEX "idx_state_snapshots_created_at" ON "public"."state_snapshots" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_state_snapshots_user_id" ON "public"."state_snapshots" USING "btree" ("user_id");



CREATE INDEX "idx_subscriptions_user_id" ON "public"."subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_user_goals_user_id" ON "public"."user_goals" USING "btree" ("user_id");



CREATE UNIQUE INDEX "ux_onboarding_responses_user_question_scope" ON "public"."onboarding_responses" USING "btree" ("user_id", "question_key", "module_scope");



CREATE UNIQUE INDEX "ux_subscriptions_provider_subscription" ON "public"."subscriptions" USING "btree" ("provider", "external_subscription_id") WHERE ("external_subscription_id" IS NOT NULL);



CREATE OR REPLACE TRIGGER "trg_ai_conversations_updated_at" BEFORE UPDATE ON "public"."ai_conversations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_assessments_updated_at" BEFORE UPDATE ON "public"."assessments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_recommendations_updated_at" BEFORE UPDATE ON "public"."recommendations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."ai_conversations"
    ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_messages"
    ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_messages"
    ADD CONSTRAINT "ai_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."check_ins"
    ADD CONSTRAINT "check_ins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."insights"
    ADD CONSTRAINT "insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_responses"
    ADD CONSTRAINT "onboarding_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_source_assessment_id_fkey" FOREIGN KEY ("source_assessment_id") REFERENCES "public"."assessments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_source_insight_id_fkey" FOREIGN KEY ("source_insight_id") REFERENCES "public"."insights"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."state_snapshots"
    ADD CONSTRAINT "state_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_goals"
    ADD CONSTRAINT "user_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE "public"."ai_conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ai_conversations_manage_own" ON "public"."ai_conversations" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."ai_messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ai_messages_manage_own" ON "public"."ai_messages" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."assessments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "assessments_manage_own" ON "public"."assessments" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."check_ins" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "check_ins_manage_own" ON "public"."check_ins" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."insights" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insights_manage_own" ON "public"."insights" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."onboarding_responses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "onboarding_responses_insert_own" ON "public"."onboarding_responses" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND ("module_scope" = 'lovespark'::"text")));



CREATE POLICY "onboarding_responses_manage_own" ON "public"."onboarding_responses" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "onboarding_responses_select_own" ON "public"."onboarding_responses" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") AND ("module_scope" = 'lovespark'::"text")));



CREATE POLICY "onboarding_responses_update_own" ON "public"."onboarding_responses" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "user_id") AND ("module_scope" = 'lovespark'::"text"))) WITH CHECK ((("auth"."uid"() = "user_id") AND ("module_scope" = 'lovespark'::"text")));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."recommendations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "recommendations_manage_own" ON "public"."recommendations" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."state_snapshots" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "state_snapshots_manage_own" ON "public"."state_snapshots" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscriptions_manage_own" ON "public"."subscriptions" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_goals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_goals_manage_own" ON "public"."user_goals" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."ai_conversations" TO "anon";
GRANT ALL ON TABLE "public"."ai_conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_conversations" TO "service_role";



GRANT ALL ON TABLE "public"."ai_messages" TO "anon";
GRANT ALL ON TABLE "public"."ai_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_messages" TO "service_role";



GRANT ALL ON TABLE "public"."assessments" TO "anon";
GRANT ALL ON TABLE "public"."assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."assessments" TO "service_role";



GRANT ALL ON TABLE "public"."check_ins" TO "anon";
GRANT ALL ON TABLE "public"."check_ins" TO "authenticated";
GRANT ALL ON TABLE "public"."check_ins" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."current_subscription" TO "anon";
GRANT ALL ON TABLE "public"."current_subscription" TO "authenticated";
GRANT ALL ON TABLE "public"."current_subscription" TO "service_role";



GRANT ALL ON TABLE "public"."insights" TO "anon";
GRANT ALL ON TABLE "public"."insights" TO "authenticated";
GRANT ALL ON TABLE "public"."insights" TO "service_role";



GRANT ALL ON TABLE "public"."latest_assessments" TO "anon";
GRANT ALL ON TABLE "public"."latest_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."latest_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_responses" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_responses" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."recommendations" TO "anon";
GRANT ALL ON TABLE "public"."recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."state_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."state_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."state_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."user_goals" TO "anon";
GRANT ALL ON TABLE "public"."user_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."user_goals" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







