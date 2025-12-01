# Payment & Billing Integration Guide

## Overview
This guide explains how to add payment/billing functionality to Raindrop Journal, enabling you to monetize features through subscriptions or one-time purchases.

## Table of Contents
1. [Payment Provider Options](#payment-provider-options)
2. [Recommended Approach: Stripe](#recommended-approach-stripe)
3. [Architecture Overview](#architecture-overview)
4. [Implementation Steps](#implementation-steps)
5. [Feature Gating Strategy](#feature-gating-strategy)
6. [Subscription Tiers](#subscription-tiers)
7. [Code Examples](#code-examples)

---

## Payment Provider Options

### 1. Stripe (Recommended)
**Pros:**
- Most popular and developer-friendly
- Excellent documentation
- Built-in subscription management
- Supports one-time and recurring payments
- Strong fraud protection
- Easy integration with Firebase
- Stripe Customer Portal for users to manage subscriptions

**Pricing:**
- 2.9% + $0.30 per transaction
- No monthly fees

**Best For:** Most apps, especially SaaS products

### 2. PayPal
**Pros:**
- Widely recognized brand
- Users may already have accounts
- International support

**Cons:**
- More complex API
- Less developer-friendly than Stripe

### 3. Paddle
**Pros:**
- Merchant of record (handles taxes/VAT)
- Good for global sales

**Cons:**
- Higher fees (5% + payment processing)
- Less control over checkout experience

### 4. LemonSqueezy
**Pros:**
- Merchant of record
- Simple setup
- Good for indie developers

**Cons:**
- Newer platform
- Smaller ecosystem

---

## Recommended Approach: Stripe

For Raindrop Journal, I recommend **Stripe** because:
1. Seamless Firebase integration via Stripe Extension
2. Excellent React libraries
3. Built-in subscription management
4. Customer portal for self-service
5. Webhooks for real-time updates
6. Strong security and compliance

---

## Architecture Overview

### High-Level Flow
```
User → Frontend (React) → Firebase Functions → Stripe API
                ↓                                    ↓
         Firebase Auth                        Payment Processing
                ↓                                    ↓
         Firestore (subscription status) ← Webhooks ←
```

### Key Components

1. **Frontend (React)**
   - Pricing page
   - Checkout button
   - Subscription status display
   - Feature gates

2. **Backend (Firebase Functions)**
   - Create checkout session
   - Handle webhooks
   - Verify subscription status
   - Manage customer records

3. **Database (Firestore)**
   - User subscription data
   - Payment history
   - Feature access flags

4. **Stripe**
   - Payment processing
   - Subscription management
   - Customer portal
   - Webhooks

---

## Implementation Steps

### Phase 1: Setup (1-2 hours)

#### Step 1: Create Stripe Account
1. Go to https://stripe.com
2. Sign up for account
3. Get API keys (test mode first)
4. Save keys securely

#### Step 2: Install Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
npm install stripe  # For backend
```

#### Step 3: Install Firebase Stripe Extension (Easiest Method)
1. Go to Firebase Console
2. Navigate to Extensions
3. Install "Run Payments with Stripe"
4. Configure with your Stripe API keys
5. Set up products and prices in Stripe Dashboard

**OR Manual Setup:**
- Set up Firebase Functions
- Create Stripe integration manually

---

### Phase 2: Backend Setup (2-4 hours)

#### Create Firebase Functions for Stripe

**File: `functions/stripe.js`**
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);

// Create checkout session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { priceId, successUrl, cancelUrl } = data;
  const userId = context.auth.uid;

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: context.auth.token.email,
      client_reference_id: userId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
      },
    });

    return { sessionId: session.id };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Create customer portal session
exports.createPortalSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const userId = context.auth.uid;
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const stripeCustomerId = userDoc.data()?.stripeCustomerId;

  if (!stripeCustomerId) {
    throw new functions.https.HttpsError('not-found', 'No customer found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: data.returnUrl,
  });

  return { url: session.url };
});

// Webhook handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  res.json({ received: true });
});

async function handleCheckoutComplete(session) {
  const userId = session.metadata.userId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  await admin.firestore().collection('users').doc(userId).update({
    stripeCustomerId: customerId,
    subscriptionId: subscriptionId,
    subscriptionStatus: 'active',
    plan: 'premium', // or get from session
    subscriptionStartDate: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleSubscriptionUpdate(subscription) {
  const customerId = subscription.customer;
  const userSnapshot = await admin.firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .get();

  if (!userSnapshot.empty) {
    const userId = userSnapshot.docs[0].id;
    await admin.firestore().collection('users').doc(userId).update({
      subscriptionStatus: subscription.status,
      subscriptionId: subscription.id,
    });
  }
}

async function handleSubscriptionCanceled(subscription) {
  const customerId = subscription.customer;
  const userSnapshot = await admin.firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .get();

  if (!userSnapshot.empty) {
    const userId = userSnapshot.docs[0].id;
    await admin.firestore().collection('users').doc(userId).update({
      subscriptionStatus: 'canceled',
      subscriptionEndDate: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

async function handlePaymentSucceeded(invoice) {
  // Log successful payment
  console.log('Payment succeeded:', invoice.id);
}

async function handlePaymentFailed(invoice) {
  // Handle failed payment - notify user
  console.log('Payment failed:', invoice.id);
}
```

---

### Phase 3: Frontend Setup (3-5 hours)

#### 1. Create Stripe Context

**File: `src/contexts/StripeContext.jsx`**
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from './AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StripeContext = createContext();

export function useStripe() {
  return useContext(StripeContext);
}

export function StripeProvider({ children }) {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Listen to user's subscription status
    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setSubscription({
            status: data.subscriptionStatus || 'free',
            plan: data.plan || 'free',
            customerId: data.stripeCustomerId,
          });
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const isPremium = () => {
    return subscription?.status === 'active' && subscription?.plan !== 'free';
  };

  const hasFeatureAccess = (feature) => {
    // Define feature access based on plan
    const freeFeatures = ['journal', 'basic_mood', 'basic_tasks'];
    const premiumFeatures = [
      'ai_assistant',
      'advanced_analytics',
      'time_capsule',
      'gratitude_jar',
      'unlimited_tasks',
      'export_data',
      'custom_themes',
    ];

    if (freeFeatures.includes(feature)) return true;
    if (premiumFeatures.includes(feature)) return isPremium();
    return false;
  };

  const value = {
    stripe: stripePromise,
    subscription,
    loading,
    isPremium,
    hasFeatureAccess,
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
}
```

#### 2. Create Pricing Page

**File: `src/pages/Pricing.jsx`**
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStripe } from '../contexts/StripeContext';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function Pricing() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { subscription, isPremium } = useStripe();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Daily journaling',
        'Basic mood tracking',
        'Up to 10 tasks per month',
        'Basic statistics',
        '7-day streak tracking',
      ],
      cta: 'Current Plan',
      priceId: null,
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      features: [
        'Everything in Free',
        'AI Assistant with unlimited chats',
        'Advanced mood analytics',
        'Unlimited tasks & recurring tasks',
        'Time Capsule feature',
        'Gratitude Jar',
        'Export your data',
        'Custom themes',
        'Priority support',
      ],
      cta: 'Upgrade to Premium',
      priceId: 'price_xxxxxxxxxxxxx', // Replace with actual Stripe Price ID
      popular: true,
    },
  ];

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
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`,
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

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const functions = getFunctions();
      const createPortalSession = httpsCallable(functions, 'createPortalSession');
      
      const { data } = await createPortalSession({
        returnUrl: window.location.origin + '/pricing',
      });

      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-sage-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-sage-800 dark:text-beige-100 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-sage-600 dark:text-beige-200">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 relative ${
                plan.popular ? 'ring-2 ring-sage-500 dark:ring-beige-400' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-sage-500 dark:bg-beige-400 text-white dark:text-gray-900 px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <h2 className="text-2xl font-bold text-sage-800 dark:text-beige-100 mb-2">
                {plan.name}
              </h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-sage-900 dark:text-beige-50">
                  {plan.price}
                </span>
                <span className="text-sage-600 dark:text-beige-300">
                  /{plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-sage-500 dark:text-beige-400 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sage-700 dark:text-beige-200">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() =>
                  plan.priceId
                    ? handleSubscribe(plan.priceId)
                    : null
                }
                disabled={loading || (!plan.priceId && plan.name === 'Free')}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-sage-600 hover:bg-sage-700 text-white dark:bg-beige-400 dark:hover:bg-beige-500 dark:text-gray-900'
                    : 'bg-sage-100 hover:bg-sage-200 text-sage-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-beige-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Loading...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {isPremium() && (
          <div className="text-center mt-8">
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="text-sage-600 dark:text-beige-300 hover:underline"
            >
              Manage Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 3. Create Feature Gate Component

**File: `src/components/FeatureGate.jsx`**
```javascript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe } from '../contexts/StripeContext';

export default function FeatureGate({ feature, children, fallback }) {
  const navigate = useNavigate();
  const { hasFeatureAccess, loading } = useStripe();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasFeatureAccess(feature)) {
    return (
      fallback || (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-sage-800 dark:text-beige-100 mb-4">
            Premium Feature
          </h2>
          <p className="text-sage-600 dark:text-beige-300 mb-6">
            Upgrade to Premium to unlock this feature
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-sage-600 hover:bg-sage-700 text-white dark:bg-beige-400 dark:hover:bg-beige-500 dark:text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            View Plans
          </button>
        </div>
      )
    );
  }

  return children;
}
```

---

### Phase 4: Integration (2-3 hours)

#### Update App.js to include Stripe Provider

```javascript
import { StripeProvider } from './contexts/StripeContext';

function App() {
  return (
    <AuthProvider>
      <StripeProvider>
        {/* Your app routes */}
      </StripeProvider>
    </AuthProvider>
  );
}
```

#### Add Pricing Route

```javascript
import Pricing from './pages/Pricing';

// In your routes
<Route path="/pricing" element={<Pricing />} />
```

#### Gate Premium Features

```javascript
// Example: AI Assistant
import FeatureGate from '../components/FeatureGate';

export default function AIAssistant() {
  return (
    <FeatureGate feature="ai_assistant">
      {/* Your AI Assistant component */}
    </FeatureGate>
  );
}
```

---

## Feature Gating Strategy

### Free Tier Features
- ✅ Daily journaling (unlimited)
- ✅ Basic mood tracking
- ✅ Up to 10 tasks per month
- ✅ Basic statistics
- ✅ 7-day streak tracking
- ✅ Basic badges

### Premium Tier Features ($9.99/month)
- ✅ Everything in Free
- ✅ AI Assistant (unlimited)
- ✅ Advanced mood analytics (30/90/365 days)
- ✅ Unlimited tasks
- ✅ Recurring tasks
- ✅ Time Capsule
- ✅ Gratitude Jar
- ✅ All badges and quests
- ✅ Export data
- ✅ Custom themes
- ✅ Priority support

### Implementation Examples

**Limit Tasks for Free Users:**
```javascript
// In TaskModal.jsx
const { hasFeatureAccess } = useStripe();
const [taskCount, setTaskCount] = useState(0);

useEffect(() => {
  // Fetch user's task count for current month
  fetchMonthlyTaskCount();
}, []);

const handleAddTask = async () => {
  if (!hasFeatureAccess('unlimited_tasks') && taskCount >= 10) {
    alert('Free users can create up to 10 tasks per month. Upgrade to Premium for unlimited tasks!');
    navigate('/pricing');
    return;
  }
  // Add task logic
};
```

**Gate AI Assistant:**
```javascript
// In AIAssistant.jsx
import FeatureGate from '../components/FeatureGate';

export default function AIAssistant() {
  return (
    <FeatureGate feature="ai_assistant">
      <div className="ai-assistant-content">
        {/* AI Assistant UI */}
      </div>
    </FeatureGate>
  );
}
```

**Limit Analytics for Free Users:**
```javascript
// In MoodDashboard.jsx
const { hasFeatureAccess } = useStripe();

const availablePeriods = hasFeatureAccess('advanced_analytics')
  ? ['7', '30', '90', '365']
  : ['7']; // Free users only get 7-day view
```

---

## Subscription Tiers

### Recommended Pricing Structure

#### Option 1: Simple (Recommended for Start)
- **Free**: $0
- **Premium**: $9.99/month or $99/year (save 17%)

#### Option 2: Three-Tier
- **Free**: $0
- **Plus**: $4.99/month - Some premium features
- **Premium**: $9.99/month - All features

#### Option 3: Usage-Based
- **Free**: $0 - Limited usage
- **Premium**: $9.99/month - Unlimited

### Stripe Product Setup

1. Go to Stripe Dashboard → Products
2. Create "Premium Monthly" product
   - Price: $9.99
   - Billing: Recurring monthly
   - Copy Price ID: `price_xxxxx`
3. Create "Premium Yearly" product
   - Price: $99
   - Billing: Recurring yearly
   - Copy Price ID: `price_yyyyy`

---

## Environment Variables

Create `.env` file:
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

Backend (Firebase Functions config):
```bash
firebase functions:config:set stripe.secret_key="sk_test_xxxxxxxxxxxxx"
firebase functions:config:set stripe.webhook_secret="whsec_xxxxxxxxxxxxx"
```

---

## Testing

### Test Mode
1. Use Stripe test keys
2. Test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any CVC

### Test Scenarios
- ✅ Successful subscription
- ✅ Failed payment
- ✅ Subscription cancellation
- ✅ Subscription renewal
- ✅ Feature access after payment
- ✅ Feature restriction after cancellation

---

## Security Considerations

1. **Never expose secret keys** in frontend
2. **Validate on backend** - Always verify subscription status server-side
3. **Use webhooks** - Don't rely solely on client-side status
4. **Secure Firebase Rules** - Restrict access based on subscription
5. **Handle edge cases** - Payment failures, cancellations, refunds

### Firebase Security Rules Example
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
      
      // Only allow reading premium content if user has active subscription
      match /premium_data/{document=**} {
        allow read: if request.auth.uid == userId && 
                      get(/databases/$(database)/documents/users/$(userId)).data.subscriptionStatus == 'active';
      }
    }
  }
}
```

---

## Deployment Checklist

### Before Going Live
- [ ] Switch to Stripe live keys
- [ ] Test live payment flow
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Configure Firebase Functions for production
- [ ] Update environment variables
- [ ] Test subscription cancellation
- [ ] Test customer portal
- [ ] Set up email notifications
- [ ] Create refund policy
- [ ] Add terms of service
- [ ] Add privacy policy
- [ ] Test on mobile devices

---

## User Experience Best Practices

### 1. Clear Value Proposition
- Show what users get with Premium
- Use comparison table
- Highlight most popular plan

### 2. Smooth Upgrade Flow
- One-click upgrade from any feature
- Clear pricing information
- No hidden fees

### 3. Easy Cancellation
- Self-service via Stripe Customer Portal
- No dark patterns
- Keep access until period ends

### 4. Transparent Communication
- Email confirmations
- Payment receipts
- Renewal reminders
- Cancellation confirmations

---

## Monitoring & Analytics

### Track These Metrics
- Conversion rate (free → premium)
- Churn rate
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (LTV)
- Failed payments
- Cancellation reasons

### Tools
- Stripe Dashboard (built-in analytics)
- Google Analytics (conversion tracking)
- Firebase Analytics
- Custom dashboard in your app

---

## Support & Refunds

### Refund Policy (Example)
- 30-day money-back guarantee
- Pro-rated refunds for annual plans
- Handle via Stripe Dashboard

### Customer Support
- Email support for premium users
- FAQ page
- In-app help center
- Stripe Customer Portal for self-service

---

## Next Steps

### Immediate (Week 1)
1. Set up Stripe account
2. Install dependencies
3. Create basic pricing page
4. Implement one premium feature gate

### Short-term (Week 2-3)
1. Implement all feature gates
2. Set up webhooks
3. Test thoroughly
4. Add customer portal

### Long-term (Month 2+)
1. Analyze conversion data
2. A/B test pricing
3. Add more premium features
4. Consider annual plans
5. Implement referral program

---

## Common Issues & Solutions

### Issue: Webhook not receiving events
**Solution:** Check webhook URL in Stripe Dashboard, verify endpoint is publicly accessible

### Issue: Subscription status not updating
**Solution:** Check webhook handler, verify Firestore writes are succeeding

### Issue: Users can access premium features without paying
**Solution:** Always verify subscription status server-side, not just client-side

### Issue: Payment succeeded but user doesn't have access
**Solution:** Check webhook processing, verify user ID mapping is correct

---

## Resources

### Documentation
- Stripe Docs: https://stripe.com/docs
- Stripe React: https://stripe.com/docs/stripe-js/react
- Firebase Stripe Extension: https://firebase.google.com/products/extensions/stripe-firestore-stripe-payments

### Support
- Stripe Support: https://support.stripe.com
- Firebase Support: https://firebase.google.com/support

---

## Conclusion

Adding payments to Raindrop Journal will:
1. Generate revenue to sustain development
2. Unlock premium features for paying users
3. Create a sustainable business model
4. Allow you to provide better support

Start with the simple two-tier model (Free + Premium), test thoroughly, and iterate based on user feedback and conversion data.

The implementation is straightforward with Stripe and Firebase, and you can have a working payment system in 1-2 weeks of focused development.

