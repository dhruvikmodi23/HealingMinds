"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  UserCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ChangePasswordModal from "./ChangePasswordModal";
import DeleteAccountModal from "./DeleteAccountModal";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    profession: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState({
    profile: false,
    avatar: false,
    subscription: false,
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfileData = async () => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      setError(null);

      // Fetch user profile
      const profileResponse = await api.get("/users/profile");
      updateUser(profileResponse);

      // Fetch subscription data
      const subscriptionResponse = await api.get("/users/subscription");
      setSubscription(subscriptionResponse);

      // Set form data
      setFormData({
        name: profileResponse.name || "",
        age: profileResponse.age || "",
        gender: profileResponse.gender || "",
        profession: profileResponse.profession || "",
      });
      
      // Set avatar preview
      setAvatarPreview(profileResponse.avatar || "");
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError(err.response?.data?.message || "Failed to load profile data");
      toast.error("Failed to load profile data");
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));
    try {
      const updatedUser = await api.put("/users/profile", formData);
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("avatar", file);

    setLoading(prev => ({ ...prev, avatar: true }));
    try {
      const response = await api.post("/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      updateUser({ avatar: response.avatarUrl });
      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setError(error.response?.data?.message || "Failed to upload avatar");
      toast.error(error.response?.data?.message || "Failed to upload avatar");
    } finally {
      setLoading(prev => ({ ...prev, avatar: false }));
    }
  };

  const handleDeleteAvatar = async () => {
    setLoading(prev => ({ ...prev, avatar: true }));
    try {
      const response = await api.delete("/users/avatar");
      updateUser({ avatar: null });
      setAvatarPreview("");
      toast.success("Avatar removed successfully");
    } catch (error) {
      console.error("Error deleting avatar:", error);
      setError(error.response?.data?.message || "Failed to remove avatar");
      toast.error(error.response?.data?.message || "Failed to remove avatar");
    } finally {
      setLoading(prev => ({ ...prev, avatar: false }));
    }
  };

  const upgradeSubscription = async (plan) => {
    setLoading(prev => ({ ...prev, subscription: true }));
    try {
      const updatedSubscription = await api.put("/users/subscription", { plan });
      setSubscription(updatedSubscription);
      toast.success(`Subscription upgraded to ${plan} plan`);
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      setError(error.response?.data?.message || "Failed to upgrade subscription");
      toast.error(error.response?.data?.message || "Failed to upgrade subscription");
    } finally {
      setLoading(prev => ({ ...prev, subscription: false }));
    }
  };

  if (loading.profile) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error loading profile</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProfileData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-2 border-blue-100"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserCircleIcon className="h-10 w-10 text-blue-600" />
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors"
                    title="Change avatar"
                  >
                    <PencilIcon className="h-4 w-4 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={loading.avatar}
                    />
                  </label>
                  {avatarPreview && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={loading.avatar}
                      className="absolute top-0 right-0 bg-red-600 rounded-full p-1 cursor-pointer hover:bg-red-700 transition-colors"
                      title="Remove avatar"
                    >
                      {loading.avatar ? (
                        <ArrowPathIcon className="h-4 w-4 text-white animate-spin" />
                      ) : (
                        <TrashIcon className="h-4 w-4 text-white" />
                      )}
                    </button>
                  )}
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.name}
                  </h2>
                  <p className="text-gray-600 capitalize">{user?.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSubmit}
                      disabled={loading.profile}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-300 disabled:opacity-70"
                    >
                      {loading.profile ? (
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckIcon className="h-4 w-4 mr-2" />
                      )}
                      {loading.profile ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-300"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Personal Information
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="age"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Age
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        min="13"
                        max="100"
                        value={formData.age}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="profession"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Profession
                    </label>
                    <input
                      type="text"
                      id="profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Subscription & Actions */}
          <div className="space-y-6">
            {/* Subscription */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Subscription Plan
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">
                      {subscription?.plan?.toUpperCase() || "FREE"} PLAN
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      subscription?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {subscription?.status?.toUpperCase() || "INACTIVE"}
                  </span>
                </div>

                {subscription?.plan !== "free" && subscription?.startDate && subscription?.endDate && (
                  <>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        Started:{" "}
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        Expires:{" "}
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-blue-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Upgrade Plan
                </h4>
                <div className="space-y-3">
                <Link
                to="/user/upgrade"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
              >
                  <button
                    onClick={() => upgradeSubscription("standard")}
                    disabled={loading.subscription || subscription?.plan === "standard"}
                    className={`w-full flex justify-between items-center px-4 py-3 border rounded-lg transition-colors ${
                      loading.subscription || subscription?.plan === "standard"
                        ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <span className="font-medium">Standard</span>
                    <span className="text-sm text-gray-600">₹799/month</span>
                  </button>
                  </Link>

                  <Link
                to="/user/upgrade"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
              >
                  <button
                    onClick={() => upgradeSubscription("premium")}
                    disabled={loading.subscription || subscription?.plan === "premium"}
                    className={`w-full flex justify-between items-center px-4 py-3 border rounded-lg transition-colors ${
                      loading.subscription || subscription?.plan === "premium"
                        ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <span className="font-medium">Premium</span>
                    <span className="text-sm text-gray-600">₹999/month</span>
                  </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Change Password
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ProfileSettings;