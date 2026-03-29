# Auth-Gated App Testing Playbook

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.customers.insertOne({
  id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  firstName: 'Test',
  lastName: 'User',
  picture: 'https://via.placeholder.com/150',
  authProvider: 'google',
  created_at: new Date()
});
db.customer_sessions.insertOne({
  customerId: userId,
  sessionToken: sessionToken,
  expiresAt: new Date(Date.now() + 7*24*60*60*1000),
  createdAt: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```bash
# Test auth endpoint
curl -X GET "$API_URL/api/customer-auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Browser Testing
```javascript
// Set cookie and navigate
await page.context.add_cookies([{
    "name": "customer_session",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "your-app.com",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "None"
}]);
await page.goto("https://your-app.com/cabinet");
```

## Checklist
- [ ] Customer document has id field
- [ ] Session customerId matches customer's id
- [ ] Backend queries exclude MongoDB's _id
- [ ] /api/customer-auth/me returns customer data
- [ ] Cabinet loads without redirect
