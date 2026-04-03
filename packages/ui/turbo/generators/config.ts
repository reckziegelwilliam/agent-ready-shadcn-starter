import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // Register a helper to strip leading slash from route
  plop.setHelper("stripSlash", (text: string) => text.replace(/^\//, ""));

  plop.setGenerator("feature", {
    description: "Scaffold a new feature example with spec, state matrix, prompt, and review template",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Feature name (kebab-case, e.g., settings-page):",
        validate: (input: string) => /^[a-z][a-z0-9-]*$/.test(input) || "Must be kebab-case (lowercase letters, numbers, hyphens)",
      },
      {
        type: "input",
        name: "description",
        message: "Short description:",
      },
      {
        type: "input",
        name: "route",
        message: "Route path (e.g., /settings):",
        validate: (input: string) => input.startsWith("/") || "Must start with /",
      },
    ],
    actions: [
      { type: "add", path: "{{ turbo.paths.root }}/packages/specs/{{name}}.md", templateFile: "templates/spec.md.hbs" },
      { type: "add", path: "{{ turbo.paths.root }}/packages/specs/{{name}}-states.md", templateFile: "templates/state-matrix.md.hbs" },
      { type: "add", path: "{{ turbo.paths.root }}/packages/prompts/build-{{name}}.md", templateFile: "templates/prompt.md.hbs" },
      { type: "add", path: "{{ turbo.paths.root }}/examples/{{name}}/README.md", templateFile: "templates/example-readme.md.hbs" },
      { type: "add", path: "{{ turbo.paths.root }}/examples/{{name}}/review.md", templateFile: "templates/example-review.md.hbs" },
      { type: "add", path: "{{ turbo.paths.root }}/apps/web/app/{{stripSlash route}}/page.tsx", templateFile: "templates/page.tsx.hbs" },
      { type: "add", path: "{{ turbo.paths.root }}/apps/web/components/{{name}}/index.ts", templateFile: "templates/component-index.ts.hbs" },
    ],
  });
}
