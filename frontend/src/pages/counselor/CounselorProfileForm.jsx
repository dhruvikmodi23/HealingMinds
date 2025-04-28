"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  UserCircleIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  XMarkIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const CounselorProfileForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
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
  
  const languages = [
    "English",
    "Spanish",
    "French",
    "Mandarin",
    "Hindi",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user) {
          throw new Error('Authentication required. Please login again.');
        }
    
        // Make the API request
        const response = await api.get("/counselors/profile");
        console.log("Profile response:", response);
        // Handle the response based on the current api.js behavior
        // The interceptor returns response.data (stripping the axios response wrapper)
        // And if response.data.data exists, it returns just that
        
        // Case 1: The data is nested under response.data.data
        let profileData = response.data?.data || response.data;
        
        if (response && response._id) {
          // Case 1: Response is the profile object directly
          setProfile(response);
        } else if (response && response.data && response.data._id) {
          // Case 2: Response has nested data property
          setProfile(response.data);
        } else if (response && Array.isArray(response) && response[0]?._id) {
          // Case 3: Response is an array containing profile
          setProfile(response[0]);
        } else {
          // New profile case
          setProfile(getInitialProfileState());
        }
    
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message || 'Failed to load profile');
        setProfile(getInitialProfileState());
        
        if (err.response?.status === 401) {
          setTimeout(() => navigate("/login"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function for initial profile state
    const getInitialProfileState = () => ({
      bio: "",
      specializations: [],
      credentials: "",
      experience: 0,
      education: [""],
      certifications: [""],
      languages: ["English"]
    });

    if (user) {
      fetchProfile();
    }
  }, [user, navigate]);

  const formik = useFormik({
    initialValues: {
      bio: "",
      specializations: [],
      credentials: "",
      experience: 0,
      education: [""],
      certifications: [""],
      languages: ["English"],
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      bio: Yup.string()
        .required("Bio is required")
        .min(100, "Bio should be at least 100 characters"),
      specializations: Yup.array()
        .min(1, "Select at least one specialization")
        .required("Specializations are required"),
      credentials: Yup.string()
        .required("Credentials are required"),
      experience: Yup.number()
        .min(0, "Experience cannot be negative")
        .required("Experience is required"),
      education: Yup.array()
        .of(Yup.string().required("Education entry is required")),
      certifications: Yup.array()
        .of(Yup.string().required("Certification entry is required")),
      languages: Yup.array()
        .min(1, "Select at least one language")
        .required("Languages are required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Prepare payload - clean empty strings from arrays
        const payload = {
          ...values,
          education: values.education.filter(e => e.trim() !== ""),
          certifications: values.certifications.filter(c => c.trim() !== "")
        };

        // Determine if we're creating or updating
        const endpoint = "/counselors/profile";
        const method = profile?._id ? "put" : "post";


        const response = await api[method](endpoint, payload);

         // Handle response based on api.js behavior
         const result = response.data || response;
        
         if (result.error) {
           throw new Error(result.error);
         }
 
         setSuccess(true);
         setTimeout(() => navigate("/counselor"), 1500);
      } catch (err) {
        console.error("Profile save error:", err);
        setError(err.response?.data?.message || 
                err.message || 
                "Failed to save profile. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (profile) {
      formik.setValues({
        bio: profile.bio || "",
        specializations: profile.specializations || [],
        credentials: profile.credentials || "",
        experience: profile.experience || 0,
        education: profile.education?.length ? 
                  [...profile.education] : [""],
        certifications: profile.certifications?.length ? 
                      [...profile.certifications] : [""],
        languages: profile.languages?.length ? 
                  [...profile.languages] : ["English"],
      });
    }
  }, [profile]);

  const addEducationField = () => {
    formik.setFieldValue("education", [...formik.values.education, ""]);
  };

  const removeEducationField = (index) => {
    const newEducation = formik.values.education.filter((_, i) => i !== index);
    formik.setFieldValue("education", newEducation.length ? newEducation : [""]);
  };

  const addCertificationField = () => {
    formik.setFieldValue("certifications", [...formik.values.certifications, ""]);
  };

  const removeCertificationField = (index) => {
    const newCerts = formik.values.certifications.filter((_, i) => i !== index);
    formik.setFieldValue("certifications", newCerts.length ? newCerts : [""]);
  };

  const toggleSpecialization = (spec) => {
    const newSpecs = formik.values.specializations.includes(spec)
      ? formik.values.specializations.filter(s => s !== spec)
      : [...formik.values.specializations, spec];
    formik.setFieldValue("specializations", newSpecs);
  };

  const toggleLanguage = (lang) => {
    const newLangs = formik.values.languages.includes(lang)
      ? formik.values.languages.filter(l => l !== lang)
      : [...formik.values.languages, lang];
    formik.setFieldValue("languages", newLangs);
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {profile?._id ? "Update Your Profile" : "Create Your Counselor Profile"}
          </h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
              <CheckIcon className="h-5 w-5 mr-2" />
              Profile saved successfully! Redirecting...
            </div>
          )}

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                rows={6}
                className={`block w-full px-3 py-2 border ${
                  formik.touched.bio && formik.errors.bio
                    ? "border-red-300"
                    : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Tell clients about yourself, your approach to therapy, and your experience..."
                {...formik.getFieldProps("bio")}
              />
              {formik.touched.bio && formik.errors.bio ? (
                <p className="mt-1 text-sm text-red-600">{formik.errors.bio}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  Minimum 100 characters ({formik.values.bio.length}/100)
                </p>
              )}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specializations
              </label>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      formik.values.specializations.includes(spec)
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-gray-100 text-gray-800 border border-gray-300"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
              {formik.touched.specializations && formik.errors.specializations ? (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.specializations}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credentials
                </label>
                <input
                  type="text"
                  className={`block w-full px-3 py-2 border ${
                    formik.touched.credentials && formik.errors.credentials
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="e.g., PhD, LCSW, LMFT"
                  {...formik.getFieldProps("credentials")}
                />
                {formik.touched.credentials && formik.errors.credentials ? (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.credentials}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  className={`block w-full px-3 py-2 border ${
                    formik.touched.experience && formik.errors.experience
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  {...formik.getFieldProps("experience")}
                />
                {formik.touched.experience && formik.errors.experience ? (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.experience}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Education
                </label>
                <button
                  type="button"
                  onClick={addEducationField}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Add Education
                </button>
              </div>
              {formik.values.education.map((edu, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    className={`flex-grow px-3 py-2 border ${
                      formik.touched.education && 
                      formik.errors.education?.[index]
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="e.g., Master's in Clinical Psychology, University of..."
                    value={edu}
                    onChange={(e) =>
                      formik.setFieldValue(`education[${index}]`, e.target.value)
                    }
                    onBlur={formik.handleBlur}
                  />
                  {formik.values.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducationField(index)}
                      className="ml-2 p-2 text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              {formik.touched.education && formik.errors.education ? (
                <p className="mt-1 text-sm text-red-600">
                  {typeof formik.errors.education === "string"
                    ? formik.errors.education
                    : "Please fill all education fields"}
                </p>
              ) : null}
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Certifications
                </label>
                <button
                  type="button"
                  onClick={addCertificationField}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Add Certification
                </button>
              </div>
              {formik.values.certifications.map((cert, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    className={`flex-grow px-3 py-2 border ${
                      formik.touched.certifications && 
                      formik.errors.certifications?.[index]
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="e.g., Certified Cognitive Behavioral Therapist"
                    value={cert}
                    onChange={(e) =>
                      formik.setFieldValue(`certifications[${index}]`, e.target.value)
                    }
                    onBlur={formik.handleBlur}
                  />
                  {formik.values.certifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCertificationField(index)}
                      className="ml-2 p-2 text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              {formik.touched.certifications && formik.errors.certifications ? (
                <p className="mt-1 text-sm text-red-600">
                  {typeof formik.errors.certifications === "string"
                    ? formik.errors.certifications
                    : "Please fill all certification fields"}
                </p>
              ) : null}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages Spoken
              </label>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      formik.values.languages.includes(lang)
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-gray-100 text-gray-800 border border-gray-300"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              {formik.touched.languages && formik.errors.languages ? (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.languages}
                </p>
              ) : null}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Processing...
                  </>
                ) : profile?._id ? (
                  "Update Profile"
                ) : (
                  "Create Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CounselorProfileForm;