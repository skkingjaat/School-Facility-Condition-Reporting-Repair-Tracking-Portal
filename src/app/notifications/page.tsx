"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Bell,
    Check,
    CircleAlert,
    Clock3,
    ExternalLink,
    Loader2,
    RefreshCw,
} from "lucide-react";

type IssueStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";
type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type NotificationIssue = {
    id: string;
    description: string;
    status: IssueStatus;
    priority: IssuePriority;
};

type Notification = {
    id: string;
    message: string;
    read: boolean;
    createdAt: string;
    issue: NotificationIssue | null;
};

type NotificationsResponse = {
    success: boolean;
    message?: string;
    data?: {
        notifications: Notification[];
    };
};

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
        return "Unknown date";
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

export default function NotificationsPage() {
    const router = useRouter();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [markingId, setMarkingId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<
        "PARENT" | "TEACHER" | "ADMIN" | null
    >(null);

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    const fetchNotifications = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await fetch("/api/notifications", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const result: NotificationsResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to retrieve notifications"
                );
            }

            setNotifications(result.data?.notifications ?? []);
        } catch (fetchError) {
            console.error("Fetch notifications error:", fetchError);

            setError(
                fetchError instanceof Error
                    ? fetchError.message
                    : "Unable to retrieve notifications"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadNotifications() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/notifications", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                const result: NotificationsResponse = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Unable to retrieve notifications"
                    );
                }

                if (!cancelled) {
                    setNotifications(result.data?.notifications ?? []);
                }
            } catch (fetchError) {
                console.error("Fetch notifications error:", fetchError);

                if (!cancelled) {
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : "Unable to retrieve notifications"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadNotifications();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadUserRole() {
            try {
                const response = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    return;
                }

                const role = result.data?.user?.role;

                if (
                    !cancelled &&
                    (role === "PARENT" ||
                        role === "TEACHER" ||
                        role === "ADMIN")
                ) {
                    setUserRole(role);
                }
            } catch (roleError) {
                console.error("Fetch user role error:", roleError);
            }
        }

        void loadUserRole();

        return () => {
            cancelled = true;
        };
    }, []);

    async function markAsRead(notificationId: string) {
        try {
            setMarkingId(notificationId);

            const response = await fetch(
                `/api/notifications/${notificationId}`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to mark notification as read"
                );
            }

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification.id === notificationId
                        ? {
                            ...notification,
                            read: true,
                        }
                        : notification
                )
            );
        } catch (markError) {
            console.error("Mark notification as read error:", markError);

            setError(
                markError instanceof Error
                    ? markError.message
                    : "Unable to update notification"
            );
        } finally {
            setMarkingId(null);
        }
    }

    async function openNotification(notification: Notification) {
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        if (notification.issue) {
            router.push(`/issues/${notification.issue.id}`);
        }
    }

    return (
        <main className="min-h-screen bg-muted/30">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <section className="mb-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <Bell className="h-6 w-6" aria-hidden="true" />
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Notifications
                                </h1>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Stay updated on your reported issues and repair progress.
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

                            {userRole === "ADMIN" ? (
                                <button
                                    type="button"
                                    onClick={() => router.push("/admin")}
                                    className="inline-flex min-h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                                >
                                    Admin Panel
                                </button>
                            ) : null}

                            <button
                                type="button"
                                onClick={() => void fetchNotifications(true)}
                                disabled={loading || refreshing}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""
                                        }`}
                                    aria-hidden="true"
                                />
                                Refresh
                            </button>
                        </div>
                    </div>
                </section>

                {/* Summary */}
                <section className="mb-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Notifications
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {notifications.length}
                                </p>
                            </div>

                            <div className="rounded-lg bg-muted p-3">
                                <Bell className="h-5 w-5" aria-hidden="true" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Unread Notifications
                                </p>
                                <p className="mt-1 text-2xl font-semibold">{unreadCount}</p>
                            </div>

                            <div className="rounded-lg bg-muted p-3">
                                <CircleAlert className="h-5 w-5" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={() => void fetchNotifications(true)}
                                className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-300 bg-background px-3 font-medium transition-colors hover:bg-red-100"
                            >
                                Try Again
                            </button>
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
                            Loading notifications...
                        </div>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && notifications.length === 0 && (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border bg-background px-6 text-center shadow-sm">
                        <div className="mb-4 rounded-full bg-muted p-4">
                            <Bell className="h-7 w-7" aria-hidden="true" />
                        </div>

                        <h2 className="text-lg font-semibold">No notifications</h2>

                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                            You do not have any notifications yet. Updates about your
                            reported issues will appear here.
                        </p>
                    </div>
                )}

                {/* Notifications */}
                {!loading && notifications.length > 0 && (
                    <section className="space-y-3">
                        {notifications.map((notification) => {
                            const issue = notification.issue;

                            return (
                                <article
                                    key={notification.id}
                                    className={`rounded-xl border bg-background p-4 shadow-sm transition-colors sm:p-5 ${notification.read
                                        ? ""
                                        : "border-primary/30 bg-primary/2"
                                        }`}
                                >
                                    <div className="flex gap-3 sm:gap-4">
                                        <div
                                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.read
                                                ? "bg-muted"
                                                : "bg-primary/10"
                                                }`}
                                        >
                                            {notification.read ? (
                                                <Check
                                                    className="h-5 w-5"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <Bell
                                                    className="h-5 w-5"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <p
                                                        className={`text-sm leading-6 ${notification.read
                                                            ? "text-muted-foreground"
                                                            : "font-medium"
                                                            }`}
                                                    >
                                                        {notification.message}
                                                    </p>

                                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Clock3
                                                            className="h-3.5 w-3.5"
                                                            aria-hidden="true"
                                                        />
                                                        <span>
                                                            {formatDate(notification.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {!notification.read && (
                                                    <span className="inline-flex w-fit shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                                        Unread
                                                    </span>
                                                )}
                                            </div>

                                            {issue && (
                                                <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                                                    <div className="flex flex-col gap-3">
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground">
                                                                Related Issue
                                                            </p>

                                                            <p className="mt-1 line-clamp-2 text-sm font-medium">
                                                                {issue.description}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                                                    issue.status
                                                                )}`}
                                                            >
                                                                {formatLabel(issue.status)}
                                                            </span>

                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(
                                                                    issue.priority
                                                                )}`}
                                                            >
                                                                {formatLabel(issue.priority)}
                                                            </span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void openNotification(notification)
                                                            }
                                                            disabled={markingId === notification.id}
                                                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
                                                        >
                                                            {markingId === notification.id ? (
                                                                <Loader2
                                                                    className="h-4 w-4 animate-spin"
                                                                    aria-hidden="true"
                                                                />
                                                            ) : (
                                                                <ExternalLink
                                                                    className="h-4 w-4"
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                            {userRole === "TEACHER"
                                                                ? "Open Repair Issue"
                                                                : userRole === "ADMIN"
                                                                    ? "Manage Issue"
                                                                    : "View Issue"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {!notification.read && !issue && (
                                                <button
                                                    type="button"
                                                    onClick={() => void markAsRead(notification.id)}
                                                    disabled={markingId === notification.id}
                                                    className="mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {markingId === notification.id ? (
                                                        <Loader2
                                                            className="h-4 w-4 animate-spin"
                                                            aria-hidden="true"
                                                        />
                                                    ) : (
                                                        <Check
                                                            className="h-4 w-4"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </div>
        </main>
    );
}