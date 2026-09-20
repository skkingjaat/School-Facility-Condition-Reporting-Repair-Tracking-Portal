// File: src/app/issues/report/page.tsx

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  { value: "FURNITURE", label: "Furniture" },
  { value: "CLASSROOM", label: "Classroom" },
  { value: "TOILET_SANITATION", label: "Toilet & Sanitation" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "SAFETY", label: "Safety" },
  { value: "OTHER", label: "Other" },
];

const priorities = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const allowedVideoTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

type ValidationErrors = {
  description?: string[];
  category?: string[];
  location?: string[];
  priority?: string[];
};

type IssueResponse = {
  success: boolean;
  message: string;
  errors?: ValidationErrors;
  data?: {
    issue?: {
      id: string;
    };
  };
};

type MediaResponse = {
  success: boolean;
  message: string;
};

export default function ReportIssuePage() {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("");

  const [files, setFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const selectedFiles = Array.from(event.target.files ?? []);

    for (const file of selectedFiles) {
      const isImage = allowedImageTypes.includes(file.type);
      const isVideo = allowedVideoTypes.includes(file.type);

      if (!isImage && !isVideo) {
        setError(
          `${file.name}: Only JPG, PNG, WEBP, MP4, WEBM, and MOV files are allowed.`
        );
        event.target.value = "";
        return;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setError(
          `${file.name}: Image size must not exceed 10 MB.`
        );
        event.target.value = "";
        return;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        setError(
          `${file.name}: Video size must not exceed 50 MB.`
        );
        event.target.value = "";
        return;
      }

      if (file.size === 0) {
        setError(`${file.name}: The selected file is empty.`);
        event.target.value = "";
        return;
      }
    }

    setFiles(selectedFiles);
    event.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((currentFiles) =>
      currentFiles.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  async function uploadMedia(
    issueId: string,
    file: File
  ): Promise<MediaResponse> {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      `/api/issues/${issueId}/media`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    const result: MediaResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || `Unable to upload ${file.name}.`
      );
    }

    return result;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedDescription = description.trim();
    const trimmedLocation = location.trim();

    if (!trimmedDescription) {
      setError("Please describe the facility issue.");
      return;
    }

    if (trimmedDescription.length < 10) {
      setError(
        "Description must be at least 10 characters."
      );
      return;
    }

    if (trimmedDescription.length > 2000) {
      setError(
        "Description must not exceed 2000 characters."
      );
      return;
    }

    if (!category) {
      setError("Please select an issue category.");
      return;
    }

    if (!trimmedLocation) {
      setError("Please enter the issue location.");
      return;
    }

    if (trimmedLocation.length < 2) {
      setError("Location must be at least 2 characters.");
      return;
    }

    if (trimmedLocation.length > 200) {
      setError(
        "Location must not exceed 200 characters."
      );
      return;
    }

    if (!priority) {
      setError("Please select the issue priority.");
      return;
    }

    setLoading(true);

    try {
      const issueResponse = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          description: trimmedDescription,
          category,
          location: trimmedLocation,
          priority,
        }),
      });

      const issueResult: IssueResponse =
        await issueResponse.json();

      if (
        !issueResponse.ok ||
        !issueResult.success ||
        !issueResult.data?.issue?.id
      ) {
        const backendError =
          issueResult.errors?.description?.[0] ??
          issueResult.errors?.category?.[0] ??
          issueResult.errors?.location?.[0] ??
          issueResult.errors?.priority?.[0];

        setError(
          backendError ||
            issueResult.message ||
            "Unable to report issue."
        );

        return;
      }

      const issueId = issueResult.data.issue.id;

      for (const file of files) {
        await uploadMedia(issueId, file);
      }

      setSuccess(
        files.length > 0
          ? "Issue and media reported successfully."
          : "Issue reported successfully."
      );

      setDescription("");
      setCategory("");
      setLocation("");
      setPriority("");
      setFiles([]);

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to complete issue reporting."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border bg-background shadow-sm">
          <div className="border-b px-5 py-5 sm:px-8 sm:py-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Report Facility Issue
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Report a damaged, unsafe, or poorly maintained
              school facility.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 px-5 py-6 sm:px-8 sm:py-8"
          >
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Issue Description
              </label>

              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the problem clearly..."
                rows={5}
                maxLength={2000}
                disabled={loading}
                className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="flex justify-between gap-4 text-xs text-muted-foreground">
                <span>Minimum 10 characters</span>

                <span>{description.length}/2000</span>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  disabled={loading}
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Select category</option>

                  {categories.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="priority"
                  className="text-sm font-medium"
                >
                  Priority
                </label>

                <select
                  id="priority"
                  name="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value)
                  }
                  disabled={loading}
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Select priority</option>

                  {priorities.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-sm font-medium"
              >
                Issue Location
              </label>

              <input
                id="location"
                name="location"
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="Example: Building A, First Floor, Classroom 10A"
                maxLength={200}
                disabled={loading}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="flex justify-between gap-4 text-xs text-muted-foreground">
                <span>Minimum 2 characters</span>

                <span>{location.length}/200</span>
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="media"
                className="text-sm font-medium"
              >
                Photos or Videos
              </label>

              <input
                id="media"
                name="media"
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full cursor-pointer rounded-md border bg-background text-sm file:mr-4 file:border-0 file:bg-muted file:px-4 file:py-2.5 file:text-sm file:font-medium hover:file:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="text-xs text-muted-foreground">
                Images up to 10 MB and videos up to 50 MB.
              </p>

              {files.length > 0 ? (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {file.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        disabled={loading}
                        className="shrink-0 text-sm font-medium text-destructive hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                role="status"
                className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
              >
                {success}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                disabled={loading}
                className="h-11 rounded-md border bg-background px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? files.length > 0
                    ? "Reporting & Uploading..."
                    : "Reporting..."
                  : "Report Issue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}