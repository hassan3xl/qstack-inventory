"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Check, X, ChevronDown } from "lucide-react";
import {
  UseFormRegister,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface InputProps<T extends FieldValues> {
  name: Path<T>;
  register: UseFormRegister<T>;
  label?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  field?: "input" | "textarea" | "checkbox" | "select" | "radio";
  type?: string;
  placeholder?: string;
  error?: FieldError;
  success?: string;
  disabled?: boolean;
  options?: Option[];
  rows?: number;
  multiple?: boolean;
  validation?: object;
  className?: string;
  [key: string]: any;
}

function Input<T extends FieldValues>({
  name,
  register,
  label,
  icon: Icon,
  field = "input",
  type = "text",
  placeholder,
  error,
  success,
  disabled = false,
  options = [],
  rows = 4,
  multiple = false,
  validation = {},
  className = "",
  ...props
}: InputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;

  const getContainerClasses = () => {
    const base =
      "relative flex items-center rounded-lg border bg-background transition-all duration-200";
    const state = error
      ? "border-destructive/50 focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20"
      : success
      ? "border-green-500/50 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20"
      : focused
      ? "border-ring ring-2 ring-ring/20 shadow-sm"
      : "border-input hover:border-ring/60";
    const disabledState = disabled
      ? "opacity-50 cursor-not-allowed bg-muted"
      : "";
    return `${base} ${state} ${disabledState}`;
  };

  const getIconClasses = () =>
    error
      ? "text-destructive"
      : success
      ? "text-green-600 dark:text-green-400"
      : focused
      ? "text-primary"
      : "text-muted-foreground";

  const fieldClass =
    `flex-1 px-4 py-2.5 bg-transparent outline-none text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed ${className}`.trim();

  const renderInput = () => {
    switch (field) {
      case "textarea":
        return (
          <div className={getContainerClasses()}>
            {Icon && (
              <Icon
                size={18}
                className={`ml-3 self-start mt-3.5 transition-colors ${getIconClasses()}`}
              />
            )}
            <textarea
              {...register(name, validation)}
              placeholder={placeholder}
              rows={rows}
              disabled={disabled}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`${fieldClass} resize-none min-h-[100px]`}
              {...props}
            />
          </div>
        );

      case "select": {
        const registered = register(name, validation);
        const [selectedValue, setSelectedValue] = useState("");
        const [isOpen, setIsOpen] = useState(false);
        const selectRef = React.useRef<HTMLSelectElement | null>(null);

        React.useEffect(() => {
          if (selectRef.current && selectRef.current.value !== selectedValue) {
            setSelectedValue(selectRef.current.value);
          }
        });

        const selectedOption = options.find((opt) => opt.value === selectedValue);
        const selectedLabel = selectedOption ? selectedOption.label : "";

        if (multiple) {
          return (
            <div className={`${getContainerClasses()} relative`}>
              {Icon && (
                <Icon
                  size={18}
                  className={`ml-3 transition-colors ${getIconClasses()}`}
                />
              )}
              <select
                {...registered}
                ref={(e) => {
                  registered.ref(e);
                  selectRef.current = e;
                }}
                disabled={disabled}
                multiple
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`${fieldClass} pr-10 appearance-none cursor-pointer py-2`}
                {...props}
              >
                {placeholder && (
                  <option value="" disabled>
                    {placeholder}
                  </option>
                )}
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div className={`${getContainerClasses()} w-full relative`}>
            {Icon && (
              <Icon
                size={18}
                className={`ml-3 transition-colors ${getIconClasses()}`}
              />
            )}
            
            {/* Hidden select to link with react-hook-form */}
            <select
              {...registered}
              ref={(e) => {
                registered.ref(e);
                selectRef.current = e;
              }}
              disabled={disabled}
              value={selectedValue}
              onChange={(e) => {
                setSelectedValue(e.target.value);
                registered.onChange(e);
              }}
              className="hidden"
              {...props}
            >
              <option value="" disabled>
                {placeholder}
              </option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Custom Dropdown Trigger */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsOpen(!isOpen)}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                setTimeout(() => setIsOpen(false), 200);
              }}
              className={`${fieldClass} w-full pr-10 text-left cursor-pointer flex items-center justify-between min-h-[44px]`}
            >
              <span className={selectedValue ? "text-foreground font-semibold" : "text-muted-foreground font-semibold"}>
                {selectedLabel || placeholder || "Select option"}
              </span>
              <ChevronDown
                size={16}
                className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                }`}
              />
            </button>

            {/* Custom Dropdown Options */}
            {isOpen && !disabled && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 w-full z-50 bg-background border border-border rounded-lg shadow-xl max-h-52 overflow-y-auto divide-y divide-border/20 py-1">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedValue(opt.value);
                      if (selectRef.current) {
                        selectRef.current.value = opt.value;
                        selectRef.current.dispatchEvent(new Event("change", { bubbles: true }));
                      }
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors flex justify-between items-center cursor-pointer ${
                      selectedValue === opt.value
                        ? "bg-primary/5 text-primary font-bold"
                        : "text-foreground font-medium"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedValue === opt.value && (
                      <Check size={16} className="text-primary shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }

      case "checkbox":
        return (
          <div className="flex items-start space-x-3">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                {...register(name, validation)}
                disabled={disabled}
                className="peer sr-only"
                id={name}
                {...props}
              />
              <label
                htmlFor={name}
                className={`
                  w-5 h-5 border-2 rounded-md flex items-center justify-center cursor-pointer 
                  transition-all duration-200 bg-background
                  peer-checked:bg-primary peer-checked:border-primary
                  peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2
                  ${
                    error
                      ? "border-destructive"
                      : "border-input hover:border-ring"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <Check
                  size={14}
                  className="text-primary-foreground opacity-0 peer-checked:opacity-100 scale-0 peer-checked:scale-100 transition-all duration-200"
                />
              </label>
            </div>
            {label && (
              <label
                htmlFor={name}
                className={`text-sm text-foreground leading-tight select-none ${
                  disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {label}
              </label>
            )}
          </div>
        );

      default:
        return (
          <div className={getContainerClasses()}>
            {Icon && (
              <Icon
                size={18}
                className={`ml-3 transition-colors ${getIconClasses()}`}
              />
            )}
            <input
              type={inputType}
              {...register(name, validation)}
              placeholder={placeholder}
              disabled={disabled}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={fieldClass}
              {...props}
            />
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mr-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-2">
      {label && field !== "checkbox" && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {validation && (validation as any).required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </label>
      )}
      {renderInput()}
      {error && (
        <div className="flex items-start gap-1.5 text-sm text-destructive">
          <X size={16} className="mt-0.5 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}
      {success && !error && (
        <div className="flex items-start gap-1.5 text-sm text-green-600 dark:text-green-400">
          <Check size={16} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}

interface NormalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  error?: string;
  success?: string;
  type?: string;
}

const NormalInput = React.forwardRef<HTMLInputElement, NormalInputProps>(
  ({ label, icon: Icon, error, success, type = "text", className = "", disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const inputType = type === "password" && showPassword ? "text" : type;

    const getContainerClasses = () => {
      const base =
        "relative flex items-center rounded-lg border bg-background transition-all duration-200";
      const state = error
        ? "border-destructive/50 focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20"
        : success
        ? "border-green-500/50 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20"
        : focused
        ? "border-ring ring-2 ring-ring/20 shadow-sm"
        : "border-input hover:border-ring/60";
      const disabledState = disabled
        ? "opacity-50 cursor-not-allowed bg-muted"
        : "";
      return `${base} ${state} ${disabledState}`;
    };

    const getIconClasses = () =>
      error
        ? "text-destructive"
        : success
        ? "text-green-600 dark:text-green-400"
        : focused
        ? "text-primary"
        : "text-muted-foreground";

    const fieldClass =
      `flex-1 px-4 py-2.5 bg-transparent outline-none text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed ${className}`.trim();

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className={getContainerClasses()}>
          {Icon && (
            <Icon
              size={18}
              className={`ml-3 transition-colors ${getIconClasses()}`}
            />
          )}
          <input
            type={inputType}
            ref={ref}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={fieldClass}
            {...props}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="mr-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <div className="flex items-start gap-1.5 text-sm text-destructive">
            <X size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && !error && (
          <div className="flex items-start gap-1.5 text-sm text-green-600 dark:text-green-400">
            <Check size={16} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>
    );
  }
);
NormalInput.displayName = "NormalInput";

export { Input, NormalInput };
