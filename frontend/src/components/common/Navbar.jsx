"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const getDashboardLink = () => {
    if (!user) return "/"

    switch (user.role) {
      case "admin":
        return "/admin"
      case "counselor":
        return "/counselor"
      case "user":
        return "/user"
      default:
        return "/"
    }
  }

  return (
    <nav className="bg-white border-b border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
                <span className="text-white font-bold text-xl">MG</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">MentalGuard</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-6">
              <Link 
                to="/" 
                className="text-gray-500 hover:text-blue-600 px-1 pt-1 border-b-2 border-transparent hover:border-blue-600 text-sm font-medium transition-colors duration-300"
              >
                Home
              </Link>
              {/* <Link 
                to="/assessment" 
                className="text-gray-500 hover:text-blue-600 px-1 pt-1 border-b-2 border-transparent hover:border-blue-600 text-sm font-medium transition-colors duration-300"
              >
                Self-Assessment
              </Link> */}
              <Link 
                to="/about" 
                className="text-gray-500 hover:text-blue-600 px-1 pt-1 border-b-2 border-transparent hover:border-blue-600 text-sm font-medium transition-colors duration-300"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-500 hover:text-blue-600 px-1 pt-1 border-b-2 border-transparent hover:border-blue-600 text-sm font-medium transition-colors duration-300"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center text-gray-500 hover:text-blue-600 px-1 pt-1 border-b-2 border-transparent hover:border-blue-600 text-sm font-medium transition-colors duration-300"
                >
                  Dashboard
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-1 focus:outline-none">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-300"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
        <div className="pt-2 pb-3 space-y-1 bg-white">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-300"
          >
            Home
          </Link>
          {/* <Link
            to="/assessment"
            onClick={() => setIsOpen(false)}
            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-300"
          >
            Self-Assessment
          </Link> */}
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-300"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-300"
          >
            Contact
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-blue-100 bg-white">
          {isAuthenticated ? (
            <div className="space-y-3 px-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.name || "User"}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to={getDashboardLink()}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1 px-4">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full px-4 py-2 text-center text-base font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block w-full px-4 py-2 text-center text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors duration-300"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar