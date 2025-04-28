"use client";

import React, { useState, useRef } from "react"; // Added React import
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import {
  ArrowRight,
  User,
  Calendar,
  ShieldCheck,
  FileText,
  Heart,
  Sparkles,
  Brain,
  Smile,
  Leaf,
  Check,
  MessageSquare,
} from "lucide-react";

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("individual");
  const heroRef = useRef(null);

  const features = [
    {
      title: "Professional Counseling",
      description:
        "Connect with licensed therapists specializing in various mental health areas",
      icon: <User className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      title: "Flexible Scheduling",
      description:
        "Book appointments that fit your schedule, with options for rescheduling",
      icon: <Calendar className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      title: "Secure Sessions",
      description:
        "Meet with your counselor through high-quality, confidential video calls",
      icon: <ShieldCheck className="h-6 w-6 text-blue-700" />,
      color: "bg-blue-50",
    },
    {
      title: "Self-Assessment",
      description:
        "Gain insights into your mental health with our scientifically-backed tests",
      icon: <Brain className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      title: "Personalized Care",
      description:
        "Receive tailored advice based on your unique profile and needs",
      icon: <Sparkles className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      title: "Ongoing Support",
      description: "Stay connected with your counselor between sessions",
      icon: <Heart className="h-6 w-6 text-blue-700" />,
      color: "bg-blue-50",
    },
  ];

  const testimonials = [
    {
      name: "Sarah J.",
      role: "Teacher",
      content:
        "This platform has been life-changing. The counselors are compassionate and the platform is so easy to use.",
      initials: "SJ",
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Michael R.",
      role: "Software Engineer",
      content:
        "As someone with a busy schedule, I appreciate how flexible the appointment system is.",
      initials: "MR",
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Aisha T.",
      role: "Healthcare Professional",
      content:
        "The self-assessment tools provided valuable insights that helped me understand my stress triggers.",
      initials: "AT",
      color: "bg-blue-100 text-blue-700",
    },
  ];

  const pricingData = {
    individual: [
      {
        title: "Basic",
        description: "Essential mental health resources",
        price: "Free",
        features: [
          "Self-assessment tools",
          "Personalized recommendations",
          "Community resources",
        ],
        popular: false,
        buttonText: "Get Started",
        color: "border-gray-200",
        buttonClass: "bg-gray-900 text-white hover:bg-gray-800",
      },
      {
        title: "Standard",
        description: "Comprehensive mental health support",
        price: "₹399",
        period: "/month",
        features: [
          "Everything in Basic",
          "3 counseling sessions",
          "Messaging support",
          "Progress tracking",
        ],
        popular: true,
        buttonText: "Upgrade Now",
        color: "border-blue-500 ring-2 ring-blue-500/20",
        buttonClass: "bg-blue-600 text-white hover:bg-blue-700",
      },
      {
        title: "Premium",
        description: "Complete mental health care",
        price: "₹799",
        period: "/month",
        features: [
          "Everything in Standard",
          "Unlimited sessions",
          "Priority scheduling",
          "Advanced analytics",
          "Family access",
        ],
        popular: false,
        buttonText: "Upgrade Now",
        color: "border-gray-200",
        buttonClass: "bg-gray-900 text-white hover:bg-gray-800",
      },
    ],
    family: [
      {
        title: "Family Basic",
        description: "Essential family resources",
        price: "₹999",
        period: "/month",
        features: [
          "Up to 3 family members",
          "Basic assessment tools",
          "Shared resources library",
        ],
        popular: false,
        buttonText: "Get Started",
        color: "border-gray-200",
        buttonClass: "bg-gray-900 text-white hover:bg-gray-800",
      },
      {
        title: "Family Plus",
        description: "Comprehensive family support",
        price: "₹1999",
        period: "/month",
        features: [
          "Up to 5 family members",
          "2 counseling sessions each",
          "Family therapy session",
          "Group activities",
        ],
        popular: false,
        buttonText: "Upgrade Now",
        color: "border-gray-200",
        buttonClass: "bg-gray-900 text-white hover:bg-gray-800",
      },
      {
        title: "Family Premium",
        description: "Ultimate family care",
        price: "₹2999",
        period: "/month",
        features: [
          "Unlimited family members",
          "4 sessions per member",
          "Priority scheduling",
          "Family workshops",
          "24/7 support line",
        ],
        popular: true,
        buttonText: "Upgrade Now",
        color: "border-blue-500 ring-2 ring-blue-500/20",
        buttonClass: "bg-blue-600 text-white hover:bg-blue-700",
      },
    ],
  };


  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Responsive Updates */}
      <section className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 w-[200%] h-[200%]"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
            style={{
              backgroundImage: `
                radial-gradient(circle at 30% 60%, rgba(56, 182, 255, 0.3) 0%, transparent 25%),
                radial-gradient(circle at 70% 40%, rgba(10, 147, 255, 0.4) 0%, transparent 25%),
                radial-gradient(circle at 50% 20%, rgba(0, 112, 243, 0.2) 0%, transparent 30%)
              `,
            }}
          />
        </div>

        {/* Floating 3D element - Hide on mobile */}
        <motion.div
          className="hidden md:block absolute right-4 lg:right-10 top-1/4 w-48 lg:w-64 h-48 lg:h-64 rounded-2xl bg-white shadow-xl border border-blue-100 flex items-center justify-center"
          initial={{ y: -20, rotate: -5 }}
          animate={{
            y: [0, -15, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="relative w-full h-full p-4 lg:p-6">
            <div className="absolute top-2 lg:top-4 left-2 lg:left-4 h-2 lg:h-3 w-2 lg:w-3 rounded-full bg-blue-400 animate-pulse"></div>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="h-10 lg:h-16 w-10 lg:w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-2 lg:mb-4">
                <Heart className="h-5 lg:h-8 w-5 lg:w-8 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs lg:text-sm font-medium text-gray-700">
                  Therapy Session
                </p>
                <p className="text-[10px] lg:text-xs text-gray-500">Now Available</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 text-xs sm:text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4 sm:mb-6">
              Compassionate Care
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Mental health support <br className="hidden sm:block" />
              <span className="relative inline-block">
                <span className="relative z-10">when you need it most</span>
                <span className="absolute bottom-1 left-0 w-full h-3 sm:h-4 -z-0">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 500 40"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,20 Q125,35 250,20 T500,20"
                      fill="none"
                      stroke="rgba(56, 182, 255, 0.4)"
                      strokeWidth="30"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,20 Q125,5 250,20 T500,20"
                      fill="none"
                      stroke="rgba(10, 147, 255, 0.3)"
                      strokeWidth="28"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
              Connect with licensed therapists for personalized care that fits
              your schedule and meets your unique needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700 text-white">
                  Book a Session <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                  Learn More
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Stats - Adjusted for mobile */}
          <motion.div
            className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {[
              { value: "10K+", label: "Clients Helped" },
              { value: "100+", label: "Professionals" },
              { value: "24/7", label: "Availability" },
              { value: "95%", label: "Satisfaction" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-t from-white to-transparent z-20"></div>
      </section>

      {/* Trusted By Section - Responsive */}
      <div className="bg-blue-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-blue-600 text-xs sm:text-sm uppercase tracking-wider font-medium mb-6 sm:mb-8">
            Trusted by professionals at
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-8">
            {[
              "HealthPlus",
              "Wellness Corp",
              "CareFirst",
              "MindSpace",
              "TherapyNet",
            ].map((company, index) => (
              <div
                key={index}
                className="text-center text-sm sm:text-base text-blue-700 font-medium"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section - Responsive */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <span className="inline-block px-3 py-1 text-xs sm:text-sm font-semibold text-blue-600 bg-blue-100 rounded-full mb-3 sm:mb-4">
                Our Approach
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Holistic mental health support
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                Evidence-based care designed to meet your unique needs
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div
                  className={`${feature.color} p-4 sm:p-6 rounded-lg sm:rounded-xl border border-blue-100 hover:border-blue-200 transition-all h-full flex flex-col`}
                >
                  <div
                    className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg ${feature.color} flex items-center justify-center mb-3 sm:mb-4`}
                  >
                    {feature.icon} {/* Use the icon directly */}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Responsive */}
      <section className="py-12 sm:py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <span className="inline-block px-3 py-1 text-xs sm:text-sm font-semibold text-blue-600 bg-blue-100 rounded-full mb-3 sm:mb-4">
                How It Works
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Simple steps to feeling better
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                Getting started is easy with our streamlined process
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description:
                  "Sign up in minutes and tell us about yourself to help match you with the right support.",
                icon: <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />,
                color: "bg-blue-500",
              },
              // ... (other steps)
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="relative mb-4 sm:mb-6">
                  <div
                    className={`${item.color} h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center z-10 relative shadow-md`}
                  >
                    {item.icon}
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all h-full">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 flex items-center">
                    <span
                      className={`${item.color} text-white h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-xs mr-2`}
                    >
                      {item.step}
                    </span>
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Responsive */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <span className="inline-block px-3 py-1 text-xs sm:text-sm font-semibold text-blue-600 bg-blue-100 rounded-full mb-3 sm:mb-4">
                Testimonials
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                What our clients say
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                Real stories from people who transformed their mental wellbeing
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg sm:rounded-xl shadow-md border border-blue-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div
                      className={`flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full ${testimonial.color} flex items-center justify-center font-semibold`}
                    >
                      {testimonial.initials}
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 italic">
                    "{testimonial.content}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Responsive */}
      <section className="py-12 sm:py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <span className="inline-block px-3 py-1 text-xs sm:text-sm font-semibold text-blue-600 bg-blue-100 rounded-full mb-3 sm:mb-4">
                Pricing
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Affordable care options
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                Flexible plans to support your mental health journey
              </p>
            </motion.div>
          </div>

          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="inline-flex rounded-lg bg-blue-100 p-1">
              <button
                type="button"
                className={`py-1.5 px-4 sm:py-2 sm:px-6 rounded-md transition-colors font-medium text-xs sm:text-sm ${
                  activeTab === "individual"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "bg-transparent text-blue-600 hover:bg-blue-200"
                }`}
                onClick={() => setActiveTab("individual")}
              >
                Individual
              </button>
              <button
                type="button"
                className={`py-1.5 px-4 sm:py-2 sm:px-6 rounded-md transition-colors font-medium text-xs sm:text-sm ${
                  activeTab === "family"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "bg-transparent text-blue-600 hover:bg-blue-200"
                }`}
                onClick={() => setActiveTab("family")}
              >
                Family
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto"
            >
              {pricingData[activeTab].map((plan, index) => (
                <motion.div
                  key={index}
                  className={`bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all ${plan.color} overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {plan.popular && (
                    <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 text-center">
                      Most Popular
                    </div>
                  )}
                  <div className="p-4 sm:p-6 md:p-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      {plan.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                      {plan.description}
                    </p>
                    <div className="mb-4 sm:mb-6">
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-xs sm:text-sm text-gray-600 ml-1">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <Link
                      to={plan.price === "Free" ? "/register" : "/user/upgrade"}
                      className="block"
                    >
                      <Button
                        className={`w-full py-2 px-4 rounded-md font-medium text-xs sm:text-sm ${plan.buttonClass}`}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </div>
                  <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-blue-50 border-t border-blue-100">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-3 sm:mb-4">
                      What's included:
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="ml-2 text-xs sm:text-sm text-gray-700">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section - Responsive */}
      <section className="relative py-12 sm:py-20 bg-white text-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-black text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Ready to prioritize your mental health?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
                Take the first step toward better mental health today. Our
                counselors are ready to support you on your journey to wellness.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium flex items-center justify-center gap-2">
                    Get Started <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
                <Link to="/assessment" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium">
                    Free Assessment
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;