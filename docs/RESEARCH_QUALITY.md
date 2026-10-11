# Writing useful articles with a smaller Qwen model

The daily job uses fixed instructions written into [research-prompts.mjs](../scripts/research-prompts.mjs). It does not require OpenAI calls at runtime. Changing this document alone does not change the model instructions. Prompt and validator changes belong in the same reviewed change.

## The production flow

1. **Evidence editor:** inspect at most three fresh, allowlisted issuer announcements. Select one concrete business development. Return its angle, a reader question, two or three distinct facts with exact supporting excerpts, an established event date, and specific missing details. Code checks the source identity, excerpts, qualifiers, numbers, fact IDs and date before writing starts.
2. **Writer:** see only the selected source and the validated plan. Explain what was announced, the disclosed scope, what depends on what, and the gaps. The story, headline/deck evidence and ordered fact ledger are locked. The writer cannot silently substitute another story or claim.
3. **Reviewer:** receive a fresh context containing the original source, plan and draft, rather than the writer's conversation. Check H1/D1, every F-number, every analysis paragraph and every limitation. Every field must be accounted for. Then assess coherence, clarity, specificity, repetition and restraint separately.
4. **One optional copy edit:** only a fully grounded, material article with bounded writing feedback can enter this step. A fresh review must pass afterward. No second rewrite, unsupported-claim rescue, lower standard, model fallback or invented filler is allowed. Publication occurs only after checks pass.

The reviewer is another pass of the **same configured Qwen model**, not an independent human or stronger model. It can share the writer's blind spots. Code checks exact support, constraints and review coverage; it cannot prove that every interpretation is true. Human qualification of the actual model remains necessary before daily activation.

## What the writing should do

The headline names the actor, action and object. The deck attributes the announcement and carries its status and main dependency. Facts move from transaction to scope/terms to execution conditions. Analysis explains a concrete dependency or a useful question. Limitations identify gaps in this source, rather than making claims about the whole market.

Aim for 170–260 words, with short, direct sentences. Sparse evidence is a reason for a shorter article or a skipped day. The hard limits remain 350 words overall and 180 words for title, deck and facts. The brief performs no derived arithmetic, annualization, implied prices or forecasts.

The prompts include examples of useful and weak writing. These are explicitly invented examples and are not eligible news sources:

| Weak copy | Useful direction |
| --- | --- |
| “This transformative deal underscores the rapid growth of the AI ecosystem.” | Name the event's actual dependency and explain what readers should track. |
| “The investment guarantees new operating capacity.” | Preserve proposed status and approvals; distinguish a plan from an operating asset. |
| “There are no financing terms.” | State that the supplied announcement does not disclose the terms. |
| Repeating the deck as analysis | Explain a conditional implication using the established facts. |

Do not attach generic market growth claims, a confident forecast, or a stock recommendation to make the article seem sophisticated. Do not invent a definition for an unfamiliar technical term. Omit unnecessary jargon or explain only what the source establishes.

## Qualification packets

Before enabling automation, use the exact intended Qwen tag, serving configuration and quantization to draft several private articles from representative source packets. Keep the approval and daily controls off until the existing first-draft activation process is complete. Do not use historical test results as evidence for a changed model or prompt version.

Use these scenarios to evaluate the writer and reviewer. Synthetic packets belong only in isolated evaluation, never the public article dataset:

| Packet | Required behavior | Reject if |
| --- | --- | --- |
| A proposed GPU facility contingent on permits; operating date not disclosed | Carry the permit condition into headline/deck/facts as needed; track approval before assessing an operating timeline | A plan becomes installed or operating capacity |
| An up-to amount, a long contract term and uncertain start date | Preserve the maximum, currency and term exactly; identify the unresolved start date | The maximum becomes spent cash, annual revenue or a per-unit estimate |
| A hardware deployment agreement with no financing value | Describe the agreement and the missing economic detail | The writer invents a valuation, financing amount or counterparties |
| Two recent announcements of the same deal with conflicting economic terms | Hold rather than select whichever number sounds better | The article silently resolves the conflict |
| A promotional announcement without concrete business scope | Skip the day | A vague launch becomes a material capital event |
| A real announcement with several unfamiliar terms | Use only necessary terms and evidence-supported explanations | Jargon hides who did what, or a definition adds an unsupported claim |
| A fluent draft with a false signed/closed assertion | Reject in the factual review, without a style rewrite | All writing scores pass and publication proceeds |
| A grounded draft that repeats itself or has generic analysis | One targeted copy edit, followed by another full factual and writing review | The edit adds new claims or a second rewrite is requested |

For each accepted article, a human should be able to answer: Who announced what? What is its actual status? Which terms are disclosed? What condition matters? What remains unknown? Inspect every numeric claim and transaction verb against its own evidence excerpt. Confirm the prose is readable without specialist knowledge and that each section does distinct work.

Reject a packet with any factual/status/currency/unit/date defect regardless of how polished it sounds. A model's own passing rubric is not sufficient qualification. Review both accepted and held drafts; a model that skips everything has not demonstrated useful writing. Record the prompt version, exact model, serving configuration, reviewed source packet, result and human decision. No live Qwen quality result is claimed by the offline tests.

## Runtime bounds and provenance

Normal generation uses three requests with output budgets of 1,500, 1,800 and 1,000 tokens. The optional rewrite and re-review add 1,800 and 1,000, for a maximum output reservation of 7,100 tokens across five requests, plus input allowance. Actual usage depends on the provider; token limits are not a price estimate or entitlement. Source evidence windows are bounded to 3,200 UTF-8 bytes per candidate and end at a complete sentence; the window is not a complete-source audit. Aggregate model input is limited to the gateway's 16,000-byte message-text budget.

Each call has a distinct idempotency key and a 40-second deadline. Network, quota or server failures stop the run without an automatic resend; uncertain outcome is not zero usage. A subsequent run must first reconcile uncertain serving usage with Tahoe. A copy edit is a distinct planned model request, not a transport retry.

The prompts request `/no_think` and the text-chat adapter uses temperature 0.7, following [Qwen3's documented non-thinking guidance](https://qwen.readthedocs.io/en/latest/getting_started/quickstart.html). The API retains the existing supported text-chat fields; it does not assume that host-only `enable_thinking`, structured-output, `top_p` or `top_k` options exist. Only an empty `<think></think>` prefix is tolerated; nonempty reasoning, fenced responses, invalid JSON and truncation are held. Qualify this behavior on the actual host.

The private story ledger records playbook v2, model, source and evidence hashes, each stage's prompt/input/output hashes, writing rubric and whether a rewrite occurred. Keys are never inserted into prompts or that ledger. Article schema, byline, source links, daily/story deduplication and publication activation controls are preserved. Website articles and newsletter emails retain separate operational controls.
