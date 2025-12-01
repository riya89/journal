import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Billing({ theme }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Mock subscription data - will be replaced with real Stripe data later
  const [subscription] = useState({
    status: 'free',
    plan: 'Free',
    nextBillingDate: null,
  });

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
      isCurrent: subscription.plan === 'Free',
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
      priceId: 'price_xxxxxxxxxxxxx', // Will be replaced with actual Stripe Price ID
      popular: true,
      isCurrent: subscription.plan === 'Premium',
    },
  ];

  const handleSubscribe = (priceId) => {
    console.log('Button clicked! Price ID:', priceId);
    console.log('Current user:', currentUser);

    // Show custom modal instead of alert
    setShowModal(true);
  };

  const handleManageSubscription = async () => {
    alert('Stripe customer portal coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3EFE2] to-[#E6F0D1] dark:from-[#1a1410] dark:to-[#2b241c] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/60 dark:bg-white/10 border-2 border-[#cdd6c0] dark:border-[#5b4a3d] text-[#6c7a5b] dark:text-[#EBDDBF] hover:opacity-70 transition shadow-sm"
          title="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-3xl sm:text-4xl font-bold text-[#6c7a5b] dark:text-[#EBDDBF] mb-4 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
            Billing & Subscription
          </h1>
          <p className={`text-base sm:text-lg text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
            Manage your subscription and billing information
          </p>
        </div>

        {/* Current Subscription Status */}
        <div className="bg-white dark:bg-[#2b241c] rounded-2xl shadow-lg p-6 mb-8 border border-[#cdd6c0]/30 dark:border-[#5b4a3d]/30">
          <h2 className={`text-xl font-bold text-[#6c7a5b] dark:text-[#EBDDBF] mb-4 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
            Current Plan
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className={`text-2xl font-bold text-[#7A916C] dark:text-[#d4a574] ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
                {subscription.plan}
              </p>
              <p className={`text-sm text-[#6c7a5b]/70 dark:text-[#EBDDBF]/70 mt-1 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                {subscription.status === 'free' 
                  ? 'Free forever' 
                  : `Next billing: ${subscription.nextBillingDate}`}
              </p>
            </div>
            {subscription.status !== 'free' && (
              <button
                onClick={handleManageSubscription}
                className="px-6 py-2 bg-[#E6F0D1] dark:bg-[#3a2e20] text-[#6c7a5b] dark:text-[#EBDDBF] rounded-xl font-semibold hover:scale-[1.02] transition"
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold text-[#6c7a5b] dark:text-[#EBDDBF] mb-6 text-center ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
            Available Plans
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white dark:bg-[#2b241c] rounded-2xl shadow-lg p-6 sm:p-8 relative border-2 transition-all ${
                  plan.popular 
                    ? 'border-[#7A916C] dark:border-[#d4a574] scale-[1.02]' 
                    : 'border-[#cdd6c0]/30 dark:border-[#5b4a3d]/30'
                } ${plan.isCurrent ? 'ring-2 ring-[#7A916C] dark:ring-[#d4a574]' : ''}`}
              >
                {plan.popular && (
                  <div className={`absolute top-0 right-0 bg-[#7A916C] dark:bg-[#d4a574] text-white dark:text-[#1a1410] px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-semibold ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                    Most Popular
                  </div>
                )}

                {plan.isCurrent && (
                  <div className={`absolute top-0 left-0 bg-green-500 text-white px-4 py-1 rounded-tl-xl rounded-br-xl text-sm font-semibold ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                    Current Plan
                  </div>
                )}

                <h2 className={`text-2xl font-bold text-[#6c7a5b] dark:text-[#EBDDBF] mb-2 mt-2 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
                  {plan.name}
                </h2>
                <div className="mb-6">
                  <span className={`text-4xl font-bold text-[#7A916C] dark:text-[#d4a574] ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
                    {plan.price}
                  </span>
                  <span className={`text-[#6c7a5b]/70 dark:text-[#EBDDBF]/70 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                    /{plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-[#7A916C] dark:text-[#d4a574] mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={`text-sm text-[#6c7a5b] dark:text-[#EBDDBF] ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    console.log('=== BUTTON CLICKED ===');
                    console.log('Plan:', plan.name);
                    console.log('Is Current:', plan.isCurrent);
                    console.log('Price ID:', plan.priceId);
                    
                    if (plan.isCurrent) {
                      console.log('Button is for current plan, doing nothing');
                      return;
                    }
                    
                    console.log('Calling handleSubscribe...');
                    handleSubscribe(plan.priceId);
                  }}
                  disabled={plan.isCurrent}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all cursor-pointer ${theme === 'dark' ? 'font-gothic-body' : ''} ${
                    plan.popular && !plan.isCurrent
                      ? 'bg-[#7A916C] hover:bg-[#6B7A59] text-white dark:bg-[#d4a574] dark:hover:bg-[#b8956a] dark:text-[#1a1410]'
                      : 'bg-[#E6F0D1] hover:bg-[#cdd6c0] text-[#6c7a5b] dark:bg-[#3a2e20] dark:hover:bg-[#4a3a28] dark:text-[#EBDDBF]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {plan.isCurrent ? 'Current Plan' : plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white dark:bg-[#2b241c] rounded-2xl shadow-lg p-6 border border-[#cdd6c0]/30 dark:border-[#5b4a3d]/30">
          <h3 className={`text-lg font-bold text-[#6c7a5b] dark:text-[#EBDDBF] mb-4 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
            💳 Payment Information
          </h3>
          <div className={`space-y-3 text-sm text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
            <p>• All payments are securely processed through Stripe</p>
            <p>• You can cancel your subscription at any time</p>
            <p>• No hidden fees or charges</p>
            <p>• 30-day money-back guarantee</p>
            <p>• Your data is always yours, even if you cancel</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white dark:bg-[#2b241c] rounded-2xl shadow-lg p-6 border border-[#cdd6c0]/30 dark:border-[#5b4a3d]/30">
          <h3 className={`text-lg font-bold text-[#6c7a5b] dark:text-[#EBDDBF] mb-4 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
            ❓ Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div>
              <p className={`font-semibold text-[#6c7a5b] dark:text-[#EBDDBF] mb-1 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Can I switch plans later?
              </p>
              <p className={`text-sm text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Yes! You can upgrade or downgrade your plan at any time from this page.
              </p>
            </div>
            <div>
              <p className={`font-semibold text-[#6c7a5b] dark:text-[#EBDDBF] mb-1 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                What happens if I cancel?
              </p>
              <p className={`text-sm text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                You'll keep access to premium features until the end of your billing period. Your data is never deleted.
              </p>
            </div>
            <div>
              <p className={`font-semibold text-[#6c7a5b] dark:text-[#EBDDBF] mb-1 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Is there a free trial?
              </p>
              <p className={`text-sm text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                The Free plan is available forever! Try it out and upgrade when you're ready.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-[#2b241c] rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border-2 border-[#7A916C] dark:border-[#d4a574] ${theme === 'dark' ? 'font-gothic-body' : ''}`}
          >
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E6F0D1] dark:bg-[#3a2e20] mb-4">
                <span className="text-5xl">🚀</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-bold text-[#6c7a5b] dark:text-[#EBDDBF] mb-3 ${theme === 'dark' ? 'font-spooky-header' : ''}`}>
                Coming Soon!
              </h2>
              <p className={`text-base text-[#6c7a5b]/80 dark:text-[#EBDDBF]/80 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Premium features are currently in development
              </p>
            </div>

            {/* Content */}
            <div className="text-center mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className={`text-green-700 dark:text-green-300 font-semibold ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                🎉 All features are FREE for now!
              </p>
              <p className={`text-sm text-green-600 dark:text-green-400 mt-2 ${theme === 'dark' ? 'font-gothic-body' : ''}`}>
                Enjoy unlimited access while we work on payment integration
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all bg-[#7A916C] hover:bg-[#6B7A59] text-white dark:bg-[#d4a574] dark:hover:bg-[#b8956a] dark:text-[#1a1410] ${theme === 'dark' ? 'font-gothic-body' : ''}`}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
