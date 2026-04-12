import { useState } from "react";
import { useGetVendorProfileQuery, useUpdateVendorProfileMutation } from "../redux/features/authSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Input from "./shared/Input";
import DetailsModal from "./shared/Modal";

const Profile = () => {
  const { data: profile, isLoading, isError } = useGetVendorProfileQuery();
  const [updateProfile] = useUpdateVendorProfileMutation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    number: "",
    address: "",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <p className="text-purple-200 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <p className="text-red-400 text-lg">Failed to load profile.</p>
      </div>
    );
  }

  const handleEdit = () => {
    setFormData({
      username: profile?.username || "",
      email: profile?.email || "",
      number: profile?.number || "",
      address: profile?.address || "",
    });
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData).unwrap();
      toast.success("Profile updated successfully");
      setShowEditModal(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <button
            onClick={handleEdit}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-900/20"
          >
            Edit Profile
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <div className="p-8">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {profile?.username?.charAt(0)?.toUpperCase() || "V"}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{profile?.username || "Vendor"}</h2>
                <p className="text-purple-200">{profile?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-purple-300">Username</p>
                <p className="text-lg font-medium text-white">{profile?.username || "-"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-purple-300">Email</p>
                <p className="text-lg font-medium text-white">{profile?.email || "-"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-purple-300">Phone Number</p>
                <p className="text-lg font-medium text-white">{profile?.number || "-"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-purple-300">Address</p>
                <p className="text-lg font-medium text-white">{profile?.address || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <DetailsModal
        show={showEditModal}
        title="Edit Profile"
        onClose={() => setShowEditModal(false)}
        size="md"
        footerContent={
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              form="profile-form"
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        }
      >
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            name="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone Number"
            name="number"
            placeholder="Enter phone number"
            value={formData.number}
            onChange={handleChange}
          />
          <Input
            label="Address"
            name="address"
            placeholder="Enter address"
            value={formData.address}
            onChange={handleChange}
          />
        </form>
      </DetailsModal>
    </div>
  );
};

export default Profile;