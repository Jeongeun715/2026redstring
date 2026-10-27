-- Red String · Supabase 초기 설정
-- Supabase SQL Editor의 새 쿼리에 이 파일 전체를 붙여 넣고 Run을 누르세요.
-- 기존 테이블·기대평을 삭제하지 않습니다. 같은 파일을 다시 실행해도 됩니다.
begin;

create table if not exists public.guestbook (
  id bigint generated always as identity primary key,
  nickname text not null check (char_length(nickname) between 1 and 16),
  message text not null check (char_length(message) between 1 and 100),
  ornament text not null default 'star' check (ornament in ('star','heart','pick','note')),
  created_at bigint not null,
  deleted_at bigint,
  delete_hash text not null check (delete_hash ~ '^[a-f0-9]{64}$'),
  request_id uuid not null unique,
  rate_key text not null check (rate_key ~ '^[a-f0-9]{64}$')
);
create index if not exists guestbook_rate on public.guestbook(rate_key, created_at);
create index if not exists guestbook_visible on public.guestbook(id desc) where deleted_at is null;

create table if not exists public.spotify_tokens (
  id text primary key,
  seed_hash text not null,
  refresh_token text not null
);

-- 브라우저의 공개 키로는 두 테이블을 읽거나 변경할 수 없습니다.
alter table public.guestbook enable row level security;
alter table public.spotify_tokens enable row level security;
revoke all on table public.guestbook, public.spotify_tokens from public, anon, authenticated;
revoke all on sequence public.guestbook_id_seq from public, anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.guestbook, public.spotify_tokens to service_role;
grant usage, select on sequence public.guestbook_id_seq to service_role;

-- 재시도 시 중복 등록을 막고, 같은 접속자의 등록을 10초 간격으로 제한합니다.
-- 트랜잭션 잠금으로 서버가 여러 개여도 동시에 제한을 우회할 수 없게 합니다.
create or replace function public.redstring_create_entry(
  p_nickname text,
  p_message text,
  p_ornament text,
  p_request_id uuid,
  p_rate_key text,
  p_delete_hash text
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_entry public.guestbook%rowtype;
  v_now bigint;
  v_state text;
begin
  if p_nickname is null or char_length(p_nickname) not between 1 and 16
    or p_message is null or char_length(p_message) not between 1 and 100
    or p_ornament is null or p_ornament not in ('star','heart','pick','note')
    or p_request_id is null or p_rate_key is null or p_rate_key !~ '^[a-f0-9]{64}$'
    or p_delete_hash is null or p_delete_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid guestbook input' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_rate_key, 0));
  v_now := floor(extract(epoch from clock_timestamp()) * 1000)::bigint;
  select * into v_entry from public.guestbook where request_id = p_request_id;
  if found then
    if v_entry.deleted_at is not null or v_entry.rate_key <> p_rate_key
      or v_entry.nickname <> p_nickname or v_entry.message <> p_message
      or v_entry.ornament <> p_ornament or v_entry.delete_hash <> p_delete_hash then
      return jsonb_build_object('state', 'conflict');
    end if;
    v_state := 'duplicate';
  else
    if exists (select 1 from public.guestbook where rate_key = p_rate_key and created_at > v_now - 10000) then
      return jsonb_build_object('state', 'rate_limited');
    end if;
    insert into public.guestbook(nickname, message, ornament, created_at, delete_hash, request_id, rate_key)
      values (p_nickname, p_message, p_ornament, v_now, p_delete_hash, p_request_id, p_rate_key)
      returning * into v_entry;
    v_state := 'created';
  end if;
  return jsonb_build_object('state', v_state, 'entry', jsonb_build_object(
    'id', v_entry.id, 'nickname', v_entry.nickname, 'message', v_entry.message,
    'ornament', v_entry.ornament, 'createdAt', v_entry.created_at
  ));
end;
$$;
revoke all on function public.redstring_create_entry(text,text,text,uuid,text,text) from public, anon, authenticated;
grant execute on function public.redstring_create_entry(text,text,text,uuid,text,text) to service_role;

notify pgrst, 'reload schema';
commit;

-- 기존 프로젝트에 꽃 통계만 추가할 때: 이 파일 전체를 SQL Editor에서 Run.
-- 기존 기대평과 통계를 유지합니다. 여러 번 실행해도 됩니다.
begin;
create table if not exists public.member_flower_counts (
  member_id text primary key,
  member_name text not null,
  part text not null,
  total_clicks bigint not null default 0 check (total_clicks >= 0),
  last_clicked_at timestamptz
);
create table if not exists public.member_flower_events (
  request_id uuid primary key,
  member_id text not null references public.member_flower_counts(member_id),
  created_at timestamptz not null default now()
);
insert into public.member_flower_counts(member_id,member_name,part) values
('vocal-1','강재준','보컬'),('vocal-2','박지현','보컬'),('vocal-3','김은혜','보컬'),
('guitar-1','심규진','기타'),('guitar-2','안진관','기타'),('guitar-3','김수진','기타'),
('bass-1','박정은','베이스'),('bass-2','임지훈','베이스'),
('keys-1','한승엽','건반'),('keys-2','유다현','건반'),
('drums-1','박기종','드럼'),('drums-2','노유경','드럼')
on conflict(member_id) do update set member_name=excluded.member_name, part=excluded.part;
alter table public.member_flower_counts enable row level security;
alter table public.member_flower_events enable row level security;
revoke all on public.member_flower_counts,public.member_flower_events from public,anon,authenticated;
grant usage on schema public to service_role;
grant select,insert,update,delete on public.member_flower_counts,public.member_flower_events to service_role;

-- 요청 ID가 같은 네트워크 재시도는 한 번만 집계합니다. 동시 클릭도 유실하지 않습니다.
create or replace function public.redstring_send_flower(p_member_id text,p_request_id uuid)
returns boolean language plpgsql security invoker set search_path='' as $$
declare v_inserted uuid;
begin
  if p_request_id is null or not exists(select 1 from public.member_flower_counts where member_id=p_member_id) then
    raise exception 'Invalid flower input' using errcode='22023';
  end if;
  insert into public.member_flower_events(request_id,member_id) values(p_request_id,p_member_id)
    on conflict(request_id) do nothing returning request_id into v_inserted;
  if v_inserted is not null then
    update public.member_flower_counts set total_clicks=total_clicks+1,last_clicked_at=clock_timestamp()
      where member_id=p_member_id;
  elsif not exists(select 1 from public.member_flower_events where request_id=p_request_id and member_id=p_member_id) then
    raise exception 'Request ID conflict' using errcode='22023';
  end if;
  return true;
end;
$$;
revoke all on function public.redstring_send_flower(text,uuid) from public,anon,authenticated;
grant execute on function public.redstring_send_flower(text,uuid) to service_role;
notify pgrst,'reload schema';
commit;
