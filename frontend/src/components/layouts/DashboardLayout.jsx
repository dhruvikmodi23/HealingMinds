"use client";

import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar when navigating
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserNavigation = () => {
    if (user.role === "admin") {
      return [
        { name: "Dashboard", href: "/admin", icon: ChartBarIcon },
        { name: "Users", href: "/admin/users", icon: UserIcon },
        { name: "Counselors", href: "/admin/counselors", icon: UsersIcon },
        { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
        { name: "Payments", href: "/admin/payments", icon: CreditCardIcon },
        { name: "Questions", href: "/admin/assessment/questions", icon: ClipboardDocumentCheckIcon },
        { name: "Assessment Analysis", href: "/admin/assessment/analytics", icon: ChartBarIcon },
      ];
    } else if (user.role === "counselor") {
      return [
        { name: "Dashboard", href: "/counselor", icon: ChartBarIcon },
        {
          name: "Appointments",
          href: "/counselor/appointments",
          icon: CalendarIcon,
        },
        { name: "Profile", href: "/counselor/profile", icon: UserIcon },
      ];
    } else {
      return [
        { name: "Dashboard", href: "/user", icon: ChartBarIcon },
        { name: "Counselors", href: "/user/counselors", icon: UsersIcon },
        {
          name: "Appointments",
          href: "/user/appointments",
          icon: CalendarIcon,
        },
        {
          name: "Self-Assessment",
          href: "/user/assessment",
          icon: ClipboardDocumentCheckIcon,
        },
        { name: "Upgrade Plan", href: "/user/upgrade", icon: CreditCardIcon },
        {
          name: "Payment History",
          href: "/user/payments/history",
          icon: CreditCardIcon,
        },
        { name: "Profile", href: "/user/profile", icon: UserIcon },
        {
          name: "Assessment History",
          href: "/user/assessments",
          icon: ClipboardDocumentCheckIcon,
        },
      ];
    }
  };

  const navigation = getUserNavigation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-indigo-700 overflow-y-auto transition transform z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
              <span className="text-white font-bold text-xl">MG</span>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              MentalGuard
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="px-2 space-y-1 mt-6">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-100 hover:bg-indigo-600"
                }`}
              >
                <item.icon
                  className="mr-3 h-6 w-6 text-indigo-300"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto p-4 border-t border-indigo-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-2 py-2 text-sm font-medium text-indigo-100 rounded-md hover:bg-indigo-600"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 text-indigo-300" />
            Sign out
          </button>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-700">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-indigo-800">
            <Link to="/" className="flex items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
                <span className="text-white font-bold text-xl">MG</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                MentalGuard
              </span>
            </Link>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-indigo-800 text-white"
                        : "text-indigo-100 hover:bg-indigo-600"
                    }`}
                  >
                    <item.icon
                      className="mr-3 h-6 w-6 text-indigo-300"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-indigo-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {user?.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={user.avatar}
                      alt={user?.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <UserCircleIcon className="h-6 w-6 text-indigo-300" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs font-medium text-indigo-200">
                    {user?.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-3 flex items-center w-full px-2 py-2 text-sm font-medium text-indigo-100 rounded-md hover:bg-indigo-600"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 text-indigo-300" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {navigation.find((item) => item.href === location.pathname)
                  ?.name || "Dashboard"}
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <Link
                to={
                  user?.role === "admin"
                    ? "/admin/profile"
                    : `/${user?.role}/profile`
                }
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">View profile</span>
                <Cog6ToothIcon className="h-6 w-6" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;