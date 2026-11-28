# CHAMPZZ branded auth emails

Supabase dashboard (project champzz) → Authentication:

1. **Emails → SMTP Settings** → enable custom SMTP
   - Sender email: `champzz@zebraish.com` · Sender name: `CHAMPZZ`
   - Host `smtp.resend.com` · Port `465` · Username `resend` · Password: a Resend API key (sending access)
2. **Emails → Templates**
   - Confirm signup → subject `Confirm your CHAMPZZ account`, body = `confirm-signup.html`
   - Reset password → subject `Reset your CHAMPZZ password`, body = `reset-password.html`
3. **URL Configuration** → Site URL `https://champzz.vercel.app`, add `https://champzz.vercel.app/**` to Redirect URLs.

Custom SMTP also lifts Supabase's built-in limit of a few emails per hour.
