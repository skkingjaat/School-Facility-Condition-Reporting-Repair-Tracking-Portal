
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock3,
    FileText,
    Image as ImageIcon,
    MapPin,
    User,
    Wrench,
    XCircle,
    Video,
} from "lucide-react";
import Image from "next/image";

type IssueStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";

type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type IssueMedia = {
    id: string;
    url: string;
    type: "IMAGE" | "VIDEO";
    createdAt: string;
};

type Actor = {
    id: string;
    name: string;
    role: string;
};

type TimelineItem = {
    id: string;
    action: string;
    description: string;
    createdBy: string;
    createdAt: string;
    actor: Actor | null;
};

type Assignee = {
    id: string;
    name: string;
    role: string;
};

type RepairTask = {
    id: string;
    status?: string;
    description?: string | null;
    assignedTo?: string | null;
    estimatedCompletion?: string | null;
    assignee: Assignee | null;
};

type Reporter = {
    id: string;
    name: string;
    email: string;
    role: string;
    schoolId: string;
};

type Issue = {
    id: string;
    description: string;
    category: string;
    location: string;
    priority: IssuePriority;
    status: IssueStatus;
    estimatedResolutionTime: string | null;
    reportedBy: string;
    createdAt: string;
    updatedAt: string;
    reporter: Reporter;
    media: IssueMedia[];
    timeline: TimelineItem[];
    repairTask: RepairTask | null;
};

// type IssueResponse = {
//     success: boolean;
//     message: string;
//     data?: {
//         issue: Issue;
//     };
// };

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}

function formatDateOnly(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
    }).format(new Date(date));
}

function formatLabel(value: string) {
    return value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function getTimelineIcon(action: string) {
    if (action.includes("RESOLVED")) {
        return <CheckCircle2 className="h-5 w-5" />;
    }

    if (
        action.includes("REPAIR") ||
        action.includes("ASSIGN")
    ) {
        return <Wrench className="h-5 w-5" />;
    }

    if (action.includes("PROGRESS")) {
        return <Clock3 className="h-5 w-5" />;
    }

    return <FileText className="h-5 w-5" />;
}

export default function IssueTrackingPage() {
    const params = useParams();
    const router = useRouter();

    const issueId =
        typeof params.issueId === "string"
            ? params.issueId
            : "";

    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!issueId) {
            return;
        }

        async function loadIssue() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`/api/issues/${issueId}`, {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok || !result.success || !result.data?.issue) {
                    setError(result.message || "Unable to load issue");
                    return;
                }

                setIssue(result.data.issue);
            } catch {
                setError("Unable to connect to the server");
            } finally {
                setLoading(false);
            }
        }

        loadIssue();
    }, [issueId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-muted/30 p-4 sm:p-6">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-2xl border bg-background p-6 shadow-sm">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 w-56 rounded bg-muted" />
                            <div className="h-24 rounded bg-muted" />

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="h-24 rounded bg-muted" />
                                <div className="h-24 rounded bg-muted" />
                                <div className="h-24 rounded bg-muted" />
                                <div className="h-24 rounded bg-muted" />
                            </div>

                            <div className="h-48 rounded bg-muted" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !issue) {
        return (
            <main className="min-h-screen bg-muted/30 p-4 sm:p-6">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <XCircle className="h-6 w-6 text-destructive" />
                        </div>

                        <h1 className="mt-5 text-xl font-semibold">
                            Unable to load issue
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {error || "Issue could not be found."}
                        </p>

                        <button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-muted/30 p-4 sm:p-6">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="inline-flex h-10 w-fit items-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>

                    <div className="text-sm text-muted-foreground">
                        Issue ID:{" "}
                        <span className="font-mono text-foreground">
                            {issue.id}
                        </span>
                    </div>
                </div>

                {/* Main Issue Card */}
                <section className="rounded-2xl border bg-background shadow-sm">
                    <div className="border-b px-5 py-5 sm:px-8 sm:py-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Facility Issue
                                </p>

                                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                                    {formatLabel(issue.category)}
                                </h1>

                                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                    {issue.description}
                                </p>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2">
                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                        issue.status
                                    )}`}
                                >
                                    {formatLabel(issue.status)}
                                </span>

                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityClass(
                                        issue.priority
                                    )}`}
                                >
                                    {formatLabel(issue.priority)} Priority
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Issue Information */}
                    <div className="grid gap-px border-b bg-border sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-background p-5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                    Location
                                </span>
                            </div>

                            <p className="mt-2 text-sm font-semibold">
                                {issue.location}
                            </p>
                        </div>

                        <div className="bg-background p-5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                    Reported
                                </span>
                            </div>

                            <p className="mt-2 text-sm font-semibold">
                                {formatDate(issue.createdAt)}
                            </p>
                        </div>

                        <div className="bg-background p-5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock3 className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                    Last Updated
                                </span>
                            </div>

                            <p className="mt-2 text-sm font-semibold">
                                {formatDate(issue.updatedAt)}
                            </p>
                        </div>

                        <div className="bg-background p-5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                    Reported By
                                </span>
                            </div>

                            <p className="mt-2 text-sm font-semibold">
                                {issue.reporter.name}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {formatLabel(issue.reporter.role)}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Status & Repair */}
                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Clock3 className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Resolution Status
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Current progress of this issue
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Current Status
                                </span>

                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                        issue.status
                                    )}`}
                                >
                                    {formatLabel(issue.status)}
                                </span>
                            </div>

                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{
                                        width:
                                            issue.status === "PENDING"
                                                ? "33%"
                                                : issue.status === "IN_PROGRESS"
                                                    ? "66%"
                                                    : "100%",
                                    }}
                                />
                            </div>

                            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                <span>Reported</span>
                                <span>In Progress</span>
                                <span>Resolved</span>
                            </div>
                        </div>

                        {issue.estimatedResolutionTime ? (
                            <div className="mt-6 rounded-lg border bg-muted/40 p-4">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Estimated Resolution
                                </p>

                                <p className="mt-1 text-sm font-semibold">
                                    {formatDate(issue.estimatedResolutionTime)}
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 rounded-lg border bg-muted/40 p-4">
                                <p className="text-sm text-muted-foreground">
                                    No estimated resolution time has been provided yet.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Wrench className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Repair Assignment
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Assigned maintenance work
                                </p>
                            </div>
                        </div>

                        {issue.repairTask ? (
                            <div className="mt-6 space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Assigned To
                                    </p>

                                    <p className="mt-1 text-sm font-semibold">
                                        {issue.repairTask.assignee?.name ??
                                            "Not assigned"}
                                    </p>

                                    {issue.repairTask.assignee?.role ? (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {formatLabel(
                                                issue.repairTask.assignee.role
                                            )}
                                        </p>
                                    ) : null}
                                </div>

                                {issue.repairTask.status ? (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Repair Status
                                        </p>

                                        <p className="mt-1 text-sm font-semibold">
                                            {formatLabel(issue.repairTask.status)}
                                        </p>
                                    </div>
                                ) : null}

                                {issue.repairTask.description ? (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Repair Details
                                        </p>

                                        <p className="mt-1 text-sm leading-6">
                                            {issue.repairTask.description}
                                        </p>
                                    </div>
                                ) : null}

                                {issue.repairTask.estimatedCompletion ? (
                                    <div className="rounded-lg border bg-muted/40 p-4">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Estimated Completion
                                        </p>

                                        <p className="mt-1 text-sm font-semibold">
                                            {formatDate(
                                                issue.repairTask.estimatedCompletion
                                            )}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="mt-6 rounded-lg border bg-muted/40 p-5">
                                <p className="text-sm font-medium">
                                    Repair not assigned yet
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    The maintenance team has not assigned a repair task
                                    to this issue yet.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Media */}
                <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <ImageIcon className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Photos & Videos
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                Media attached to this issue
                            </p>
                        </div>
                    </div>

                    {issue.media.length > 0 ? (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {issue.media.map((media) => (
                                <div
                                    key={media.id}
                                    className="overflow-hidden rounded-xl border bg-muted/20"
                                >
                                    {media.type === "IMAGE" ? (
                                        <a
                                            href={media.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <Image
                                                src={media.url}
                                                alt="Issue attachment"
                                                width={640}
                                                height={360}
                                                
                                                className="aspect-video w-full object-cover transition hover:scale-[1.02]"
                                            />
                                        </a>
                                    ) : (
                                        <video
                                            src={media.url}
                                            controls
                                            preload="metadata"
                                            className="aspect-video w-full bg-black object-contain"
                                        />
                                    )}

                                    <div className="flex items-center gap-2 border-t px-3 py-2">
                                        {media.type === "IMAGE" ? (
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Video className="h-4 w-4 text-muted-foreground" />
                                        )}

                                        <span className="text-xs font-medium text-muted-foreground">
                                            {media.type === "IMAGE"
                                                ? "Photo"
                                                : "Video"}
                                        </span>

                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {formatDateOnly(media.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-lg border bg-muted/40 p-5">
                            <p className="text-sm text-muted-foreground">
                                No photos or videos have been attached to this issue.
                            </p>
                        </div>
                    )}
                </section>

                {/* Timeline */}
                <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Clock3 className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Issue Timeline
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                Track every update made to this issue
                            </p>
                        </div>
                    </div>

                    {issue.timeline.length > 0 ? (
                        <div className="mt-8">
                            {issue.timeline.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="relative flex gap-4"
                                >
                                    {index < issue.timeline.length - 1 ? (
                                        <div className="absolute left-5 top-10 h-[calc(100%-8px)] w-px bg-border" />
                                    ) : null}

                                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background text-primary">
                                        {getTimelineIcon(item.action)}
                                    </div>

                                    <div className="min-w-0 flex-1 pb-8">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <h3 className="text-sm font-semibold">
                                                {formatLabel(item.action)}
                                            </h3>

                                            <time className="text-xs text-muted-foreground">
                                                {formatDate(item.createdAt)}
                                            </time>
                                        </div>

                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {item.description}
                                        </p>

                                        {item.actor ? (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                <User className="h-3.5 w-3.5" />

                                                <span>
                                                    {item.actor.name} ·{" "}
                                                    {formatLabel(item.actor.role)}
                                                </span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-lg border bg-muted/40 p-5">
                            <p className="text-sm text-muted-foreground">
                                No timeline updates are available.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}