"use client"

import { Link } from "react-router-dom"
import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"
import { Heart, Shield, Users, Clock, Sparkles } from "lucide-react"

const AboutPage = () => {
  const features = [
    {
      icon: <Heart className="h-8 w-8 text-blue-600" />,
      title: "Compassionate Care",
      description: "Our team of licensed professionals provides empathetic, personalized mental health support tailored to your unique needs."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Safe & Confidential",
      description: "All sessions are completely confidential and conducted in a secure, HIPAA-compliant environment."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Experienced Professionals",
      description: "We carefully vet all counselors to ensure they meet our high standards of qualification and experience."
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Flexible Scheduling",
      description: "Book appointments that fit your schedule with our 24/7 availability and easy rescheduling options."
    },
    {
      icon: <Sparkles className="h-8 w-8 text-blue-600" />,
      title: "Holistic Approach",
      description: "We address mental health from multiple angles including therapy, self-care tools, and community support."
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About MindfulCare</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transforming mental health care through accessible, compassionate, and professional support.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="mb-12 lg:mb-0">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6">
                  At MindfulCare, we believe everyone deserves access to quality mental health care. Our mission is to break down barriers to mental health support by providing affordable, convenient, and stigma-free counseling services.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  Founded in 2023, we've helped thousands of individuals improve their mental wellbeing through our network of licensed professionals and innovative digital platform.
                </p>
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                >
                  Join Our Community
                </Link>
              </div>
              <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Team meeting" 
                  className="rounded-lg shadow-md w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose MindfulCare</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're redefining mental health care with our innovative approach
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Leadership</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Passionate professionals dedicated to your mental wellbeing
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Dr. Sarah Johnson",
                  role: "Chief Clinical Officer",
                  bio: "Licensed psychologist with 15+ years experience in cognitive behavioral therapy.",
                  img: "https://randomuser.me/api/portraits/women/44.jpg"
                },
                {
                  name: "Michael Chen",
                  role: "Founder & CEO",
                  bio: "Tech entrepreneur passionate about making mental health care accessible to all.",
                  img: "https://randomuser.me/api/portraits/men/32.jpg"
                },
                {
                  name: "Aisha Williams",
                  role: "Director of Counseling",
                  bio: "Specializes in trauma-informed care and multicultural counseling approaches.",
                  img: "https://randomuser.me/api/portraits/women/63.jpg"
                }
              ].map((member, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
                  <img 
                    src={member.img} 
                    alt={member.name} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-blue-600 mb-3">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default AboutPage