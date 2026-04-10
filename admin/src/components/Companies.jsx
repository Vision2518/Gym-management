import { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import {
  useAddCompanyMutation,
  useDeleteCompanyMutation,
  useGetCompaniesQuery,
  useUpdateCompanyMutation,
} from "../redux/features/authSlice";
import { toast } from "react-toastify";
import Modal from "./shared/Modal";
import Input from "./shared/Input";

const empty = { name: "", email: "", number: "", address: "" };

const Companies = () => {
  const { data, isLoading, isError } = useGetCompaniesQuery();
  const [addCompany] = useAddCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();
  const [deleteCompany] = useDeleteCompanyMutation();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const companies = data?.company || [];

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setShowModal(true);
  };

  const openEdit = (company) => {
    setEditing(company);
    setForm({
      name: company.name || "",
      email: company.email || "",
      number: company.number || "",
      address: company.address || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(empty);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    try {
      await deleteCompany(id).unwrap();
      toast.success("Company deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Companies</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaPlus /> Add Company
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <p className="text-blue-200 p-8 text-center">Loading...</p>
        ) : isError ? (
          <p className="text-red-400 p-8 text-center">Failed to load companies.</p>
        ) : (
          <table className="w-full text-sm text-left text-white">
            <thead className="bg-white/10 text-blue-200 uppercase text-xs">
              <tr>
                {["#", "Name", "Email", "Number", "Address", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-blue-300">
                    No companies found
                  </td>
                </tr>
              ) : (
                companies.map((company, i) => (
                  <tr
                    key={company.id}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 font-medium">{company.name}</td>
                    <td className="px-6 py-4">{company.email}</td>
                    <td className="px-6 py-4">{company.number || "-"}</td>
                    <td className="px-6 py-4">{company.address || "-"}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button
                        onClick={() => openEdit(company)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-red-400 hover:text-red-300"
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
      </div>

      <Modal
        show={showModal}
        title={editing ? "Edit Company" : "Add Company"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={editing ? "Update Company" : "Add Company"}
      >
        <Input
          label="Company Name"
          name="name"
          placeholder="Company Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Phone Number"
          name="number"
          placeholder="Phone Number"
          value={form.number}
          onChange={handleChange}
          required
        />
        <label className="flex flex-col text-left">
          <span>
            Address
            <span className="text-red-500 ml-1">*</span>
          </span>
          <textarea
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            required
            className="border p-2 rounded min-h-28"
          />
        </label>
      </Modal>
    </div>
  );
};

export default Companies;
