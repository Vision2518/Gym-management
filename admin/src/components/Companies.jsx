import { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import {
  useAddCompanyMutation,
  useDeleteCompanyMutation,
  useGetCompaniesQuery,
  useUpdateCompanyMutation,
} from "../redux/features/authSlice";
import { toast } from "react-toastify";
import DetailsModal from "./shared/Modal";
import Input from "./shared/Input";
import Pagination from "./shared/Pagination";
import { usePagination } from "../hooks/usePagination";
import { getErrorMessage } from "../utils/toastMessage";

const phoneRegex = /^\d{10}$/;

const empty = { name: "", email: "", number: "", address: "" };

const Companies = () => {
  const { data, isLoading, isError } = useGetCompaniesQuery();
  const [addCompany, { isLoading: isAddingCompany }] = useAddCompanyMutation();
  const [updateCompany, { isLoading: isUpdatingCompany }] =
    useUpdateCompanyMutation();
  const [deleteCompany, { isLoading: isDeletingCompany }] =
    useDeleteCompanyMutation();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [form, setForm] = useState(empty);
  const [initialForm, setInitialForm] = useState(empty);

  const companies = data?.company || [];
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
  } = usePagination(companies, 10);
  const isSubmitting = isAddingCompany || isUpdatingCompany;
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const isSubmitDisabled = isSubmitting || (editing && !isDirty);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setInitialForm(empty);
    setShowModal(true);
  };

  const openEdit = (company) => {
    const nextForm = {
      name: company.name || "",
      email: company.email || "",
      number: company.number || "",
      address: company.address || "",
    };
    setEditing(company);
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    if (!phoneRegex.test(form.number)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      if (editing) {
        await updateCompany({ id: editing.id, ...form }).unwrap();
        toast.success("Company updated");
      } else {
        await addCompany(form).unwrap();
        toast.success("Company added");
      }
      closeModal();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save company details."));
    }
  };

  const openDelete = (company) => {
    setDeletingCompany(company);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCompany(deletingCompany.id).unwrap();
      toast.success("Company deleted");
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to delete company."));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Companies
        </h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-900/20"
        >
          Add Company
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl border border-white/5">
        {isLoading ? (
          <p className="text-blue-200 p-8 text-center animate-pulse">
            Loading...
          </p>
        ) : isError ? (
          <p className="text-red-400 p-8 text-center">
            Failed to load companies.
          </p>
        ) : (
          <table className="w-full text-sm text-left text-white">
            <thead className="bg-white/10 text-blue-200 uppercase text-xs tracking-wider">
              <tr>
                {["#", "Name", "Email", "Number", "Address", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-6 py-5 font-semibold">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-blue-300">
                    No companies found
                  </td>
                </tr>
              ) : (
                paginatedItems.map((company, i) => (
                  <tr
                    key={company.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4 text-blue-300">{startItem + i}</td>
                    <td className="px-6 py-4 font-medium">{company.name}</td>
                    <td className="px-6 py-4 text-gray-300">{company.email}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {company.number || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                      {company.address || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => openEdit(company)}
                          className="cursor-pointer text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => openDelete(company)}
                          className="cursor-pointer text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
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

      {/* Main Add/Edit Modal */}
      <DetailsModal
        show={showModal}
        title={editing ? "Edit Company" : "Add Company"}
        onClose={closeModal}
        size="4xl" // WIDE SIZE FOR HORIZONTAL LAYOUT
        footerContent={
          <div className="flex justify-end">
            <button
              form="company-form"
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-[#00ab41] hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white py-3 px-12 rounded-lg font-bold transition-all duration-200 shadow-md transform active:scale-95 disabled:active:scale-100"
            >
              {isSubmitting
                ? editing
                  ? "Updating..."
                  : "Adding..."
                : editing
                  ? "Update Company"
                  : "Add Company"}
            </button>
          </div>
        }
      >
        <form id="company-form" onSubmit={handleSubmit} className="space-y-8">
          {/* HORIZONTAL GRID ROW 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Company Name"
              name="name"
              placeholder="Enter company name"
              value={form.name}
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
            <Input
              label="Phone Number"
              name="number"
              placeholder="Enter phone number"
              value={form.number}
              onChange={handleChange}
              required
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              title="Phone number must be exactly 10 digits"
            />
            <div className="md:col-span-3">
              <Input
                label="Address"
                name="address"
                placeholder="Enter full company address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </form>
      </DetailsModal>

      {/* Delete Confirmation Modal */}
      <DetailsModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Company"
        size="md"
        footerContent={
          <div className="flex gap-4 w-full">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingCompany}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeletingCompany}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20"
            >
              {isDeletingCompany ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        }
      >
        <div className="text-center py-6">
          <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <FaTrash className="text-red-500 text-3xl" />
          </div>
          <p className="text-gray-600 text-lg">
            Are you sure you want to delete:
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {deletingCompany?.name}
          </p>
        </div>
      </DetailsModal>
    </div>
  );
};

export default Companies;
