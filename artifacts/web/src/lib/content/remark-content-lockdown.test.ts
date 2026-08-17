import assert from "node:assert/strict";
import { test } from "node:test";
import { remark } from "remark";
import remarkMdx from "remark-mdx";
import { remarkContentLockdown } from "./remark-content-lockdown.ts";

const process = async (mdx: string) => {
  await remark().use(remarkMdx).use(remarkContentLockdown).process(mdx);
};

/** Velite also has a plain-markdown path (excerpt/description fields) with no
 * remark-mdx in the chain — raw HTML parses to an `html` mdast node there. */
const processMarkdown = async (md: string) => {
  await remark().use(remarkContentLockdown).process(md);
};

test("allows plain prose", async () => {
  await process("# Hello\n\nSome copy.\n");
});

test("allows a Block with literal props", async () => {
  await process('<Hero title="Hi" cta={{ label: "Go", href: "/go" }} />\n');
});

test("allows arrays of objects and nested JSX", async () => {
  await process('<FeatureGrid features={[{ title: "A" }, { title: "B" }]} />\n');
});

test("allows template strings and negative numbers", async () => {
  await process("<Stats offset={-2} note={`a b`} />\n");
});

test("rejects import statements", async () => {
  await assert.rejects(() => process('import { x } from "y";\n\n# Hi\n'), /import.*not allowed/i);
});

test("rejects export statements", async () => {
  await assert.rejects(() => process("export const x = 1;\n\n# Hi\n"), /export.*not allowed/i);
});

test("rejects function calls in props", async () => {
  await assert.rejects(() => process("<Hero title={fetchTitle()} />\n"), /CallExpression/);
});

test("rejects identifier references in props", async () => {
  await assert.rejects(() => process("<Hero title={someVariable} />\n"), /someVariable/);
});

test("rejects member access in props", async () => {
  await assert.rejects(() => process("<Hero title={process.env.SECRET} />\n"), /MemberExpression/);
});

test("rejects spread attributes", async () => {
  await assert.rejects(() => process("<Hero {...props} />\n"), /spread/i);
});

test("rejects arrow functions in props", async () => {
  await assert.rejects(() => process("<Hero onClick={() => 1} />\n"), /ArrowFunctionExpression/);
});

test("rejects code in flow expressions", async () => {
  await assert.rejects(() => process("{globalThis.alert(1)}\n"), /CallExpression/);
});

test("error messages point the agent at the schemas file", async () => {
  await assert.rejects(() => process("<Hero title={x} />\n"), /schemas\.ts/);
});

// --- Fix round 1: bypasses found by security review ---

test("rejects raw script elements", async () => {
  await assert.rejects(() => process("<script>alert(1)</script>\n"), /raw HTML/i);
});

test("rejects raw script elements with a src attribute", async () => {
  await assert.rejects(() => process('<script src="https://evil.example/x.js" />\n'), /raw HTML/i);
});

// Subjects must be CAPITALISED Block names: a lowercase tag is rejected by the
// raw-HTML-element rule first, so it would never reach the rule under test.
test("rejects dangerouslySetInnerHTML on a Block", async () => {
  await assert.rejects(
    () =>
      process('<Hero dangerouslySetInnerHTML={{ __html: "<img src=x onerror=alert(1)>" }} />\n'),
    /can inject raw HTML/,
  );
});

test("rejects javascript: URLs in JSX href attributes", async () => {
  await assert.rejects(() => process('<Hero href="javascript:alert(1)" />\n'), /only http\(s\)/);
});

test("rejects javascript: URLs in markdown links", async () => {
  await assert.rejects(() => process("[click](javascript:alert(1))\n"), /javascript/i);
});

test("rejects dotted/member JSX tag names", async () => {
  await assert.rejects(() => process("<Hero.constructor />\n"), /dotted|member/i);
});

test("rejects regex literals in props", async () => {
  await assert.rejects(() => process("<Hero x={/evil/gi} />\n"), /regular expression/i);
});

test("rejects tagged template literals in props", async () => {
  await assert.rejects(() => process("<Hero title={tag`x`} />\n"), /TaggedTemplateExpression/);
});

test("rejects identifiers inside template literal expressions", async () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal MDX source under test, not a template
  await assert.rejects(() => process("<Hero x={`a ${evil} b`} />\n"), /evil/);
});

test("rejects computed object properties", async () => {
  await assert.rejects(() => process('<Hero cta={{ ["a"+"b"]: 1 }} />\n'), /computed/i);
});

test("rejects accessor (getter) object properties", async () => {
  await assert.rejects(
    () => process("<Hero cta={{ get x() { return 1 } }} />\n"),
    /computed|accessor/i,
  );
});

test("rejects object spread in props", async () => {
  await assert.rejects(() => process("<Hero cta={{ ...a }} />\n"), /SpreadElement/);
});

test("rejects spread attributes on nested JSX inside expressions", async () => {
  await assert.rejects(
    () => process("<Hero items={[<Card {...evil} />]} />\n"),
    /JSXSpreadAttribute/,
  );
});

test("rejects code in inline text expressions", async () => {
  await assert.rejects(() => process("Hello {globalThis.alert(1)} world\n"), /CallExpression/);
});

test("allows the undefined literal identifier", async () => {
  await process("<Hero x={undefined} />\n");
});

test("allows nested capitalized Block children", async () => {
  await process('<Hero><Card title="A" /></Hero>\n');
});

test("allows relative markdown links", async () => {
  await process("[docs](/about)\n");
});

test("allows mailto markdown links", async () => {
  await process("[mail](mailto:a@b.com)\n");
});

test("allows https markdown images", async () => {
  await process("![img](https://images.unsplash.com/photo-1.jpg)\n");
});

test("allows plain markdown documents with headings, lists, and tables", async () => {
  await process(
    "# Title\n\n## Section\n\n- one\n- two\n- three\n\n| A | B |\n| - | - |\n| 1 | 2 |\n",
  );
});

// --- Fix round 4: the estree JSX walk gets the same rules as the mdast walk ---
//
// Every attack below wraps the payload in an MDX expression container `{…}`, so
// it reaches JSX through `checkExpression`'s JSXElement/JSXAttribute cases
// rather than through `checkNode`. All six were verified to compile and render
// executable output before this round.

test("rejects raw elements inside flow expressions", async () => {
  await assert.rejects(() => process("{<script>{`alert(1)`}</script>}\n"), /Raw HTML elements/);
});

test("rejects raw script src inside flow expressions", async () => {
  await assert.rejects(
    () => process('{<script src="https://evil.example/x.js" />}\n'),
    /Raw HTML elements/,
  );
});

test("rejects raw elements inside inline text expressions", async () => {
  await assert.rejects(
    () => process("Hello {<script>{`alert(1)`}</script>} world\n"),
    /Raw HTML elements/,
  );
});

test("rejects raw elements nested in a Block prop", async () => {
  await assert.rejects(
    () => process("<Hero items={[<script>{`alert(1)`}</script>]} />\n"),
    /Raw HTML elements/,
  );
});

test("rejects raw elements inside JSX fragments in expressions", async () => {
  await assert.rejects(
    () => process("{<><script>{`alert(1)`}</script></>}\n"),
    /Raw HTML elements/,
  );
});

test("rejects raw style elements inside expressions", async () => {
  await assert.rejects(
    () => process("{<style>{`body{display:none}`}</style>}\n"),
    /Raw HTML elements/,
  );
});

test("rejects dangerouslySetInnerHTML inside expressions", async () => {
  await assert.rejects(
    () =>
      process('{<div dangerouslySetInnerHTML={{ __html: "<img src=x onerror=alert(1)>" }} />}\n'),
    /Raw HTML elements/,
  );
});

test("rejects dangerouslySetInnerHTML on a Block inside expressions", async () => {
  await assert.rejects(
    () =>
      process('{<Hero dangerouslySetInnerHTML={{ __html: "<img src=x onerror=alert(1)>" }} />}\n'),
    /can inject raw HTML/,
  );
});

test("rejects srcDoc inside expressions", async () => {
  await assert.rejects(
    () => process('{<iframe srcDoc="<script>alert(1)</script>" />}\n'),
    /Raw HTML elements/,
  );
});

test("rejects srcDoc on a Block inside expressions", async () => {
  await assert.rejects(
    () => process('{<Frame srcDoc="<script>alert(1)</script>" />}\n'),
    /can inject raw HTML/,
  );
});

// --- Hyphenated and namespaced tag names (both walks) ---

test("rejects hyphenated tag names despite capitalization", async () => {
  await assert.rejects(
    () => process('<Foo-bar onclick="alert(1)">click</Foo-bar>\n'),
    /Hyphenated tag names/,
  );
});

test("rejects hyphenated tag names inside expressions", async () => {
  await assert.rejects(
    () => process('{<evil-el onclick="alert(1)">x</evil-el>}\n'),
    /Hyphenated tag names/,
  );
});

test("rejects namespaced tag names", async () => {
  await assert.rejects(
    () => process('<A:script src="https://evil.example/x.js" />\n'),
    /Namespaced tag names/,
  );
});

test("rejects namespaced tag names inside expressions", async () => {
  await assert.rejects(
    () => process('{<A:script src="https://evil.example/x.js" />}\n'),
    /plain Block names/,
  );
});

test("rejects dotted tag names inside expressions", async () => {
  await assert.rejects(() => process("{<Hero.constructor />}\n"), /plain Block names/);
});

// --- Event handler props (both walks) ---

test("rejects event handler props on a Block", async () => {
  await assert.rejects(() => process('<Hero onclick="alert(1)" />\n'), /Event handler props/);
});

test("rejects event handler props inside expressions", async () => {
  await assert.rejects(
    () => process('<Hero items={[<Card onClick="alert(1)" />]} />\n'),
    /Event handler props/,
  );
});

// --- URL checks on expression-valued attributes (both walks) ---

test("rejects javascript: URLs in string-literal expression props", async () => {
  await assert.rejects(
    () => process('<Button href={"javascript:alert(1)"} />\n'),
    /only http\(s\)/,
  );
});

test("rejects javascript: URLs in template-literal expression props", async () => {
  await assert.rejects(
    () => process("<Button href={`javascript:alert(1)`} />\n"),
    /only http\(s\)/,
  );
});

test("rejects data: URLs in expression props", async () => {
  await assert.rejects(
    () => process('<Img src={"data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="} />\n'),
    /only http\(s\)/,
  );
});

test("rejects unsafe URLs on JSX reached through expressions", async () => {
  await assert.rejects(() => process('{<Link href="javascript:alert(1)" />}\n'), /only http\(s\)/);
});

test("rejects unsafe URL expression props on JSX nested in a Block prop", async () => {
  await assert.rejects(
    () => process('<Hero items={[<Link href={"javascript:alert(1)"} />]} />\n'),
    /only http\(s\)/,
  );
});

test("URL rejections explain that the prop name is what makes it a URL", async () => {
  await assert.rejects(() => process('<Cta action="Sign up: today" />\n'), /because of its NAME/);
});

// --- Raw HTML on the plain-markdown (no remark-mdx) path ---

test("rejects raw html nodes in plain markdown", async () => {
  await assert.rejects(() => processMarkdown("<script>alert(1)</script>\n"), /Raw HTML/);
});

test("rejects inline raw html in plain markdown", async () => {
  await assert.rejects(() => processMarkdown("Hello <b onclick=alert(1)>x</b>\n"), /Raw HTML/);
});

// --- Positives that must keep passing (guards against over-tightening) ---

test("allows JSX fragments", async () => {
  await assert.doesNotReject(() => process('<>\n  <Hero title="Hi" />\n</>\n'));
});

test("allows mdx comments", async () => {
  await assert.doesNotReject(() => process("{/* a note for the next agent */}\n"));
});

test("allows Blocks with safe URL props", async () => {
  await assert.doesNotReject(() =>
    process('<Cta href="/signup" poster={"https://cdn.example/p.jpg"} />\n'),
  );
});

// --- Fix round 5: URL props fail closed, namespaced props, wider URL names ---

// NEW-6: one empty interpolation used to defeat the URL rule, because an
// unresolvable value was skipped instead of rejected.
test("rejects interpolated template URLs in props", async () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal MDX source under test, not a template
  const mdx = '<Img src={`data:text/html;base64,${""}PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==`} />\n';
  await assert.rejects(() => process(mdx), /plain literal strings/);
});

test("rejects interpolated template javascript: URLs in props", async () => {
  await assert.rejects(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal MDX source under test, not a template
    () => process('<Button href={`javascript:${""}alert(1)`} />\n'),
    /plain literal strings/,
  );
});

test("rejects interpolated template URLs on JSX inside expressions", async () => {
  await assert.rejects(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal MDX source under test, not a template
    () => process('{<Link href={`javascript:${""}x`} />}\n'),
    /plain literal strings/,
  );
});

test("rejects interpolated template URLs on JSX nested in a Block prop", async () => {
  await assert.rejects(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal MDX source under test, not a template
    () => process('<Hero items={[<Link href={`javascript:${""}x`} />]} />\n'),
    /plain literal strings/,
  );
});

// NEW-7: mdast kept namespaced prop names verbatim while estree rejected them.
test("rejects namespaced prop names", async () => {
  await assert.rejects(
    () => process('<Hero xlink:href="javascript:alert(1)" />\n'),
    /Namespaced prop names/,
  );
});

// NEW-8: URL-bearing prop names are now a heuristic superset, not five names.
test("rejects unsafe URLs in a url prop", async () => {
  await assert.rejects(() => process('<Card url="javascript:alert(1)" />\n'), /only http\(s\)/);
});

test("rejects unsafe URLs in a to prop", async () => {
  await assert.rejects(() => process('<Card to="javascript:alert(1)" />\n'), /only http\(s\)/);
});

test("rejects unsafe URLs in a name ending in Url", async () => {
  await assert.rejects(() => process('<Card imageUrl="data:text/html,x" />\n'), /only http\(s\)/);
});

test("rejects unsafe URLs in a srcSet prop", async () => {
  await assert.rejects(() => process('<Card srcSet="javascript:alert(1)" />\n'), /only http\(s\)/);
});

test("allows relative URLs in a url prop", async () => {
  await assert.doesNotReject(() => process('<Card url="/about" />\n'));
});

test("allows https URLs in a name ending in Url", async () => {
  await assert.doesNotReject(() =>
    process('<Card imageUrl="https://images.unsplash.com/p.jpg" />\n'),
  );
});

// Adjudication: `data` is not URL-bearing. The URL-carrying `data` attribute
// belongs to <object>/<embed>, which the element-name rule already rejects, so
// these Block shapes must stay available.
test("allows array data props", async () => {
  await assert.doesNotReject(() => process("<Chart data={[1, 2, 3]} />\n"));
});

test("allows arrays of objects in data props", async () => {
  await assert.doesNotReject(() => process('<Table data={[{ a: "b" }]} />\n'));
});

test("allows object data props", async () => {
  await assert.doesNotReject(() => process("<Stats data={{ total: 5 }} />\n"));
});

test("allows interpolated templates on props that are not URLs", async () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal MDX source under test, not a template
  await assert.doesNotReject(() => process('<Hero title={`Plain ${""} text`} />\n'));
});

// --- Fix round 6: URL check on nested object-property KEYS, not just
// top-level attribute names. Every link prop in this design is a nested
// object (`primary={{ label, href }}`), so the top-level rule alone
// protected almost none of the real link surface. ---

test("rejects javascript: URLs in a nested href property", async () => {
  await assert.rejects(
    () => process('<Hero primary={{ label: "x", href: "javascript:alert(1)" }} />\n'),
    /only http\(s\)/,
  );
});

test("rejects data: URLs in a nested src property", async () => {
  await assert.rejects(
    () => process('<Hero img={{ src: "data:text/html,<script>alert(1)</script>" }} />\n'),
    /only http\(s\)/,
  );
});

test("rejects javascript: URLs in a nested url property", async () => {
  await assert.rejects(
    () => process('<Hero cta={{ url: "javascript:alert(1)" }} />\n'),
    /only http\(s\)/,
  );
});

test("rejects javascript: URLs in nested properties inside an array of objects", async () => {
  await assert.rejects(
    () => process('<FeatureGrid features={[{ title: "A", href: "javascript:alert(1)" }]} />\n'),
    /only http\(s\)/,
  );
});

test("rejects javascript: URLs in a deeply nested property", async () => {
  await assert.rejects(
    () => process('<Hero a={{ b: { href: "javascript:alert(1)" } }} />\n'),
    /only http\(s\)/,
  );
});

test("rejects interpolated template URLs in a nested property (fail closed)", async () => {
  await assert.rejects(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal MDX source under test, not a template
    () => process('<Hero primary={{ href: `javascript:${""}alert(1)` }} />\n'),
    /plain literal strings/,
  );
});

test("rejects javascript: URLs in a quoted/Literal nested property key", async () => {
  await assert.rejects(
    () => process('<Hero primary={{ "href": "javascript:alert(1)" }} />\n'),
    /only http\(s\)/,
  );
});

test("allows safe relative URLs in a nested href property", async () => {
  await assert.doesNotReject(() => process('<Hero primary={{ label: "Go", href: "/go" }} />\n'));
});

test("allows safe relative URLs in a nested href property on CTA", async () => {
  await assert.doesNotReject(() =>
    process('<CTA primary={{ label: "About", href: "/about" }} />\n'),
  );
});

test("allows mailto URLs in a nested href property", async () => {
  await assert.doesNotReject(() =>
    process('<Hero primary={{ label: "Mail", href: "mailto:a@b.com" }} />\n'),
  );
});

test("allows https URLs in a nested src property", async () => {
  await assert.doesNotReject(() =>
    process('<Hero img={{ src: "https://images.unsplash.com/photo-1.jpg" }} />\n'),
  );
});

test("allows prose with a colon in a non-URL nested key", async () => {
  await assert.doesNotReject(() =>
    process('<Hero cta={{ label: "Text", title: "Not a url: colon prose" }} />\n'),
  );
});

test("allows array data props (regression guard)", async () => {
  await assert.doesNotReject(() => process("<Chart data={[1,2,3]} />\n"));
});
