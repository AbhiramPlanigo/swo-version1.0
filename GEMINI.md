# Project Guidelines & Rules

## Design & Motion System (Emil Kowalski / Apple Design)
For all UI design, gesture interactions, spring animations, transitions, typography, materials, and layout polish throughout this project:
- Adhere strictly to the design and motion skills in `.agents/skills/`:
  - **`apple-design`** ([.agents/skills/apple-design/SKILL.md](file:///c:/Users/ABHIRAM%20U/Downloads/student-welfare-office---christ-university/.agents/skills/apple-design/SKILL.md)): 17 core principles of fluid, interruptible, physical interfaces translated from WWDC.
  - **`animate`** ([.agents/skills/animate/SKILL.md](file:///c:/Users/ABHIRAM%20U/Downloads/student-welfare-office---christ-university/.agents/skills/animate/SKILL.md)): Step-by-step decision tree for building high-craft web animations (Motion / CSS).
  - **`emil-design-eng`** ([.agents/skills/emil-design-eng/SKILL.md](file:///c:/Users/ABHIRAM%20U/Downloads/student-welfare-office---christ-university/.agents/skills/emil-design-eng/SKILL.md)): Design engineering principles, component polish, and invisible interaction details.
  - **`review-animations`** ([.agents/skills/review-animations/SKILL.md](file:///c:/Users/ABHIRAM%20U/Downloads/student-welfare-office---christ-university/.agents/skills/review-animations/SKILL.md)): Audit & review standards for motion code quality.
  - **`improve-animations`** & **`find-animation-opportunities`**: Auditing codebases for motion enhancements.

### Core Motion & Physics Rules:
1. **Zero latency**: Respond on pointer-down.
2. **Direct manipulation**: 1:1 pointer tracking with `setPointerCapture` and grab offset awareness.
3. **Interruptibility**: Animate from presentation (live) values, never target values. Animations must be interruptible mid-flight.
4. **Spring physics**: Default to critically damped (`damping: 1.0`, `response: 0.3-0.4`). Under-damped bounce (`damping: ~0.8`) is strictly reserved for momentum flick releases.
5. **Velocity handoff & projection**: Pass release velocity to springs and project endpoints using exponential decay.
6. **Spatial consistency**: Symmetric entrance/exit paths, anchored transform origins.
7. **Materials & Depth**: Translucent chrome (`backdrop-filter: blur()`), hierarchy via weight, vibrancy over flat grays.
8. **Accessibility**: Always respect `prefers-reduced-motion` (cross-fade instead of spring/slide) and `prefers-reduced-transparency`.
