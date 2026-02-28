# Skill: new-app-delivery-flow

Use this skill to deliver a brand-new app quickly with a public URL first,
then iterate on features.

## Goal

Speed up app delivery and reduce agent drift by following a deterministic
three-phase flow.

## Flow (required default)

1. **Get URL live with placeholder first**
   - `pnpm new:app:live -- --name <app-name> [--port <43xxx>] [--hostname <host>]`
   - This scaffolds app, installs deps, writes a hello-world placeholder,
     maps tunnel, starts app, starts tunnel, and health-checks public URL.

2. **Build the real app second**
   - Replace placeholder UI with feature implementation.
   - Keep changes app-local under `apps/<app-name>`.

3. **Use advanced skills only when explicitly requested**
   - TDD skill: only if user asks for test-driven development workflow.
   - UI review skill: only if user asks for a UI review workflow.

## Port policy

- Use deterministic high ports `43000-43199`.
- Avoid `3000/3001` for shared apps.

## Notes

- This skill is about process order and speed, not specific design choices.
- If user wants a different flow, user instruction wins.
