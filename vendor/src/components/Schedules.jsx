import { useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import Modal from "./shared/Modal";
import Input from "./shared/Input";
import { useGetSchedulesByCompanyQuery, useAddScheduleMutation, useUpdateScheduleMutation, useDeleteScheduleMutation } from "../redux/features/authSlice";

const empty = { company_id: "", start_time: "", end_time: "" };

const Schedules = () => {
  const { data, isLoading, isError } = useGetSchedulesByCompanyQuery();
  const [addSchedule] = useAddScheduleMutation();
  const [updateSchedule] = useUpdateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const schedules = data?.schedules || [];

  const openAdd = () => {
    const token = localStorage.getItem("authToken");
    const decoded = JSON.parse(atob(token.split(".")[1]));
    setEditing(null);
    setForm({ company_id: decoded.company_id, start_time: "", end_time: "" });
    setShowModal(true);
  };
  const openEdit = (s) => { setEditing(s); setForm({ company_id: s.company_id, start_time: s.start_time, end_time: s.end_time }); setShowModal(true); };
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateSchedule({ id: editing.id, ...form }).unwrap();
        toast.success("Schedule updated");
      } else {
        await addSchedule(form).unwrap();
        toast.success("Schedule added");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await deleteSchedule(id).unwrap();
      toast.success("Schedule deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Schedules</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          <FaPlus /> Add Schedule
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? <p className="text-purple-200 p-8 text-center">Loading...</p>
          : isError ? <p className="text-red-400 p-8 text-center">Failed to load schedules.</p>
          : (
          <table className="w-full text-sm text-left text-white">
            <thead className="bg-white/10 text-purple-200 uppercase text-xs">
              <tr>{["#", "Member", "Start Time", "End Time", "Actions"].map(h => <th key={h} className="px-6 py-4">{h}</th>)}</tr>
            </thead>
            <tbody>
              {schedules.length === 0
                ? <tr><td colSpan={5} className="text-center py-8 text-purple-300">No schedules found</td></tr>
                : schedules.map((s, i) => (
                  <tr key={s.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 font-medium">{s.full_name || "-"}</td>
                    <td className="px-6 py-4">{s.start_time}</td>
                    <td className="px-6 py-4">{s.end_time}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button onClick={() => openEdit(s)} className="text-yellow-400 hover:text-yellow-300"><FaEdit size={16} /></button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300"><FaTrash size={16} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal show={showModal} title={editing ? "Edit Schedule" : "Add Schedule"} onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitLabel={editing ? "Update" : "Add Schedule"}>
        <Input label="Start Time" name="start_time" type="time" value={form.start_time} onChange={handleChange} required />
        <Input label="End Time" name="end_time" type="time" value={form.end_time} onChange={handleChange} required />
      </Modal>
    </div>
  );
};

export default Schedules;
