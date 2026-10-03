// File: src/app/page.tsx


import { Navbar } from "@/components/layout/navbar";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";


const issueCategories = [
  {
    title: "Classrooms & Furniture",
    description:
      "Broken desks, chairs, doors, windows and other classroom facilities.",
    image:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Electrical Safety",
    description:
      "Damaged switches, lights, wiring and other electrical hazards.",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Toilets & Sanitation",
    description:
      "Report sanitation, cleanliness, drainage and hygiene concerns.",
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Water & Plumbing",
    description:
      "Leaking taps, pipes, water supply and plumbing problems.",
    image:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Buildings & Safety",
    description:
      "Damaged walls, ceilings, windows and other structural concerns.",
    image:
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Other Facility Issues",
    description:
      "Report any other school infrastructure issue that needs attention.",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=85",
  },
];

const workflow = [
  {
    number: "01",
    title: "Report",
    description:
      "Tell the school what is wrong, where it is located and how serious the problem is.",
  },
  {
    number: "02",
    title: "Review",
    description:
      "The school administration reviews the report and decides what action is required.",
  },
  {
    number: "03",
    title: "Repair",
    description:
      "The issue is assigned for repair and its progress is updated through the portal.",
  },
  {
    number: "04",
    title: "Resolve",
    description:
      "After the repair is completed, the issue is marked resolved and the reporter is notified.",
  },
];

export default function HomePage() {
  return (
<>
      <Navbar />

    <main className="min-h-screen bg-yellow-500 text-foreground">
      

      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          <div className="order-2 lg:order-1">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              School Facility Reporting Portal
            </p>

            <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              A safer school starts with{" "}
              <span className="text-primary">speaking up.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7  sm:text-lg">
              Easily report broken, damaged or unsafe school facilities and
              follow the progress of every repair from report to resolution.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              >
                Report an Issue
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-muted"
              >
                Track an Issue
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm ">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Easy to report
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Clear status
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Better accountability
              </span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=90"
                alt="School building and campus"
                width={1800}
                height={1200}
                priority
                className="h-90 w-full object-cover sm:h-110 lg:h-135"
              />

              <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/30 bg-black/65 p-4 text-white backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                  One place for school facility concerns
                </p>

                <p className="mt-1 text-sm font-medium sm:text-base">
                  Report it. Follow it. Get it resolved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section id="about" className="scroll-mt-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Why this portal matters
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Small problems should not become major safety concerns.
            </h2>

            <p className="mt-5 max-w-xl leading-7 ">
              A broken desk, leaking tap, damaged window or electrical hazard
              can easily go unnoticed when there is no simple way to report it.
              This portal creates a clear communication channel between the
              school community and administration.
            </p>

            <p className="mt-4 max-w-xl leading-7 ">
              Every report can be reviewed, assigned, updated and eventually
              resolved—with the progress visible to the appropriate users.
            </p>

            <Link href="/login" className="mt-7 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90">
              Start a Report
              <ArrowRight />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1400&q=85"
              alt="Students learning in a classroom"
              width={1400}
              height={933}
              className="h-90 w-full object-cover sm:h-110"
            />
          </div>
        </div>
      </section>

      {/* Issues */}
      <section id="issues" className="scroll-mt-20 border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              What can be reported
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              If something needs attention, report it.
            </h2>

            <p className="mt-4 leading-7 ">
              Use clear categories to help the school understand and prioritize
              facility problems.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {issueCategories.map((category) => (
              <article
                key={category.title}
                className="group overflow-hidden rounded-2xl border bg-background transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-16/10verflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-semibold">{category.title}</h3>

                  <p className="mt-2 text-sm leading-6 ">
                    {category.description}
                  </p>

                  <Link
                    href="/login"
                    className="mt-5 inline-flex items-center text-sm font-medium text-primary"
                  >
                    Report a concern
                    <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Simple from start to finish.
            </h2>

            <p className="mt-4 leading-7 ">
              A straightforward process keeps everyone informed and makes
              responsibility clear.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {workflow.map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl border bg-card p-6"
              >
                <p className="text-sm font-bold text-primary">{step.number}</p>

                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>

                <p className="mt-3 text-sm leading-6 ">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1400&q=85"
              alt="Teacher and students in a school"
              width={1400}
              height={933}
              className="h-90 w-full object-cover sm:h-115"
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Built for the school community
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Parents, teachers and school administrators working together.
            </h2>

            <p className="mt-5 leading-7 ">
              The portal gives each group a clear role in identifying,
              communicating and resolving facility concerns.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <h3 className="font-semibold">Parents</h3>
                <p className="mt-1 text-sm leading-6 ">
                  Report concerns affecting your child&apos;s school environment and
                  follow their progress.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Teachers</h3>
                <p className="mt-1 text-sm leading-6 ">
                  Quickly report classroom and infrastructure problems that
                  need attention.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">School Administration</h3>
                <p className="mt-1 text-sm leading-6 ">
                  Review reports, assign repair work, update statuses and
                  monitor resolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking */}
      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Transparent tracking
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Know where your report stands.
            </h2>

            <p className="mt-5 max-w-xl leading-7 ">
              Once an issue has been reported, its progress can be followed
              through a clear repair lifecycle.
            </p>

            <div className="mt-8 space-y-4">
              {[
                ["Reported", "The issue has been submitted."],
                ["Pending", "The school is reviewing the report."],
                ["In Progress", "Repair work has started."],
                ["Resolved", "The reported issue has been addressed."],
              ].map(([status, description], index) => (
                <div key={status} className="flex gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-medium">{status}</p>
                    <p className="mt-1 text-sm ">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1400&q=85"
              alt="Maintenance professional working on a facility"
              width={1400}
              height={933}
              className="h-90 w-full object-cover sm:h-115"
            />

            <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-background/95 p-5 shadow-xl backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wider ">
                Example issue
              </p>

              <div className="mt-2 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Broken classroom window</p>
                  <p className="mt-1 text-xs ">
                    Science Block · Room 204
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  In Progress
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl">
          <Image
            src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=85"
            alt="Students in a bright school environment"
            width={1800}
            height={1000}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/85" />

          <div className="relative px-6 py-16 text-center text-white sm:px-10 sm:py-20">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-white/70">
              Make your school better
            </p>

            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              See something that needs attention?
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
              Your report can help the school identify problems and take action
              before they become bigger concerns.
            </p>

            <Link
              href="/login"
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-background px-6 text-base font-medium text-black shadow-sm transition-colors hover:bg-background/90"
            >
              Report a Facility Issue
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="size-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold leading-none">
                    School Facility
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] ">
                    Reporting Portal
                  </p>
                </div>
              </Link>

              <p className="mt-4 text-sm leading-6 ">
                A centralized platform for reporting, tracking and managing
                school facility issues.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm sm:grid-cols-3">
              <div>
                <p className="font-semibold">Portal</p>

                <div className="mt-3 space-y-2 ">
                  <Link
                    href="/login"
                    className="block hover:text-foreground"
                  >
                    Login
                  </Link>

                  <Link
                    href="/login"
                    className="block hover:text-foreground"
                  >
                    Report an Issue
                  </Link>

                  <Link
                    href="/dashboard"
                    className="block hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>

              <div>
                <p className="font-semibold">Information</p>

                <div className="mt-3 space-y-2 ">
                  <Link href="#about" className="block hover:text-foreground">
                    About
                  </Link>

                  <Link href="#issues" className="block hover:text-foreground">
                    Issues
                  </Link>

                  <Link
                    href="#how-it-works"
                    className="block hover:text-foreground"
                  >
                    How It Works
                  </Link>
                </div>
              </div>

              <div>
                <p className="font-semibold">Platform</p>

                <div className="mt-3 space-y-2 ">
                  <Link
                    href="login"
                    className="block hover:text-foreground"
                  >
                    Issue Reporting
                  </Link>
                  <Link
                    href="login"
                    className="block hover:text-foreground"
                  >
                    Repair Tracking
                  </Link>
                  <Link
                    href="login"
                    className="block hover:text-foreground"
                  >
                    Notifications
                  </Link>
                  
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs  sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} School Facility Reporting Portal.
            </p>

            <p>Designed for safer and better-maintained schools.</p>
          </div>
        </div>
      </footer>
    </main>
</>
  );
}