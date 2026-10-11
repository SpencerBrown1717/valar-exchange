# Tahoe Research activation · 2026-10-10

Starting main: `627243fd89a83c3ec7c1a7ee74dc9d44c32d796d`. This change contains only the Research pipeline and its tests/runbook. The separately rebased institutional website/newsletter branch remains available and is not part of this rollout.

The owner requested complete daily operation and explicitly approved creation of the dedicated Tahoe caller key and storage in this repository's GitHub Actions secret. The key named **Valar Research daily articles** was created and saved as `TAHOE_RESEARCH_API_KEY` using the secure UI. No key was written to source, chat, local environment files or build output. Existing public Research pages and the content ledger remain unchanged.

Configured repository variables: `TAHOE_RESEARCH_CHAT_URL=https://www.tahoecloud.ai/v1/chat/completions`, `TAHOE_RESEARCH_MODEL=qwen3:8b`, `VALAR_RESEARCH_APPROVED=true`, `VALAR_RESEARCH_DAILY_ENABLED=false`. The durable config remains `enabled:false`.

A prior browser inference completed using `qwen3:8b`: request `b85b45a7-91d0-4cc2-a83a-63165fc3fc69`, 190 total tokens, 11.90 seconds. It used a clearly fictional writing packet, produced coherent copy, and missed its requested word count. The browser test uses different request settings from the editorial pipeline; it proves live inference only.

## First-run acceptance

Manual **Daily VALAR Research** runs use `generate-draft` and retain checked content in a private 14-day artifact. They can run on an owner-selected task branch while the persistent publication config is off. Private mode does not create a publication proposal; even a later `publish` invocation has nothing to publish. Bad serving configuration is rejected before any source requests, including on quiet days. The normal daily path retains its config, daily approval, content validation and atomic-main-update guards.

Required remaining evidence: a successful hosted private run from the exact candidate, accepted real-source article and provenance reviewed against the quality rubric, deployment of that exact content/configuration, then a scheduled publication and its resulting Vercel deployment. A quiet-news skip is not qualification of the model. Hosted billing/capacity failures are not passing checks.

## Pause and recovery

Unset `VALAR_RESEARCH_APPROVED` to stop new manual and scheduled inference. Keep `VALAR_RESEARCH_DAILY_ENABLED=false` until first-run acceptance passes. For a durable publication pause, keep or commit `enabled:false`. Do not automatically rerun uncertain inference. Reconcile Tahoe Usage first; preserve article/day/story ledgers and use a new run from current main after repairs. To disconnect, revoke the dedicated key and remove the repository secret through the owner's normal controls.
