import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { FormInput } from "../components/ui/FormInput";
import { Logo } from "../components/ui/Logo";
import { useSignInMutation, useSignUpMutation } from "../lib/auth-hooks";
import { getApiErrorMessage } from "../lib/auth-api";

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;
type FormErrors = Partial<Record<keyof SignupForm, string>>;

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SignupForm>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const signUpMutation = useSignUpMutation()
  const signInMutation = useSignInMutation()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = signupSchema.safeParse(form);
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
      await signUpMutation.mutateAsync({
        full_name: form.fullName,
        email: form.email,
        password: form.password,
      });

      await signInMutation.mutateAsync({
        email: form.email,
        password: form.password,
      });
      navigate("/", { replace: true });
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          "Unable to create account. Please try again.",
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
          <p className="text-sm text-muted">Create your clinician account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {submitError ? (
            <p className="text-sm text-red-500">{submitError}</p>
          ) : null}

          <FormInput
            label="Full Name"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Dr. Jane Smith"
            value={form.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />

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

          <FormInput
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            fullWidth
            loading={signUpMutation.isPending || signInMutation.isPending}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-5 text-center">
          <p className="text-sm text-muted">
            Already have an account?{" "}
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
      </div>
    </div>
  );
}
