-- Grant paid plan to test user
update public.profiles
set plan = 'paid'
where id = 'c79f604f-535b-40e6-9ddc-6b27d11b58b1';

-- Also update auth metadata so raw_user_meta_data reflects the plan
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"plan":"paid"}'::jsonb
where id = 'c79f604f-535b-40e6-9ddc-6b27d11b58b1';
