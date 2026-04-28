import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaFileInvoice } from "react-icons/fa";
import { toast } from "react-toastify";
import Modal from "./shared/Modal";
import Input from "./shared/Input";
import Pagination from "./shared/Pagination";
import {
  useGetAllPaymentsQuery,
  useAddPaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useGetMembersByCompanyQuery,
  useGetPlansByCompanyQuery,
} from "../redux/features/authSlice";
import { getErrorMessage } from "../utils/toastMessage";

const getTodayDate = () => new Date().toISOString().split("T")[0];
const paymentFilters = [
  {
    key: "all",
    label: "All Payments",
    description: "View every payment record in one place.",
  },
  {
    key: "paid",
    label: "Paid",
    description: "Members who have fully paid their amount.",
  },
  {
    key: "partial",
    label: "Partially Paid",
    description: "Payments with a remaining balance still due.",
  },
  {
    key: "unpaid",
    label: "Unpaid",
    description: "Members or records with no payment completed yet.",
  },
];

const empty = {
  member_id: "",
  plan_id: "",
  discount: 0,
  paid_amount: "",
  payment_date: getTodayDate(),
  payment_method: "cash",
  remarks: "",
};

const getPaymentStatus = (payment) => {
  const rawStatus = String(payment.payment_status || payment.status || "")
    .trim()
    .toLowerCase();

  if (rawStatus.includes("partial")) return "partial";
  if (rawStatus === "paid" || rawStatus === "complete") return "paid";
  if (
    rawStatus === "unpaid" ||
    rawStatus === "pending" ||
    rawStatus === "due"
  ) {
    return "unpaid";
  }

  const paidAmount = Number(payment.paid_amount || 0);
  const remainingAmount = Number(payment.remaining_amount || 0);

  if (remainingAmount > 0 && paidAmount > 0) return "partial";
  if (remainingAmount > 0 && paidAmount <= 0) return "unpaid";
  if (paidAmount > 0) return "paid";

  return "unpaid";
};

const getStatusStyles = (status) => {
  if (status === "paid") {
    return "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30";
  }

  if (status === "partial") {
    return "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30";
  }

  return "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30";
};

const formatStatusLabel = (status) => {
  if (status === "partial") return "Partially Paid";
  if (status === "paid") return "Paid";
  return "Unpaid";
};

const Payments = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const paymentQueryArgs = {
    page: currentPage,
    limit: 10,
    filter: activeFilter,
    search: paymentSearch.trim(),
  };
  const { data, isLoading, isError } = useGetAllPaymentsQuery(paymentQueryArgs);
  const { data: membersData, isLoading: isMembersLoading } =
    useGetMembersByCompanyQuery();
  const { data: plansData } = useGetPlansByCompanyQuery();
  const [addPayment, { isLoading: isAddingPayment }] = useAddPaymentMutation();
  const [updatePayment, { isLoading: isUpdatingPayment }] =
    useUpdatePaymentMutation();
  const [deletePayment, { isLoading: isDeletingPayment }] =
    useDeletePaymentMutation();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [form, setForm] = useState(empty);
  const [initialForm, setInitialForm] = useState(empty);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMemberData, setSelectedMemberData] = useState(null);
  const [selectedPlanName, setSelectedPlanName] = useState("");

  const payments = data?.payments || [];
  const members = membersData?.members || [];
  const plans = plansData?.plans || [];
  const pagination = data?.pagination;
  const paymentStatusCounts = data?.counts || {
    all: 0,
    paid: 0,
    partial: 0,
    unpaid: 0,
  };
  const isSubmitting = isAddingPayment || isUpdatingPayment;
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const isSubmitDisabled = isSubmitting || (editing && !isDirty);
  const normalizedSearch = memberSearch.trim().toLowerCase();
  const paidAmountText = form.paid_amount ? `${form.paid_amount} only` : "";
  const filteredMembers = useMemo(() => {
    return members
      .filter((member) => {
        if (!normalizedSearch) return true;

        const memberName = member.full_name?.toLowerCase() || "";
        const memberPhone = String(member.phone || "").toLowerCase();
        const memberEmail = String(member.email || "").toLowerCase();

        return (
          memberName.includes(normalizedSearch) ||
          memberPhone.includes(normalizedSearch) ||
          memberEmail.includes(normalizedSearch)
        );
      })
      .sort((a, b) => {
        const aName = a.full_name?.toLowerCase() || "";
        const bName = b.full_name?.toLowerCase() || "";
        const aStarts = aName.startsWith(normalizedSearch);
        const bStarts = bName.startsWith(normalizedSearch);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aName.localeCompare(bName);
      });
  }, [members, normalizedSearch]);
  const exactMatchedMember = useMemo(() => {
    if (!normalizedSearch) return null;

    return (
      members.find(
        (member) => (member.full_name || "").trim().toLowerCase() === normalizedSearch,
      ) || null
    );
  }, [members, normalizedSearch]);
  const selectedMember = members.find(
    (member) => String(member.id) === String(form.member_id),
  );
  const selectedPlan = plans.find(
    (plan) => String(plan.id) === String(form.plan_id),
  );
  const selectedMemberPlan = plans.find(
    (plan) =>
      String(plan.id) ===
      String(selectedMemberData?.plan_id || selectedMember?.plan_id),
  );
  const showMemberSuggestions =
    showModal &&
    filteredMembers.length > 0 &&
    (normalizedSearch || !form.member_id);
  const totalCollected = Number(data?.summary?.collected_amount || 0);
  const selectedFilterConfig =
    paymentFilters.find((filter) => filter.key === activeFilter) ||
    paymentFilters[0];
  const pageSize = pagination?.limit || 10;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems || 0;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const showPagination = totalItems > 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, paymentSearch]);

  useEffect(() => {
    if (exactMatchedMember) {
      const nextPlanId = exactMatchedMember.plan_id
        ? String(exactMatchedMember.plan_id)
        : "";

      if (
        String(form.member_id || "") !== String(exactMatchedMember.id) ||
        String(form.plan_id || "") !== nextPlanId
      ) {
        setForm((prev) => ({
          ...prev,
          member_id: String(exactMatchedMember.id),
          plan_id: nextPlanId,
        }));
      }

      setSelectedMemberData(exactMatchedMember);
      setSelectedPlanName(
        exactMatchedMember.plan_name ||
          plans.find((plan) => String(plan.id) === nextPlanId)?.plan_name ||
          "",
      );
      return;
    }

    if (!form.member_id) return;

    const matchedMember = members.find(
      (member) => String(member.id) === String(form.member_id),
    );

    if (!matchedMember) return;

    const nextPlanId = matchedMember.plan_id ? String(matchedMember.plan_id) : "";

    if (String(form.plan_id || "") !== nextPlanId) {
      setForm((prev) => ({
        ...prev,
        plan_id: nextPlanId,
      }));
    }

    setSelectedMemberData(matchedMember);
    setSelectedPlanName(
      matchedMember.plan_name ||
        plans.find((plan) => String(plan.id) === nextPlanId)?.plan_name ||
        "",
    );
  }, [exactMatchedMember, form.member_id, form.plan_id, members, plans]);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setInitialForm(empty);
    setMemberSearch("");
    setSelectedMemberData(null);
    setSelectedPlanName("");
    setShowModal(true);
  };
  const openEdit = (p) => {
    const matchedMember = members.find(
      (member) => String(member.id) === String(p.member_id),
    );
    const nextForm = {
      member_id: p.member_id,
      plan_id: p.plan_id,
      discount: p.discount,
      paid_amount: p.paid_amount,
      payment_date: p.created_at ? new Date(p.created_at).toISOString().split("T")[0] : getTodayDate(),
      payment_method: p.payment_method,
      remarks: p.remarks || "",
    };
    setEditing(p);
    setForm(nextForm);
    setInitialForm(nextForm);
    setMemberSearch(p.member_name || "");
    setSelectedMemberData(matchedMember || null);
    setSelectedPlanName(
      p.plan_name ||
        matchedMember?.plan_name ||
        plans.find((plan) => String(plan.id) === String(p.plan_id))?.plan_name ||
        "",
    );
    setShowModal(true);
  };
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleMemberPick = (member) => {
    setForm((prev) => ({
      ...prev,
      member_id: String(member.id),
      plan_id: member.plan_id ? String(member.plan_id) : "",
    }));
    setMemberSearch(member.full_name || "");
    setSelectedMemberData(member);
    setSelectedPlanName(
      member.plan_name ||
        plans.find((plan) => String(plan.id) === String(member.plan_id))?.plan_name ||
        "",
    );
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
      setSelectedMemberData(null);
      setSelectedPlanName("");
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
    window.open(
      `${import.meta.env.VITE_DEV_BACKEND_URL}/payment/bill/${id}`,
      "_blank",
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Tracker</h1>
          <p className="mt-2 max-w-2xl text-sm text-purple-200/80">
            Track fully paid, partially paid, and unpaid members from one
            workspace.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 self-start rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
        >
          <FaPlus size={14} />
          Add Payment
        </button>
      </div>

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
              <p className="text-sm text-emerald-200/80">Collected</p>
              <p className="mt-2 text-2xl font-bold text-white">
                Rs {totalCollected.toLocaleString()}
              </p>
            </div>
            <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-5">
              <p className="text-sm text-amber-200/80">Partially Paid</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {paymentStatusCounts.partial}
              </p>
            </div>
            <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-5">
              <p className="text-sm text-rose-200/80">Unpaid</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {paymentStatusCounts.unpaid}
              </p>
            </div>
          </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-xl">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {selectedFilterConfig.label}
              </h2>
              <p className="mt-1 text-sm text-purple-200/75">
                {selectedFilterConfig.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex min-w-[190px] flex-col gap-2 text-sm text-purple-200/80">
                <span>Status Filter</span>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-white outline-none transition focus:border-purple-400"
                >
                  {paymentFilters.map((filter) => (
                    <option key={filter.key} value={filter.key}>
                      {filter.label} ({paymentStatusCounts[filter.key] ?? 0})
                    </option>
                  ))}
                </select>
              </label>
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                placeholder="Search payments by member name, phone, or email"
                className="w-full min-w-[260px] max-w-md rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-purple-200/70 outline-none transition focus:border-purple-400 focus:bg-white/15"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            {isLoading || isMembersLoading ? (
              <p className="p-8 text-center text-purple-200">Loading...</p>
            ) : isError ? (
              <p className="p-8 text-center text-yellow-400">
                No payments found
              </p>
            ) : (
              <table className="w-full text-left text-sm text-white">
                <thead className="bg-white/10 text-xs uppercase text-purple-200">
                  <tr>
                    {[
                      "#",
                      "Member",
                      "Plan",
                      "Status",
                      "Paid (Rs)",
                      "Method",
                      "Date",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="px-6 py-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-10 text-center text-purple-300"
                      >
                        No records found for this filter.
                      </td>
                    </tr>
                  ) : (
                    payments.map((row, i) => {
                      const status = getPaymentStatus(row);
                      const isPaymentRow = row.rowType === "payment";

                      return (
                        <tr
                          key={row.id}
                          className="border-t border-white/10 transition-colors hover:bg-white/5"
                        >
                          <td className="px-6 py-4">{startItem + i}</td>
                          <td className="px-6 py-4 font-medium">
                            {row.member_name}
                          </td>
                          <td className="px-6 py-4">{row.plan_name}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                                status,
                              )}`}
                            >
                              {formatStatusLabel(status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            Rs {Number(row.paid_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {row.payment_method}
                          </td>
                          <td className="px-6 py-4">
                            {row.created_at
                              ? new Date(row.created_at).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="flex gap-3 px-6 py-4">
                            {isPaymentRow ? (
                              <>
                                <button
                                  onClick={() => handleBill(row.id)}
                                  className="cursor-pointer text-green-400 hover:text-green-300"
                                >
                                  <FaFileInvoice size={16} />
                                </button>
                                <button
                                  onClick={() => openEdit(row)}
                                  className="cursor-pointer text-yellow-400 hover:text-yellow-300"
                                >
                                  <FaEdit size={16} />
                                </button>
                                <button
                                  onClick={() => openDelete(row)}
                                  disabled={isDeletingPayment}
                                  className="cursor-pointer text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:text-red-200"
                                >
                                  <FaTrash size={16} />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={openAdd}
                                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-700"
                              >
                                Add Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {showPagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              goToPrevious={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              goToNext={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              goToPage={(page) => {
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }}
              startItem={startItem}
              endItem={endItem}
              totalItems={totalItems}
            />
          )}
        </div>
      </section>

      <Modal
        show={showModal}
        title={editing ? "Edit Payment" : "Add Payment"}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
          setForm(empty);
          setInitialForm(empty);
          setMemberSearch("");
          setSelectedMemberData(null);
          setSelectedPlanName("");
        }}
        onSubmit={handleSubmit}
        submitLabel={editing ? "Update" : "Add Payment"}
        submitLoadingLabel={editing ? "Update" : "Adding..."}
        isSubmitting={isSubmitDisabled}
        size="4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 relative">
            <label className="block text-sm font-medium text-gray-700">
              Member
            </label>
            <input
              name="member_search"
              type="text"
              placeholder="Search member by name, phone, or email"
              value={memberSearch}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                if (form.member_id) {
                  setForm((prev) => ({ ...prev, member_id: "", plan_id: "" }));
                  setSelectedMemberData(null);
                  setSelectedPlanName("");
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
              required
            />
            {showMemberSuggestions ? (
              <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                {filteredMembers.map((member) => (
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
                    <span className="block">{member.full_name}</span>
                    <span className="block text-xs opacity-70">
                      {[member.phone, member.email]
                        .filter(Boolean)
                        .join(" | ") || "No contact info"}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
            {normalizedSearch && filteredMembers.length === 0 ? (
              <p className="text-sm text-gray-500">
                No matching members found.
              </p>
            ) : null}
          </div>
          <Input
            label="Plan"
            name="plan_name"
            value={selectedPlanName || selectedPlan?.plan_name || selectedMemberPlan?.plan_name || ""}
            placeholder="Plan will be selected automatically"
            readOnly
          />
          <Input
            label="Paid Amount"
            name="paid_amount"
            type="number"
            placeholder="Amount"
            value={form.paid_amount}
            onChange={handleChange}
            required
          />

          <Input
            label="Discount"
            name="discount"
            type="number"
            placeholder="0"
            value={form.discount}
            onChange={handleChange}
          />
          <Input
            label="Payment Date"
            name="payment_date"
            type="date"
            value={form.payment_date}
            onChange={handleChange}
            required
          />
          <label className="flex flex-col text-left">
            <span>
              Payment Method <span className="text-red-500">*</span>
            </span>
            <select
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
              className="border p-2 rounded"
            >
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
          <Input
            label="Remarks"
            name="remarks"
            placeholder="Optional remarks"
            value={form.remarks}
            onChange={handleChange}
          />
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
          <p className="text-gray-600 text-lg">
            Are you sure you want to delete payment for:
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {deletingPayment?.member_name}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
