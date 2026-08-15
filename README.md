# ResearchFlow

A GitHub-inspired versioning and review platform for academic research.

## Structure
- **Backend/** — Node.js + Express + MongoDB (MVC pattern)
- **Frontend/** — React + Vite (feature-sliced architecture)

## Core entities
- **User** — student or professor
- **Repo** — a project's organized library (papers, datasets, experiments, results)
- **Version** — a versioned file within a repo, optionally linked to other versions (traceability)
- **ReviewRequest** — a persistent thread between student & professor for paper review rounds
