"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"
import TestimonialCard from "../components/common/TestimonialCard"
import FeatureCard from "../components/common/FeatureCard"
import { CheckIcon } from "@heroicons/react/24/outline"

const NotFoundPage = () => {
  const [activeTab, setActiveTab] = useState("individual")

  const features = [
    {
      title: "Professional Counseling",
      description: "Connect with licensed therapists specializing in various mental health areas",
      icon: "👨‍⚕️",
    },
    {
      title: "Flexible Scheduling",
      description: "Book appointments that fit your schedule, with options for rescheduling",
      icon: "📅",
    },
    {
      title: "Secure Video Sessions",
      description: "Meet with your counselor through high-quality, confidential video calls",
      icon: "🔒",
    },
    {
      title: "Self-Assessment Tools",
      description: "Gain insights into your mental health with our scientifically-backed tests",
      icon: "📝",
    },
    {
      title: "Personalized Recommendations",
      description: "Receive tailored advice based on your unique profile and needs",
      icon: "🎯",
    },
    {
      title: "Private Messaging",
      description: "Stay connected with your counselor between sessions",
      icon: "💬",
    },
  ]

  const testimonials = [
    {
      name: "Sarah J.",
      role: "Teacher",
      content:
        "MindfulCare has been life-changing. The counselors are compassionate and the platform is so easy to use. I've made tremendous progress with my anxiety in just a few months.",
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Michael R.",
      role: "Software Engineer",
      content:
        "As someone with a busy schedule, I appreciate how flexible the appointment system is. My counselor is fantastic and the video quality is excellent.",
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Aisha T.",
      role: "Healthcare Professional",
      content:
        "The self-assessment tools provided valuable insights that helped me understand my stress triggers. My counselor used these results to create a personalized plan for me.",
      image: "/placeholder.svg?height=60&width=60",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.h1
                className="text-5xl font-bold mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Your Journey to Mental Wellbeing Starts Here
              </motion.h1>
              <motion.p
                className="text-xl mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Connect with certified counselors, take self-assessment tests, and begin your path to improved mental
                health.
              </motion.p>
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Link
                  to="/register"
                  className="btn bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold"
                >
                  Get Started
                </Link>
                <Link
                  to="/assessment"
                  className="btn bg-transparent border-2 border-white hover:bg-white/10 px-6 py-3 rounded-lg font-semibold"
                >
                  Take Free Assessment
                </Link>
              </motion.div>
            </div>
            <motion.div
              className="md:w-1/2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="Mental health illustration"
                className="max-w-full rounded-lg shadow-xl"
              />
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path
              fill="#f7fafc"
              fillOpacity="1"
              d="M0,128L48,117.3C96,107,192,85,288,96C384,107,480,149,576,165.3C672,181,768,171,864,144C960,117,1056,75,1152,64C1248,53,1344,75,1392,85.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">How We Support Your Mental Health</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers comprehensive tools and services designed to improve your mental wellbeing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} title={feature.title} description={feature.description} icon={feature.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Your Path to Better Mental Health</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started is simple with our easy-to-follow process
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center md:space-x-8 mb-12">
            <div className="mb-8 md:mb-0 md:w-1/2">
              <img
                src="/placeholder.svg?height=350&width=500"
                alt="Process illustration"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2 space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-gray-900">Create Your Account</h3>
                  <p className="mt-2 text-gray-600">
                    Sign up in minutes and complete your profile to help us understand your needs.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-gray-900">Take Self-Assessment</h3>
                  <p className="mt-2 text-gray-600">
                    Complete our scientifically-backed assessment to get personalized insights.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                    3
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-gray-900">Choose Your Counselor</h3>
                  <p className="mt-2 text-gray-600">
                    Browse profiles and select a counselor that matches your preferences and needs.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                    4
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-gray-900">Begin Your Sessions</h3>
                  <p className="mt-2 text-gray-600">
                    Schedule appointments and connect with your counselor through secure video calls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works best for your mental health journey
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className={`py-2 px-4 rounded-l-md focus:outline-none ${activeTab === "individual" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("individual")}
              >
                Individual
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-r-md focus:outline-none ${activeTab === "family" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("family")}
              >
                Family
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900">Basic</h3>
                <div className="mt-4">
                  <span className="text-5xl font-extrabold text-gray-900">Free</span>
                </div>
                <p className="mt-4 text-gray-600">Essential tools to begin your mental health journey</p>
              </div>
              <div className="px-6 py-4 bg-gray-50">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">Self-assessment tests</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">Personalized recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">Community support resources</span>
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4">
                <Link
                  to="/register"
                  className="block w-full py-3 px-4 rounded-md shadow bg-indigo-600 text-white font-medium text-center hover:bg-indigo-700"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Standard Plan */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 border-2 border-indigo-600">
              <div className="bg-indigo-600 px-4 py-1 text-white text-center">
                <span className="text-sm font-medium">Most Popular</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900">Standard</h3>
                <div className="mt-4">
                  <span className="text-5xl font-extrabold text-gray-900">₹999</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="mt-4 text-gray-600">All the essentials to improve your mental health</p>
              </div>
              <div className="px-6 py-4 bg-gray-50">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">Everything in Basic</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">3 counseling sessions/month</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">Messaging with counselor</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">Progress tracking</span>
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4">
                <Link
                  to="/user/upgrade"
                  className="block w-full py-3 px-4 rounded-md shadow bg-indigo-600 text-white font-medium text-center hover:bg-indigo-700"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900">Premium</h3>
                <div className="mt-4">
                  <span className="text-5xl font-extrabold text-gray-900">₹1499</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="mt-4 text-gray-600">Comprehensive mental health care for your needs</p>
              </div>
              <div className="px-6 py-4 bg-gray-50">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">Everything in Standard</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">Unlimited counseling sessions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">Priority scheduling</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-gray-700">Family member access</span>
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4">
                <Link
                  to="/user/upgrade"
                  className="block w-full py-3 px-4 rounded-md shadow bg-indigo-600 text-white font-medium text-center hover:bg-indigo-700"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">What Our Users Say</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from people who have transformed their mental wellbeing with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                content={testimonial.content}
                image={testimonial.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Start Your Mental Health Journey Today</h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto">
              Take the first step toward better mental health. Our counselors are ready to support you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="btn bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold"
              >
                Sign Up Now
              </Link>
              <Link
                to="/assessment"
                className="btn bg-transparent border-2 border-white hover:bg-white/10 text-white px-8 py-3 rounded-lg text-lg font-semibold"
              >
                Free Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default NotFoundPage

