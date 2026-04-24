import { useMemo, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import Modal from "./shared/Modal";
import Input from "./shared/Input";
import { getErrorMessage } from "../utils/toastMessage";
import {
  useGetMembersByCompanyQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useGetPaymentHistoryQuery,
} from "../redux/features/authSlice";
import { useGetSchedulesByCompanyQuery, useGetPlansByCompanyQuery } from "../redux/features/authSlice";

const phoneRegex = /^\d{10}$/;

const empty = { full_name: "", phone: "", email: "", gender: "", age: "", address: "", join_date: "", status: "active", plan_id: "", schedule_id: "", company_id: "" };

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? `Rs. ${amount.toLocaleString()}` : "Rs. 0";
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toISOString().split("T")[0];
};

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

const Members = () => {
  const { data, isLoading, isError } = useGetMembersByCompanyQuery();
  const { data: schedulesData } = useGetSchedulesByCompanyQuery();
  const { data: plansData } = useGetPlansByCompanyQuery();
  const [addMember, { isLoading: isAddingMember }] = useAddMemberMutation();
  const [updateMember, { isLoading: isUpdatingMember }] = useUpdateMemberMutation();
  const [deleteMember, { isLoading: isDeletingMember }] = useDeleteMemberMutation();

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [form, setForm] = useState(empty);
  const [initialForm, setInitialForm] = useState(empty);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: paymentHistoryData,
    isFetching: isPaymentHistoryLoading,
    isError: isPaymentHistoryError,
  } = useGetPaymentHistoryQuery(viewingMember?.id, {
    skip: !viewingMember?.id || !showViewModal,
  });

  const members = data?.members || [];
  const schedules = schedulesData?.schedules || [];
  const plans = plansData?.plans || [];
  const paymentHistory = paymentHistoryData?.payment_history || [];
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredMembers = useMemo(() => members.filter((member) => {
    if (!normalizedSearchTerm) return true;

    const memberName = String(member.full_name || "").toLowerCase();
    const memberPhone = String(member.phone || "").toLowerCase();
    const memberEmail = String(member.email || "").toLowerCase();

    return (
      memberName.includes(normalizedSearchTerm) ||
      memberPhone.includes(normalizedSearchTerm) ||
      memberEmail.includes(normalizedSearchTerm)
    );
  }), [members, normalizedSearchTerm]);
  const isSubmitting = isAddingMember || isUpdatingMember;
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const isSubmitDisabled = isSubmitting || (editing && !isDirty);

  const openAdd = () => {
    const nextForm = { ...empty, company_id: getVendorCompanyId() };
    setEditing(null);
    setForm(nextForm);
    setInitialForm(nextForm);
    setShowModal(true);
  };
  const openEdit = (m) => {
    const nextForm = { full_name: m.full_name, phone: m.phone, email: m.email || "", gender: m.gender || "", age: m.age || "", address: m.address || "", join_date: m.join_date?.split("T")[0] || "", status: m.status, plan_id: m.plan_id, schedule_id: m.schedule_id, company_id: m.company_id };
    setEditing(m);
    setForm(nextForm);
    setInitialForm(nextForm);
    setShowModal(true);
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    if (!phoneRegex.test(form.phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      if (editing) {
        await updateMember({ id: editing.id, ...form }).unwrap();
        toast.success("Member updated");
      } else {
        await addMember({ ...form, company_id: form.company_id || getVendorCompanyId() }).unwrap();
        toast.success("Member added");
      }
      setShowModal(false);
      setEditing(null);
      setForm(empty);
      setInitialForm(empty);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save member details."));
    }
  };

  const openDelete = (member) => {
    setDeletingMember(member);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteMember(deletingMember.id).unwrap();
      toast.success("Member deleted");
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to delete member."));
    }
  };

  const openView = (member) => {
    setViewingMember(member);
    setShowViewModal(true);
  };

  const selectedViewPlan = plans.find(
    (plan) => String(plan.id) === String(viewingMember?.plan_id),
  );
  const selectedViewSchedule = schedules.find(
    (schedule) => String(schedule.id) === String(viewingMember?.schedule_id),
  );
  const paymentTotals = useMemo(() => paymentHistory.reduce(
    (acc, item) => {
      acc.totalPaid += Number(item.total_paid || 0);
      acc.totalDue += Number(item.remaining_amount || 0);
      return acc;
    },
    { totalPaid: 0, totalDue: 0 },
  ), [paymentHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Members</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
         Add Member
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search members by name, phone, or email"
          className="w-full max-w-md rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-purple-200/70 outline-none transition focus:border-purple-400 focus:bg-white/15"
        />
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
              {filteredMembers.length === 0
                ? <tr><td colSpan={7} className="text-center py-8 text-purple-300">No members found</td></tr>
                : filteredMembers.map((m, i) => (
                  <tr key={m.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 font-medium">{m.full_name}</td>
                    <td className="px-6 py-4">{m.phone}</td>
                    <td className="px-6 py-4">{m.email || "-"}</td>
                    <td className="px-6 py-4">{m.gender || "-"}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${m.status === "active" ? "bg-green-600" : "bg-red-600"}`}>{m.status}</span></td>
                    <td className="px-6 py-4 flex gap-3">
                      <button onClick={() => openView(m)} className="text-blue-400 hover:text-blue-300"><FaEye size={16} /></button>
                      <button onClick={() => openEdit(m)} className="text-yellow-400 hover:text-yellow-300"><FaEdit size={16} /></button>
                      <button onClick={() => openDelete(m)} disabled={isDeletingMember} className="text-red-400 hover:text-red-300 disabled:text-red-200 disabled:cursor-not-allowed"><FaTrash size={16} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal show={showModal} title={editing ? "Edit Member" : "Add Member"} onClose={() => { setShowModal(false); setEditing(null); setForm(empty); setInitialForm(empty); }} onSubmit={handleSubmit} submitLabel={editing ? "Update" : "Add Member"} submitLoadingLabel={editing ? "Update" : "Adding..."} isSubmitting={isSubmitDisabled} size="4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Full Name" name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required />
          <Input label="Phone" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required inputMode="numeric" pattern="\d{10}" maxLength={10} title="Phone number must be exactly 10 digits" />
          <Input label="Email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <Input label="Age" name="age" placeholder="Age" value={form.age} onChange={handleChange} />
          <Input label="Join Date" name="join_date" type="date" value={form.join_date} onChange={handleChange} required />
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
        <div className="md:col-span-3">
          <Input label="Address" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        </div>
      </Modal>

      <Modal
        show={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingMember(null);
        }}
        title="Member Details"
        size="4xl"
        footerContent={
          <button
            type="button"
            onClick={() => {
              setShowViewModal(false);
              setViewingMember(null);
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-base font-semibold text-gray-900">{viewingMember?.full_name || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-base font-semibold text-gray-900">{viewingMember?.phone || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-base font-semibold text-gray-900">{viewingMember?.email || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Age</p>
              <p className="text-base font-semibold text-gray-900">{viewingMember?.age || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-base font-semibold text-gray-900">{viewingMember?.gender || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Join Date</p>
              <p className="text-base font-semibold text-gray-900">{viewingMember?.join_date?.split("T")[0] || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-base font-semibold text-gray-900 capitalize">{viewingMember?.status || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Plan</p>
              <p className="text-base font-semibold text-gray-900">{selectedViewPlan?.plan_name || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Schedule</p>
              <p className="text-base font-semibold text-gray-900">
                {selectedViewSchedule
                  ? `${selectedViewSchedule.start_time} - ${selectedViewSchedule.end_time}`
                  : "-"}
              </p>
            </div>
          </div>
          <div className="space-y-1 pt-2">
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="text-base font-semibold text-gray-900">{viewingMember?.address || "-"}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">Payment Summary</p>
                <p className="text-sm text-slate-500">History, paid amount, and pending due for this member.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:min-w-[320px]">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Paid</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600">{formatCurrency(paymentTotals.totalPaid)}</p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Due</p>
                  <p className="mt-1 text-lg font-bold text-rose-600">{formatCurrency(paymentTotals.totalDue)}</p>
                </div>
              </div>
            </div>

            {isPaymentHistoryLoading ? (
              <p className="rounded-xl bg-white px-4 py-6 text-center text-sm text-slate-500">Loading payment history...</p>
            ) : isPaymentHistoryError ? (
              <p className="rounded-xl bg-red-50 px-4 py-6 text-center text-sm text-red-600">Failed to load payment history.</p>
            ) : paymentHistory.length === 0 ? (
              <p className="rounded-xl bg-white px-4 py-6 text-center text-sm text-slate-500">No payment history found for this member.</p>
            ) : (
              <div className="space-y-4">
                {paymentHistory.map((item) => (
                  <div key={item.plan_id} className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-slate-900">{item.plan_name || "Plan"}</p>
                        <p className="text-sm text-slate-500">
                          Plan Price: {formatCurrency(item.plan_price)} | Discount: {formatCurrency(item.discount)}
                        </p>
                      </div>
                      <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        Number(item.remaining_amount) === 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {item.payment_status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Payable</p>
                        <p className="mt-1 text-base font-bold text-slate-900">{formatCurrency(item.payable_amount)}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Paid</p>
                        <p className="mt-1 text-base font-bold text-emerald-700">{formatCurrency(item.total_paid)}</p>
                      </div>
                      <div className="rounded-xl bg-rose-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-rose-700">Due</p>
                        <p className="mt-1 text-base font-bold text-rose-700">{formatCurrency(item.remaining_amount)}</p>
                      </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-left text-slate-500">
                            <th className="px-3 py-2 font-medium">Date</th>
                            <th className="px-3 py-2 font-medium">Amount</th>
                            <th className="px-3 py-2 font-medium">Method</th>
                            <th className="px-3 py-2 font-medium">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.payments.map((payment) => (
                            <tr key={payment.id} className="border-b border-slate-100 last:border-b-0">
                              <td className="px-3 py-2 text-slate-700">{formatDate(payment.created_at)}</td>
                              <td className="px-3 py-2 font-semibold text-slate-900">{formatCurrency(payment.paid_amount)}</td>
                              <td className="px-3 py-2 capitalize text-slate-700">{payment.payment_method || "-"}</td>
                              <td className="px-3 py-2 text-slate-600">{payment.remarks || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Member"
        footerContent={
          <div className="flex gap-4 w-full">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingMember}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeletingMember}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all"
            >
              {isDeletingMember ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <FaTrash className="text-red-500 text-2xl" />
          </div>
          <p className="text-gray-600 text-lg">Are you sure you want to delete member:</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{deletingMember?.full_name}</p>
        </div>
      </Modal>
    </div>
  );
};

export default Members;
