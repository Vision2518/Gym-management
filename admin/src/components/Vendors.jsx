import { useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import {
  useGetVendorsQuery,
  useGetCompaniesQuery,
  useAddVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} from "../redux/features/authSlice";
import { toast } from "react-toastify";
import DetailsModal from "./shared/Modal";
import Input from "./shared/Input";
import Select from "./shared/Select";
import Pagination from "./shared/Pagination";
import { usePagination } from "../hooks/usePagination";
import { getErrorMessage } from "../utils/toastMessage";

const phoneRegex = /^\d{10}$/;
const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

const empty = {
  company_id: "",
  username: "",
  email: "",
  password: "",
  number: "",
};

const Vendors = () => {
  const { data, isLoading, isError } = useGetVendorsQuery();
  const { data: companiesData } = useGetCompaniesQuery();
  const [addVendor, { isLoading: isAddingVendor }] = useAddVendorMutation();
  const [updateVendor, { isLoading: isUpdatingVendor }] =
    useUpdateVendorMutation();
  const [deleteVendor, { isLoading: isDeletingVendor }] =
    useDeleteVendorMutation();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(null);
  const [form, setForm] = useState(empty);
  const [initialForm, setInitialForm] = useState(empty);

  const vendors = data?.vendors || [];
  const companies = companiesData?.company || [];
  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    goToPrevious,
    goToNext,
    startItem,
    endItem,
    totalItems,
    showPagination,
  } = usePagination(vendors, 10);
  const isSubmitting = isAddingVendor || isUpdatingVendor;
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const isSubmitDisabled = isSubmitting || (editing && !isDirty);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setInitialForm(empty);
    setShowModal(true);
  };
  const openEdit = (v) => {
    const nextForm = {
      company_id: v.company_id,
      username: v.username,
      email: v.email,
      password: "",
      number: v.number || "",
    };
    setEditing(v);
    setForm(nextForm);
    setInitialForm(nextForm);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(empty);
    setInitialForm(empty);
  };

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    if (form.number && !phoneRegex.test(form.number)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }
    if (
      (!editing || form.password) &&
      !strongPasswordRegex.test(form.password)
    ) {
      toast.error(
        "Password must be at least 6 characters and include letters, numbers, and a symbol.",
      );
      return;
    }

    try {
      if (editing) {
        await updateVendor({ id: editing.id, ...form }).unwrap();
        toast.success("Vendor updated");
      } else {
        await addVendor(form).unwrap();
        toast.success("Vendor added");
      }
      closeModal();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save vendor details."));
    }
  };

  const openDelete = (v) => {
    setDeletingVendor(v);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteVendor(deletingVendor.id).unwrap();
      toast.success("Vendor deleted");
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to delete vendor."));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Vendors</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-900/20"
        >
          Add Vendor
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <p className="text-blue-200 p-8 text-center">Loading...</p>
        ) : isError ? (
          <p className="text-red-400 p-8 text-center">
            Failed to load vendors.
          </p>
        ) : (
          <table className="w-full text-sm text-left text-white">
            <thead className="bg-white/10 text-blue-200 uppercase text-xs">
              <tr>
                {[
                  "#",
                  "Username",
                  "Email",
                  "Number",
                  "Company",
                  "Package",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-6 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-blue-300">
                    No vendors found
                  </td>
                </tr>
              ) : (
                paginatedItems.map((v, i) => (
                  <tr
                    key={v.id}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">{startItem + i}</td>
                    <td className="px-6 py-4 font-medium">{v.username}</td>
                    <td className="px-6 py-4">{v.email}</td>
                    <td className="px-6 py-4">{v.number || "-"}</td>
                    <td className="px-6 py-4">
                      {companies.find((c) => c.id === v.company_id)?.name ||
                        v.company_id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        {v.package_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-3">
                      <button
                        onClick={() => openEdit(v)}
                        className="cursor-pointer text-yellow-400 hover:text-yellow-300"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => openDelete(v)}
                        className="cursor-pointer text-red-400 hover:text-red-300"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        {showPagination && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            goToPrevious={goToPrevious}
            goToNext={goToNext}
            goToPage={goToPage}
            startItem={startItem}
            endItem={endItem}
            totalItems={totalItems}
          />
        )}
      </div>

      {/* Modal */}
      <DetailsModal
        show={showModal}
        title={editing ? "Edit Vendor" : "Add Vendor"}
        onClose={closeModal}
        size="4xl"
        footerContent={
          <div className="flex justify-end">
            <button
              form="vendor-form"
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-[#00ab41] hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white py-3 px-12 rounded-lg font-bold transition-all duration-200 shadow-md transform active:scale-95 disabled:active:scale-100"
            >
              {isSubmitting
                ? editing
                  ? "Updating..."
                  : "Adding..."
                : editing
                  ? "Update Vendor"
                  : "Add Vendor"}
            </button>
          </div>
        }
      >
        <form id="vendor-form" onSubmit={handleSubmit} className="space-y-8">
          {/* HORIZONTAL GRID ROW 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label="Company"
              name="company_id"
              options={companies}
              value={form.company_id}
              onChange={handleChange}
              required
            />
            <Input
              label="Username"
              name="username"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* HORIZONTAL GRID ROW 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder={
                editing ? "New Password (optional)" : "Enter password"
              }
              value={form.password}
              onChange={handleChange}
              required={!editing}
              minLength={6}
              title="Password must be at least 6 characters and include letters, numbers, and a symbol"
            />
            <Input
              label="Phone Number"
              name="number"
              placeholder="Enter phone number"
              value={form.number}
              onChange={handleChange}
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              title="Phone number must be exactly 10 digits"
            />
          </div>
        </form>
      </DetailsModal>

      {/* Delete Confirmation Modal */}
      <DetailsModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        size="md"
        footerContent={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingVendor}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeletingVendor}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20"
            >
              {isDeletingVendor ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <FaTrash className="text-red-500 text-2xl" />
          </div>
          <p className="text-gray-600 text-lg">
            Are you sure you want to delete vendor:
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {deletingVendor?.username}
          </p>
        </div>
      </DetailsModal>
    </div>
  );
};

export default Vendors;
