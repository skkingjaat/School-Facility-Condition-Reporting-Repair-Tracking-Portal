"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    Clock3,
    Filter,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Wrench,
} from "lucide-react";

type IssueStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";
type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type IssueCategory =
    | "FURNITURE"
    | "CLASSROOM"
    | "TOILET_SANITATION"
    | "ELECTRICAL"
    | "SAFETY"
    | "OTHER";

type RepairStatus = "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";

type Issue = {
    id: string;
    description: string;
    category: IssueCategory;
    location: string;
    priority: IssuePriority;
    status: IssueStatus;
    estimatedResolutionTime: string | null;
    createdAt: string;
    updatedAt: string;
    reporter: {
        id: string;
        name: string;
        role: "PARENT" | "TEACHER" | "ADMIN";
    };
    media: {
        id: string;
        url: string;
        type: "IMAGE" | "VIDEO";
    }[];
    timeline: {
        id: string;
        action: string;
        description: string;
        createdBy: string;
        createdAt: string;
    }[];
    repairTask: {
        id: string;
        issueId: string;
        assignedTo: string;
        status: RepairStatus;
        assignedAt: string;
        completedAt: string | null;
        assignee: {
            id: string;
            name: string;
            role: "PARENT" | "TEACHER" | "ADMIN";
        };
    } | null;
};

type Teacher = {
    id: string;
    name: string;
    email: string;
};

type IssuesResponse = {
    success: boolean;
    message?: string;
    data?: {
        issues: Issue[];
    };
};

type TeachersResponse = {
    success: boolean;
    message?: string;
    data?: {
        teachers: Teacher[];
    };
};

const STATUS_OPTIONS: { value: "" | IssueStatus; label: string }[] = [
    { value: "", label: "All statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
];

const PRIORITY_OPTIONS: {
    value: "" | IssuePriority;
    label: string;
}[] = [
    { value: "", label: "All priorities" },
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
];

const CATEGORY_OPTIONS: {
    value: "" | IssueCategory;
    label: string;
}[] = [
    { value: "", label: "All categories" },
    { value: "FURNITURE", label: "Furniture" },
    { value: "CLASSROOM", label: "Classroom" },
    { value: "TOILET_SANITATION", label: "Toilet & Sanitation" },
    { value: "ELECTRICAL", label: "Electrical" },
    { value: "SAFETY", label: "Safety" },
    { value: "OTHER", label: "Other" },
];

function formatLabel(value: string) {
    return value
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getStatusClasses(status: IssueStatus) {
    switch (status) {
        case "PENDING":
            return "bg-amber-100 text-amber-800";
        case "IN_PROGRESS":
            return "bg-blue-100 text-blue-800";
        case "RESOLVED":
            return "bg-green-100 text-green-800";
        default:
            return "bg-muted text-muted-foreground";
    }
}

function getPriorityClasses(priority: IssuePriority) {
    switch (priority) {
        case "LOW":
            return "bg-slate-100 text-slate-700";
        case "MEDIUM":
            return "bg-yellow-100 text-yellow-800";
        case "HIGH":
            return "bg-orange-100 text-orange-800";
        case "CRITICAL":
            return "bg-red-100 text-red-800";
        default:
            return "bg-muted text-muted-foreground";
    }
}

function getRepairClasses(status: RepairStatus) {
    switch (status) {
        case "ASSIGNED":
            return "bg-violet-100 text-violet-800";
        case "IN_PROGRESS":
            return "bg-blue-100 text-blue-800";
        case "COMPLETED":
            return "bg-green-100 text-green-800";
        default:
            return "bg-muted text-muted-foreground";
    }
}

export default function AdminPage() {
    const router = useRouter();

    const [issues, setIssues] = useState<Issue[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [teachersLoading, setTeachersLoading] = useState(true);

    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    const [statusFilter, setStatusFilter] = useState<IssueStatus | "">("");
    const [priorityFilter, setPriorityFilter] = useState<IssuePriority | "">(
        ""
    );
    const [categoryFilter, setCategoryFilter] = useState<IssueCategory | "">(
        ""
    );

    const [selectedTeacherByIssue, setSelectedTeacherByIssue] = useState<
        Record<string, string>
    >({});

    const [processingIssueId, setProcessingIssueId] = useState<string | null>(
        null
    );

    const fetchIssues = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const params = new URLSearchParams();

                if (statusFilter) {
                    params.set("status", statusFilter);
                }

                if (priorityFilter) {
                    params.set("priority", priorityFilter);
                }

                if (categoryFilter) {
                    params.set("category", categoryFilter);
                }

                const query = params.toString();

                const response = await fetch(
                    query ? `/api/issues?${query}` : "/api/issues",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const result: IssuesResponse = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Unable to retrieve reported issues"
                    );
                }

                setIssues(result.data?.issues ?? []);
            } catch (fetchError) {
                console.error("Admin issues fetch error:", fetchError);

                setError(
                    fetchError instanceof Error
                        ? fetchError.message
                        : "Unable to retrieve reported issues"
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [categoryFilter, priorityFilter, statusFilter]
    );

    const fetchTeachers = useCallback(async () => {
        try {
            setTeachersLoading(true);

            const response = await fetch("/api/admin/teachers", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const result: TeachersResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to retrieve teachers"
                );
            }

            setTeachers(result.data?.teachers ?? []);
        } catch (fetchError) {
            console.error("Admin teachers fetch error:", fetchError);

            setActionError(
                fetchError instanceof Error
                    ? fetchError.message
                    : "Unable to retrieve teachers"
            );
        } finally {
            setTeachersLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadIssues() {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams();

                if (statusFilter) {
                    params.set("status", statusFilter);
                }

                if (priorityFilter) {
                    params.set("priority", priorityFilter);
                }

                if (categoryFilter) {
                    params.set("category", categoryFilter);
                }

                const query = params.toString();

                const response = await fetch(
                    query ? `/api/issues?${query}` : "/api/issues",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const result: IssuesResponse = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Unable to retrieve reported issues"
                    );
                }

                if (!cancelled) {
                    setIssues(result.data?.issues ?? []);
                }
            } catch (fetchError) {
                console.error("Admin issues fetch error:", fetchError);

                if (!cancelled) {
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : "Unable to retrieve reported issues"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadIssues();

        return () => {
            cancelled = true;
        };
    }, [categoryFilter, priorityFilter, statusFilter]);

    useEffect(() => {
    let cancelled = false;

    async function loadTeachers() {
        try {
            setTeachersLoading(true);

            const response = await fetch("/api/admin/teachers", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const result: TeachersResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to retrieve teachers"
                );
            }

            if (!cancelled) {
                setTeachers(result.data?.teachers ?? []);
            }
        } catch (fetchError) {
            console.error("Admin teachers fetch error:", fetchError);

            if (!cancelled) {
                setActionError(
                    fetchError instanceof Error
                        ? fetchError.message
                        : "Unable to retrieve teachers"
                );
            }
        } finally {
            if (!cancelled) {
                setTeachersLoading(false);
            }
        }
    }

    void loadTeachers();

    return () => {
        cancelled = true;
    };
}, []);

    const statistics = useMemo(() => {
        const total = issues.length;

        const pending = issues.filter(
            (issue) => issue.status === "PENDING"
        ).length;

        const inProgress = issues.filter(
            (issue) => issue.status === "IN_PROGRESS"
        ).length;

        const resolved = issues.filter(
            (issue) => issue.status === "RESOLVED"
        ).length;

        const critical = issues.filter(
            (issue) => issue.priority === "CRITICAL"
        ).length;

        const assigned = issues.filter(
            (issue) => issue.repairTask !== null
        ).length;

        const resolutionRate =
            total > 0 ? Math.round((resolved / total) * 100) : 0;

        return {
            total,
            pending,
            inProgress,
            resolved,
            critical,
            assigned,
            resolutionRate,
        };
    }, [issues]);

    function clearFilters() {
        setStatusFilter("");
        setPriorityFilter("");
        setCategoryFilter("");
    }

    const hasFilters =
        statusFilter !== "" ||
        priorityFilter !== "" ||
        categoryFilter !== "";

    async function assignRepair(issueId: string) {
        const assignedTo = selectedTeacherByIssue[issueId];

        if (!assignedTo) {
            setActionError("Please select a teacher before assigning the repair.");
            setActionSuccess("");
            return;
        }

        try {
            setProcessingIssueId(issueId);
            setActionError("");
            setActionSuccess("");

            const response = await fetch(`/api/issues/${issueId}/repair`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    assignedTo,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to assign repair task"
                );
            }

            setActionSuccess("Repair task assigned successfully.");

            setSelectedTeacherByIssue((current) => {
                const next = { ...current };
                delete next[issueId];
                return next;
            });

            await fetchIssues(true);
        } catch (actionFetchError) {
            console.error("Assign repair error:", actionFetchError);

            setActionError(
                actionFetchError instanceof Error
                    ? actionFetchError.message
                    : "Unable to assign repair task"
            );
        } finally {
            setProcessingIssueId(null);
        }
    }

    async function updateRepairStatus(
        issueId: string,
        status: "IN_PROGRESS" | "COMPLETED"
    ) {
        try {
            setProcessingIssueId(issueId);
            setActionError("");
            setActionSuccess("");

            const response = await fetch(`/api/issues/${issueId}/repair`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to update repair status"
                );
            }

            setActionSuccess(
                status === "IN_PROGRESS"
                    ? "Repair started successfully."
                    : "Repair completed successfully."
            );

            await fetchIssues(true);
        } catch (actionFetchError) {
            console.error("Update repair status error:", actionFetchError);

            setActionError(
                actionFetchError instanceof Error
                    ? actionFetchError.message
                    : "Unable to update repair status"
            );
        } finally {
            setProcessingIssueId(null);
        }
    }

    return (
        <main className="min-h-screen bg-muted/30">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <section className="mb-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <ShieldCheck
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                />
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Admin Management
                                </h1>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Manage reported infrastructure issues and monitor
                                repair progress for your school.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => router.push("/dashboard")}
                                className="inline-flex min-h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                Dashboard
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/notifications")}
                                className="inline-flex min-h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                Notifications
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    void fetchIssues(true);
                                    void fetchTeachers();
                                }}
                                disabled={loading || refreshing}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        refreshing ? "animate-spin" : ""
                                    }`}
                                    aria-hidden="true"
                                />
                                Refresh
                            </button>
                        </div>
                    </div>
                </section>

                {/* Statistics */}
                <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Issues
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {statistics.total}
                                </p>
                            </div>

                            <div className="rounded-lg bg-muted p-3">
                                <BarChart3
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Pending
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {statistics.pending}
                                </p>
                            </div>

                            <div className="rounded-lg bg-muted p-3">
                                <Clock3
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    In Progress
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {statistics.inProgress}
                                </p>
                            </div>

                            <div className="rounded-lg bg-muted p-3">
                                <Wrench
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Resolved
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {statistics.resolved}
                                </p>
                            </div>

                            <div className="rounded-lg bg-muted p-3">
                                <CheckCircle2
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </div>
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                            Resolution rate: {statistics.resolutionRate}%
                        </p>
                    </div>
                </section>

                {/* Additional monitoring */}
                <section className="mb-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            Repair Tasks Assigned
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                            {statistics.assigned}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            Critical Priority Issues
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                            {statistics.critical}
                        </p>
                    </div>
                </section>

                {/* Filters */}
                <section className="mb-6 rounded-xl border bg-background p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Filter className="h-4 w-4" aria-hidden="true" />
                        <h2 className="text-sm font-semibold">Issue Filters</h2>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as IssueStatus | ""
                                )
                            }
                            className="min-h-10 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                            aria-label="Filter by status"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(event) =>
                                setPriorityFilter(
                                    event.target.value as IssuePriority | ""
                                )
                            }
                            className="min-h-10 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                            aria-label="Filter by priority"
                        >
                            {PRIORITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(event) =>
                                setCategoryFilter(
                                    event.target.value as IssueCategory | ""
                                )
                            }
                            className="min-h-10 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                            aria-label="Filter by category"
                        >
                            {CATEGORY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-3 text-sm font-medium underline underline-offset-4"
                        >
                            Clear filters
                        </button>
                    )}
                </section>

                {/* Action messages */}
                {actionError && (
                    <div
                        role="alert"
                        className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle
                                className="mt-0.5 h-5 w-5 shrink-0"
                                aria-hidden="true"
                            />
                            <p>{actionError}</p>
                        </div>
                    </div>
                )}

                {actionSuccess && (
                    <div
                        role="status"
                        className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                    >
                        <div className="flex items-start gap-3">
                            <CheckCircle2
                                className="mt-0.5 h-5 w-5 shrink-0"
                                aria-hidden="true"
                            />
                            <p>{actionSuccess}</p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle
                                className="mt-0.5 h-5 w-5 shrink-0"
                                aria-hidden="true"
                            />
                            <div className="flex-1">
                                <p>{error}</p>

                                <button
                                    type="button"
                                    onClick={() => void fetchIssues(true)}
                                    className="mt-3 font-medium underline underline-offset-4"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex min-h-64 items-center justify-center rounded-xl border bg-background shadow-sm">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Loader2
                                className="h-5 w-5 animate-spin"
                                aria-hidden="true"
                            />
                            Loading reported issues...
                        </div>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && issues.length === 0 && (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border bg-background px-6 text-center shadow-sm">
                        <div className="mb-4 rounded-full bg-muted p-4">
                            <CheckCircle2
                                className="h-7 w-7"
                                aria-hidden="true"
                            />
                        </div>

                        <h2 className="text-lg font-semibold">
                            No issues found
                        </h2>

                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                            There are no reported issues matching the current
                            filters.
                        </p>
                    </div>
                )}

                {/* Issues */}
                {!loading && issues.length > 0 && (
                    <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
                        <div className="border-b px-5 py-4">
                            <h2 className="font-semibold">Reported Issues</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {issues.length} issue
                                {issues.length === 1 ? "" : "s"} shown
                            </p>
                        </div>

                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">
                                            Issue
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Category
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Priority
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Reporter
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Repair
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {issues.map((issue) => {
                                        const processing =
                                            processingIssueId === issue.id;

                                        return (
                                            <tr
                                                key={issue.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="max-w-xs px-5 py-4">
                                                    <p className="line-clamp-2 font-medium">
                                                        {issue.description}
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {issue.location}
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {formatDate(
                                                            issue.createdAt
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    {formatLabel(issue.category)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(
                                                            issue.priority
                                                        )}`}
                                                    >
                                                        {formatLabel(
                                                            issue.priority
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                                            issue.status
                                                        )}`}
                                                    >
                                                        {formatLabel(
                                                            issue.status
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="font-medium">
                                                        {issue.reporter.name}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {formatLabel(
                                                            issue.reporter.role
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="min-w-65 px-5 py-4">
                                                    {issue.repairTask ? (
                                                        <div className="space-y-2">
                                                            <div>
                                                                <span
                                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRepairClasses(
                                                                        issue
                                                                            .repairTask
                                                                            .status
                                                                    )}`}
                                                                >
                                                                    {formatLabel(
                                                                        issue
                                                                            .repairTask
                                                                            .status
                                                                    )}
                                                                </span>

                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    {
                                                                        issue
                                                                            .repairTask
                                                                            .assignee
                                                                            .name
                                                                    }
                                                                </p>
                                                            </div>

                                                            {issue.repairTask
                                                                .status ===
                                                                "ASSIGNED" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        void updateRepairStatus(
                                                                            issue.id,
                                                                            "IN_PROGRESS"
                                                                        )
                                                                    }
                                                                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                                                >
                                                                    {processing && (
                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    )}
                                                                    Start Repair
                                                                </button>
                                                            )}

                                                            {issue.repairTask
                                                                .status ===
                                                                "IN_PROGRESS" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        void updateRepairStatus(
                                                                            issue.id,
                                                                            "COMPLETED"
                                                                        )
                                                                    }
                                                                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                                                >
                                                                    {processing && (
                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    )}
                                                                    Complete Repair
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {teachersLoading ? (
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    Loading teachers...
                                                                </div>
                                                            ) : teachers.length ===
                                                              0 ? (
                                                                <p className="text-xs text-muted-foreground">
                                                                    No teachers
                                                                    available
                                                                    for this
                                                                    school.
                                                                </p>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        value={
                                                                            selectedTeacherByIssue[
                                                                                issue
                                                                                    .id
                                                                            ] ??
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            event
                                                                        ) =>
                                                                            setSelectedTeacherByIssue(
                                                                                (
                                                                                    current
                                                                                ) => ({
                                                                                    ...current,
                                                                                    [issue.id]:
                                                                                        event
                                                                                            .target
                                                                                            .value,
                                                                                })
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                        className="min-h-9 w-full rounded-md border bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                                                                        aria-label={`Select teacher for issue ${issue.id}`}
                                                                    >
                                                                        <option value="">
                                                                            Select teacher
                                                                        </option>

                                                                        {teachers.map(
                                                                            (
                                                                                teacher
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        teacher.id
                                                                                    }
                                                                                    value={
                                                                                        teacher.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        teacher.name
                                                                                    }
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </select>

                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                        onClick={() =>
                                                                            void assignRepair(
                                                                                issue.id
                                                                            )
                                                                        }
                                                                        className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                                                    >
                                                                        {processing && (
                                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                        )}
                                                                        Assign Repair
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.push(
                                                                `/issues/${issue.id}`
                                                            )
                                                        }
                                                        className="inline-flex min-h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-muted"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile/tablet cards */}
                        <div className="divide-y lg:hidden">
                            {issues.map((issue) => {
                                const processing =
                                    processingIssueId === issue.id;

                                return (
                                    <article
                                        key={issue.id}
                                        className="p-4 sm:p-5"
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <p className="line-clamp-3 font-medium">
                                                    {issue.description}
                                                </p>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {issue.location}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatDate(issue.createdAt)}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(
                                                        issue.priority
                                                    )}`}
                                                >
                                                    {formatLabel(
                                                        issue.priority
                                                    )}
                                                </span>

                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                                        issue.status
                                                    )}`}
                                                >
                                                    {formatLabel(issue.status)}
                                                </span>

                                                {issue.repairTask && (
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRepairClasses(
                                                            issue.repairTask
                                                                .status
                                                        )}`}
                                                    >
                                                        Repair:{" "}
                                                        {formatLabel(
                                                            issue.repairTask
                                                                .status
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid gap-2 text-sm sm:grid-cols-2">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Category
                                                    </p>
                                                    <p className="font-medium">
                                                        {formatLabel(
                                                            issue.category
                                                        )}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Reporter
                                                    </p>
                                                    <p className="font-medium">
                                                        {issue.reporter.name}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Reported
                                                    </p>
                                                    <p className="font-medium">
                                                        {formatDate(
                                                            issue.createdAt
                                                        )}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Assigned Staff
                                                    </p>
                                                    <p className="font-medium">
                                                        {issue.repairTask
                                                            ? issue.repairTask
                                                                  .assignee.name
                                                            : "Not assigned"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Mobile repair management */}
                                            <div className="rounded-lg border bg-muted/20 p-3">
                                                <p className="mb-2 text-xs font-medium">
                                                    Repair Management
                                                </p>

                                                {issue.repairTask ? (
                                                    <div className="space-y-2">
                                                        <p className="text-sm">
                                                            Assigned to{" "}
                                                            <span className="font-medium">
                                                                {
                                                                    issue
                                                                        .repairTask
                                                                        .assignee
                                                                        .name
                                                                }
                                                            </span>
                                                        </p>

                                                        {issue.repairTask
                                                            .status ===
                                                            "ASSIGNED" && (
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    void updateRepairStatus(
                                                                        issue.id,
                                                                        "IN_PROGRESS"
                                                                    )
                                                                }
                                                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                {processing && (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                )}
                                                                Start Repair
                                                            </button>
                                                        )}

                                                        {issue.repairTask
                                                            .status ===
                                                            "IN_PROGRESS" && (
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    void updateRepairStatus(
                                                                        issue.id,
                                                                        "COMPLETED"
                                                                    )
                                                                }
                                                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                {processing && (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                )}
                                                                Complete Repair
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : teachersLoading ? (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Loading teachers...
                                                    </div>
                                                ) : teachers.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        No teachers available
                                                        for this school.
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <select
                                                            value={
                                                                selectedTeacherByIssue[
                                                                    issue.id
                                                                ] ?? ""
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setSelectedTeacherByIssue(
                                                                    (
                                                                        current
                                                                    ) => ({
                                                                        ...current,
                                                                        [issue.id]:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            disabled={processing}
                                                            className="min-h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                                            aria-label={`Select teacher for issue ${issue.id}`}
                                                        >
                                                            <option value="">
                                                                Select teacher
                                                            </option>

                                                            {teachers.map(
                                                                (teacher) => (
                                                                    <option
                                                                        key={
                                                                            teacher.id
                                                                        }
                                                                        value={
                                                                            teacher.id
                                                                        }
                                                                    >
                                                                        {
                                                                            teacher.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={() =>
                                                                void assignRepair(
                                                                    issue.id
                                                                )
                                                            }
                                                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {processing && (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            )}
                                                            Assign Repair
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/issues/${issue.id}`
                                                    )
                                                }
                                                className="inline-flex min-h-10 w-full items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted sm:w-fit"
                                            >
                                                View Issue
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}