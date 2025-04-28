"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserCircleIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const CounselorList = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    specialization: "",
    language: "",
    minRating: 0,
  });

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        setLoading(true);
        const params = {};
        if (searchTerm) params.name = searchTerm;
        if (filters.specialization) params.specialization = filters.specialization;
        if (filters.language) params.language = filters.language;
        if (filters.minRating) params.minRating = filters.minRating;

        const response = await api.get("/counselors", { params });
        
        if (Array.isArray(response)) {
          setCounselors(response);
        } 
        // Case 2: Response has data property containing array
        else if (response.data && Array.isArray(response.data)) {
          setCounselors(response.data);
        }
        // Case 3: Response has nested data.data structure
        else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setCounselors(response.data.data);
        }
        // Default case
        else {
          setCounselors([]);
          console.error("Unexpected response structure:", response);
        }
      } catch (err) {
        console.error("Error fetching counselors:", err);
        setCounselors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCounselors();
  }, [searchTerm, filters]);

  const specializations = [
    "Anxiety",
    "Depression",
    "Relationship Issues",
    "Trauma",
    "Stress Management",
    "Addiction",
    "Child Therapy",
    "Family Therapy",
  ];

  const languages = ["English", "Spanish", "French", "Mandarin", "Hindi"];

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Counselor</h1>
          <p className="text-gray-600">
            Connect with our licensed mental health professionals
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name or specialty"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
              Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                value={filters.specialization}
                onChange={(e) =>
                  setFilters({ ...filters, specialization: e.target.value })
                }
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                value={filters.language}
                onChange={(e) =>
                  setFilters({ ...filters, language: e.target.value })
                }
              >
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                value={filters.minRating}
                onChange={(e) =>
                  setFilters({ ...filters, minRating: Number(e.target.value) })
                }
              >
                <option value={0}>Any Rating</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Counselor List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : counselors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No counselors found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counselors.map((counselor) => (
              <div
                key={counselor._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden border-2 border-blue-100">
                      <img
                        className="h-full w-full object-cover"
                        src={counselor.user?.avatar || "/default-avatar.png"}
                        alt={counselor.user?.name}
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {counselor.user?.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(counselor.rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-500">
                          ({counselor.reviewCount || 0})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Specializations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {counselor.specializations?.map((spec) => (
                        <span
                          key={spec}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {counselor.languages?.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {counselor.bio}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <Link
                      to={`/user/counselors/${counselor._id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={`/user/book/${counselor._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    >
                      Book Session
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselorList;