import { useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import Modal from "./shared/Modal";
import Input from "./shared/Input";
import Pagination from "./shared/Pagination";
import { usePagination } from "../hooks/usePagination";
import { useGetSchedulesByCompanyQuery, useAddScheduleMutation, useUpdateScheduleMutation, useDeleteScheduleMutation } from "../redux/features/authSlice";
import { getErrorMessage } from "../utils/toastMessage";

const empty = { company_id: "", start_time: "", end_time: "" };

const getVendorCompanyId = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return "";

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded.company_id || "";
  } catch {
    return "";
  }
};

const Schedules = () => {
  const { data, isLoading, isError } = useGetSchedulesByCompanyQuery();
  const [addSchedule, { isLoading: isAddingSchedule }] = useAddScheduleMutation();
  const [updateSchedule, { isLoading: isUpdatingSchedule }] = useUpdateScheduleMutation();
  const [deleteSchedule, { isLoading: isDeletingSchedule }] = useDeleteScheduleMutation();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [form, setForm] = useState(empty);
  const [initialForm, setInitialForm] = useState(empty);

  const schedules = data?.schedules || [];
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
  } = usePagination(schedules, 10);
  const isSubmitting = isAddingSchedule || isUpdatingSchedule;
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const isSubmitDisabled = isSubmitting || (editing && !isDirty);

  const openAdd = () => {
    const companyId = getVendorCompanyId();
    setEditing(null);
    setForm({ company_id: companyId, start_time: "", end_time: "" });
    setInitialForm({ company_id: companyId, start_time: "", end_time: "" });
    setShowModal(true);
  };
  const openEdit = (s) => {
    const nextForm = {
      company_id: getVendorCompanyId() || s.company_id,
      start_time: s.start_time,
      end_time: s.end_time,
    };
    setEditing(s);
    setForm(nextForm);
    setInitialForm(nextForm);
    setShowModal(true);
  };
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
      setEditing(null);
      setForm(empty);
      setInitialForm(empty);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save schedule details."));
    }
  };

  const openDelete = (schedule) => {
    setDeletingSchedule(schedule);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteSchedule(deletingSchedule.id).unwrap();
      toast.success("Schedule deleted");
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to delete schedule."));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Schedules</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
           Add Schedule
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? <p className="text-purple-200 p-8 text-center">Loading...</p>
          : isError ? <p className="text-red-400 p-8 text-center">Failed to load schedules.</p>
          : (
          <table className="w-full text-sm text-left text-white">
            <thead className="bg-white/10 text-purple-200 uppercase text-xs">
              <tr>{["#", "Start Time", "End Time", "Actions"].map(h => <th key={h} className="px-6 py-4">{h}</th>)}</tr>
            </thead>
            <tbody>
              {schedules.length === 0
                ? <tr><td colSpan={5} className="text-center py-8 text-purple-300">No schedules found</td></tr>
                : paginatedItems.map((s, i) => (
                  <tr key={s.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{startItem + i}</td>
                    <td className="px-6 py-4">{s.start_time}</td>
                    <td className="px-6 py-4">{s.end_time}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button onClick={() => openEdit(s)} className="text-yellow-400 hover:text-yellow-300"><FaEdit size={16} /></button>
                      <button onClick={() => openDelete(s)} disabled={isDeletingSchedule} className="text-red-400 hover:text-red-300 disabled:text-red-200 disabled:cursor-not-allowed"><FaTrash size={16} /></button>
                    </td>
                  </tr>
                ))}
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

      <Modal show={showModal} title={editing ? "Edit Schedule" : "Add Schedule"} onClose={() => { setShowModal(false); setEditing(null); setForm(empty); setInitialForm(empty); }} onSubmit={handleSubmit} submitLabel={editing ? "Update" : "Add Schedule"} submitLoadingLabel={editing ? "Update" : "Adding..."} isSubmitting={isSubmitDisabled} size="4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Start Time" name="start_time" type="time" value={form.start_time} onChange={handleChange} required />
          <Input label="End Time" name="end_time" type="time" value={form.end_time} onChange={handleChange} required />
        </div>
      </Modal>

      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Schedule"
        footerContent={
          <div className="flex gap-4 w-full">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingSchedule}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeletingSchedule}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all"
            >
              {isDeletingSchedule ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <FaTrash className="text-red-500 text-2xl" />
          </div>
          <p className="text-gray-600 text-lg">Are you sure you want to delete schedule:</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {deletingSchedule ? `${deletingSchedule.start_time} - ${deletingSchedule.end_time}` : ""}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Schedules;
