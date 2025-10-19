# Agent-OS Workflow Modes Documentation

**Version:** 1.0.0
**Last Updated:** October 16, 2025

## Overview

The Agent-OS now supports **three configurable workflow modes** that allow you to optimize for speed, token efficiency, or thoroughness based on your project needs.

### Quick Reference

| Mode | Speed | Token Usage | Best For |
|------|-------|-------------|----------|
| **Direct** | 3-4x faster | 70-80% savings | UI polish, simple features, routine updates |
| **Selective** | 2x faster | 40-50% savings | Mixed complexity, backend work, integrations |
| **Thorough** | Baseline | Highest usage | Mission-critical features, complex systems |

---

## Mode A: Direct Implementation

### Overview
The AI implements tasks directly without delegating to specialized subagents. Perfect for straightforward work where you want fast iteration.

### Characteristics
- ✅ No agent delegation overhead
- ✅ Minimal documentation (code comments + summary)
- ✅ Self-verification with spot checks
- ✅ Single-pass implementation
- ✅ Focus on code delivery

### When to Use
- **UI Components:** Creating new React components
- **Styling:** Tailwind CSS, layout adjustments, responsive design
- **Animations:** Framer Motion microinteractions
- **Bug Fixes:** Non-critical bug fixes and enhancements
- **Refactoring:** Code cleanup and optimization
- **Tests:** Writing Playwright tests for existing features

### Workflow

```
┌─────────────────┐
│  Implementation │  ← Direct coding by main AI
│   (No Agents)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Self-Verification│  ← Spot checks, linting, type-checking
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Brief Summary   │  ← Changes made, tests run, status
└─────────────────┘
```

### Quality Assurance
- **Code Standards:** ESLint and TypeScript checks
- **Self-Review:** Validate against acceptance criteria
- **Spot Testing:** Test critical paths manually
- **Final Summary:** Document changes and results

### Example Usage

```bash
# Use default mode (set in config.yml)
/agent-os:implement-spec

# Force direct mode
/agent-os:implement-spec --mode=direct

# Direct mode for specific phase
/agent-os:implement-spec --phase=3 --mode=direct
```

---

## Mode B: Selective Delegation

### Overview
Intelligently delegates complex tasks to specialized agents while handling straightforward work directly. Best of both worlds.

### Characteristics
- ✅ Task complexity analysis
- ✅ Delegate only high-risk or complex work
- ✅ Direct implementation for simple tasks
- ✅ Single final verification
- ✅ Focused documentation on complex areas

### When to Use
- **Backend + Frontend:** Features spanning multiple layers
- **Database Changes:** Migrations with UI updates
- **Complex Workflows:** Multi-step user journeys
- **Security-Sensitive:** Authentication, authorization
- **API Integration:** External service integrations

### Complexity Indicators

#### High Complexity (Delegate)
- 3D graphics and WebGL
- Complex state management patterns
- Database schema migrations
- API integrations with external services
- Authentication/authorization logic
- Real-time features (WebSockets)
- Performance-critical algorithms

#### Medium Complexity (Evaluate)
- Multi-step user workflows
- Form validation and submission
- Data transformation pipelines
- Component composition patterns

#### Low Complexity (Direct)
- Single UI components
- CSS/Tailwind styling
- Simple event handlers
- Static content updates
- Configuration changes

### Workflow

```
┌─────────────────┐
│ Analyze Tasks   │  ← Evaluate complexity of each task group
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌─────────┐
│ Simple │ │ Complex │
│ Direct │ │Delegate │
└───┬────┘ └────┬────┘
    │           │
    └─────┬─────┘
          ▼
  ┌───────────────┐
  │ Single Final  │  ← One comprehensive verification
  │ Verification  │
  └───────────────┘
```

### Delegation Rules
- **Backend Work:** → database-engineer, api-engineer
- **Complex Frontend:** → ui-designer
- **Critical Testing:** → testing-engineer

### Example Usage

```bash
# Use selective mode
/agent-os:implement-spec --mode=selective

# Selective for entire spec
/agent-os:implement-spec --mode=selective
```

---

## Mode C: Thorough Multi-Agent

### Overview
Full multi-agent workflow with comprehensive verification at every step. Use for mission-critical features.

### Characteristics
- ✅ All tasks delegated to specialized agents
- ✅ Multi-phase verification process
- ✅ Comprehensive documentation at each step
- ✅ Separate verifiers for frontend/backend
- ✅ Final implementation-verifier approval

### When to Use
- **Mission-Critical:** Production features with high user impact
- **Complex 3D:** Three.js, WebGL, advanced graphics
- **Architecture Changes:** Major system refactoring
- **Security-Sensitive:** Features requiring SOC2/HIPAA compliance
- **Multi-System Integration:** Complex integrations across services

### Workflow

```
┌─────────────────┐
│   Planning      │  ← Create task assignments
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Implementation  │  ← Delegate all task groups to specialized agents
│  (All Delegated)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Component     │  ← Frontend/backend verifiers check work
│  Verification   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Final       │  ← Implementation-verifier does comprehensive audit
│  Verification   │
└─────────────────┘
```

### Quality Assurance
- **Specialized Agents:** Each task group has dedicated expertise
- **Multi-Phase Verification:** Component → Integration → Final
- **Documentation Trail:** Comprehensive records at each step
- **Test Coverage:** Full validation of all test scenarios
- **Standards Audit:** Compliance with all coding standards

### Example Usage

```bash
# Use thorough mode
/agent-os:implement-spec --mode=thorough

# Thorough for specific phase
/agent-os:implement-spec --phase=4 --mode=thorough
```

---

## Configuration

### Global Configuration

Edit `agent-os/config.yml`:

```yaml
version: 2.1.0
workflow:
  default_mode: direct      # Options: direct, selective, thorough
  auto_select: true         # Enable intelligent mode selection
  project_profile: medium   # Options: small, medium, large
```

### Per-Spec Configuration

Create `agent-os/specs/{spec-id}/planning/workflow-config.yml`:

```yaml
spec_id: 2025-10-16-innovation-implementation
phases:
  phase_1:
    mode: thorough
    reason: "Critical accessibility foundation"

  phase_2:
    mode: selective
    reason: "Mixed complexity UI work"

  phase_3:
    mode: direct
    reason: "Straightforward microinteractions"
```

### Auto-Selection

Enable `auto_select: true` to let the system choose the best mode based on:

- **Project Profile:** small, medium, large
- **Task Keywords:** Analyzes task descriptions for complexity indicators
- **Backend/Frontend:** Detects backend work that needs delegation
- **Security Flags:** Identifies security-critical features

---

## Token & Time Savings

### Direct Mode (Mode A)
- **Token Savings:** 70-80% vs Thorough
- **Time Savings:** 3-4x faster
- **Best For:** Phase 3 (Microinteractions & Polish)

**Example:** Phase 3 of Innovation Implementation
- Thorough mode: 5-7 days, ~150K tokens
- Direct mode: 1-2 days, ~30-40K tokens

### Selective Mode (Mode B)
- **Token Savings:** 40-50% vs Thorough
- **Time Savings:** 2x faster
- **Best For:** Phase 4 (3D Emotion Galaxy)

**Example:** Phase 4 with mixed complexity
- Thorough mode: 14-20 days, ~400K tokens
- Selective mode: 7-10 days, ~200-240K tokens

---

## Migration Guide

### For Existing Specs

1. **Assess Current Phase:**
   - Phases already complete: No changes needed
   - Phases in progress: Can switch modes mid-spec

2. **Create Workflow Config:**
   ```bash
   # Create workflow-config.yml for your spec
   touch agent-os/specs/{spec-id}/planning/workflow-config.yml
   ```

3. **Set Per-Phase Modes:**
   ```yaml
   phases:
     phase_3:
       mode: direct
       reason: "UI polish work - straightforward"
   ```

4. **Run Implementation:**
   ```bash
   /agent-os:implement-spec --phase=3
   ```

### Backward Compatibility

- Existing `task-assignments.yml` files remain valid
- If `workflow-config.yml` is absent, defaults to `config.yml` setting
- Old specs use thorough mode by default (safe default)

---

## Recommendations by Project Type

### Small Projects (< 10 components)
- **Default:** Direct mode
- **Override:** Selective for backend changes
- **Use Thorough:** Security-critical features only

### Medium Projects (10-50 components)
- **Default:** Selective mode
- **Override:** Direct for UI-only polish
- **Use Thorough:** Mission-critical features

### Large Projects (50+ components)
- **Default:** Selective mode
- **Override:** Direct for microinteractions
- **Use Thorough:** Core architecture changes

---

## FAQ

### Q: Can I change modes mid-spec?
**A:** Yes! Each phase can use a different mode via `workflow-config.yml`.

### Q: Will direct mode sacrifice quality?
**A:** No. Direct mode still follows all coding standards, runs lints/tests, and maintains WCAG AA compliance. It just skips the multi-agent overhead for straightforward work.

### Q: When should I use thorough mode?
**A:** For mission-critical features, complex 3D work, security-sensitive code, or when regulatory compliance is required.

### Q: How does auto-select work?
**A:** It analyzes task descriptions for keywords like "3D", "database", "API", "security" and selects the appropriate mode automatically.

### Q: Can I override auto-selection?
**A:** Yes. Use `--mode=direct|selective|thorough` flag to force a specific mode.

---

## Support

For questions or issues with workflow modes:
1. Check `implementation-modes.yml` for mode definitions
2. Review your spec's `workflow-config.yml`
3. Check `config.yml` for global defaults
4. Open an issue in the agent-os repository

---

**Happy implementing! 🚀**
