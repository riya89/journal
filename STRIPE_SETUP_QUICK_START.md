# Stripe Setup Quick Start Guide

## ✅ What's Already Done

1. **Billing Page Created** (`src/pages/Billing.jsx`)
   - Beautiful UI showing Free and Premium plans
   - Current subscription status display
   - FAQ and payment information sections
   - Ready for Stripe integration

2. **Header Updated** (`src/components/Header.jsx`)
   - Settings menu now includes "Billing" option
   - Clicking "Billing" navigates to `/billing` page

3. **Route Added** (`src/App.js`)
   - `/billing` route configured
   - Accessible from anywhere in the app

## 🎯 Current Status

**All features are FREE right now** - No payment gates are active. The billing page is ready but shows placeholder content until you integrate Stripe.

## 📋 Next Steps to Enable Payments

### Phase 1: Stripe Account Setup (15 minutes)

1. **Create Stripe Account**
   ```
   - Go to https://stripe.com
   - Sign up for a free account
   - Verify your email
   - Complete business information
   ```

2. **Get API Keys**
   ```
   - Go to Stripe Dashboard → Developers → API Keys
   - Copy "Publishable key" (starts with pk_test_...)
   - Copy "Secret key" (starts with sk_test_...)
   - Keep these secure!
   ```

3. **Create Products in Stripe**
   ```
   - Go to Stripe Dashboard → Products
   - Click "Add Product"
   
   Product 1: Premium Monthly
   - Name: "Raindrop Journal Premium"
   - Description: "Monthly subscription"
   - Price: $9.99
   - Billing: Recurring monthly
   - Copy the Price ID (starts with price_...)
   
   Product 2: Premium Yearly (Optional)
   - Name: "Raindrop Journal Premium Yearly"
   - Description: "Annual subscription"
   - Price: $99
   - Billing: Recurring yearly
   - Copy the Price ID
   ```

### Phase 2: Install Dependencies (5 minutes)

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

### Phase 3: Environment Variables (5 minutes)

Create `.env` file in project root:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

Create `.env.local` for backend (if using Firebase Functions):
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Phase 4: Update Billing Page (10 minutes)

Replace the placeholder Price ID in `src/pages/Billing.jsx`:

```javascript
// Line 38 - Replace this:
priceId: 'price_xxxxxxxxxxxxx',

// With your actual Stripe Price ID:
priceId: 'price_1234567890abcdef',
```

### Phase 5: Backend Setup (1-2 hours)

Choose one of these options:

#### Option A: Firebase Stripe Extension (Easiest - Recommended)
```
1. Go to Firebase Console
2. Navigate to Extensions
3. Install "Run Payments with Stripe"
4. Configure with your Stripe API keys
5. Follow the extension setup wizard
```

#### Option B: Manual Firebase Functions
```
1. Set up Firebase Functions
2. Copy code from PAYMENT_BILLING_INTEGRATION_GUIDE.md
3. Deploy functions
4. Set up webhooks
```

### Phase 6: Create Stripe Context (30 minutes)

Create `src/contexts/StripeContext.jsx` using the code from `PAYMENT_BILLING_INTEGRATION_GUIDE.md` (lines 200-280).

Update `src/App.js` to wrap with StripeProvider:
```javascript
import { StripeProvider } from './contexts/StripeContext';

export default function App() {
  return (
    <AuthProvider>
      <StripeProvider>
        <AppContent />
      </StripeProvider>
    </AuthProvider>
  );
}
```

### Phase 7: Implement Checkout (30 minutes)

Update the `handleSubscribe` function in `src/pages/Billing.jsx`:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const handleSubscribe = async (priceId) => {
  if (!currentUser) {
    navigate('/login');
    return;
  }

  if (!priceId) return;

  setLoading(true);
  try {
    const functions = getFunctions();
    const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
    
    const { data } = await createCheckoutSession({
      priceId: priceId,
      successUrl: `${window.location.origin}/billing?success=true`,
      cancelUrl: `${window.location.origin}/billing`,
    });

    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to start checkout. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### Phase 8: Test Payment Flow (15 minutes)

1. **Use Stripe Test Cards**
   ```
   Success: 4242 4242 4242 4242
   Decline: 4000 0000 0000 0002
   Any future expiry date
   Any 3-digit CVC
   ```

2. **Test Flow**
   ```
   1. Click "Upgrade to Premium"
   2. Fill in test card details
   3. Complete checkout
   4. Verify redirect to success page
   5. Check subscription status updates
   ```

3. **Check Stripe Dashboard**
   ```
   - Go to Stripe Dashboard → Payments
   - Verify test payment appears
   - Check customer was created
   - Verify subscription is active
   ```

## 🔒 Making Features Paid (When Ready)

When you want to gate features behind payment, use the guide in `HOW_TO_MAKE_FEATURES_PAID.md`.

Example - Make AI Assistant premium:
```javascript
// src/pages/AIAssistant.jsx
import FeatureGate from '../components/FeatureGate';

export default function AIAssistant() {
  return (
    <FeatureGate feature="ai_assistant">
      {/* Your AI Assistant content */}
    </FeatureGate>
  );
}
```

## 📊 Current Billing Page Features

✅ **Already Working:**
- Beautiful responsive design
- Free and Premium plan comparison
- Current plan display
- FAQ section
- Payment information
- Mobile-friendly layout
- Dark/Light theme support

⏳ **Needs Stripe Integration:**
- Actual checkout process
- Subscription status from Stripe
- Customer portal access
- Payment processing
- Webhook handling

## 🎨 Customization

### Change Pricing
Edit `src/pages/Billing.jsx` line 15-50 to modify:
- Plan names
- Prices
- Features list
- Button text

### Add Annual Plan
Add a third plan object in the `plans` array:
```javascript
{
  name: 'Premium Yearly',
  price: '$99',
  period: 'year',
  features: [...],
  priceId: 'price_your_yearly_id',
  popular: false,
}
```

### Modify Colors
The billing page uses your existing theme colors:
- Light theme: Sage greens and beige
- Dark theme: Warm browns and beige

## 🚀 Going Live

Before accepting real payments:

1. **Switch to Live Keys**
   ```
   - Get live API keys from Stripe Dashboard
   - Update .env with pk_live_... and sk_live_...
   - Update Firebase Functions config
   ```

2. **Activate Stripe Account**
   ```
   - Complete business verification
   - Add bank account for payouts
   - Set up tax settings
   ```

3. **Update Webhook URL**
   ```
   - Point to production URL
   - Test webhook delivery
   ```

4. **Legal Requirements**
   ```
   - Add Terms of Service
   - Add Privacy Policy
   - Add Refund Policy
   - Display clearly on billing page
   ```

## 📞 Support

- **Stripe Documentation**: https://stripe.com/docs
- **Firebase Stripe Extension**: https://firebase.google.com/products/extensions/stripe-firestore-stripe-payments
- **Test Cards**: https://stripe.com/docs/testing

## 🎯 Summary

**Right Now:**
- Billing page is live at `/billing`
- Accessible from Settings → Billing in header
- Shows pricing plans and information
- All features remain free

**To Enable Payments:**
1. Create Stripe account (15 min)
2. Install dependencies (5 min)
3. Add environment variables (5 min)
4. Set up backend (1-2 hours)
5. Test with test cards (15 min)

**Total Time to Full Integration:** 2-3 hours

The foundation is ready - you just need to connect Stripe when you're ready to start charging!
