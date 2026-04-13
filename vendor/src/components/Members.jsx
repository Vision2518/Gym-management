import { useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import Modal from "./shared/Modal";
import Input from "./shared/Input";
import {
  useGetMembersByCompanyQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
} from "../redux/features/authSlice";
import { useGetSchedulesByCompanyQuery, useGetPlansByCompanyQuery } from "../redux/features/authSlice";

const empty = { full_name: "", phone: "", email: "", gender: "", age: "", address: "", join_date: "", status: "active", plan_id: "", schedule_id: "", company_id: "" };

const Members = () => {
  const { data, isLoading, isError } = useGetMembersByCompanyQuery();
  const { data: schedulesData } = useGetSchedulesByCompanyQuery();
  const { data: plansData } = useGetPlansByCompanyQuery();
  const [addMember] = useAddMemberMutation();
  const [updateMember] = useUpdateMemberMutation();
  const [deleteMember] = useDeleteMemberMutation();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const members = data?.members || [];
  const schedules = schedulesData?.schedules || [];
  const plans = plansData?.plans || [];

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (m) => { setEditing(m); setForm({ full_name: m.full_name, phone: m.phone, email: m.email || "", gender: m.gender || "", age: m.age || "", address: m.address || "", join_date: m.join_date?.split("T")[0] || "", status: m.status, plan_id: m.plan_id, schedule_id: m.schedule_id, company_id: m.company_id }); setShowModal(true); };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateMember({ id: editing.id, ...form }).unwrap();
        toast.success("Member updated");
      } else {
        await addMember(form).unwrap();
        toast.success("Member added");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this member?")) return;
    try {
      await deleteMember(id).unwrap();
      toast.success("Member deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Members</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          <FaPlus /> Add Member
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? <p className="text-purple-200 p-8 text-center">Loading...</p>
          : isError ? <p className="text-red-400 p-8 text-center">Failed to load members.</p>
          : (
          <table className="w-full text-sm text-left text-white">
            <thead className="bg-white/10 text-purple-200 uppercase text-xs">
              <tr>{["#", "Name", "Phone", "Email", "Gender", "Status", "Actions"].map(h => <th key={h} className="px-6 py-4">{h}</th>)}</tr>
            </thead>
            <tbody>
              {members.length === 0
                ? <tr><td colSpan={7} className="text-center py-8 text-purple-300">No members found</td></tr>
                : members.map((m, i) => (
                  <tr key={m.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 font-medium">{m.full_name}</td>
                    <td className="px-6 py-4">{m.phone}</td>
                    <td className="px-6 py-4">{m.email || "-"}</td>
                    <td className="px-6 py-4">{m.gender || "-"}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${m.status === "active" ? "bg-green-600" : "bg-red-600"}`}>{m.status}</span></td>
                    <td className="px-6 py-4 flex gap-3">
                      <button onClick={() => openEdit(m)} className="text-yellow-400 hover:text-yellow-300"><FaEdit size={16} /></button>
                      <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300"><FaTrash size={16} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal show={showModal} title={editing ? "Edit Member" : "Add Member"} onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitLabel={editing ? "Update" : "Add Member"} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required />
          <Input label="Phone" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <Input label="Age" name="age" placeholder="Age" value={form.age} onChange={handleChange} />
          <Input label="Join Date" name="join_date" type="date" value={form.join_date} onChange={handleChange} required />
          <Input label="Company ID" name="company_id" type="number" placeholder="Company ID" value={form.company_id} onChange={handleChange} required />
          <label className="flex flex-col text-left">
            <span>Gender</span>
            <select name="gender" value={form.gender} onChange={handleChange} className="border p-2 rounded">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="flex flex-col text-left">
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange} className="border p-2 rounded">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="flex flex-col text-left">
            <span>Plan <span className="text-red-500">*</span></span>
            <select name="plan_id" value={form.plan_id} onChange={handleChange} required className="border p-2 rounded">
              <option value="">Select Plan</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.plan_name}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-left">
            <span>Schedule <span className="text-red-500">*</span></span>
            <select name="schedule_id" value={form.schedule_id} onChange={handleChange} required className="border p-2 rounded">
              <option value="">Select Schedule</option>
              {schedules.map(s => <option key={s.id} value={s.id}>{s.start_time} - {s.end_time}</option>)}
            </select>
          </label>
        </div>
        <Input label="Address" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
      </Modal>
    </div>
  );
};

export default Members;
