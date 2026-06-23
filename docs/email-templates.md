# Email templates

Three transactional emails rendered with React Email and sent via Nodemailer SMTP.

## Template reference

### verification-email.tsx

Triggered on user registration (`databaseHooks.user.create.after`).

| Prop | Type | Description |
|------|------|-------------|
| `user.name` | string | Recipient name |
| `user.email` | string | Recipient email |
| `url` | string | Verification link (20-min expiry) |

```
┌─────────────────────────────┐
│ ████████████████████████████ │  ← blue accent bar (h-1, bg-blue-600)
│                             │
│  ISC Auth                   │
│                             │
│  Hi {name},                 │
│                             │
│  Thanks for signing up.     │
│  Please verify your email.  │
│                             │
│       [ Verify Email ]      │  ← blue button
│                             │
│  This link expires in       │
│  20 minutes.                │
│ ─────────────────────────── │
│  ISC Auth — Integrity       │
│  Solutions                  │
└─────────────────────────────┘
```

### reset-password-email.tsx

Triggered by `emailAndPassword.sendResetPassword` callback.

| Prop | Type | Description |
|------|------|-------------|
| `user.name` | string | Recipient name |
| `user.email` | string | Recipient email |
| `url` | string | Password reset link (20-min expiry) |

Same layout as verification email but "Reset Password" button and appropriate copy.

### existing-signup-email.tsx

Triggered by `emailAndPassword.onExistingUserSignUp` callback when someone tries to register with an already-used email.

| Prop | Type | Description |
|------|------|-------------|
| `user.name` | string | Recipient name |
| `user.email` | string | Recipient email |

No button — informational only. Alerts the user of the attempt.

## Rendering pipeline

```
better-auth callback
  └─ createElement(Template, { user, url })
       └─ render(component)        # @react-email/render
            └─ smtp_transporter.sendMail({ html })
                 └─ nodemailer → SMTP server
```

Email is rendered synchronously in the auth callback. If SMTP fails, the error is logged but the auth flow continues (no retry).

## Live preview

```bash
bun run email:dev          # http://localhost:3001
```

React Email dev server watches `emails/` and shows rendered templates with PreviewProps values. Requires `@react-email/ui` — pre-installed with `bun add` (npm has peer-dep conflicts with this workspace).

## Design system

All three templates share a consistent layout:

| Element | Style |
|---------|-------|
| Background | `bg-gray-50` (light), `dark:bg-gray-950` |
| Card | `bg-white shadow-lg border border-gray-200`, `dark:bg-gray-900 dark:border-gray-800` |
| Accent bar | `h-1 bg-blue-600 rounded-t-lg` at card top |
| Brand text | `text-2xl font-bold text-gray-900 dark:text-gray-100` |
| Body text | `text-gray-700 dark:text-gray-300` |
| Button | `bg-blue-600 text-white rounded-md px-6 py-3`, `dark:bg-blue-500` |
| Footer | `text-xs text-gray-400 dark:text-gray-500` |
| Separator | `Hr border-gray-200 dark:border-gray-700` |

### Dark mode

Uses Tailwind `dark:` variants with `prefers-color-scheme` media query. The `<Head>` element is placed **inside** `<Tailwind>` so that the `dark:` class modifiers are compiled correctly by React Email's Tailwind processor.

```tsx
// Correct — Head inside Tailwind
<Tailwind>
  <Head />
  ...
</Tailwind>
```

### PreviewProps

React Email reads `PreviewProps` as a static property on the default export function — not as a named export. Each template defines it at module level:

```tsx
export default function VerificationEmail({ user, url }: Props) { ... }
VerificationEmail.PreviewProps = { user: { name: "John Doe", email: "john@example.com" }, url: "..." };
```

## SMTP configuration

Transporter in `lib/smtp.ts` reads env vars. Sender: `"ISC Auth" <Soporte@integritysolutions.com.ec>`.

For dev without real SMTP, use Ethereal Email:

```ts
const testAccount = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: { user: testAccount.user, pass: testAccount.pass },
});
// Preview URL: nodemailer.getTestMessageUrl(message)
```
