# Contact form web app

Google Apps Script web app for the omun.net contact form. The inbox that receives messages is a script property. Do not put that address in the page, in `js/`, or in a response from the script.

This is a new deployment. Do not reuse the Spectrum Patronum `/exec` URL. That deployment delivers mail to the Spectrum inbox.

## Deploy

`formEndpoint` in `js/config.js` already points at the deployed web app.

1. Open [Google Apps Script](https://script.google.com) while signed in to a Google account Omun controls. Do not use the Spectrum Patronum account. `MailApp` sends as the account you deploy with. The messages are delivered to the script property below, so that Google account does not have to be the inbox itself.
2. Create a project and replace the default script with `Code.gs` from this folder.
3. In the Apps Script editor, open **Project settings** and add **Script properties**:
   - `RECIPIENT`: the inbox that should receive messages. Set it only here. Do not write that address in this repository, the page, or the script.
   - `SHARED_SECRET` (optional): if this is set, each request must include the same value as `formToken` in `js/config.js`. The page source is public, so this only stops clients that never read the script.
   - `ALLOWED_ORIGINS` (optional): `https://omun.net,https://www.omun.net`. The page sends `location.origin`.
4. Choose **Deploy**, then **New deployment**. Click the gear, choose **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
     (older editors call this "Anyone, even anonymous")
5. Authorize sending mail when Google asks. The script runs as the account you deploy with and only sends email. It does not write the message to a spreadsheet, Drive, or anywhere else.
6. Copy the web app URL that ends in `/exec` into `formEndpoint` in `js/config.js` if a new deployment has a different URL.

After editing `Code.gs`, open **Deploy**, **Manage deployments**, edit the web app, and select **New version**. That keeps the same `/exec` URL. You redeploy the script yourself; this repository does not deploy it.

The site stores nothing. Each accepted message is mailed to `RECIPIENT`, with the visitor's address as reply-to. The subject starts with `[Omun]` and the sender's name. The body says the message came from the website contact form and includes the fields, the page language, and the time in Europe/Madrid. Uploaded files are attachments on that email, not links.

The page posts JSON as `text/plain`, so the browser does not send a CORS preflight. Apps Script answers with a redirect. The page follows it and reads `{"ok":true}` or `{"ok":false,"error":"..."}`. The error is a short code (`wait`, `rate`, `busy`, `size`, `too_large`, `invalid`, or `server`). The response does not include an inbox address.

Limits, checked on the raw file bytes: each file and the whole submission must be at most 18 MB. The request body cap is 30 MB so the base64 form of an 18 MB file still fits. Images, video (including mp4) and PDF are accepted only when both the type and the extension match. The message is limited to 4000 characters. Surname and phone may be empty. If `MailApp.getRemainingDailyQuota()` is 0, the script returns `busy` and sends nothing. If `sendEmail` throws because the message is too large, it returns `too_large`. Work stops with `busy` if it runs past five and a half minutes, inside Apps Script's six-minute limit.

Spam checks, with no third-party captcha: a honeypot field named `company`, a minimum of about 3 seconds between opening the form and sending, and CacheService counters (not Script Properties) of about 5 messages per hour for the same visitor address and about 100 per hour overall.

`MailApp` sends as the deploying account. Consumer Google accounts can send on the order of 100 messages a day. When that quota is used up, the visitor is asked to try again later. Nothing is kept on the site.

Opening the `/exec` URL in a browser runs `doGet` and returns `{"ok":true}`. That check does not show the script properties.
