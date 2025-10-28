# Design Exception Process

**Version:** 1.0.0
**Last Updated:** 2025-10-27
**Status:** Active

---

## Purpose

This document defines the process for requesting and documenting exceptions to the design system. It provides a structured way to handle creative one-offs while preventing "exception creep" that would undermine the system.

---

## When to Request an Exception

### Valid Reasons

✅ **Artistic Expression**
- Page is art, not UI (e.g., artist statement, portfolio showcase)
- Breaking rules serves the creative vision

✅ **Unique User Needs**
- Standard patterns don't fit the use case
- User research shows alternative approach is better

✅ **Technical Constraints**
- Third-party integrations require different layout
- Performance optimization requires custom approach

✅ **Business Requirements**
- Marketing campaign needs unique landing page
- Special event requires custom experience

### Invalid Reasons

❌ **Convenience**
- "It's easier to break the rule than follow it"
- Solution: Learn the pattern, use the system

❌ **Personal Preference**
- "I like larger text / more spacing / different colors"
- Solution: Propose system change, don't create exception

❌ **Lack of Understanding**
- "I don't know how to achieve this within the system"
- Solution: Ask for help, consult documentation

❌ **Time Pressure**
- "We need to ship fast, no time to follow rules"
- Solution: Ship within system, iterate later

---

## Exception Request Process

### Step 1: Identify Need

Before requesting an exception, ask:

1. **Does a pattern exist for this?**
   - Check [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
   - Check [component-patterns.md](./component-patterns.md)
   - Search existing components

2. **Can I use a Tier 4 page classification?**
   - See [PAGE_TYPE_TAXONOMY.md](./PAGE_TYPE_TAXONOMY.md)
   - Tier 4 allows creative freedom with documentation

3. **What am I gaining by breaking the rule?**
   - Better user experience?
   - Higher conversion?
   - Creative impact?
   - Technical necessity?

4. **What am I losing by breaking the rule?**
   - Consistency?
   - Maintenance burden?
   - User confusion?
   - Design debt?

---

### Step 2: Document Exception

Create a new file: `.agent-os/exceptions/[page-name].md`

**Template:**

```markdown
# Exception: [Page Name]

**Date:** YYYY-MM-DD
**Requested By:** [Your Name]
**Status:** [Proposed | Approved | Rejected | Implemented]

---

## Page Details

**URL:** /path/to/page
**Page Type:** Tier 4 (One-Off Creative)

---

## Rules Being Broken

List specific design system rules being violated:

- [ ] Chrome budget exceeded (>60%)
- [ ] Typography scale exceeded (>text-6xl)
- [ ] Custom color palette (not charcoal/gold)
- [ ] Non-standard layout/spacing
- [ ] Other: [specify]

---

## Rationale

### Why This Exception Serves Users

[Explain how breaking the rule creates value for users]

### Why Standard Patterns Don't Work

[Explain why existing system patterns are insufficient]

### What We're Gaining

[Specific benefits: conversion lift, engagement, brand impact, etc.]

### What We're Losing

[Honest assessment: inconsistency, maintenance cost, etc.]

---

## Design Mockups

[Include screenshots, wireframes, or visual references]

- Mockup URL: [link]
- Figma file: [link]
- Screenshots: [attach images]

---

## Success Metrics

How will we measure if this exception was worth it?

- **Metric 1:** [e.g., Conversion rate from page]
- **Metric 2:** [e.g., Time on page]
- **Metric 3:** [e.g., User feedback score]

**Target:** [Define success threshold]
**Timeline:** [When will we evaluate?]

---

## Approval

**Reviewed By:** [Design System Owner]
**Date:** YYYY-MM-DD
**Decision:** [Approved | Rejected | Needs Revision]

**Comments:**
[Reviewer feedback]

---

## Implementation Notes

[After approval, document implementation details]

**File:** `src/routes/path/to/page.svelte`
**Lines:** [Where exception code lives]
**Dependencies:** [Any special dependencies]

---

## Post-Launch Review

[After implementation, evaluate success]

**Launch Date:** YYYY-MM-DD
**Review Date:** YYYY-MM-DD

**Metrics Results:**
- Metric 1: [actual result vs target]
- Metric 2: [actual result vs target]
- Metric 3: [actual result vs target]

**Lessons Learned:**
[What worked, what didn't, would we do it again?]

**Should This Become a Pattern?**
[If successful, consider adding to design system]
```

---

### Step 3: Implement with Annotations

Once approved, annotate the code with clear comments:

```svelte
<!-- /src/routes/artist-statement/+page.svelte -->

<!--
  DESIGN EXCEPTION: Artist Statement Page
  See: .agent-os/exceptions/artist-statement.md
  Approved: 2025-10-27 by [Owner Name]

  Rationale: This page is art, not UI. It intentionally breaks chrome budget
  and typography rules to create an immersive creative experience that matches
  the photographer's artistic vision.

  Rules Broken:
  - Chrome budget: 75% (exceeds 60% limit)
  - Typography: text-8xl (exceeds text-6xl limit)
  - Custom gradient background (not charcoal palette)
-->

<script lang="ts">
  // Exception implementation
</script>

<section class="py-24 bg-gradient-to-b from-purple-950 to-charcoal-950">
  <h1 class="text-8xl font-bold text-center mb-8">
    My Journey
  </h1>
  <!-- Exceptional creative content -->
</section>
```

**Key Annotation Requirements:**
- Clear comment block at top of file
- Link to exception documentation
- Approval date and approver name
- Brief rationale
- List of rules broken

---

## Approval Authority

### Who Can Approve Exceptions?

**Design System Owner:**
- Primary approver for all exceptions
- Can approve any exception type
- Can delegate authority for minor exceptions

**Project Lead:**
- Can approve exceptions for marketing campaigns
- Can approve temporary exceptions (with expiration date)
- Cannot approve exceptions that create design debt

**Self-Approval (Allowed Cases):**
- Tier 4 pages with documented rationale
- Temporary exceptions for experiments (with expiration)
- Technical workarounds for third-party integrations

**Requires Team Review:**
- Exceptions that affect multiple pages
- Exceptions that create new patterns
- Exceptions that significantly impact performance

---

## Exception Lifecycle

### 1. Proposed → 2. Under Review → 3. Approved/Rejected → 4. Implemented → 5. Reviewed

```
Proposed
    ↓
    ├─ Documentation created
    ├─ Mockups shared
    └─ Metrics defined
    ↓
Under Review
    ↓
    ├─ Design system owner reviews
    ├─ Team discusses (if needed)
    └─ Decision made
    ↓
Approved ─────────────────┐
    ↓                     ↓
Implemented          Rejected
    ↓                     ↓
    ├─ Code annotated  Archive
    ├─ Exception file  (document
    │   updated        for future
    └─ Launched        reference)
    ↓
Reviewed (Post-Launch)
    ↓
    ├─ Metrics evaluated
    ├─ Lessons documented
    └─ Decision:
        ├─ Keep exception
        ├─ Revert to system
        └─ Promote to pattern
```

---

## Exception Expiration

Some exceptions should have an expiration date:

**Temporary Exceptions:**
```markdown
## Expiration

**Expires:** 2025-12-31
**Reason:** This is a temporary campaign landing page

**On Expiration:**
- [ ] Remove page
- [ ] Archive exception documentation
- [ ] Delete custom components
```

**Permanent Exceptions:**
```markdown
## Expiration

**Permanent:** Yes
**Review Frequency:** Quarterly

**Review Checklist:**
- [ ] Still serves users?
- [ ] Metrics still strong?
- [ ] Maintenance burden acceptable?
```

---

## Anti-Patterns to Avoid

### ❌ Silent Exceptions

**Bad:**
```svelte
<!-- No documentation, no annotation -->
<h1 class="text-9xl">Huge Text</h1>
```

**Good:**
```svelte
<!-- EXCEPTION: See .agent-os/exceptions/hero.md -->
<h1 class="text-9xl">Huge Text</h1>
```

---

### ❌ Vague Rationale

**Bad:**
```markdown
Rationale: We needed it to look better.
```

**Good:**
```markdown
Rationale: A/B testing showed that hero text larger than text-6xl
increased conversion by 23% for this specific campaign. User research
revealed that athletes respond to bold, impactful messaging that matches
the energy of the sport.
```

---

### ❌ Exception Creep

**Bad:**
```
exceptions/
├── page1.md (approved)
├── page2.md (approved because page1 did it)
├── page3.md (approved because page2 did it)
└── page4.md (now it's the norm, not an exception)
```

**Good:**
```
exceptions/
├── artist-statement.md (approved, permanent)
└── summer-campaign-2025.md (approved, expires 2025-09-01)

→ Only 2 exceptions, both well-justified
→ Temporary exception has expiration date
```

---

## Examples

### Example 1: Artist Statement Page (Approved)

**File:** `.agent-os/exceptions/artist-statement.md`

**Summary:**
- **Page:** `/artist-statement`
- **Rules Broken:** Chrome budget (75%), typography (text-8xl), custom colors
- **Rationale:** Page is creative expression, not UI. Matches photographer's artistic vision.
- **Metrics:** Engagement time, emotional response (qualitative), social shares
- **Status:** Approved (permanent)

---

### Example 2: Summer Campaign Landing Page (Approved, Temporary)

**File:** `.agent-os/exceptions/summer-campaign-2025.md`

**Summary:**
- **Page:** `/campaigns/summer-2025`
- **Rules Broken:** Typography (text-7xl), custom orange gradient
- **Rationale:** Campaign needs high-impact hero to match energy of summer sports
- **Metrics:** Sign-ups for summer photo sessions, conversion rate
- **Expires:** 2025-09-01
- **Status:** Approved (temporary)

---

### Example 3: "Better Design" Request (Rejected)

**File:** `.agent-os/exceptions/explore-redesign.md` (never created)

**Summary:**
- **Page:** `/explore`
- **Proposed Change:** Larger text, more spacing, custom grid
- **Rationale:** "Current design feels cramped"
- **Decision:** Rejected
- **Feedback:** The current design follows Tier 1 (Gallery) rules for good reason (chrome budget, photo-first). If you believe the system is wrong, propose a system-wide change, not a page-specific exception.

---

## Periodic Exception Audit

**Frequency:** Quarterly

**Checklist:**
- [ ] Review all active exceptions
- [ ] Check expiration dates
- [ ] Evaluate metrics
- [ ] Identify patterns (should any exception become a standard pattern?)
- [ ] Archive expired/removed exceptions
- [ ] Update this document with lessons learned

---

## Version History

### v1.0.0 (2025-10-27)
- Initial exception process
- Defined approval authority
- Created exception template
- Established lifecycle and expiration rules

---

## Related Documentation

- [PAGE_TYPE_TAXONOMY.md](./PAGE_TYPE_TAXONOMY.md) - Page classification
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Core design system
- [design-principles.md](./design-principles.md) - Design principles

---

**Remember:** Exceptions exist to handle edge cases, not to bypass the system. If you're creating many exceptions, the system may need to evolve—propose a pattern change instead.
