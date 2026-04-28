import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { FormInput } from "../components/ui/FormInput";
import { Logo } from "../components/ui/Logo";
import { useRecoveryToken, useResetPasswordMutation } from "../lib/auth-hooks";
import { getApiErrorMessage } from "../lib/auth-api";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;
type FormErrors = Partial<Record<keyof ResetForm, string>>;
type Step = "form" | "success";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ResetForm>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const recoveryToken = useRecoveryToken()
  const resetPasswordMutation = useResetPasswordMutation()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!recoveryToken) {
      setSubmitError(
        "Invalid or expired reset link. Please request a new one.",
      );
      return;
    }

    const result = resetSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        accessToken: recoveryToken,
        newPassword: form.password,
      });
      setStep("success");
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          "Unable to reset password. Please request a new reset link.",
        ),
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-1 flex items-center gap-2">
            <Logo size={28} />
            <span className="text-2xl font-bold tracking-tight text-primary">
              RefAI
            </span>
          </div>
          <p className="text-sm text-muted">
            {step === "form" ? "Create a new password" : "Password updated"}
          </p>
        </div>

        {step === "form" ? (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {!recoveryToken ? (
              <p className="text-sm text-red-500">
                Invalid or expired reset link. Request a new password reset
                email.
              </p>
            ) : null}

            {submitError ? (
              <p className="text-sm text-red-500">{submitError}</p>
            ) : null}

            <FormInput
              label="New Password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />

            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter new password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            <Button
              type="submit"
              fullWidth
              loading={resetPasswordMutation.isPending}
              disabled={!recoveryToken}
            >
              Update Password
            </Button>

            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => navigate("/login")}
            >
              Back to Sign In
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#15803D"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm text-muted">
              Your password has been updated. You can now sign in with your new
              password.
            </p>
            <Button
              type="button"
              fullWidth
              onClick={() => navigate("/login", { replace: true })}
            >
              Go to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
