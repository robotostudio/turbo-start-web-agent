// Content lockdown: MDX compiles to JavaScript, so "agents may only edit
// content/" is meaningless unless content is code-free. This remark plugin runs
// inside the Velite pipeline (velite.config.ts) and fails the build when a
// content file steps outside the Compose contract:
//
//   - no `import` / `export` statements (the Block registry is injected)
//   - expressions (`{…}` in bodies and props) must be pure literals: strings,
//     numbers, booleans, arrays, objects, template strings, and nested JSX
//   - no calls, member access, identifiers, spreads, functions, or operators —
//     i.e. nothing that executes at build time
//   - JSX may only name capitalised Blocks, may not carry behaviour-bearing or
//     HTML-injecting props, and may only point at safe URLs
//
// IMPORTANT: there are two independent walks below — `checkNode` over the mdast
// (`mdxJsxFlowElement` / `mdxJsxTextElement`) and `checkExpression` over the
// estree reached through any expression container `{…}` (`JSXElement` /
// `JSXAttribute`). An attacker can reach a JSX element through either. Every
// element/prop/URL rule therefore lives in ONE shared helper
// (`checkElementName`, `checkPropName`, `checkPropUrl`) that BOTH walks call.
// Never inline a new rule into a single walk: that divergence is exactly how
// `{<script>{`alert(1)`}</script>}` survived an earlier round of fixes.
//
// Error messages are written for the authoring agent: they say what to do
// instead, because the agent's only feedback channel is the failing build.

/** Minimal structural types — the real mdast/estree types live in Velite's own
 * dependency tree and aren't resolvable from this package's node_modules. */
type EstreeNode = {
  type: string;
  [key: string]: unknown;
};

type MdastNode = {
  type: string;
  name?: string | null;
  url?: string | null;
  children?: MdastNode[];
  attributes?: Array<{
    type: string;
    name?: string;
    value?: { type?: string; data?: { estree?: EstreeNode } } | string | null;
  }>;
  data?: { estree?: EstreeNode };
  position?: unknown;
};

type VFileLike = {
  // Method syntax (not a property arrow) so unified's stricter VFile.fail
  // overloads stay assignable (methods are checked bivariantly).
  fail(reason: string, place?: unknown): never;
};

type Fail = (reason: string) => never;

const COMPOSE_HINT =
  "Content MDX is compose-only: assemble Blocks from src/lib/blocks/schemas.ts and pass props as literal values. See README.md.";

const CATALOG_HINT = "compose Blocks from src/lib/blocks/schemas.ts instead";

/** Identifiers that are values, not code. Everything else (process, fetch,
 * window, …) is banned — content has no business referencing bindings. */
const LITERAL_IDENTIFIERS = new Set(["undefined", "NaN", "Infinity"]);

/** `!` is logical negation; `+`/`-` are sign operators. All three are pure
 * (no side effects, no code execution), so all three are allowed. */
const ALLOWED_UNARY_OPERATORS = new Set(["-", "+", "!"]);

/** JSX prop names that can inject raw HTML/markup regardless of how "literal"
 * their value looks — the value is not code, but its effect is. */
const BANNED_PROP_NAMES = new Set(["dangerouslysetinnerhtml", "srcdoc"]);

/** Prop names whose values are URLs and must be scheme-checked. Deliberately a
 * heuristic superset: `isSafeUrl` is scheme-agnostic and permissive about
 * relative values, so a false positive costs one clear error message while a
 * miss costs an unchecked URL sink.
 *
 * `data` is deliberately NOT here. The URL-bearing `data` attribute belongs to
 * `<object>`/`<embed>`, both raw HTML elements that `checkElementName` already
 * rejects on both walks, so a `data` prop reaching a URL sink cannot occur —
 * while `data` is one of the most common names for an array/object prop
 * (`<Chart data={[…]} />`), where it would be a recurring false positive. */
const URL_ATTRIBUTE_NAMES = new Set([
  "href",
  "src",
  "action",
  "formaction",
  "poster",
  "url",
  "to",
  "cite",
  "ping",
  "srcset",
]);

/** …plus any prop name ending in one of these (imageUrl, backgroundHref, …). */
const URL_ATTRIBUTE_SUFFIXES = ["url", "href", "src"];

const isUrlBearingPropName = (name: string): boolean => {
  const lower = name.toLowerCase();
  if (URL_ATTRIBUTE_NAMES.has(lower)) return true;
  return URL_ATTRIBUTE_SUFFIXES.some((suffix) => lower.endsWith(suffix));
};

/** Any prop whose name starts with `on` is treated as an event handler:
 * content carries copy and structure, never behaviour. */
const EVENT_HANDLER_PROP = /^on/i;

/** mdast node types this plugin already understands. Any other MDX-introduced
 * node type (mdxJsxAttribute variants aside) is unknown syntax and must fail
 * closed rather than pass silently through the `default` branch. */
const HANDLED_MDX_NODE_TYPES = new Set([
  "mdxjsEsm",
  "mdxFlowExpression",
  "mdxTextExpression",
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
]);

const SAFE_URL_SCHEME = /^(https?|mailto|tel):/i;

/** Allowlist for URLs in content: relative/anchor/query/dot-relative paths,
 * and http(s)/mailto/tel schemes. Everything else — including
 * protocol-relative `//host` and pseudo-schemes like `javascript:` — is
 * unsafe and rejected. */
export const isSafeUrl = (value: string): boolean => {
  if (value.startsWith("//")) return false;
  if (
    value.startsWith("/") ||
    value.startsWith("#") ||
    value.startsWith("?") ||
    value.startsWith(".")
  ) {
    return true;
  }
  if (SAFE_URL_SCHEME.test(value)) return true;
  const stopIndex = value.search(/[/?#]/);
  const colonIndex = value.indexOf(":");
  if (colonIndex !== -1 && (stopIndex === -1 || colonIndex < stopIndex)) {
    return false;
  }
  return true;
};

const asNodes = (value: unknown): EstreeNode[] =>
  Array.isArray(value) ? (value.filter(Boolean) as EstreeNode[]) : [];

const asNode = (value: unknown): EstreeNode | null =>
  value && typeof value === "object" ? (value as EstreeNode) : null;

// --- Shared JSX rules, called from BOTH walks --------------------------------

/** Rule 1: which tag names content may use.
 * `null`/`undefined` means a fragment (`<>…</>`), which is always allowed. */
const checkElementName = (name: string | null | undefined, fail: Fail): void => {
  if (name === null || name === undefined) return;
  if (name.includes(".")) {
    fail(`Dotted/member tag names like "<${name}>" are not allowed in content. ${COMPOSE_HINT}`);
  }
  if (name.includes("-")) {
    // A hyphen makes the JSX compiler emit an intrinsic custom element (a
    // string tag), and React DOM forwards unknown `on*` props on custom
    // elements straight to the DOM — a live inline handler, capital or not.
    fail(
      `Hyphenated tag names like "<${name}>" are not allowed in content — they compile to custom HTML elements whose event-handler props reach the DOM. ${CATALOG_HINT}. ${COMPOSE_HINT}`,
    );
  }
  if (name.includes(":")) {
    fail(
      `Namespaced tag names like "<${name}>" are not allowed in content — they compile to arbitrary raw HTML elements. ${CATALOG_HINT}. ${COMPOSE_HINT}`,
    );
  }
  if (!/^[A-Z]/.test(name)) {
    fail(
      `Raw HTML elements like "<${name}>" are not allowed in content — ${CATALOG_HINT}. ${COMPOSE_HINT}`,
    );
  }
};

/** Rule 2: which prop names content may use. */
const checkPropName = (name: string | null | undefined, fail: Fail): void => {
  if (!name) return;
  if (BANNED_PROP_NAMES.has(name.toLowerCase())) {
    fail(`The "${name}" prop can inject raw HTML and is not permitted in content. ${COMPOSE_HINT}`);
  }
  if (name.includes(":")) {
    // mdast keeps `xlink:href` verbatim while the estree walk pre-filters to
    // JSXIdentifier — reject here so both walks agree.
    fail(
      `Namespaced prop names like "${name}" are not allowed in content — use a plain Block prop name. ${COMPOSE_HINT}`,
    );
  }
  if (EVENT_HANDLER_PROP.test(name)) {
    fail(
      `Event handler props like "${name}" are not allowed in content — this prop was rejected because of its NAME: it begins with "on", the event-handler prefix, and content carries copy and structure, never behaviour. If it is not a handler, rename it (e.g. "onboardingSteps" → "steps"). ${COMPOSE_HINT}`,
    );
  }
};

const URL_PROP_NAME_HINT =
  "is treated as a URL because of its NAME (href, src, url, to, cite, ping, srcSet, formAction, poster, and any name ending in url/href/src always are)";

/** Rule 3: URL-named props may only hold plain literal strings, and only safe
 * ones. `value` is `null` whenever the value could NOT be resolved to a plain
 * literal string — an interpolated template, a computed or non-string value, or
 * no value at all. That case FAILS: for a URL sink, "unknown" must never mean
 * "allow" (one empty interpolation would otherwise defeat the whole rule), and
 * content has no legitimate need for a computed URL. Deliberately does not try
 * to evaluate or concatenate templates — that would be a parser to keep correct
 * forever. */
const checkPropUrl = (name: string | null | undefined, value: string | null, fail: Fail): void => {
  if (!name || !isUrlBearingPropName(name)) return;
  if (value === null) {
    fail(
      `The "${name}" prop ${URL_PROP_NAME_HINT}, and URL props must be plain literal strings — interpolated templates and computed values cannot be checked. Write the full URL out literally, or rename the prop if it does not hold a URL. ${COMPOSE_HINT}`,
    );
  } else if (!isSafeUrl(value)) {
    fail(
      `URL "${value}" is not allowed — the "${name}" prop ${URL_PROP_NAME_HINT}, and only http(s), mailto, tel, and relative URLs are permitted in content. If this value is not a URL, rename the prop; if it is, use a permitted scheme. ${COMPOSE_HINT}`,
    );
  }
};

/** The literal string a value node denotes, or `null` when it is not resolvable
 * to one (interpolated template, non-string literal, computed value, absent
 * value). Callers must treat `null` as "unknown", and every URL caller treats
 * unknown as a rejection. Unwraps the Program/ExpressionStatement wrapper that
 * mdast attaches to attribute expressions, and expression containers on the
 * estree side. */
const literalStringValue = (node: EstreeNode | null): string | null => {
  if (!node) return null;
  switch (node.type) {
    case "Program": {
      const body = asNodes(node.body);
      return body.length === 1 ? literalStringValue(body[0]) : null;
    }
    case "ExpressionStatement":
      return literalStringValue(asNode(node.expression));
    case "JSXExpressionContainer":
      return literalStringValue(asNode(node.expression));
    case "Literal":
      return typeof node.value === "string" ? node.value : null;
    case "TemplateLiteral": {
      if (asNodes(node.expressions).length > 0) return null;
      const quasis = asNodes(node.quasis);
      if (quasis.length !== 1) return null;
      const cooked = asNode(quasis[0].value);
      return cooked && typeof cooked.cooked === "string" ? cooked.cooked : null;
    }
    default:
      return null;
  }
};

const failUnsafeContentUrl = (url: string, fail: Fail): never =>
  fail(
    `URL "${url}" is not allowed — only http(s), mailto, tel, and relative URLs are permitted in content. ${COMPOSE_HINT}`,
  );

// --- Walk 1: estree expressions ---------------------------------------------

/** Walk an estree fragment and throw (via fail) on anything that isn't a pure
 * literal or nested JSX. Allowlist, not blocklist: unknown node types are
 * rejected by default, so new syntax fails closed. */
const checkExpression = (node: EstreeNode, fail: Fail): void => {
  const check = (child: EstreeNode | null) => {
    if (child) checkExpression(child, fail);
  };
  /** For fields ESTree requires: a missing one means a tree shape we do not
   * understand, so it must fail rather than pass silently. */
  const checkRequired = (child: EstreeNode | null) => {
    if (child) {
      checkExpression(child, fail);
    } else {
      fail(
        `Expression is missing a required child node and cannot be verified as safe. ${COMPOSE_HINT}`,
      );
    }
  };
  switch (node.type) {
    case "Program":
      for (const statement of asNodes(node.body)) check(statement);
      return;
    case "ExpressionStatement":
      checkRequired(asNode(node.expression));
      return;
    case "Literal":
      // ESTree models /pattern/flags as a Literal with a `regex` property.
      // Regexes are non-serialisable and a ReDoS vector — reject them.
      if (node.regex) {
        fail(`Regular expression literals are not allowed in content. ${COMPOSE_HINT}`);
      }
      return;
    case "TemplateLiteral":
      for (const expression of asNodes(node.expressions)) check(expression);
      return;
    case "ArrayExpression":
      for (const element of asNodes(node.elements)) check(element);
      return;
    case "ObjectExpression":
      for (const property of asNodes(node.properties)) check(property);
      return;
    case "Property": {
      if (node.computed || node.kind !== "init") {
        fail(`Computed or accessor object properties are not allowed in content. ${COMPOSE_HINT}`);
      }
      const valueNode = asNode(node.value);
      checkRequired(valueNode);
      // Object property keys are URL sinks too — every link prop in this
      // design is a nested object (`primary={{ label, href }}`), so the
      // top-level attribute check alone would protect almost none of the
      // real link surface. Same name predicate, same safe-URL/literal-string
      // helpers as the top-level rule — see `checkPropUrl`.
      const keyNode = asNode(node.key);
      const keyName =
        keyNode && keyNode.type === "Identifier" && typeof keyNode.name === "string"
          ? keyNode.name
          : keyNode && keyNode.type === "Literal" && typeof keyNode.value === "string"
            ? keyNode.value
            : null;
      checkPropUrl(keyName, literalStringValue(valueNode), fail);
      return;
    }
    case "UnaryExpression": {
      if (!ALLOWED_UNARY_OPERATORS.has(String(node.operator))) {
        fail(`Operator "${node.operator}" is not allowed in content expressions. ${COMPOSE_HINT}`);
      }
      checkRequired(asNode(node.argument));
      return;
    }
    case "Identifier": {
      if (!LITERAL_IDENTIFIERS.has(String(node.name))) {
        fail(
          `Referencing "${node.name}" is not allowed — content expressions must be literal values (strings, numbers, arrays, objects). ${COMPOSE_HINT}`,
        );
      }
      return;
    }
    // Nested JSX inside expression props (e.g. arrays of elements) is content,
    // not code — allow it, but hold it to the same element/prop/URL rules as
    // JSX written at the mdast level, and keep checking its own expressions.
    case "JSXElement": {
      const opening = asNode(node.openingElement);
      const nameNode = opening ? asNode(opening.name) : null;
      const tagName =
        nameNode && nameNode.type === "JSXIdentifier" && typeof nameNode.name === "string"
          ? nameNode.name
          : null;
      if (tagName === null) {
        fail(`Only plain Block names are allowed as JSX tags in content. ${COMPOSE_HINT}`);
      } else {
        checkElementName(tagName, fail);
      }
      if (opening) for (const attribute of asNodes(opening.attributes)) check(attribute);
      for (const child of asNodes(node.children)) check(child);
      return;
    }
    case "JSXFragment":
      for (const child of asNodes(node.children)) check(child);
      return;
    case "JSXAttribute": {
      const value = asNode(node.value);
      // Value first, then the name rules: the value walk gives the most
      // specific diagnostic, and both always run unless one fails.
      if (value) check(value);
      const nameNode = asNode(node.name);
      const propName =
        nameNode && nameNode.type === "JSXIdentifier" && typeof nameNode.name === "string"
          ? nameNode.name
          : null;
      if (propName === null) {
        fail(`Only plain prop names are allowed on JSX in content. ${COMPOSE_HINT}`);
      } else {
        checkPropName(propName, fail);
        checkPropUrl(propName, literalStringValue(value), fail);
      }
      return;
    }
    case "JSXExpressionContainer":
      checkRequired(asNode(node.expression));
      return;
    case "JSXText":
    case "JSXEmptyExpression":
      return;
    default:
      fail(
        `"${node.type}" syntax is not allowed in content — expressions must be literal values, not code. ${COMPOSE_HINT}`,
      );
  }
};

// --- Walk 2: mdast nodes ------------------------------------------------------

/** Recurse the MDX AST, checking ESM statements, expressions, and JSX props. */
const checkNode = (node: MdastNode, file: VFileLike): void => {
  const fail: Fail = (reason: string): never => file.fail(reason, node.position);

  switch (node.type) {
    case "mdxjsEsm":
      fail(
        `\`import\`/\`export\` statements are not allowed in content — Blocks are injected from the registry, no imports needed. ${COMPOSE_HINT}`,
      );
      break;
    case "html":
      // Only reachable on the plain-markdown path (no remark-mdx in the chain,
      // e.g. Velite's excerpt/description fields). Raw HTML there is exactly
      // what this plugin exists to stop, so fail closed.
      fail(`Raw HTML is not allowed in content — ${CATALOG_HINT}. ${COMPOSE_HINT}`);
      break;
    case "mdxFlowExpression":
    case "mdxTextExpression": {
      const estree = node.data?.estree;
      if (estree) {
        checkExpression(estree, fail);
      } else {
        fail(
          `Expression is missing its parsed syntax tree and cannot be verified as safe. ${COMPOSE_HINT}`,
        );
      }
      break;
    }
    case "mdxJsxFlowElement":
    case "mdxJsxTextElement": {
      // `node.name` is null for fragments (<>…</>) — those are always allowed.
      checkElementName(node.name, fail);
      for (const attribute of node.attributes ?? []) {
        if (attribute.type === "mdxJsxExpressionAttribute") {
          fail(`Spread attributes ({...props}) are not allowed in content. ${COMPOSE_HINT}`);
        }
        const attributeName = attribute.name;
        const value = attribute.value;
        if (value && typeof value === "object" && value.type === "mdxJsxAttributeValueExpression") {
          // Value first, then the name rules — same ordering as the estree walk.
          const estree = value.data?.estree;
          if (estree) {
            checkExpression(estree, fail);
          } else {
            fail(
              `Attribute expression is missing its parsed syntax tree and cannot be verified as safe. ${COMPOSE_HINT}`,
            );
          }
          checkPropName(attributeName, fail);
          checkPropUrl(attributeName, literalStringValue(estree ?? null), fail);
        } else {
          checkPropName(attributeName, fail);
          checkPropUrl(attributeName, typeof value === "string" ? value : null, fail);
        }
      }
      break;
    }
    case "link":
    case "image":
    case "definition": {
      const url = node.url;
      if (typeof url === "string" && !isSafeUrl(url)) {
        failUnsafeContentUrl(url, fail);
      }
      break;
    }
    default:
      // Ordinary markdown nodes (paragraph, heading, list, …) reach here and
      // must pass through untouched. Only fail closed on *MDX-introduced*
      // syntax we don't already handle above — that's where code can hide.
      if (node.type.startsWith("mdx") && !HANDLED_MDX_NODE_TYPES.has(node.type)) {
        fail(`"${node.type}" MDX syntax is not allowed in content. ${COMPOSE_HINT}`);
      }
      break;
  }

  for (const child of node.children ?? []) checkNode(child, file);
};

/** Remark plugin: reject code-bearing MDX in content files. */
export const remarkContentLockdown = () => (tree: MdastNode, file: VFileLike) => {
  checkNode(tree, file);
};
