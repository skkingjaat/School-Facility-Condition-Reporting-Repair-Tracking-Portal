"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserRole = "PARENT" | "TEACHER";

export default function Register() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<UserRole>("PARENT");
    const [schoolId, setSchoolId] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedSchoolId = schoolId.trim();

        if (trimmedName.length < 2) {
            setError("Name must be at least 2 characters");
            return;
        }

        if (trimmedName.length > 100) {
            setError("Name must not exceed 100 characters");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password.length > 72) {
            setError("Password must not exceed 72 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!trimmedSchoolId) {
            setError("School ID is required");
            return;
        }

        if (trimmedSchoolId.length > 100) {
            setError("School ID must not exceed 100 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: trimmedName,
                    email: trimmedEmail,
                    password,
                    role,
                    schoolId: trimmedSchoolId,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                if (response.status === 409) {
                    setError("An account with this email already exists");
                } else if (
                    response.status === 400 &&
                    result.errors
                ) {
                    const fieldErrors = result.errors as Record<
                        string,
                        string[] | undefined
                    >;

                    const firstError = Object.values(fieldErrors).find(
                        (messages) => messages && messages.length > 0
                    )?.[0];

                    setError(firstError || result.message || "Please check your details");
                } else {
                    setError(result.message || "Unable to complete registration");
                }

                return;
            }

            router.push("/dashboard");
            router.refresh();
        } catch {
            setError("Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Create your account
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Register to report and track school facility issues.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label
                                htmlFor="name"
                                className="text-sm font-medium"
                            >
                                Full name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                disabled={loading}
                                maxLength={100}
                                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                disabled={loading}
                                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="schoolId"
                                className="text-sm font-medium"
                            >
                                School ID
                            </label>

                            <input
                                id="schoolId"
                                name="schoolId"
                                type="text"
                                placeholder="Enter your school ID"
                                value={schoolId}
                                onChange={(event) => setSchoolId(event.target.value)}
                                required
                                disabled={loading}
                                maxLength={100}
                                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <p className="text-xs text-muted-foreground">
                                Use the school ID provided by your school.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Account type
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole("PARENT")}
                                    disabled={loading}
                                    aria-pressed={role === "PARENT"}
                                    className={`h-11 rounded-md border px-3 text-sm font-medium transition ${role === "PARENT"
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "bg-background hover:bg-muted"
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                    Parent
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole("TEACHER")}
                                    disabled={loading}
                                    aria-pressed={role === "TEACHER"}
                                    className={`h-11 rounded-md border px-3 text-sm font-medium transition ${role === "TEACHER"
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "bg-background hover:bg-muted"
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                    Teacher
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                disabled={loading}
                                minLength={8}
                                maxLength={72}
                                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <p className="text-xs text-muted-foreground">
                                Password must be 8–72 characters.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="confirmPassword"
                                className="text-sm font-medium"
                            >
                                Confirm password
                            </label>

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                required
                                disabled={loading}
                                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {error ? (
                            <div
                                role="alert"
                                className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                            >
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-11 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        Registration is available for parents and teachers.
                    </p>
                </div>
            </div>
        </main>
    );
}
