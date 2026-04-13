import { useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import Modal from "./shared/Modal";
import Input from "./shared/Input";
import { useGetPlansByCompanyQuery, useAddPlanMutation, useUpdatePlanMutation, useDeletePlanMutation } from "../redux/features/authSlice";

const empty = { name: "", duration: "", price: "" };

const Plans = () => {
  const { data, isLoading, isError } = useGetPlansByCompanyQuery();
  const [addPlan] = useAddPlanMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const [deletePlan] = useDeletePlanMutation();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const plans = data?.plans || [];

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.plan_name, duration: p.duration, price: p.price }); setShowModal(true); };
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updatePlan({ id: editing.id, ...form }).unwrap();
        toast.success("Plan updated");
      } else {
        const token = localStorage.getItem("authToken");
        const decoded = JSON.parse(atob(token.split(".")[1]));
        await addPlan({ ...form, company_id: decoded.company_id }).unwrap();
        toast.success("Plan added");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await deletePlan(id).unwrap();
      toast.success("Plan deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Membership Plans</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          <FaPlus /> Add Plan
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? <p className="text-purple-200 p-8 text-center">Loading...</p>
          : isError ? <p className="text-red-400 p-8 text-center">Failed to load plans.</p>
          : (
          <table className="w-full text-sm text-left text-white">
            <thead className="bg-white/10 text-purple-200 uppercase text-xs">
              <tr>{["#", "Plan Name", "Duration", "Price (Rs)", "Actions"].map(h => <th key={h} className="px-6 py-4">{h}</th>)}</tr>
            </thead>
            <tbody>
              {plans.length === 0
                ? <tr><td colSpan={5} className="text-center py-8 text-purple-300">No plans found</td></tr>
                : plans.map((p, i) => (
                  <tr key={p.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 font-medium">{p.plan_name}</td>
                    <td className="px-6 py-4">{p.duration}</td>
                    <td className="px-6 py-4">Rs {p.price}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button onClick={() => openEdit(p)} className="text-yellow-400 hover:text-yellow-300"><FaEdit size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300"><FaTrash size={16} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal show={showModal} title={editing ? "Edit Plan" : "Add Plan"} onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitLabel={editing ? "Update Plan" : "Add Plan"}>
        <Input label="Plan Name" name="name" placeholder="e.g. Gold" value={form.name} onChange={handleChange} required />
        <Input label="Duration" name="duration" placeholder="e.g. 1 Month" value={form.duration} onChange={handleChange} required />
        <Input label="Price (Rs)" name="price" type="number" placeholder="e.g. 2000" value={form.price} onChange={handleChange} required />
      </Modal>
    </div>
  );
};

export default Plans;
