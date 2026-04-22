import { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaFileInvoice } from "react-icons/fa";
import { toast } from "react-toastify";
import Modal from "./shared/Modal";
import Input from "./shared/Input";
import { useGetAllPaymentsQuery, useAddPaymentMutation, useUpdatePaymentMutation, useDeletePaymentMutation, useGetMembersByCompanyQuery, useGetPlansByCompanyQuery } from "../redux/features/authSlice";
import { getErrorMessage } from "../utils/toastMessage";

const empty = { member_id: "", plan_id: "", discount: 0, paid_amount: "", payment_method: "cash", remarks: "" };

const Payments = () => {
  const { data, isLoading, isError } = useGetAllPaymentsQuery();
  const { data: membersData } = useGetMembersByCompanyQuery();
  const { data: plansData } = useGetPlansByCompanyQuery();
  const [addPayment, { isLoading: isAddingPayment }] = useAddPaymentMutation();
  const [updatePayment, { isLoading: isUpdatingPayment }] = useUpdatePaymentMutation();
  const [deletePayment, { isLoading: isDeletingPayment }] = useDeletePaymentMutation();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [form, setForm] = useState(empty);
  const [initialForm, setInitialForm] = useState(empty);
  const [memberSearch, setMemberSearch] = useState("");

  const payments = data?.payments || [];
  const members = membersData?.members || [];
  const plans = plansData?.plans || [];
  const isSubmitting = isAddingPayment || isUpdatingPayment;
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const isSubmitDisabled = isSubmitting || (editing && !isDirty);
  const normalizedSearch = memberSearch.trim().toLowerCase();
  const paidAmountText = form.paid_amount ? `${form.paid_amount} only` : "";
  const filteredMembers = members
    .filter((member) =>
      member.full_name?.toLowerCase().includes(normalizedSearch),
    )
    .sort((a, b) => {
      const aName = a.full_name?.toLowerCase() || "";
      const bName = b.full_name?.toLowerCase() || "";
      const aStarts = aName.startsWith(normalizedSearch);
      const bStarts = bName.startsWith(normalizedSearch);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return aName.localeCompare(bName);
    });
  const selectedMember = members.find((member) => String(member.id) === String(form.member_id));
  const selectedPlan = plans.find((plan) => String(plan.id) === String(form.plan_id));

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setInitialForm(empty);
    setMemberSearch("");
    setShowModal(true);
  };
  const openEdit = (p) => {
    const nextForm = { member_id: p.member_id, plan_id: p.plan_id, discount: p.discount, paid_amount: p.paid_amount, payment_method: p.payment_method, remarks: p.remarks || "" };
    setEditing(p);
    setForm(nextForm);
    setInitialForm(nextForm);
    setMemberSearch(p.member_name || "");
    setShowModal(true);
  };
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleMemberSelect = (e) => {
    const memberId = e.target.value;
    const member = members.find((item) => String(item.id) === String(memberId));

    setForm((prev) => ({
      ...prev,
      member_id: memberId,
      plan_id: member?.plan_id || "",
    }));
    setMemberSearch(member?.full_name || "");
  };
  const handleMemberPick = (member) => {
    setForm((prev) => ({
      ...prev,
      member_id: member.id,
      plan_id: member.plan_id || "",
    }));
    setMemberSearch(member.full_name || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updatePayment({ id: editing.id, ...form }).unwrap();
        toast.success("Payment updated");
      } else {
        await addPayment(form).unwrap();
        toast.success("Payment added");
      }
      setShowModal(false);
      setEditing(null);
      setForm(empty);
      setInitialForm(empty);
      setMemberSearch("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save payment details."));
    }
  };

  const openDelete = (payment) => {
    setDeletingPayment(payment);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deletePayment(deletingPayment.id).unwrap();
      toast.success("Payment deleted");
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to delete payment."));
    }
  };

  const handleBill = (id) => {
    window.open(`${import.meta.env.VITE_DEV_BACKEND_URL}/payment/bill/${id}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Payments</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
           Add Payment
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? <p className="text-purple-200 p-8 text-center">Loading...</p>
          : isError ? <p className="text-yellow-400 p-8 text-center">Failed to load payments.</p>
          : (
          <table className="w-full text-sm text-left text-white">
            <thead className="bg-white/10 text-purple-200 uppercase text-xs">
              <tr>{["#", "Member", "Plan", "Paid (Rs)", "Method", "Date", "Actions"].map(h => <th key={h} className="px-6 py-4">{h}</th>)}</tr>
            </thead>
            <tbody>
              {payments.length === 0
                ? <tr><td colSpan={7} className="text-center py-8 text-purple-300">No payments found</td></tr>
                : payments.map((p, i) => (
                  <tr key={p.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 font-medium">{p.member_name}</td>
                    <td className="px-6 py-4">{p.plan_name}</td>
                    <td className="px-6 py-4">Rs {p.paid_amount}</td>
                    <td className="px-6 py-4">{p.payment_method}</td>
                    <td className="px-6 py-4">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button onClick={() => handleBill(p.id)} className="text-green-400 hover:text-green-300"><FaFileInvoice size={16} /></button>
                      <button onClick={() => openEdit(p)} className="text-yellow-400 hover:text-yellow-300"><FaEdit size={16} /></button>
                      <button onClick={() => openDelete(p)} disabled={isDeletingPayment} className="text-red-400 hover:text-red-300 disabled:text-red-200 disabled:cursor-not-allowed"><FaTrash size={16} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
        
      <Modal show={showModal} title={editing ? "Edit Payment" : "Add Payment"} onClose={() => { setShowModal(false); setEditing(null); setForm(empty); setInitialForm(empty); setMemberSearch(""); }} onSubmit={handleSubmit} submitLabel={editing ? "Update" : "Add Payment"} submitLoadingLabel={editing ? "Update" : "Adding..."} isSubmitting={isSubmitDisabled} size="4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Search Member"
            name="member_search"
            placeholder="Search by member name"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Member Name</label>
            <div className="rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm max-h-48 overflow-y-auto">
              {normalizedSearch ? (
                filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleMemberPick(member)}
                      className={`w-full px-4 py-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                        String(form.member_id) === String(member.id)
                          ? "bg-red-50 text-red-700 font-semibold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {member.full_name}
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-gray-500">No matching members found.</p>
                )
              ) : (
                <select
                  name="member_id"
                  value={form.member_id}
                  onChange={handleMemberSelect}
                  required
                  className="w-full px-4 py-3 rounded-xl focus:outline-none bg-transparent text-gray-700"
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <Input
            label="Plan"
            name="plan_name"
            value={selectedPlan?.plan_name || selectedMember?.plan_name || ""}
            placeholder="Plan will be selected automatically"
            readOnly
          />
          <Input label="Paid Amount" name="paid_amount" type="number" placeholder="Amount" value={form.paid_amount} onChange={handleChange} required />
          
          <Input label="Discount" name="discount" type="number" placeholder="0" value={form.discount} onChange={handleChange} />
          <label className="flex flex-col text-left">
            <span>Payment Method <span className="text-red-500">*</span></span>
            <select name="payment_method" value={form.payment_method} onChange={handleChange} className="border p-2 rounded">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
            <div className="flex flex-col justify-center items-center">
            <p className="mt-2 min-h-10  text-lg font-medium text-gray-700">
              {paidAmountText}
            </p>
          </div>
          </label>
          <Input label="Remarks" name="remarks" placeholder="Optional remarks" value={form.remarks} onChange={handleChange} />
        </div>
      </Modal>

      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Payment"
        footerContent={
          <div className="flex gap-4 w-full">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingPayment}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeletingPayment}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all"
            >
              {isDeletingPayment ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <FaTrash className="text-red-500 text-2xl" />
          </div>
          <p className="text-gray-600 text-lg">Are you sure you want to delete payment for:</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{deletingPayment?.member_name}</p>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
