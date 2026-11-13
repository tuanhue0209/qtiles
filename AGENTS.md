<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Product rows (name, price, size, photo) live in the `products` table and are read through src/lib/products.query.ts, so one edit shows on every page; categories live in the `categories` table and share the catalog query layer; only shop contact info stays in src/lib/catalog.ts.
- Product photos are stored in the private `gach-anh` bucket and reach the browser as short-lived signed URLs, because public buckets are blocked in this workspace.
- Only accounts holding the admin role may add, edit or delete products; the first account created on the site gets that role through the signup trigger, so it must be the shop owner's own account.
- Shared header/footer render in src/routes/__root.tsx around the Outlet; each page is its own route file with its own head().

- Category slugs remain stable when names change; product references prevent deleting a category in use.
- Product list and detail pages share the /san-pham layout; product slugs remain stable on edits to preserve links.
- Admin editing uses focused category, product and inquiry tools with database RLS enforcing manager-only writes.
