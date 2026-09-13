DO $$
DECLARE svc text; t record;
BEGIN
 FOREACH svc IN ARRAY ARRAY['identity','travel','payments'] LOOP
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname=svc||'_owner') THEN
   EXECUTE format('CREATE ROLE %I NOLOGIN',svc||'_owner');
  END IF;
  EXECUTE format('ALTER SCHEMA %I OWNER TO %I',svc,svc||'_owner');
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname=svc LOOP
   EXECUTE format('ALTER TABLE %I.%I OWNER TO %I',svc,t.tablename,svc||'_owner');
  END LOOP;
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO %I',svc,svc);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO %I',svc,svc);
  EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA %I TO %I',svc,svc);
 END LOOP;
END $$;
