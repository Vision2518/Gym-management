import { useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import {
  useGetVendorsQuery,
  useAddVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} from "../redux/features/authSlice";
import { toast } from "react-toastify";
import Modal from "./shared/Modal";
import Input from "./shared/Input";

const empty = { company_id: "", username: "", email: "", password: "", number: "" };

const Vendors = () => {
  const { data, isLoading, isError } = useGetVendorsQuery();
  const [addVendor] = useAddVendorMutation();
  const [updateVendor] = useUpdateVendorMutation();
  const [deleteVendor] = useDeleteVendorMutation();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const vendors = data?.vendors || [];

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (v) => { setEditing(v); setForm({ company_id: v.company_id, username: v.username, email: v.email, password: "", number: v.number || "" }); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;
    try {
      await deleteVendor(id).unwrap();
      toast.success("Vendor deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Vendors</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <FaPlus /> Add Vendor
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <p className="text-blue-200 p-8 text-center">Loading...</p>
        ) : isError ? (
          <p className="text-red-400 p-8 text-center">Failed to load vendors.</p>
        ) : (
          <table className="w-full text-sm text-left text-white">
            <thead className="bg-white/10 text-blue-200 uppercase text-xs">
              <tr>
                {["#", "Username", "Email", "Number", "Company ID", "Package", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-blue-300">No vendors found</td></tr>
              ) : vendors.map((v, i) => (
                <tr key={v.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">{i + 1}</td>
                  <td className="px-6 py-4 font-medium">{v.username}</td>
                  <td className="px-6 py-4">{v.email}</td>
                  <td className="px-6 py-4">{v.number || "-"}</td>
                  <td className="px-6 py-4">{v.company_id}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-600">{v.package_type}</span>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button onClick={() => openEdit(v)} className="text-yellow-400 hover:text-yellow-300"><FaEdit size={16} /></button>
                    <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-300"><FaTrash size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          title={editing ? "Edit Vendor" : "Add Vendor"}
          onClose={closeModal}
          onSubmit={handleSubmit}
          submitLabel={editing ? "Update Vendor" : "Add Vendor"}
        >
          <Input label="Company ID" name="company_id" type="number" placeholder="Company ID" value={form.company_id} onChange={handleChange} required />
          <Input label="Username" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <Input label="Password" name="password" type="password" placeholder={editing ? "New Password (optional)" : "Password"} value={form.password} onChange={handleChange} required={!editing} />
          <Input label="Phone Number" name="number" placeholder="Phone Number (optional)" value={form.number} onChange={handleChange} />
        </Modal>
      )}
    </div>
  );
};

export default Vendors;
