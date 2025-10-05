import React from 'react';
import { 
  CheckIcon, 
  StarIcon, 
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  CheckIcon as CheckIconSolid, 
  StarIcon as StarIconSolid 
} from '@heroicons/react/24/solid';

const PricingPage = () => {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for occasional parkers',
      icon: MapPinIcon,
      color: 'gray',
      popular: false,
      features: [
        { text: 'Up to 5 free reservations per month', included: true },
        { text: 'Basic parking lot search', included: true },
        { text: 'Limited to first 3 search results', included: true },
        { text: 'Standard booking priority', included: true },
        { text: 'Basic customer support', included: true },
        { text: 'Email notifications', included: true },
        { text: 'Priority queue access', included: false },
        { text: 'Advanced search filters', included: false },
        { text: 'Unlimited search results', included: false },
        { text: '24/7 premium support', included: false },
        { text: 'Analytics dashboard', included: false },
        { text: 'API access', included: false }
      ],
      cta: 'Get Started Free',
      ctaColor: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      name: 'Go',
      price: '₹199',
      period: 'per month',
      description: 'Great for regular parkers and small businesses',
      icon: ClockIcon,
      color: 'indigo',
      popular: true,
      features: [
        { text: 'Unlimited free reservations', included: true },
        { text: 'Advanced parking lot search', included: true },
        { text: 'All search results visible', included: true },
        { text: 'Priority booking queue', included: true },
        { text: 'Priority customer support', included: true },
        { text: 'Email & SMS notifications', included: true },
        { text: 'Advanced search filters', included: true },
        { text: 'Booking history & analytics', included: true },
        { text: 'Favorite locations sync', included: true },
        { text: 'Early access to new features', included: true },
        { text: 'Vendor analytics dashboard', included: false },
        { text: 'API access', included: false }
      ],
      cta: 'Start Go Plan',
      ctaColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      name: 'Zap',
      price: '₹499',
      period: 'per month',
      description: 'Everything you need for enterprise parking management',
      icon: BoltIcon,
      color: 'purple',
      popular: false,
      features: [
        { text: 'Everything in Go plan', included: true },
        { text: 'Unlimited parking lot listings (vendors)', included: true },
        { text: 'Advanced vendor analytics dashboard', included: true },
        { text: 'Revenue projections & insights', included: true },
        { text: '24/7 premium support', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'API access with higher limits', included: true },
        { text: 'White-label solutions', included: true },
        { text: 'Advanced reporting tools', included: true },
        { text: 'Multi-location management', included: true },
        { text: 'Priority technical support', included: true },
        { text: 'Custom feature development', included: true }
      ],
      cta: 'Go Enterprise',
      ctaColor: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const features = [
    {
      icon: MapPinIcon,
      title: 'Smart Location Finding',
      description: 'AI-powered search helps you find the perfect parking spot based on your preferences and real-time availability.'
    },
    {
      icon: ClockIcon,
      title: 'Real-time Availability',
      description: 'Get instant updates on parking availability and book your spot in advance to save time.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payments',
      description: 'All transactions are protected with bank-grade security and multiple payment options.'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Insights',
      description: 'Track your parking patterns and get insights to optimize your parking experience.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto">
              Choose the perfect plan for your parking needs. Upgrade or downgrade at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                  plan.popular 
                    ? 'ring-2 ring-indigo-500 shadow-indigo-500/25 scale-105' 
                    : 'hover:shadow-xl'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <StarIconSolid className="h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                      plan.color === 'gray' ? 'bg-gray-100' :
                      plan.color === 'indigo' ? 'bg-indigo-100' :
                      'bg-purple-100'
                    }`}>
                      <IconComponent className={`h-8 w-8 ${
                        plan.color === 'gray' ? 'text-gray-600' :
                        plan.color === 'indigo' ? 'text-indigo-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 mt-2">{plan.description}</p>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-1">/{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          feature.included 
                            ? 'bg-green-100' 
                            : 'bg-gray-100'
                        }`}>
                          {feature.included ? (
                            <CheckIconSolid className="h-3 w-3 text-green-600" />
                          ) : (
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                        <span className={`ml-3 text-sm ${
                          feature.included 
                            ? 'text-gray-700' 
                            : 'text-gray-400'
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${plan.ctaColor}`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose ParkEasy?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built for the modern parking experience with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
                    <IconComponent className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll be billed pro-rata.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What happens if I exceed my Free plan limits?
              </h3>
              <p className="text-gray-600">
                Once you reach your monthly reservation limit on the Free plan, you'll be prompted to upgrade to continue booking. Your existing reservations remain valid.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a long-term commitment?
              </h3>
              <p className="text-gray-600">
                No long-term contracts required. All plans are month-to-month, and you can cancel anytime without penalties.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer enterprise solutions?
              </h3>
              <p className="text-gray-600">
                Yes! Our Zap plan includes enterprise features, and we offer custom solutions for large organizations. Contact our sales team for details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;