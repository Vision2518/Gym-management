import { useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import Modal from "./shared/Modal";
import Input from "./shared/Input";
import { useGetPlansByCompanyQuery, useAddPlanMutation, useUpdatePlanMutation, useDeletePlanMutation } from "../redux/features/authSlice";
import { getErrorMessage } from "../utils/toastMessage";

const empty = { name: "", duration: "", price: "" };

const Plans = () => {
  const { data, isLoading, isError } = useGetPlansByCompanyQuery();
  const [addPlan, { isLoading: isAddingPlan }] = useAddPlanMutation();
  const [updatePlan, { isLoading: isUpdatingPlan }] = useUpdatePlanMutation();
  const [deletePlan, { isLoading: isDeletingPlan }] = useDeletePlanMutation();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [form, setForm] = useState(empty);
  const [initialForm, setInitialForm] = useState(empty);

  const plans = data?.plans || [];
  const isSubmitting = isAddingPlan || isUpdatingPlan;
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const isSubmitDisabled = isSubmitting || (editing && !isDirty);

  const openAdd = () => { setEditing(null); setForm(empty); setInitialForm(empty); setShowModal(true); };
  const openEdit = (p) => {
    const nextForm = { name: p.plan_name, duration: p.duration, price: p.price };
    setEditing(p);
    setForm(nextForm);
    setInitialForm(nextForm);
    setShowModal(true);
  };
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
      setEditing(null);
      setForm(empty);
      setInitialForm(empty);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save plan details."));
    }
  };

  const openDelete = (plan) => {
    const memberCount = Number(plan.member_count || 0);
    if (memberCount > 0) {
      toast.error("This plan cannot be deleted because members are enrolled in it.");
      return;
    }
    setDeletingPlan(plan);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deletePlan(deletingPlan.id).unwrap();
      toast.success("Plan deleted");
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to delete plan."));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Membership Plans</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
           Add Plan
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? <p className="text-purple-200 p-8 text-center">Loading...</p>
          : isError ? <p className="text-red-400 p-8 text-center">Failed to load plans.</p>
          : (
          <table className="w-full text-sm text-left text-white">
            <thead className="bg-white/10 text-purple-200 uppercase text-xs">
              <tr>{["#", "Plan Name", "Duration", "Price (Rs)", "Members", "Actions"].map(h => <th key={h} className="px-6 py-4">{h}</th>)}</tr>
            </thead>
            <tbody>
              {plans.length === 0
                ? <tr><td colSpan={6} className="text-center py-8 text-purple-300">No plans found</td></tr>
                : plans.map((p, i) => {
                    const memberCount = Number(p.member_count || 0);
                    const isDeleteDisabled = isDeletingPlan || memberCount > 0;

                    return (
                  <tr key={p.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 font-medium">{p.plan_name}</td>
                    <td className="px-6 py-4">{p.duration}</td>
                    <td className="px-6 py-4">Rs {p.price}</td>
                    <td className="px-6 py-4">{memberCount}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button onClick={() => openEdit(p)} className="text-yellow-400 hover:text-yellow-300"><FaEdit size={16} /></button>
                      <button
                        onClick={() => openDelete(p)}
                        disabled={isDeleteDisabled}
                        title={memberCount > 0 ? "Cannot delete a plan with enrolled members" : "Delete plan"}
                        className="text-red-400 hover:text-red-300 disabled:text-red-200 disabled:cursor-not-allowed"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                    );
                  })}
            </tbody>
          </table>
        )}
      </div>

      <Modal show={showModal} title={editing ? "Edit Plan" : "Add Plan"} onClose={() => { setShowModal(false); setEditing(null); setForm(empty); setInitialForm(empty); }} onSubmit={handleSubmit} submitLabel={editing ? "Update" : "Add Plan"} submitLoadingLabel={editing ? "Update" : "Adding..."} isSubmitting={isSubmitDisabled} size="4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Plan Name" name="name" placeholder="e.g. Gold" value={form.name} onChange={handleChange} required />
          <Input label="Duration" name="duration" placeholder="e.g. 1 Month" value={form.duration} onChange={handleChange} required />
          <Input label="Price (Rs)" name="price" type="number" placeholder="e.g. 2000" value={form.price} onChange={handleChange} required />
        </div>
      </Modal>

      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Plan"
        footerContent={
          <div className="flex gap-4 w-full">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingPlan}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeletingPlan}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all"
            >
              {isDeletingPlan ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <FaTrash className="text-red-500 text-2xl" />
          </div>
          <p className="text-gray-600 text-lg">Are you sure you want to delete plan:</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{deletingPlan?.plan_name}</p>
        </div>
      </Modal>
    </div>
  );
};

export default Plans;
