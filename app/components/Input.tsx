import React from "react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface Props<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type: string;
  placeholder: string;
  register: UseFormRegister<T>;
  error?: string;
}

function Input<T extends FieldValues>({
  label,
  name,
  type,
  placeholder,
  register,
  error,
}: Props<T>) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-sm font-medium text-(--text-primary)"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className="rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
      />

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

export default Input;
