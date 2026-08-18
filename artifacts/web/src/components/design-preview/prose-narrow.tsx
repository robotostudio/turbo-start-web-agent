// Direction: Narrow — tighter measure and denser type via `prose-sm`, driven
// by @tailwindcss/typography. The plugin's own --tw-prose-* variables are
// remapped to our design tokens in globals.css, so this inherits the
// project's theme instead of the plugin's default greys.
export function ProseNarrow() {
  return (
    <section className="font-sans">
      <div className="page-inset py-20 sm:py-28">
        <div className="prose prose-sm max-w-2xl">
          <h1>Why Harbour reads from Markdown, not a database</h1>
          <p>
            Most agency templates start with a CMS integration and spend the next six months working
            around it — schema migrations, staging environments, a login your client forgets the
            password to. Harbour skips that step. Every page is a Markdown file with a handful of
            Block components inside it, and the whole site is just files in a folder.
          </p>
          <h2>What changes when content lives in git</h2>
          <p>
            A Markdown file is legible to a person, a build system, and an AI agent all at the same
            time. That last part matters more than it used to: your client&apos;s team can now edit
            copy directly through whatever agent they already use — Claude, ChatGPT, or a plain code
            editor — without learning a CMS or waiting on a developer to open a pull request.
          </p>
          <h3>The trade-off, stated plainly</h3>
          <p>
            You lose a visual editor and a media library with automatic image optimization baked in.
            For a marketing site with a dozen pages and a handful of blog posts, that trade is worth
            making. For a catalog with ten thousand SKUs, it is not — use a real CMS for that.
          </p>
          <ul>
            <li>No database to provision, back up, or migrate.</li>
            <li>Content reviews happen as pull requests, with a real diff.</li>
            <li>Rolling back a bad edit is a git revert, not a support ticket.</li>
          </ul>
          <h2>How the block system fits in</h2>
          <p>
            Content and layout are separated on purpose. A page is a sequence of Block references —{" "}
            <code>Hero</code>, <code>CTA</code>, and the ones your team adds later — each one
            validated against a schema at build time. Swap the order, delete a section, or add a new
            one; the build fails loudly if a Block gets props it doesn&apos;t understand, instead of
            failing quietly in production.
          </p>
          <ol>
            <li>Write the copy in Markdown, referencing Blocks by name.</li>
            <li>The build validates every Block&apos;s props against its schema.</li>
            <li>Deploy — the same page renders identically for every visitor.</li>
          </ol>
          <blockquote>
            <p>
              The best content model is the one your client&apos;s marketing team can use without
              calling you first.
            </p>
          </blockquote>
          <p>
            If you want the full picture, read the <a href="/about">architecture notes</a> or skim
            the <a href="/blocks-gallery">block registry</a> — both link out from the{" "}
            <strong>About</strong> page. Clone the repository, edit{" "}
            <code>content/pages/home.mdx</code>, and open a pull request. That&apos;s the whole
            workflow.
          </p>
        </div>
      </div>
    </section>
  );
}
