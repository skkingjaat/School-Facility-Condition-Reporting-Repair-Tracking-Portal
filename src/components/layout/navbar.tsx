// File: src/components/layout/navbar.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Menu,
    ShieldCheck,
    X,
} from "lucide-react";

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node)
            ) {
                setMobileMenuOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setMobileMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    function closeMobileMenu() {
        setMobileMenuOpen(false);
    }

    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3"
                >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <ShieldCheck className="size-5" />
                    </div>

                    <div>
                        <p className="text-sm font-semibold leading-none">
                            School Facility
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em]">
                            Reporting Portal
                        </p>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-7 md:flex">
                    <Link
                        href="#about"
                        className="text-sm transition-colors hover:text-foreground"
                    >
                        About
                    </Link>

                    <Link
                        href="#issues"
                        className="text-sm transition-colors hover:text-foreground"
                    >
                        Reportable Issues
                    </Link>

                    <Link
                        href="#how-it-works"
                        className="text-sm transition-colors hover:text-foreground"
                    >
                        How It Works
                    </Link>

                    <Link
                        href="/login"
                        className="text-sm transition-colors hover:text-foreground"
                    >
                        Login
                    </Link>

                    <Link
                        href="/login"
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                    >
                        Report an Issue
                        <ArrowRight className="size-4" />
                    </Link>
                </nav>

                {/* Mobile Navigation */}
                <div
                    ref={mobileMenuRef}
                    className="relative md:hidden"
                >
                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-navigation"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        className="flex size-10 items-center justify-center rounded-md border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {mobileMenuOpen ? (
                            <X className="size-5" />
                        ) : (
                            <Menu className="size-5" />
                        )}
                    </button>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div
                            id="mobile-navigation"
                            className="absolute right-0 top-12 w-72 max-w-[calc(100vw-2rem)] rounded-xl border bg-background p-3 shadow-xl"
                        >
                            <nav className="flex flex-col">
                                <Link
                                    href="#about"
                                    onClick={closeMobileMenu}
                                    className="rounded-lg px-3 py-3 text-sm transition-colors hover:bg-muted"
                                >
                                    About
                                </Link>

                                <Link
                                    href="#issues"
                                    onClick={closeMobileMenu}
                                    className="rounded-lg px-3 py-3 text-sm transition-colors hover:bg-muted"
                                >
                                    Reportable Issues
                                </Link>

                                <Link
                                    href="#how-it-works"
                                    onClick={closeMobileMenu}
                                    className="rounded-lg px-3 py-3 text-sm transition-colors hover:bg-muted"
                                >
                                    How It Works
                                </Link>

                                <Link
                                    href="/login"
                                    onClick={closeMobileMenu}
                                    className="rounded-lg px-3 py-3 text-sm transition-colors hover:bg-muted"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/login"
                                    onClick={closeMobileMenu}
                                    className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                                >
                                    Report an Issue
                                    <ArrowRight className="size-4" />
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}