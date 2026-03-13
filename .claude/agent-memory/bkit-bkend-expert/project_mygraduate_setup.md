---
name: MyGraduate project setup
description: MyGraduate 프로젝트의 DB 구성, Supabase 설정, 빠른 로그인 계정 정보
type: project
---

MyGraduate는 Next.js 14 + Supabase 기반의 학습 기록 앱이다.

- Supabase Project Ref: snrxbyabvvmcbhmeewcf
- Supabase URL: https://snrxbyabvvmcbhmeewcf.supabase.co
- 프로젝트 경로: C:/gerardo/01 SmallSF/MyGraduate
- SQL 마이그레이션 파일: supabase/setup_all.sql

DB 테이블 (2026-03-13 기준 모두 생성 완료):
profiles, subjects, sessions, session_attachments, reflections, time_capsules, achievements, growth_snapshots, self_assessments

Supabase Auth 설정:
- mailer_autoconfirm: true (이메일 인증 불필요 — 빠른 로그인 작동 조건 충족)
- disable_signup: false
- password_min_length: 6

빠른 로그인 계정: gerardo@mygraduate.com / admin1234
- 2026-03-13 기준 auth.users에 계정이 없음 → 첫 번째 빠른 로그인 시 signUp 후 재로그인 플로우로 진행됨

**Why:** 점검 결과 DB 마이그레이션은 완료된 상태. 빠른 로그인 로직은 정상적으로 작동할 수 있는 환경.
**How to apply:** 향후 auth 관련 작업 시 mailer_autoconfirm=true 전제로 코드 검토할 것.
