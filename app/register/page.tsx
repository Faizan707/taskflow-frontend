"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "../services/api";
import Input from "../components/Input";
import { RegisterForm } from "../types/auth";

function RegisterPage() {
  const router = useRouter();

  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data).unwrap();
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-175 rounded-2xl bg-(--card-background) p-8 shadow-md md:p-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-(--text-primary)">
            Create Your Account
          </h1>

          <p className="mt-2 text-sm text-(--text-secondary)">
            Join TaskFlow and start managing your projects today.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Full Name"
            name="name"
            type="text"
            placeholder="Enter your name"
            register={register}
            error={errors.name?.message}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email"
            register={register}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Create a password"
            register={register}
            error={errors.password?.message}
          />

          {/* API Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              Registration failed. Please try again.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-white transition hover:bg-(--primary-dark) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-(--text-secondary)">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium text-(--primary) hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </main>
  );
}

export default RegisterPage;
