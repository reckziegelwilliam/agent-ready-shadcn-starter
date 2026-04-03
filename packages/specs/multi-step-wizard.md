# Multi-Step Wizard

> Spec version: 1.0

## Overview

A 4-step onboarding wizard that collects user information, preferences, and plan selection before submitting all data in a single API call. The wizard uses Redux Toolkit for step and form state management, `react-hook-form` with `zod` for per-step validation, and shadcn/ui components for the UI.

## User Stories

- **As a** new user, **I want to** complete an onboarding wizard step by step, **so that** my profile and preferences are configured before I start using the application.
- **As a** user filling out the wizard, **I want to** navigate back to previous steps without losing my data, **so that** I can review and correct information.
- **As a** user on the review step, **I want to** see a summary of all my inputs and edit any section, **so that** I can confirm everything is correct before submitting.

## Screens / Components

### Screen: Wizard

**Route:** `/wizard`

**Description:** A single page that renders the current step of the wizard inside a shared layout with a progress indicator. The step component swaps based on Redux state.

**Components:**
- `WizardLayout` -- Container with step indicator and navigation. Renders the current step component as children.
- `StepIndicator` -- Horizontal progress bar showing 4 steps. Current step is highlighted, completed steps show checkmarks.
- `PersonalInfoStep` -- Step 1 form: first name, last name, email, phone (optional).
- `PreferencesStep` -- Step 2 form: industry, company size, how-did-you-hear selects.
- `PlanSelectionStep` -- Step 3: three plan cards (Free/Pro/Enterprise) with radio-style selection.
- `ReviewStep` -- Step 4: read-only summary of all data with edit buttons per section and a submit button.
- `WizardNavigation` -- Back/Next button bar. Next validates the current step before proceeding.

## Steps

### Step 1 -- Personal Info

| Field | Type | Validation | Error Message |
|-------|------|-----------|---------------|
| `firstName` | text | Required, min 1 char | "First name is required" |
| `lastName` | text | Required, min 1 char | "Last name is required" |
| `email` | email | Required, valid email format | "Please enter a valid email address" |
| `phone` | tel | Optional, if provided must be 10+ digits | "Phone number must be at least 10 digits" |

### Step 2 -- Preferences

| Field | Type | Options | Validation |
|-------|------|---------|-----------|
| `industry` | select | Technology, Healthcare, Finance, Education, Retail, Other | Required |
| `companySize` | select | 1-10, 11-50, 51-200, 201-1000, 1000+ | Required |
| `referralSource` | select | Search Engine, Social Media, Friend/Colleague, Blog/Article, Other | Required |

### Step 3 -- Plan Selection

Three cards displayed in a row (responsive to stack on mobile):

**Free Plan**
- Price: $0/month
- Features: 1 project, 1 GB storage, Community support, Basic analytics

**Pro Plan**
- Price: $29/month
- Features: Unlimited projects, 100 GB storage, Priority support, Advanced analytics, Team collaboration

**Enterprise Plan**
- Price: Custom pricing
- Features: Everything in Pro, Unlimited storage, Dedicated account manager, SSO & audit logs, Custom integrations

Selection is required. Clicking a card selects it (highlighted border).

### Step 4 -- Review & Submit

Displays all collected data organized by section:
- **Personal Info** section with edit button (jumps to step 1)
- **Preferences** section with edit button (jumps to step 2)
- **Plan** section with edit button (jumps to step 3)
- **Submit** button that posts all data to the API

## States

| State | Condition | What User Sees |
|-------|-----------|----------------|
| **Idle** | Step loaded, no interaction | Clean form for the current step |
| **Validating** | User clicked Next or interacted with field | Inline validation errors on invalid fields |
| **Valid** | All fields in current step pass validation | Next button enabled, no errors |
| **Navigating Back** | User clicked Back | Previous step loads with preserved data |
| **Submitting** | Review step submitted, API call in flight | Submit button shows spinner, all fields disabled |
| **Submit Success** | API returned 200 | Toast notification: "Onboarding complete!" |
| **Submit Error** | API returned error | Error banner on review step, form re-enabled |
| **Network Error** | No connectivity | Error banner: "Network error. Please try again." |

## Data Models

```typescript
interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Preferences {
  industry: string;
  companySize: string;
  referralSource: string;
}

type Plan = "free" | "pro" | "enterprise";

interface WizardState {
  currentStep: number;
  steps: {
    personal: PersonalInfo;
    preferences: Preferences;
    plan: Plan | null;
  };
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
```

## API Contracts

### `POST /onboarding/submit`

**Description:** Submit the completed onboarding wizard data.

**Request:**
```typescript
interface OnboardingSubmitRequest {
  personal: PersonalInfo;
  preferences: Preferences;
  plan: Plan;
}
```

**Response (200):**
```typescript
interface OnboardingSubmitResponse {
  message: string;
  onboardingId: string;
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 422 | `VALIDATION_ERROR` | `{ errors: { field: message } }` |
| 500 | `INTERNAL_ERROR` | "Something went wrong" |

## Acceptance Criteria

- [ ] **AC-1:** User can complete all 4 steps and submit the wizard.
- [ ] **AC-2:** Each step validates before allowing navigation to the next step.
- [ ] **AC-3:** Back navigation preserves all previously entered data.
- [ ] **AC-4:** Progress indicator shows current step and completed steps.
- [ ] **AC-5:** Review step displays all entered data with edit buttons per section.
- [ ] **AC-6:** Edit buttons on review step navigate to the correct step.
- [ ] **AC-7:** Submit button is disabled and shows a spinner during API call.
- [ ] **AC-8:** Success toast appears after successful submission.
- [ ] **AC-9:** Error banner appears on API failure with the error message.
- [ ] **AC-10:** All form fields are accessible via keyboard with proper labels.
- [ ] **AC-11:** Plan selection cards are keyboard-navigable.
- [ ] **AC-12:** Wizard is responsive from 320px to 1440px.

## Out of Scope

- File upload step
- Conditional steps based on previous answers
- Save draft / resume later
- Multi-language support
