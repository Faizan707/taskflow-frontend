"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import Input from "../components/Input";
import { useLoginMutation } from "../services/api";
import { setAuthToken } from "../store/authSlice";
import { setToken } from "../utils/storage";

import type { LoginForm } from "../types/auth";

function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [loginUser, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await loginUser(data).unwrap();

      dispatch(setAuthToken(response.token));
      setToken(response.token);

      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-125 rounded-2xl bg-(--card-background) p-8 shadow-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-(--text-primary)">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-(--text-secondary)">
            Sign in to continue to TaskFlow
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
            placeholder="Enter your password"
            register={register}
            error={errors.password?.message}
          />

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              Invalid email or password.
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-white transition hover:bg-(--primary-dark) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-(--text-secondary)">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="font-medium text-(--primary) hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </main>
  );
}

export default LoginPage;
