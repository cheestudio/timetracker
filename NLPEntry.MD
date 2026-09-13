# NLP Time Entry — Implementation Plan

## Overview

Add a natural language time entry interface at `/submit/`. A single textarea accepts freeform text (e.g. "2 hours on logo design for Acme yesterday, billable"), sends it to a Next.js API route that calls OpenCode Go (MiMo V2.5 Pro) for structured parsing, and returns a JSON object that maps directly to the fields required by `SubmitTime.tsx`. The user reviews the parsed result and confirms submission.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  /submit/  (Client Component)               │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  <textarea>  — natural language input │  │
│  └──────────────┬────────────────────────┘  │
│                 │ POST /api/parse            │
│  ┌──────────────▼────────────────────────┐  │
│  │  ParsedPreview — editable summary     │  │
│  │  (client, date, task, time, billable) │  │
│  └──────────────┬────────────────────────┘  │
│                 │ confirm                    │
│  ┌──────────────▼────────────────────────┐  │
│  │  addEntry() → Supabase insert         │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

         POST /api/parse
              │
┌─────────────▼───────────────────────┐
│  Next.js API Route (server-side)    │
│                                     │
│  1. Accept { input, clients[] }     │
│  2. Build system prompt w/ client   │
│     list + field schema             │
│  3. Call OpenCode Go API            │
│     (MiMo V2.5 Pro, chat/complet.) │
│  4. Parse JSON from response        │
│  5. Return structured fields        │
└─────────────────────────────────────┘
```

---

## Field Mapping

The LLM must extract these fields from natural language input:

| Field | Type | Description | Example |
|---|---|---|---|
| `client` | `string` | Matched to a known client name from the Clients table (fuzzy) | "Acme Corp" |
| `date` | `string` (YYYY-MM-DD) | Absolute or relative date | "2026-09-11" |
| `task` | `string` | Description of work performed | "Logo design revisions" |
| `timeMode` | `"timer" \| "entry"` | Whether to use start/end times or a duration | `"entry"` |
| `startTime` | `string` | Start time (h:mm A format) | "9:00 AM" |
| `endTime` | `string` | End time (h:mm A format) | "11:00 AM" |
| `duration` | `string` | Duration in HH:MM:SS (timer mode alternative) | "2:00:00" |
| `billable` | `boolean` | Whether the entry is billable | `true` |

---

## Implementation Checklist

### Phase 1 — Environment & API Route

- [x] **1.1** Add `OPENCODE_API_KEY` to `.env`
  - Store the OpenCode Go API key as `OPENCODE_API_KEY`
  - Add to `.env` (never commit the value)

- [x] **1.2** Create `/src/app/api/parse/route.ts`
  - Accept POST with `{ input: string, clients: { id: number, name: string }[] }`
  - Build a system prompt that includes:
    - The full list of client names + IDs (injected from the request body)
    - Today's date and the user's timezone (for relative date resolution)
    - Strict JSON output schema matching the field mapping above
    - Instructions for fuzzy client matching, relative date handling ("yesterday", "last tuesday", "2 hours ago")
    - Instructions for time parsing ("2 hours", "9-11am", "90 minutes", "3h 30m")
  - Call `https://opencode.ai/zen/go/v1/chat/completions` with model `mimo-v2.5-pro`
  - Parse the JSON from the LLM response
  - Validate and return the structured object
  - Handle errors gracefully (malformed JSON, API failures, rate limits)

- [x] **1.3** Define response type in `/src/types/types.ts`
  - Add `ParsedTimeEntry` interface matching the field mapping table above

### Phase 2 — Frontend Page

- [x] **2.1** Create `/src/app/submit/page.tsx`
  - Client component (`"use client"`)
  - Auth-gated: redirect to `/` if not logged in (same pattern as `page.tsx`)
  - Layout: centered container, dark theme consistent with rest of app

- [x] **2.2** Build `NLPInput` component (can be inline in page or separate)
  - Full-width `<textarea>` with NextUI styling
  - Submit on `Ctrl+Enter` or a button click
  - Loading state while awaiting API response
  - Error toast on failure (use `react-hot-toast`)

- [x] **2.3** Build `ParsedPreview` component
  - Displays the parsed fields in an editable card/panel:
    - Client: dropdown (reuse `ClientDropdown` component logic)
    - Date: date input
    - Task: text input
    - Time: either timer display or start/end inputs (based on `timeMode`)
    - Billable: checkbox
  - Each field is editable so the user can correct LLM mistakes
  - "Submit" button to confirm and persist
  - "Edit" button to go back to the textarea with the original input

- [x] **2.4** Wire up submission
  - On confirm, build a `TimeEntryProps` object from the parsed fields
  - Use the same `addEntry()` from `useTimeEntriesContext`
  - Use the same `timeToUTC()`, `timeToSeconds()`, `calculateElapsedTime()` helpers from `utils.ts`
  - Show success/error toast
  - Clear textarea on success for next entry

### Phase 3 — Prompt Engineering

- [x] **3.1** Design the system prompt
  - Include the client list as context (passed from frontend, fetched via `listClients()`)
  - Include today's date + timezone for relative date resolution
  - Define the exact JSON schema expected
  - Include few-shot examples:
    - `"2 hours on design for Acme yesterday, billable"`
    - `"Meeting with Globex 9-10:30am"`
    - `"Debugging auth module for Stark Industries, 45 minutes"`
    - `"3h client work on Wayne logos, not billable"`
    - `"Worked on Project X today from 2pm to 5pm"`
  - Handle edge cases:
    - No client mentioned → `client: null`
    - No date mentioned → default to today
    - Ambiguous time → use duration in timer mode
    - "billable" / "not billable" / no mention

- [ ] **3.2** Test prompt with various inputs
  - Verify client matching works with partial names
  - Verify relative dates resolve correctly
  - Verify time/duration parsing is accurate
  - Verify billable detection is correct

### Phase 4 — Polish & Edge Cases

- [x] **4.1** Keyboard shortcuts
  - `Ctrl+Enter` to parse
  - `Enter` to confirm parsed result (when preview is shown)
  - `Escape` to dismiss preview and return to textarea

- [x] **4.2** Loading & empty states
  - Spinner/loading indicator during API call
  - Placeholder text with example inputs in the textarea
  - Empty state after successful submission

- [x] **4.3** Error handling
  - API failure → toast + keep input in textarea
  - Invalid JSON from LLM → retry once, then show error
  - Network error → toast with retry option
  - Client not found → show warning, allow manual selection

- [x] **4.4** Navigation
  - Add link to `/submit/` from the main app (header/nav or similar)
  - Ensure the page works with the existing auth flow

---

## Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `src/app/submit/page.tsx` | **Create** | NLP entry page |
| `src/app/api/parse/route.ts` | **Create** | Server-side LLM parsing endpoint |
| `src/types/types.ts` | **Modify** | Add `ParsedTimeEntry` interface |
| `.env` | **Modify** | Add `OPENCODE_API_KEY` |

---

## OpenCode Go API Details

- **Model:** `mimo-v2.5-pro`
- **Endpoint:** `https://opencode.ai/zen/go/v1/chat/completions`
- **Package:** `@ai-sdk/openai-compatible` (or direct `fetch` — no SDK dependency needed)
- **Auth:** Bearer token via `OPENCODE_API_KEY` env var
- **Cost:** $0.435/1M input, $0.87/1M output — negligible for this use case
- **Data retention:** 0 days (MiMo V2.5 Pro is zero-data-retention)

### Direct fetch approach (no SDK)

```ts
const response = await fetch('https://opencode.ai/zen/go/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENCODE_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'mimo-v2.5-pro',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userInput },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  }),
});
```

No new npm dependencies required — `fetch` is native in Next.js server routes.

---

## Data Flow (End to End)

1. User types `"2 hours on logo design for Acme yesterday, billable"` into textarea
2. Frontend calls `POST /api/parse` with `{ input, clients }`
3. API route builds prompt with client list + today's date, calls OpenCode Go
4. LLM returns JSON:
   ```json
   {
     "client": "Acme Corp",
     "date": "2026-09-11",
     "task": "Logo design",
     "timeMode": "timer",
     "startTime": null,
     "endTime": null,
     "duration": "2:00:00",
     "billable": true
   }
   ```
5. Frontend renders `ParsedPreview` with editable fields
6. User clicks "Submit"
7. Frontend builds `TimeEntryProps` using existing utils (`timeToUTC`, `timeToSeconds`, etc.)
8. `addEntry()` inserts into Supabase via existing context
9. Success toast, textarea clears, ready for next entry

---

## Testing Notes

- Test with the actual OpenCode Go API key before shipping
- Verify client matching edge cases (similar names, abbreviations)
- Verify timezone handling matches existing `SubmitTime` behavior
- Compare parsed results against manual entry in `SubmitTime.tsx` for consistency
