import { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaFileInvoice } from "react-icons/fa";
import { toast } from "react-toastify";
import Modal from "./shared/Modal";
import Input from "./shared/Input";
import { useGetAllPaymentsQuery, useAddPaymentMutation, useUpdatePaymentMutation, useDeletePaymentMutation } from "../redux/features/authSlice";

const empty = { member_id: "", plan_id: "", discount: 0, paid_amount: "", payment_method: "cash", remarks: "" };

const Payments = () => {
  const { data, isLoading, isError } = useGetAllPaymentsQuery();
  const [addPayment] = useAddPaymentMutation();
  const [updatePayment] = useUpdatePaymentMutation();
  const [deletePayment] = useDeletePaymentMutation();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const payments = data?.payments || [];

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ member_id: p.member_id, plan_id: p.plan_id, discount: p.discount, paid_amount: p.paid_amount, payment_method: p.payment_method, remarks: p.remarks || "" }); setShowModal(true); };
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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
    } catch (err) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment?")) return;
    try {
      await deletePayment(id).unwrap();
      toast.success("Payment deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed");
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
          <FaPlus /> Add Payment
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? <p className="text-purple-200 p-8 text-center">Loading...</p>
          : isError ? <p className="text-red-400 p-8 text-center">Failed to load payments.</p>
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
                      <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300"><FaTrash size={16} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal show={showModal} title={editing ? "Edit Payment" : "Add Payment"} onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitLabel={editing ? "Update" : "Add Payment"}>
        <Input label="Member ID" name="member_id" type="number" placeholder="Member ID" value={form.member_id} onChange={handleChange} required />
        <Input label="Plan ID" name="plan_id" type="number" placeholder="Plan ID" value={form.plan_id} onChange={handleChange} required />
        <Input label="Paid Amount" name="paid_amount" type="number" placeholder="Amount" value={form.paid_amount} onChange={handleChange} required />
        <Input label="Discount" name="discount" type="number" placeholder="0" value={form.discount} onChange={handleChange} />
        <label className="flex flex-col text-left">
          <span>Payment Method <span className="text-red-500">*</span></span>
          <select name="payment_method" value={form.payment_method} onChange={handleChange} className="border p-2 rounded">
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
          </select>
        </label>
        <Input label="Remarks" name="remarks" placeholder="Optional remarks" value={form.remarks} onChange={handleChange} />
      </Modal>
    </div>
  );
};

export default Payments;
