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
