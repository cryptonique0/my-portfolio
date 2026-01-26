/**
 * THIRD-PARTY INTEGRATIONS & EXPORT GUIDE
 * Complete setup and configuration guide for all notification services and transaction exports
 */

# Third-Party Integrations & Transaction Export

## Table of Contents
1. [Overview](#overview)
2. [Slack Integration](#slack-integration)
3. [Discord Integration](#discord-integration)
4. [Twilio SMS Alerts](#twilio-sms-alerts)
5. [Push Notifications](#push-notifications)
6. [Transaction Export](#transaction-export)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Vault Guard system supports multiple notification channels to keep you informed about critical events. All notification services are built on a unified architecture that provides:

- **Automatic Retries**: Failed notifications are retried with exponential backoff
- **Error Logging**: All delivery attempts are logged for debugging
- **Service Status**: Monitor the health of each integration
- **Test Capabilities**: Send test notifications to verify configuration
- **Enable/Disable**: Toggle services on/off without reconfiguration

### Supported Notification Types

**Vault Events**
- Vault created, updated, deleted
- Guardian added/removed
- Threshold changes
- Settings updates

**Transaction Events**
- Transaction pending approval
- Approval granted/rejected
- Transaction completed/failed
- Large transaction alerts

**Security Events**
- Unusual activity detected
- New device login
- Password changed
- 2FA enabled/disabled

**Emergency Events**
- Emergency access requested
- Emergency access approved/denied
- Recovery initiated

---

## Slack Integration

### Overview
Send vault notifications to Slack channels in real-time. Supports rich message formatting with action buttons and critical alerts with @channel mentions.

### Setup Steps

#### 1. Create Slack Webhook
1. Go to [Slack App Directory](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "Vault Guard")
4. Select your workspace
5. Navigate to "Incoming Webhooks"
6. Click "Add New Webhook to Workspace"
7. Select the channel to post to
8. Copy the Webhook URL

#### 2. Configure in Vault Guard
1. Go to Settings → Notifications
2. Click on "Slack" tab
3. Paste your Webhook URL
4. (Optional) Enter channel name (e.g., #vault-alerts)
5. Toggle "Mention on Critical" for @channel alerts
6. Click "Save Configuration"
7. Click "Send Test Message" to verify

### Configuration Options

**Webhook URL** (Required)
- Format: `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`
- Where to find: Slack App → Incoming Webhooks
- Security: Keep this private - it can post to your Slack

**Channel** (Optional)
- Leave blank to use the default channel
- Format: `#channel-name` or `channel-name`
- Allows overriding the default channel per webhook

**Mention on Critical** (Enabled by default)
- Adds `<!channel>` mention to critical severity alerts
- Use for time-sensitive critical events
- Can be disabled to reduce noise

### Message Format

**Critical Alert Example:**
```
<!channel> 🔴 CRITICAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Unusual Activity Detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Severity: CRITICAL
Vault: 0x1234...cdef
Description: Multiple failed guardian approvals detected
Details:
• Event Type: unusual_activity
• Attempts: 5
[View Details Button]
⏰ 2026-01-17T15:30:00Z
```

**Standard Alert Example:**
```
🟠 HIGH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transaction Pending Approval
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Severity: HIGH
Vault: 0x1234...cdef
Description: 5 ETH withdrawal pending guardian approval
Details:
• Amount: 5 ETH
• From: 0xabcd...ef01
• Threshold: 2/3 approvals needed
[View Details Button]
⏰ 2026-01-17T14:45:00Z
```

### Troubleshooting

**"Invalid webhook"**
- Verify webhook URL is correct
- Check webhook hasn't been revoked in Slack
- Ensure it's an HTTPS URL

**Messages not appearing**
- Check that webhook channel still exists
- Verify bot permissions in channel
- Check Slack workspace hasn't disabled the app

**Missing mentions**
- Verify `<!channel>` is enabled in settings
- Check bot has permission to use mentions

---

## Discord Integration

### Overview
Send vault notifications to Discord channels with rich embed formatting, role mentions, and action buttons for critical events.

### Setup Steps

#### 1. Create Discord Webhook
1. Open Discord server settings
2. Navigate to "Integrations" → "Webhooks"
3. Click "New Webhook"
4. Name it (e.g., "Vault Guard")
5. Select target channel
6. Click "Copy Webhook URL"

#### 2. Configure in Vault Guard
1. Go to Settings → Notifications
2. Click on "Discord" tab
3. Paste your Webhook URL
4. (Optional) Enter Role ID for mentions
5. Toggle "Mention on Critical" to enable role pings
6. Click "Save Configuration"
7. Click "Send Test Message" to verify

### Configuration Options

**Webhook URL** (Required)
- Format: `https://discord.com/api/webhooks/YOUR/WEBHOOK`
- Where to find: Server Settings → Integrations → Webhooks
- Security: Keep this private - it can post to your Discord

**Role ID** (Optional)
- Get via: Enable Developer Mode in Discord → Right-click role
- Format: Numeric ID (e.g., `123456789`)
- Used for critical alert mentions

**Mention on Critical** (Enabled by default)
- Mentions specified role for critical severity alerts
- Requires valid Role ID
- Can be disabled to reduce noise

### Message Format

**Critical Alert Example:**
```
[Embed - Red color (#FF0000)]
Title: Unusual Activity Detected
Description: Multiple failed guardian approvals detected in vault

Severity: 🔴 CRITICAL
Vault: 0x1234...cdef
Event Type: unusual_activity
Attempts: 5

Footer: Vault Guard Security
Timestamp: 2026-01-17T15:30:00Z
URL: [Link to vault details]
```

### Troubleshooting

**"Invalid webhook"**
- Verify webhook URL is current
- Check webhook hasn't been deleted
- Ensure URL uses HTTPS

**Role mentions not working**
- Verify Role ID is correct
- Ensure bot has permission to mention roles
- Check role is mentionable

---

## Twilio SMS Alerts

### Overview
Receive critical vault alerts via SMS text message. Supports multiple phone numbers with validation and formatting.

### Setup Steps

#### 1. Create Twilio Account
1. Sign up at [twilio.com](https://www.twilio.com)
2. Verify your phone number
3. Navigate to "Account Info" (Dashboard)
4. Note your Account SID and Auth Token

#### 2. Get Twilio Phone Number
1. In Twilio Console, go to "Phone Numbers"
2. Click "Get a number" (or use existing)
3. Keep the phone number in E.164 format (e.g., +14155552671)

#### 3. Configure in Vault Guard
1. Go to Settings → Notifications
2. Click on "Twilio" tab
3. Enter Account SID
4. Enter Auth Token
5. Enter your Twilio phone number (From)
6. Add recipient phone numbers
7. Click "Save Configuration"
8. Click "Send Test SMS" to verify

### Configuration Options

**Account SID** (Required)
- Where to find: Twilio Console → Account Info
- Format: Starts with "AC" (e.g., ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
- Security: Keep private - allows sending SMS

**Auth Token** (Required)
- Where to find: Twilio Console → Account Info
- Keep this secure - don't share
- Can be regenerated if compromised

**From Phone Number** (Required)
- Your Twilio phone number
- Format: E.164 (+1234567890)
- Must be purchased/verified in Twilio

**Recipient Phone Numbers** (Required)
- Phones to receive alerts
- Format: E.164 (+1234567890) or 10-digit (1234567890)
- Can add multiple recipients
- Validate before saving

### Supported Alert Types

```
🔴 CRITICAL: Multiple failed guardian approvals detected (160 chars max)
🟠 HIGH: 5 ETH withdrawal pending guardian approval (160 chars max)
🟡 MEDIUM: New device login detected from IP 192.0.2.1 (160 chars max)
🔵 LOW: Vault settings were updated by guardian...
ℹ️  INFO: 2FA enabled for vault access...
```

### Message Format

SMS messages are truncated to fit within 160 characters (standard SMS limit):

```
🔴 CRITICAL: Unusual activity - 5 failed attempts. View: vault.guard/alert/123
🟠 HIGH: 5 ETH withdrawal pending. Approve: vault.guard/approve/456
```

### Recipient Management

**Add Phone Number**
1. Enter phone number (with or without +1)
2. Click "Add"
3. Phone appears in list

**Remove Phone Number**
1. Find phone in list
2. Click trash icon
3. Phone removed from recipients

**Phone Number Validation**
- Accepts: +1234567890 or 1234567890 format
- Length: 10-15 digits
- Automatically formatted to E.164

### Troubleshooting

**"Invalid Account SID or Auth Token"**
- Copy exactly from Twilio Console
- Check for leading/trailing spaces
- Verify in Twilio Console if credentials are correct

**"No phone numbers configured"**
- Add at least one recipient phone number
- Verify phone format is correct
- Click "Send Test SMS" after adding

**SMS not received**
- Verify phone number is correct
- Check SMS permissions on your phone
- Confirm Twilio account has available credits
- Check Twilio logs for delivery status

---

## Push Notifications

### Overview
Receive browser push notifications that appear even when you're not actively using the application. Requires browser permission.

### Setup Steps

#### 1. Request Permission
1. Go to Settings → Notifications
2. Click on "Push" tab
3. Click "Grant Permission"
4. Approve in browser permission dialog

#### 2. Configure Notification App Name
1. Enter app name (default: "Vault Guard")
2. This appears in push notifications
3. Click "Save Configuration"

#### 3. Send Test
1. Click "Send Test Notification"
2. Check browser notifications
3. May appear in notification center or corner

### How Push Notifications Work

**Desktop (Chrome, Firefox, Edge)**
- Appears in desktop notification center
- Requires browser permission
- Survives page refresh

**Mobile (Chrome, Firefox)**
- Appears on lock screen (if enabled)
- Requires browser permission
- May require app permission settings

### Notification Details

**Critical Alert**
```
Title: Unusual Activity Detected
Body: Multiple failed guardian approvals detected in vault
Icon: Vault Guard logo
Vibrate: [200, 100, 200, 100, 200] (urgent pattern)
Actions: [View Details] [Dismiss]
```

**Standard Alert**
```
Title: Guardian Added
Body: Alice was added as guardian to your vault
Icon: Vault Guard logo
Vibrate: [100, 100, 100]
```

### Permission Status

**Default**
- Permission not yet requested
- Click "Grant Permission" button
- Browser will ask for approval

**Granted**
- ✅ Push notifications enabled
- Notifications will be delivered
- Can revoke in browser settings

**Denied**
- ❌ Push notifications blocked
- Go to browser settings to re-enable
- Look for site permissions → Notifications

### Troubleshooting

**"Browser push notifications not supported"**
- Use Chrome, Firefox, Edge, or Safari
- Ensure browser version is current
- Check if browser disabled notifications

**Not receiving notifications**
- Verify permission is "Granted"
- Check notification center settings
- Ensure browser notifications aren't muted

**Vibration not working**
- Vibration only works on mobile devices
- Check device vibration settings
- Verify browser supports vibration API

---

## Transaction Export

### Overview
Export your vault transactions in CSV, JSON, or PDF format for record-keeping, tax preparation, and analysis.

### Supported Formats

#### CSV (Recommended for Spreadsheets)
- Open in Excel, Google Sheets, Numbers
- Comma-separated values with quoted fields
- Includes header row with column names
- Summary footer with totals
- Best for: Spreadsheet analysis, importing to accounting software

**Format:**
```
Transaction Hash,Type,Date/Time,From,To,Amount,Token,Status,Block,Gas Used,Gas Price,Fees,Description
0x1234...,DEPOSIT,2026-01-17T15:30:00Z,0xaaaa...,0xbbbb...,10.5,ETH,COMPLETED,17500000,21000,25,Initial deposit
0x5678...,WITHDRAWAL,2026-01-16T10:15:00Z,0xbbbb...,0xcccc...,5.25,ETH,COMPLETED,17500100,21000,20,Emergency withdrawal

SUMMARY
Total Transactions: 2
Completed: 2
Pending: 0
Failed: 0
```

#### JSON (Recommended for Integration)
- Structured data format
- Complete metadata included
- Summary statistics
- Array of transaction objects
- Best for: API integrations, data processing, archives

**Format:**
```json
{
  "exportDate": "2026-01-17T16:00:00Z",
  "totalCount": 2,
  "summary": {
    "total": 2,
    "completed": 2,
    "pending": 0,
    "failed": 0
  },
  "typeBreakdown": {
    "deposit": 1,
    "withdrawal": 1,
    "transfer": 0,
    "approval": 0
  },
  "transactions": [
    {
      "hash": "0x1234...",
      "type": "deposit",
      "date": "2026-01-17T15:30:00Z",
      "amount": "10.5",
      "token": "ETH",
      "status": "completed"
    }
  ]
}
```

#### PDF (Recommended for Printing)
- Human-readable report
- Summary and statistics included
- Transaction list with details
- Professional formatting
- Best for: Printing, record archives, sharing

**Includes:**
- Export date and vault address
- Summary statistics
- Transaction type breakdown
- Full transaction list
- End of report marker

### Export Options

**Include Metadata** (Checkbox)
- Adds custom metadata fields to export
- Useful for tracking custom notes
- Only available in JSON/PDF

**Date Range** (Calendar)
- Start Date: Beginning of range (inclusive)
- End Date: End of range (inclusive)
- Default: Last 30 days
- Can be customized

### Filtering Options

**Search** (Text)
- Search by transaction hash
- Search by address (from/to)
- Search by description
- Real-time filtering

**Transaction Types**
- Deposit
- Withdrawal
- Transfer
- Approval
- Can select multiple

**Status**
- Completed
- Pending
- Failed
- Rejected
- Can select multiple

### Export Process

1. **Set Format**
   - Choose CSV, JSON, or PDF
   - Check "Include Metadata" if needed

2. **Apply Filters**
   - Click "Filters" button
   - Set date range
   - Select types and statuses
   - Search for specific transactions

3. **Review Statistics**
   - See total transaction count
   - View type breakdown
   - Check date range

4. **Download**
   - Click "Download Export"
   - File automatically downloads
   - Filename includes date and vault address

### File Naming

Exports are named automatically:

```
transactions_[VAULT]_[DATE].[FORMAT]

Examples:
- transactions_ABCD_2026-01-17.csv
- transactions_ABCD_2026-01-17.json
- transactions_ABCD_2026-01-17.txt (for PDF)
```

### Use Cases

**Tax Preparation**
1. Export all transactions for tax year
2. Import CSV to accounting software
3. Categorize by transaction type
4. Calculate gains/losses

**Reconciliation**
1. Export transactions for period
2. Compare with bank/exchange records
3. Verify all transactions recorded
4. Check status of pending items

**Analysis**
1. Export to JSON format
2. Import into analysis tool
3. Create charts and reports
4. Identify patterns

**Backup**
1. Export full transaction history
2. Store securely offline
3. Keep archive of exports
4. Verify nothing missing

---

## Best Practices

### Notification Strategy

**1. Set Appropriate Severity Levels**
- **Critical**: Only for time-sensitive security events
- **High**: For important transactions and changes
- **Medium**: For informational updates
- Avoid alert fatigue by not flagging everything as critical

**2. Use Multiple Channels**
- **Slack**: For team coordination
- **Discord**: For community notifications
- **SMS**: For critical mobile alerts
- **Push**: For in-app awareness
- Redundancy ensures important alerts reach you

**3. Test Regularly**
- Send test messages to verify configuration
- Check that all channels are working
- Test with different severity levels
- Verify message formatting

**4. Monitor Delivery**
- Check service logs regularly
- Verify no integration errors
- Monitor phone number validity
- Confirm Twilio account has credits

### Transaction Export Best Practices

**1. Regular Backups**
- Export transactions monthly
- Keep archives securely
- Date all exports clearly
- Store offline copies

**2. Tax Preparation**
- Export at end of tax year
- Include all transaction types
- Export with metadata
- Keep supporting documentation

**3. Reconciliation**
- Compare exports with external sources
- Verify transaction statuses
- Check for missing transactions
- Follow up on pending items

**4. Privacy & Security**
- Keep exports secure (encrypted if stored)
- Don't share export files publicly
- Use passwords when sharing
- Delete temporary exports

---

## Troubleshooting

### Slack Issues

| Problem | Solution |
|---------|----------|
| Webhook invalid | Verify URL, check if revoked in Slack |
| Messages not appearing | Check channel exists, verify bot permissions |
| Mentions not working | Verify <!channel> in settings, check bot permissions |
| Rate limiting | Reduce notification frequency, contact Slack support |

### Discord Issues

| Problem | Solution |
|---------|----------|
| Webhook returns 401 | Webhook may be invalid/revoked, create new webhook |
| Role mentions fail | Verify role ID is correct, check bot permissions |
| Embeds malformed | Ensure data doesn't exceed field limits |
| Connection timeout | Check network, verify Discord status |

### Twilio Issues

| Problem | Solution |
|---------|----------|
| Invalid credentials | Copy exactly from Twilio Console, no spaces |
| SMS not delivered | Verify phone number, check account credits, test again |
| Rate limiting | Twilio may rate limit excessive messages |
| Phone number invalid | Use E.164 format (+1 for US numbers) |

### Push Notification Issues

| Problem | Solution |
|---------|----------|
| Permission denied | Allow in browser settings, sites → notifications |
| Not receiving notifications | Check browser notification settings, verify enabled |
| Vibration not working | Vibration only on mobile, check device settings |
| Browser not supported | Use Chrome, Firefox, Edge, or Safari |

### Export Issues

| Problem | Solution |
|---------|----------|
| Too many rows | Filter by date range, export in batches |
| Memory error | Reduce date range, export fewer transactions |
| File won't open | Verify file format, try different application |
| Metadata missing | Enable "Include Metadata" option |

---

## API Reference

### Notification Services

```typescript
// Slack
new SlackNotificationService({
  webhookUrl: 'https://hooks.slack.com/services/...',
  channel: '#notifications',
  mentionOnCritical: true,
})

// Discord
new DiscordNotificationService({
  webhookUrl: 'https://discord.com/api/webhooks/...',
  roleId: '123456789',
  mentionOnCritical: true,
})

// Twilio
new TwilioSMSService({
  accountSid: 'AC...',
  authToken: '...',
  fromNumber: '+14155552671',
  toNumbers: ['+1234567890'],
})

// Push
new PushNotificationService({
  appName: 'Vault Guard',
  appIcon: '/icon-192x192.png',
})
```

### Export Service

```typescript
// Export to CSV
const csv = TransactionExportService.exportToCSV(transactions, {
  format: 'csv',
  includeMetadata: true,
  dateRange: { start: startDate, end: endDate },
})

// Export to JSON
const json = TransactionExportService.exportToJSON(transactions, {
  format: 'json',
  includeMetadata: true,
})

// Get statistics
const stats = TransactionExportService.getStatistics(transactions)
```

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the service-specific setup guide
3. Check service status pages (Slack, Discord, Twilio)
4. Contact support with error messages and logs

