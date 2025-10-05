import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ClockIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const features = [
    {
      icon: MagnifyingGlassIcon,
      title: 'Easy Search',
      description: 'Find parking spots near your destination with our smart search'
    },
    {
      icon: MapPinIcon,
      title: 'Real-time Availability',
      description: 'See live availability and book instantly with our advanced algorithm'
    },
    {
      icon: ClockIcon,
      title: 'Advance Booking',
      description: 'Reserve your parking slot up to 30 days in advance'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payment',
      description: 'Safe and secure payments with multiple payment options'
    },
    {
      icon: CurrencyRupeeIcon,
      title: 'Best Prices',
      description: 'Competitive pricing with transparent rates and no hidden charges'
    },
    {
      icon: StarIcon,
      title: 'Trusted Partners',
      description: 'Verified parking lots with high ratings and reviews'
    }
  ];

  const stats = [
    { label: 'Cities Covered', value: '50+' },
    { label: 'Parking Lots', value: '10,000+' },
    { label: 'Happy Customers', value: '1L+' },
    { label: 'Average Rating', value: '4.8' }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai',
      text: 'ParkEasy saved my time and stress. Found parking near Bandra station in seconds!',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      location: 'Delhi',
      text: 'As a vendor, listing my parking space was simple and now I earn extra income.',
      rating: 5
    },
    {
      name: 'Anjali Patel',
      location: 'Bangalore',
      text: 'Never worry about parking anymore. The app is so convenient and reliable.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Find & Book Parking
              <span className="block text-orange-400">Anywhere in India</span>
            </h1>
            
            <p className="text-xl sm:text-2xl mb-8 text-blue-100">
              Reserve your parking spot in advance. Save time, avoid hassle, park with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/search"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Find Parking Now
              </Link>
              
              <Link
                to="/vendor/register"
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                <MapPinIcon className="h-5 w-5 mr-2" />
                List Your Space
              </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ParkEasy?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make parking simple, secure, and stress-free with our innovative technology 
              and trusted network of parking partners across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow bg-gray-50"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Book your parking spot in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Search Location
              </h3>
              <p className="text-gray-600">
                Enter your destination and find available parking spots nearby
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select & Book
              </h3>
              <p className="text-gray-600">
                Choose your preferred spot, select time slot and make payment
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Park & Go
              </h3>
              <p className="text-gray-600">
                Show your booking confirmation and park hassle-free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of happy customers across India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Park Smarter?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join ParkEasy today and never worry about parking again
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Sign Up Now
            </Link>
            
            <Link
              to="/search"
              className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Find Parking
            </Link>
            
            <Link
              to="/pricing"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;