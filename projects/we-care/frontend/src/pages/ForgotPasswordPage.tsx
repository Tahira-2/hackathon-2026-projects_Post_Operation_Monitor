import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { FormInput } from "../components/ui/FormInput";
import { Logo } from "../components/ui/Logo";
import { useForgotPasswordMutation } from "../lib/auth-hooks";
import { getApiErrorMessage } from "../lib/auth-api";

const forgotSchema = z.object({
  email: z.email("Invalid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;
type FormErrors = Partial<Record<keyof ForgotForm, string>>;

type Step = "form" | "sent";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ForgotForm>({ email: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const forgotPasswordMutation = useForgotPasswordMutation()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = forgotSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormErrors;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    try {
      await forgotPasswordMutation.mutateAsync(form.email);
      setStep("sent");
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          "Unable to send reset link. Please try again.",
        ),
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-1 flex items-center gap-2">
            <Logo size={28} />
            <span className="text-2xl font-bold tracking-tight text-primary">
              RefAI
            </span>
          </div>
          <p className="text-sm text-muted">
            {step === "form" ? "Reset your password" : "Check your email"}
          </p>
        </div>

        {step === "form" ? (
          <>
            <p className="mb-5 text-sm text-muted">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {submitError ? (
                <p className="text-sm text-red-500">{submitError}</p>
              ) : null}

              <FormInput
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="doctor@hospital.org"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />

              <Button type="submit" fullWidth loading={forgotPasswordMutation.isPending}>
                Send Reset Link
              </Button>
            </form>
          </>
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
              A reset link was sent to{" "}
              <span className="font-medium text-primary">{form.email}</span>.
              Check your inbox and follow the instructions.
            </p>
            <Button type="button" fullWidth onClick={() => navigate("/login")}>
              Back to Sign In
            </Button>
          </div>
        )}

        {step === "form" && (
          <div className="mt-6 border-t border-border pt-5 text-center">
            <p className="text-sm text-muted">
              Remember your password?{" "}
              <Button
                variant="text"
                type="button"
                className="text-sm font-medium"
                onClick={() => navigate("/login")}
              >
                Sign in
              </Button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
