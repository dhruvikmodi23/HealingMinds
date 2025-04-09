"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    alert(`Thank you for your message, ${formData.name}! We'll get back to you soon.`)
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're here to help and answer any questions you might have.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Mail className="h-8 w-8 text-blue-600" />,
                  title: "Email Us",
                  content: "dhruvikmodi23@gmail.com",
                  action: "mailto:dhruvikmodi23@gmail.com"
                },
                {
                  icon: <Phone className="h-8 w-8 text-blue-600" />,
                  title: "Call Us",
                  content: "+91 7202859004",
                  action: "tel:+18001234567"
                },
                {
                  icon: <MapPin className="h-8 w-8 text-blue-600" />,
                  title: "Meet Us",
                  content: "DDU University,Nadiad",
                  action: "https://maps.google.com"
                }
              ].map((item, index) => (
                <a 
                  key={index} 
                  href={item.action} 
                  className="bg-blue-50 rounded-xl p-8 border border-blue-100 hover:shadow-md transition-shadow duration-300 text-center"
                >
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.content}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16">
              <div className="mb-12 lg:mb-0">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Have questions about our services or need support? Fill out the form and our team will get back to you within 24 hours.
                </p>
                
                <div className="space-y-6">
                  {[
                    {
                      icon: <Clock className="h-6 w-6 text-blue-600" />,
                      text: "Monday - Friday: 9am - 9pm IST"
                    },
                    {
                      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
                      text: "Average response time: 4 hours"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {item.icon}
                      </div>
                      <p className="ml-3 text-gray-700">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-100">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Quick answers to common questions
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "How do I schedule my first session?",
                  answer: "You can book your first session directly through our platform after creating an account. Choose a counselor that fits your needs and select an available time slot."
                },
                {
                  question: "Is online therapy effective?",
                  answer: "Yes! Numerous studies have shown that online therapy can be just as effective as in-person sessions for many mental health concerns."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, HSA/FSA cards, and some insurance plans. Contact us for specific insurance inquiries."
                },
                {
                  question: "Can I change counselors if it's not a good fit?",
                  answer: "Absolutely. We want you to have the best possible experience and will help you find a counselor who better matches your needs."
                }
              ].map((item, index) => (
                <div key={index} className="border border-blue-100 rounded-lg overflow-hidden">
                  <button className="w-full flex justify-between items-center p-6 text-left bg-blue-50 hover:bg-blue-100 transition-colors duration-300">
                    <h3 className="text-lg font-medium text-gray-900">{item.question}</h3>
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="p-6 bg-white">
                    <p className="text-gray-600">{item.answer}</p>
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

export default ContactPage