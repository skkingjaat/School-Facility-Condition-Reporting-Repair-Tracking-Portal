"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Clock3,
  FileWarning,
  LogOut,
  MapPin,
} from "lucide-react";

type DashboardData = {
  summary: {
    totalIssues: number;
    pendingIssues: number;
    inProgressIssues: number;
    resolvedIssues: number;
    resolvedPercentage: number;
    averageResolutionTimeHours: number | null;
    userEngagementRate: number | null;
  };
  categories: {
    category: string;
    count: number;
  }[];
  priorities: {
    priority: string;
    count: number;
  }[];
};

type DashboardResponse = {
  success: boolean;
  message: string;
  data?: DashboardData;
};

type IssueStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";

type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type Issue = {
  id: string;
  description: string;
  category: string;
  location: string;
  priority: IssuePriority;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
};

type IssuesResponse = {
  success: boolean;
  message: string;
  data?: {
    issues: Issue[];
  };
};

const categoryLabels: Record<string, string> = {
  FURNITURE: "Furniture",
  CLASSROOM: "Classroom",
  TOILET_SANITATION: "Toilet & Sanitation",
  ELECTRICAL: "Electrical",
  SAFETY: "Safety",
  OTHER: "Other",
};

const priorityLabels: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getStatusClass(status: IssueStatus) {
  switch (status) {
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "IN_PROGRESS":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "RESOLVED":
      return "border-green-200 bg-green-50 text-green-700";

    default:
      return "border-muted bg-muted text-muted-foreground";
  }
}

function getPriorityClass(priority: IssuePriority) {
  switch (priority) {
    case "LOW":
      return "border-green-200 bg-green-50 text-green-700";

    case "MEDIUM":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "HIGH":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "CRITICAL":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-muted bg-muted text-muted-foreground";
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [error, setError] = useState("");
  const [issuesError, setIssuesError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/dashboard", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result: DashboardResponse = await response.json();

        if (!response.ok || !result.success || !result.data) {
          setError(result.message || "Unable to load dashboard");
          return;
        }

        setDashboard(result.data);
      } catch {
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadIssues() {
      try {
        setIssuesLoading(true);
        setIssuesError("");

        const params = new URLSearchParams();

        if (priorityFilter) {
          params.set("priority", priorityFilter);
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

        if (!response.ok || !result.success || !result.data) {
          setIssuesError(
            result.message || "Unable to load reported issues"
          );
          return;
        }

        if (!cancelled) {
          setIssues(result.data.issues);
        }
      } catch {
        if (!cancelled) {
          setIssuesError("Unable to connect to the server");
        }
      } finally {
        if (!cancelled) {
          setIssuesLoading(false);
        }
      }
    }

    void loadIssues();

    return () => {
      cancelled = true;
    };
  }, [priorityFilter]);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Unable to logout");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to logout");
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
            </div>

            <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl border bg-background"
              />
            ))}
          </div>

          <div className="h-32 animate-pulse rounded-xl border bg-background" />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-xl border bg-background" />
            <div className="h-64 animate-pulse rounded-xl border bg-background" />
          </div>

          <div className="h-96 animate-pulse rounded-xl border bg-background" />
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md rounded-xl border bg-background p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error || "Something went wrong while loading dashboard data."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const summaryCards = [
    {
      title: "Total Issues",
      value: dashboard.summary.totalIssues,
      description: "Reported facility issues",
    },
    {
      title: "Pending",
      value: dashboard.summary.pendingIssues,
      description: "Issues awaiting repair progress",
    },
    {
      title: "In Progress",
      value: dashboard.summary.inProgressIssues,
      description: "Repairs currently in progress",
    },
    {
      title: "Resolved",
      value: dashboard.summary.resolvedIssues,
      description: "Issues successfully resolved",
    },
    {
      title: "Avg. Resolution Time",
      value:
        dashboard.summary.averageResolutionTimeHours === null
          ? "N/A"
          : `${dashboard.summary.averageResolutionTimeHours} hrs`,
      description: "Average time from report to repair completion",
    },
    {
      title: "User Engagement",
      value:
        dashboard.summary.userEngagementRate === null
          ? "N/A"
          : `${dashboard.summary.userEngagementRate}%`,
      description: "Registered Parent/Teacher users who reported issues",
    },
  ];

  const maxCategoryCount = Math.max(
    ...dashboard.categories.map((item) => item.count),
    1
  );

  const maxPriorityCount = Math.max(
    ...dashboard.priorities.map((item) => item.count),
    1
  );

  return (
    <main className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Overview of reported facility issues and repair progress.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-red-400 px-4 text-sm font-medium transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />

            {loggingOut ? "Signing out..." : "Logout"}
          </button>
        </header>

        <section
          aria-label="Issue summary"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border bg-background p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {card.title}
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {card.value}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Resolution Rate</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Percentage of reported issues that have been resolved.
              </p>
            </div>

            <p className="text-3xl font-bold">
              {dashboard.summary.resolvedPercentage}%
            </p>
          </div>

          <div
            className="mt-5 h-3 overflow-hidden rounded-full bg-muted"
            aria-label={`Resolution rate ${dashboard.summary.resolvedPercentage}%`}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.min(
                  Math.max(dashboard.summary.resolvedPercentage, 0),
                  100
                )}%`,
              }}
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-background p-5 shadow-sm">
            <div>
              <h2 className="font-semibold">Issues by Category</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Reported issues grouped by facility category.
              </p>
            </div>

            {dashboard.categories.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No category data available.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {dashboard.categories.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">
                        {categoryLabels[item.category] ?? item.category}
                      </span>

                      <span className="text-sm font-semibold">
                        {item.count}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all duration-500"
                        style={{
                          width: `${(item.count / maxCategoryCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border bg-background p-5 shadow-sm">
            <div>
              <h2 className="font-semibold">Issues by Priority</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Reported issues grouped by priority level.
              </p>
            </div>

            {dashboard.priorities.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No priority data available.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {dashboard.priorities.map((item) => (
                  <div key={item.priority}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">
                        {priorityLabels[item.priority] ?? item.priority}
                      </span>

                      <span className="text-sm font-semibold">
                        {item.count}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all duration-500"
                        style={{
                          width: `${(item.count / maxPriorityCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Reported Issues */}
        <section className="rounded-xl border bg-background shadow-sm">
          <div className="border-b px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-semibold">Reported Issues</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Track the status and repair progress of reported issues.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="space-y-2">
                  <label
                    htmlFor="dashboard-priority-filter"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Filter by priority
                  </label>

                  <select
                    id="dashboard-priority-filter"
                    value={priorityFilter}
                    onChange={(event) =>
                      setPriorityFilter(event.target.value)
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-44"
                  >
                    <option value="">All priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/issues/report")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  Report Issue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {issuesLoading ? (
            <div className="space-y-3 p-5 sm:p-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : issuesError ? (
            <div className="p-5 sm:p-6">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-5">
                <p className="text-sm text-destructive">{issuesError}</p>
              </div>
            </div>
          ) : issues.length === 0 ? (
            <div className="p-8 text-center sm:p-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileWarning className="h-6 w-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                {priorityFilter
                  ? `No ${priorityLabels[priorityFilter] ?? priorityFilter.toLowerCase()} priority issues found`
                  : "No issues reported yet"}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {priorityFilter
                  ? "Try another priority filter or select all priorities."
                  : "Report a facility issue to start tracking its repair progress."}
              </p>

              {!priorityFilter ? (
                <button
                  type="button"
                  onClick={() => router.push("/issues/report")}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  Report Your First Issue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="divide-y md:hidden">
                {issues.map((issue) => (
                  <article key={issue.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {formatLabel(issue.category)}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {issue.description}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          issue.status
                        )}`}
                      >
                        {formatLabel(issue.status)}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{issue.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(issue.createdAt)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityClass(
                          issue.priority
                        )}`}
                      >
                        {priorityLabels[issue.priority] ?? issue.priority}
                      </span>

                      <button
                        type="button"
                        onClick={() => router.push(`/issues/${issue.id}`)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition hover:bg-muted"
                      >
                        Track Issue
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Issue
                      </th>

                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Location
                      </th>

                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Priority
                      </th>

                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Status
                      </th>

                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Reported
                      </th>

                      <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {issues.map((issue) => (
                      <tr
                        key={issue.id}
                        className="transition hover:bg-muted/20"
                      >
                        <td className="max-w-sm px-5 py-4">
                          <p className="font-medium">
                            {formatLabel(issue.category)}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {issue.description}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex max-w-48 items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />

                            <span className="truncate text-sm">
                              {issue.location}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityClass(
                              issue.priority
                            )}`}
                          >
                            {priorityLabels[issue.priority] ?? issue.priority}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                              issue.status
                            )}`}
                          >
                            {formatLabel(issue.status)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock3 className="h-4 w-4" />

                            <span className="text-xs">
                              {formatDate(issue.createdAt)}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/issues/${issue.id}`)
                            }
                            className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition hover:bg-muted"
                          >
                            Track Issue
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
