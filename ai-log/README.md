# AI conversation exports

This folder is reserved for authentic conversation exports from the AI tools used for the project.

Do not add summaries as if they were exports. Export the actual Claude Code conversations using its `/export` command, review them for secrets or personal information, then place the permitted files here. If another assistant is used for a task, identify it accurately and follow the employer's requested export format.

## Files

The three files are exports of two separate historical Claude Code sessions. Each file shows the project only as it stood where the export ends, so none of them should be read as the final project status. The final status is in [README.md](../README.md) and [docs/evaluation.md](../docs/evaluation.md).

| File | Session | Export | What it covers | Project state at the end of the file |
|---|---|---|---|---|
| `claude-code-session-2026-10-22.md` | Claude Code, 2026-10-22 | Partial export, superseded by `claude-code-session-2026-10-22-complete.txt` | The first three prompts of the session: read-only audit of the scaffold; clarifications to docs/plan.md; separate validators for candidate and final investor records; design of the evaluation (predictions kept apart from human labels, evaluator, fingerprint command, empty freeze block). Ends before the 20-candidate frame was drawn and frozen. | 3 unfrozen candidates from one announcement, 0 predictions, 0 human labels. |
| `claude-code-session-2026-10-22-complete.txt` | Claude Code, 2026-10-22 (same session) | Extended export; supersedes the partial export | Everything in the partial export, then candidate discovery from the CzechStartups and CVCA directories, the 20-candidate frame and preliminary predictions, recording the freeze fingerprints and `frozenOn` in data/reviews.json, and the checkpoint commit 73269ec. | 20 candidates and 20 preliminary predictions frozen on 2026-10-22 (commit 73269ec), 0 human labels. |
| `claude-code-session-2026-10-26.txt` | Claude Code, 2026-10-26 | Single export of the later session | Research notes for the human review on 14 of the 20 frozen candidates; correction of stale status text; entry of the reviewer's confirmed labels for all 20 candidates; final records for the 5 eligible managers; final documentation and report; commits dcaef34, 7a9b0a8, and b6647c5. | Frozen 20-candidate frame, 20 human labels (5 eligible, 8 not_eligible, 7 unresolved), data/final-investors.json, and the final documentation. |

Notes:

- The two 2026-10-22 files are separate exports of the same session, made at different times. The partial export was made partway through the session. The extended export contains the same opening prompts and continues to commit 73269ec, so it supersedes the partial one; the partial file is kept only as the earlier export. The partial file was earlier kept outside the repository as `02-scope-and-evaluation.md`; the 2026-10-26 file refers to it by that name.
- The 2026-10-26 file passes through intermediate states (for example, 17 labels entered while 3 waited for sources) before the final state at its end. Turns after that point, such as the update of this README, are not in the file.
- The human review discussion and the label decisions took place in a ChatGPT conversation, which is not in this folder. If it is added, export it with ChatGPT's own export or share function and label it as a ChatGPT conversation, not a Claude Code export.

## Redaction

The files in this folder are genuine Claude Code `/export` transcripts with one kind of change: absolute local Windows paths under `C:\Users\` were replaced with `[LOCAL_WINDOWS_PATH_REDACTED]`. This includes the same paths written as `C:/Users/...` or in the Git Bash form `/c/Users/...`; 14 paths were replaced (1, 9, and 4 in the three files, in table order). Where the exporter had wrapped a path over several lines, the line breaks and indentation were kept and the rest of the path was removed, so line numbers match the originals and a few lines are shorter or contain only indentation. No other text was changed.

The untouched original exports are kept outside the repository and are not published.

Before adding another export, review it for tokens, credentials, and personal data, and apply the same path redaction.
