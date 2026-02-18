import React, { useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  UserCheck,
  Search,
  MoreVertical,
  Shield,
  Trash2,
  Pencil,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  useCreateDesignationMutation,
  useDeleteDesignationMutation,
  useGetDesignationsQuery,
  useGetPermissionKeysQuery,
  useGetEmployeesQuery,
  useUpdateDesignationMutation,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../../store/api";

const DEFAULT_EMPLOYEES_PER_PAGE = 20;

const Management = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_EMPLOYEES_PER_PAGE);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 350);

  const {
    data: designationsResponse,
    isLoading: designationsLoading,
    isError: designationsError,
  } = useGetDesignationsQuery();

  const {
    data: permissionsResponse,
    isLoading: permissionsLoading,
    isError: permissionsError,
  } = useGetPermissionKeysQuery();

  const trimmedSearch = debouncedSearch.trim();

  const {
    data: employeesResponse,
    isLoading: employeesLoading,
    isError: employeesError,
    refetch: refetchEmployees,
  } = useGetEmployeesQuery(
    {
      page: currentPage,
      perPage,
      q: trimmedSearch,
    },
    { refetchOnMountOrArgChange: true },
  );

  const designations = designationsResponse?.data?.items || [];
  const designationPermissionOptions =
    permissionsResponse?.data?.designationPermissions || [];
  const pagePermissionOptions =
    permissionsResponse?.data?.pagePermissions || [];
  const employees = employeesResponse?.data?.items || [];
  const meta = employeesResponse?.meta || {
    total: employees.length,
    totalPages: 1,
    page: currentPage,
  };

  const activeUsers = useMemo(
    () => employees.filter((employee) => employee.isActive).length,
    [employees],
  );

  const stats = useMemo(
    () => [
      {
        title: "Management Users",
        value: meta.total ?? employees.length,
        icon: <Users size={22} />,
        bg: "bg-orange-100",
        iconBg: "bg-orange-500",
      },
      {
        title: "Designations",
        value: designations.length,
        icon: <ShieldCheck size={22} />,
        bg: "bg-blue-100",
        iconBg: "bg-blue-500",
      },
      {
        title: "Active Users",
        value: activeUsers,
        icon: <UserCheck size={22} />,
        bg: "bg-green-100",
        iconBg: "bg-green-500",
      },
    ],
    [designations.length, employees.length, meta.total, activeUsers],
  );

  return (
    <div>
      <DashboardStats stats={stats} />
      <DesignationsSection
        designations={designations}
        permissionOptions={designationPermissionOptions}
        isLoading={designationsLoading}
        isError={designationsError}
        permissionsLoading={permissionsLoading}
        permissionsError={permissionsError}
      />
      <ManagementUsers
        employees={employees}
        meta={meta}
        designations={designations}
        pagePermissionOptions={pagePermissionOptions}
        isLoading={employeesLoading}
        isError={employeesError}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onRefreshEmployees={refetchEmployees}
        onResetPage={() => setCurrentPage(1)}
        perPage={perPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setCurrentPage(1);
        }}
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default Management;

const DesignationsSection = ({
  designations,
  permissionOptions,
  isLoading,
  isError,
  permissionsLoading,
  permissionsError,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [formState, setFormState] = useState(getEmptyDesignationForm());
  const [formError, setFormError] = useState("");
  const { notice, showNotice, clearNotice } = useTimedNotice();

  const [createDesignation, { isLoading: isCreating }] =
    useCreateDesignationMutation();
  const [updateDesignation, { isLoading: isUpdating }] =
    useUpdateDesignationMutation();
  const [deleteDesignation, { isLoading: isDeleting }] =
    useDeleteDesignationMutation();

  const isSaving = isCreating || isUpdating;

  const handleOpenCreate = () => {
    setFormError("");
    clearNotice();
    setEditingDesignation(null);
    setFormState(getEmptyDesignationForm());
    setIsFormOpen(true);
  };

  const handleOpenEdit = (designation) => {
    setFormError("");
    clearNotice();
    setEditingDesignation(designation);
    setFormState(mapDesignationToForm(designation));
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingDesignation(null);
    setFormState(getEmptyDesignationForm());
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const payload = buildDesignationPayload(formState);
    if (!payload.name) {
      setFormError("Designation name is required.");
      showNotice("error", "Designation name is required.");
      return;
    }

    try {
      if (editingDesignation) {
        await updateDesignation({ id: editingDesignation._id, ...payload }).unwrap();
        showNotice("success", "Designation updated successfully.");
      } else {
        const { isActive, ...createPayload } = payload;
        await createDesignation(createPayload).unwrap();
        showNotice("success", "Designation created successfully.");
      }
      handleCloseForm();
    } catch (error) {
      const message =
        error?.data?.message || error?.error || "Unable to save designation.";
      setFormError(message);
      showNotice("error", message);
    }
  };

  const handleDelete = async (designation) => {
    if (isDeleting) return;
    const shouldDelete = window.confirm(
      `Delete designation "${designation.name}"? This cannot be undone.`,
    );
    if (!shouldDelete) return;

    try {
      await deleteDesignation(designation._id).unwrap();
      showNotice("success", "Designation deleted successfully.");
    } catch {
      setFormError("Unable to delete designation. Try again.");
      showNotice("error", "Unable to delete designation. Try again.");
    }
  };

  return (
    <div className="bg-white mt-6 rounded-3xl">
      <div className="flex items-center justify-between px-6 pt-6">
        <h2 className="text-lg font-semibold">Designations</h2>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add Designation
        </button>
      </div>
      <NoticeBanner notice={notice} />

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mx-6 mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Name
              </label>
              <input
                type="text"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                placeholder="e.g. Ops Manager"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Permission Keys
              </label>
              <MultiSelect
                options={permissionOptions || []}
                value={formState.permissionKeys}
                onChange={(values) =>
                  setFormState((prev) => ({
                    ...prev,
                    permissionKeys: values,
                  }))
                }
                disabled={permissionsLoading || permissionsError}
                placeholder="Select permissions"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Click to select multiple permissions.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    isActive: event.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              Active
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-70"
              >
                {isSaving ? "Saving..." : editingDesignation ? "Update" : "Create"}
              </button>
            </div>
          </div>

          {formError && (
            <div className="mt-3 text-sm text-red-600">{formError}</div>
          )}
        </form>
      )}

      <div className="flex flex-wrap p-4 gap-4 mb-8">
        {permissionsLoading && (
          <p className="text-sm text-gray-500 px-4">
            Loading permission options...
          </p>
        )}
        {permissionsError && (
          <p className="text-sm text-red-500 px-4">
            Unable to load permission options.
          </p>
        )}
        {isLoading && (
          <p className="text-sm text-gray-500 px-4">Loading designations...</p>
        )}
        {isError && (
          <p className="text-sm text-red-500 px-4">
            Unable to load designations.
          </p>
        )}
        {!isLoading && !isError && designations.length === 0 && (
          <p className="text-sm text-gray-500 px-4">No designations found.</p>
        )}

        {designations.map((designation) => (
          <div
            key={designation._id}
            className="bg-white border border-gray-200 rounded-[20px] px-3.75 py-4 flex justify-between items-start w-[227px] h-[102px] shadow-sm hover:shadow-lg"
            style={{ gap: "30px" }}
          >
            <div>
              <p className="text-sm font-medium">{designation.name}</p>
              <p className="text-xs mt-2 text-gray-500">
                {designation.code || "EMPLOYEE"}
              </p>
              <p className="text-[11px] mt-1 text-gray-400">
                {designation.permissionKeys?.length || 0} permissions
              </p>
            </div>

            <div className="flex flex-row gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(designation)}
                className="text-gray-400 hover:text-blue-500 text-sm"
                aria-label="Edit designation"
              >
                <Pencil size={14} />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(designation)}
                className="text-gray-400 hover:text-red-500 text-sm"
                aria-label="Delete designation"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManagementUsers = ({
  employees,
  meta,
  designations,
  pagePermissionOptions,
  isLoading,
  isError,
  currentPage,
  onPageChange,
  onRefreshEmployees,
  onResetPage,
  perPage,
  onPerPageChange,
  searchTerm,
  onSearchChange,
}) => {
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState(getEmptyEmployeeForm());
  const [employeeError, setEmployeeError] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = React.useRef(null);
  const activeMenuIdRef = React.useRef(null);
  const { notice, showNotice, clearNotice } = useTimedNotice();
  const [createEmployee, { isLoading: isCreatingEmployee }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdatingEmployee }] =
    useUpdateEmployeeMutation();

  const totalPages = Math.max(1, meta.totalPages || 1);
  const isAll = perPage === "all";
  const perPageNumber = isAll ? meta.total || employees.length : Number(perPage);
  const startIndex = isAll ? 0 : (currentPage - 1) * perPageNumber;
  const showingFrom = meta.total ? startIndex + 1 : 0;
  const showingTo = meta.total
    ? Math.min(startIndex + perPageNumber, meta.total)
    : 0;

  const maxVisiblePages = 4;
  const visibleStartPage = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(maxVisiblePages / 2),
      totalPages - maxVisiblePages + 1,
    ),
  );
  const visibleEndPage = Math.min(
    totalPages,
    visibleStartPage + maxVisiblePages - 1,
  );
  const visiblePages = Array.from(
    { length: visibleEndPage - visibleStartPage + 1 },
    (_, i) => visibleStartPage + i,
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const closeEmployeeForm = () => {
    setIsEmployeeFormOpen(false);
    setEditingEmployee(null);
    setEmployeeForm(getEmptyEmployeeForm());
    setEmployeeError("");
    clearNotice();
  };

  const openEmployeeForm = () => {
    setIsEmployeeFormOpen(true);
    setEditingEmployee(null);
    setEmployeeForm(getEmptyEmployeeForm());
    setEmployeeError("");
    clearNotice();
  };

  const openEditEmployee = (employee) => {
    setIsEmployeeFormOpen(true);
    setEditingEmployee(employee);
    setEmployeeForm(mapEmployeeToForm(employee));
    setEmployeeError("");
    clearNotice();
  };

  React.useEffect(() => {
    activeMenuIdRef.current = activeMenuId;
  }, [activeMenuId]);

  React.useEffect(() => {
    const handleClick = (event) => {
      if (!activeMenuIdRef.current) return;
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      setActiveMenuId(null);
    };
    if (activeMenuId) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activeMenuId]);

  const handleEmployeeSubmit = async (event) => {
    event.preventDefault();
    setEmployeeError("");
    clearNotice();

    const isEditing = Boolean(editingEmployee);
    const requiredChecks = [
      { key: "name", label: "Name" },
      { key: "nicNumber", label: "NIC number" },
      { key: "hrNumber", label: "HR number" },
      { key: "email", label: "Email" },
    ];

    for (const { key, label } of requiredChecks) {
      if (!employeeForm[key]?.trim()) {
        const message = `${label} is required.`;
        setEmployeeError(message);
        showNotice("error", message);
        return;
      }
    }

    if (!employeeForm.designationId) {
      const message = "Please select a designation.";
      setEmployeeError(message);
      showNotice("error", message);
      return;
    }

    const emailValue = employeeForm.email.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    if (!emailOk) {
      const message = "Please enter a valid email address.";
      setEmployeeError(message);
      showNotice("error", message);
      return;
    }

    const passwordValue = employeeForm.password.trim();
    if (!isEditing && !passwordValue) {
      const message = "Password is required.";
      setEmployeeError(message);
      showNotice("error", message);
      return;
    }

    if (passwordValue && passwordValue.length < 6) {
      const message = "Password must be at least 6 characters.";
      setEmployeeError(message);
      showNotice("error", message);
      return;
    }

    try {
      const payload = {
        name: employeeForm.name.trim(),
        fatherName: employeeForm.fatherName.trim(),
        nicNumber: employeeForm.nicNumber.trim(),
        hrNumber: employeeForm.hrNumber.trim(),
        email: emailValue.toLowerCase(),
        designationId: employeeForm.designationId,
        pagePermissions: employeeForm.pagePermissions,
      };

      if (passwordValue) {
        payload.password = passwordValue;
      }

      if (isEditing) {
        await updateEmployee({
          id: editingEmployee._id,
          ...payload,
          isActive: Boolean(employeeForm.isActive),
        }).unwrap();
        showNotice("success", "Employee updated successfully.");
      } else {
        await createEmployee(payload).unwrap();
        showNotice("success", "Employee created successfully.");
      }

      setIsEmployeeFormOpen(false);
      setEditingEmployee(null);
      setEmployeeForm(getEmptyEmployeeForm());
      if (typeof onResetPage === "function") onResetPage();
      if (typeof onRefreshEmployees === "function") onRefreshEmployees();
    } catch (error) {
      const message =
        error?.data?.message || error?.error || "Unable to save employee.";
      setEmployeeError(message);
      showNotice("error", message);
    }
  };

  return (
    <div className="bg-white mt-6 rounded-3xl">
      <div className="flex justify-between items-center mb-4 px-4 pt-6">
        <h2 className="text-lg font-semibold">Management Users</h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Rows</span>
            <select
              value={perPage}
              onChange={(event) => {
                const value = event.target.value;
                onPerPageChange(value === "all" ? "all" : Number(value));
              }}
              className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm"
            >
              <option value={20}>20</option>
              <option value={100}>100</option>
              <option value="all">All</option>
            </select>
          </div>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-gray-50 text-sm focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (isEmployeeFormOpen) {
                closeEmployeeForm();
              } else {
                openEmployeeForm();
              }
            }}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm"
          >
            {isEmployeeFormOpen ? "Close" : "+ Add Employee"}
          </button>
        </div>
      </div>
      <NoticeBanner notice={notice} />

      {isEmployeeFormOpen && (
        <form
          onSubmit={handleEmployeeSubmit}
          className="mx-6 mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4"
        >
          <p className="mb-4 text-sm text-gray-600">
            {editingEmployee ? "Edit Employee" : "Add Employee"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">Name</label>
              <input
                type="text"
                value={employeeForm.name}
                onChange={(event) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                placeholder="Employee name"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Father Name
              </label>
              <input
                type="text"
                value={employeeForm.fatherName}
                onChange={(event) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    fatherName: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">NIC #</label>
              <input
                type="text"
                value={employeeForm.nicNumber}
                onChange={(event) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    nicNumber: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">HR #</label>
              <input
                type="text"
                value={employeeForm.hrNumber}
                onChange={(event) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    hrNumber: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Email</label>
              <input
                type="email"
                value={employeeForm.email}
                onChange={(event) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Password
              </label>
              <input
                type="password"
                value={employeeForm.password}
                onChange={(event) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                placeholder={editingEmployee ? "Leave blank to keep current" : ""}
                required={!editingEmployee}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Designation
              </label>
              <select
                value={employeeForm.designationId}
                onChange={(event) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    designationId: event.target.value,
                  }))
                }
                disabled={!designations.length}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:bg-gray-100"
                required
              >
                <option value="">
                  {designations.length ? "Select designation" : "No designations"}
                </option>
                {designations.map((designation) => (
                  <option key={designation._id} value={designation._id}>
                    {designation.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600">
                Page Permissions
              </label>
              <MultiSelect
                options={pagePermissionOptions || []}
                value={employeeForm.pagePermissions}
                onChange={(values) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    pagePermissions: values,
                  }))
                }
                disabled={!pagePermissionOptions.length}
                placeholder="Select page permissions"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Click to select multiple permissions.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Status</label>
              <div className="mt-2 flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={Boolean(employeeForm.isActive)}
                    onChange={(event) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        isActive: event.target.checked,
                      }))
                    }
                    disabled={!editingEmployee}
                    className="h-4 w-4"
                  />
                  Active
                </label>
                {!editingEmployee && (
                  <span className="text-xs text-gray-400">
                    Available after create
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeEmployeeForm}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingEmployee || isUpdatingEmployee}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-70"
            >
              {isCreatingEmployee || isUpdatingEmployee
                ? "Saving..."
                : editingEmployee
                  ? "Update Employee"
                  : "Create Employee"}
            </button>
          </div>

          {employeeError && (
            <div className="mt-3 text-sm text-red-600">{employeeError}</div>
          )}
        </form>
      )}

      <div className="overflow-x-auto bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="text-gray-900 text-left">
            <tr>
              <th className="px-4 py-3">HR #</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Permissions</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={7}>
                  Loading employees...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td className="px-4 py-6 text-red-500" colSpan={7}>
                  Unable to load employees.
                </td>
              </tr>
            )}
            {!isLoading && !isError && employees.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={7}>
                  No employees found.
                </td>
              </tr>
            )}

            {employees.map((user, index) => (
              <tr
                key={user._id}
                className={`border-t border-gray-300 hover:bg-gray-200 transition ${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="px-4 py-3">{user.hrNumber || user._id.slice(-6)}</td>

                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  {user.name}
                </td>

                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.designationName}</td>

                <td className="px-4 py-3 flex items-center gap-2 text-gray-600">
                  <Shield size={14} />
                  {user.pagePermissions?.length || 0} Permissions
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 text-xs rounded-md border ${
                      user.isActive
                        ? "bg-green-100 text-green-600 border-green-300"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div
                    className="relative"
                    ref={activeMenuId === user._id ? menuRef : null}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuId((prev) =>
                          prev === user._id ? null : user._id,
                        )
                      }
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Employee actions"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenuId === user._id && (
                      <div className="absolute right-0 mt-2 w-32 rounded-lg border border-gray-200 bg-white shadow-md z-10">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            openEditEmployee(user);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between px-4 py-3 items-center mt-6 text-sm text-gray-600">
        <p>
          Showing {showingFrom}-{showingTo} from {meta.total || 0} data
        </p>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-2xl text-blue-600 border border-blue-300 hover:bg-blue-50 disabled:opacity-50"
          >
            &#60;
          </button>

          <div className="flex items-center space-x-2">
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-full ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 hover:bg-blue-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-full text-blue-600 border border-blue-300 hover:bg-blue-50 disabled:opacity-50"
          >
            &#62;
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-6">
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-8 flex items-center justify-between shadow-md hover:shadow-lg"
        >
          <div>
            <p className="text-gray-500 text-sm">{item.title}</p>
            <h2 className="text-2xl mt-2">{item.value}</h2>
          </div>

          <div
            className={`w-12 h-12 flex items-center justify-center rounded-xl text-white ${item.iconBg}`}
          >
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

const getEmptyDesignationForm = () => ({
  name: "",
  permissionKeys: [],
  isActive: true,
});

const getEmptyEmployeeForm = () => ({
  name: "",
  fatherName: "",
  nicNumber: "",
  hrNumber: "",
  email: "",
  password: "",
  designationId: "",
  pagePermissions: [],
  isActive: true,
});

const mapEmployeeToForm = (employee) => ({
  name: employee?.name || "",
  fatherName: employee?.fatherName || "",
  nicNumber: employee?.nicNumber || "",
  hrNumber: employee?.hrNumber || "",
  email: employee?.email || "",
  password: "",
  designationId: employee?.designationId || "",
  pagePermissions: Array.isArray(employee?.pagePermissions)
    ? employee.pagePermissions
    : [],
  isActive: employee?.isActive ?? true,
});

const mapDesignationToForm = (designation) => ({
  name: designation?.name || "",
  permissionKeys: Array.isArray(designation?.permissionKeys)
    ? designation.permissionKeys
    : [],
  isActive: designation?.isActive ?? true,
});

const buildDesignationPayload = (formState) => ({
  name: formState.name.trim(),
  permissionKeys: Array.isArray(formState.permissionKeys)
    ? formState.permissionKeys
    : [],
  isActive: Boolean(formState.isActive),
});

const MultiSelect = ({
  options,
  value,
  onChange,
  disabled,
  placeholder = "Select options",
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = React.useRef(null);
  const selectedValues = Array.isArray(value) ? value : [];
  const label =
    selectedValues.length > 0 ? `${selectedValues.length} selected` : placeholder;

  const toggleValue = (option) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((item) => item !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current || wrapperRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm flex items-center justify-between disabled:bg-gray-100"
      >
        <span className={selectedValues.length ? "text-gray-900" : "text-gray-400"}>
          {label}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-40 overflow-y-auto">
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No options available.
            </div>
          )}
          {options.map((option) => {
            const checked = selectedValues.includes(option);
            return (
              <button
                type="button"
                key={option}
                onClick={() => toggleValue(option)}
                className="w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50"
              >
                <span>{option}</span>
                {checked ? (
                  <Check size={14} className="text-blue-600" />
                ) : (
                  <span className="h-3 w-3 rounded border border-gray-300" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const NoticeBanner = ({ notice }) => {
  if (!notice) return null;
  const baseStyles = "mx-6 mt-4 rounded-lg border px-4 py-2 text-sm";
  const theme =
    notice.type === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-red-200 bg-red-50 text-red-700";
  return <div className={`${baseStyles} ${theme}`}>{notice.message}</div>;
};

const useTimedNotice = (durationMs = 4000) => {
  const [notice, setNotice] = useState(null);
  const timerRef = React.useRef(null);

  const clearNotice = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setNotice(null);
  };

  const showNotice = (type, message) => {
    if (!message) return;
    clearNotice();
    setNotice({ type, message });
    timerRef.current = setTimeout(() => {
      setNotice(null);
      timerRef.current = null;
    }, durationMs);
  };

  React.useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return { notice, showNotice, clearNotice };
};

const useDebouncedValue = (value, delayMs) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handle = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debouncedValue;
};
