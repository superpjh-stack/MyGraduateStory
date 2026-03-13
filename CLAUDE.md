# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project is in early initialization. No application code, build system, or framework has been chosen yet.

## Development Tooling

This project uses **bkit** (Vibecoding Kit) for AI-driven development:

- PDCA pipeline state is tracked in `docs/.pdca-status.json`
- Agent orchestration state is in `.bkit/agent-state.json`
- Session memory is in `docs/.bkit-memory.json`

The current configured pipeline level is **Dynamic** (fullstack with backend/auth).

## Workflow

Development follows the PDCA (Plan-Do-Check-Act) cycle managed through bkit skills:
- `/pdca plan` → create plan documents
- `/pdca design` → create design documents
- `/pdca do` → implement features
- `/pdca analyze` → gap analysis between design and implementation
- `/pdca iterate` → auto-fix if gap < 90%
- `/pdca report` → completion report when gap ≥ 90%
