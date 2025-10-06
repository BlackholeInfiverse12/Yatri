'use client'

import React from 'react'
import { useForm, UseFormReturn, FieldError, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Form field wrapper with validation state
interface FormFieldProps {
  label?: string
  description?: string
  error?: FieldError | string
  required?: boolean
  children: React.ReactNode
  className?: string
  success?: boolean
}

export function FormField({ 
  label, 
  description, 
  error, 
  required, 
  children, 
  className,
  success 
}: FormFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className={cn(
          'text-sm font-medium',
          error ? 'text-destructive' : 'text-foreground',
          success && !error ? 'text-green-600' : ''
        )}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {children}
        
        {/* Validation icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {error && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          {success && !error && (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
        </div>
      </div>
      
      {/* Description */}
      {description && !error && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          {description}
        </p>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <p className="text-xs text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
          <AlertCircle className="h-3 w-3" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}

// Validated input component
interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: FieldError | string
  success?: boolean
}

export function ValidatedInput({ 
  label, 
  description, 
  error, 
  success, 
  className,
  ...props 
}: ValidatedInputProps) {
  const hasError = !!error
  
  return (
    <FormField 
      label={label} 
      description={description} 
      error={error} 
      required={props.required}
      success={success}
    >
      <Input
        {...props}
        className={cn(
          hasError && 'border-destructive focus:ring-destructive',
          success && !hasError && 'border-green-500 focus:ring-green-500',
          className
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${props.name}-error` : undefined}
      />
    </FormField>
  )
}

// Validated textarea component
interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: FieldError | string
  success?: boolean
}

export function ValidatedTextarea({ 
  label, 
  description, 
  error, 
  success,
  className,
  ...props 
}: ValidatedTextareaProps) {
  const hasError = !!error
  
  return (
    <FormField 
      label={label} 
      description={description} 
      error={error} 
      required={props.required}
      success={success}
    >
      <Textarea
        {...props}
        className={cn(
          hasError && 'border-destructive focus:ring-destructive',
          success && !hasError && 'border-green-500 focus:ring-green-500',
          className
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${props.name}-error` : undefined}
      />
    </FormField>
  )
}

// Validated select component
interface ValidatedSelectProps {
  label?: string
  description?: string
  error?: FieldError | string
  success?: boolean
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  required?: boolean
}

export function ValidatedSelect({ 
  label, 
  description, 
  error, 
  success,
  placeholder,
  value,
  onValueChange,
  children,
  required
}: ValidatedSelectProps) {
  const hasError = !!error
  
  return (
    <FormField 
      label={label} 
      description={description} 
      error={error} 
      required={required}
      success={success}
    >
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn(
          hasError && 'border-destructive focus:ring-destructive',
          success && !hasError && 'border-green-500 focus:ring-green-500'
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    </FormField>
  )
}

// Validated switch component
interface ValidatedSwitchProps {
  label?: string
  description?: string
  error?: FieldError | string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  required?: boolean
}

export function ValidatedSwitch({ 
  label, 
  description, 
  error,
  checked,
  onCheckedChange,
  required
}: ValidatedSwitchProps) {
  return (
    <FormField 
      label={label} 
      description={description} 
      error={error} 
      required={required}
    >
      <Switch 
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-primary"
      />
    </FormField>
  )
}

// Form container with validation summary
interface ValidatedFormProps {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  errors?: Record<string, FieldError>
  isSubmitting?: boolean
  className?: string
}

export function ValidatedForm({ 
  children, 
  onSubmit, 
  errors,
  isSubmitting,
  className 
}: ValidatedFormProps) {
  const errorCount = errors ? Object.keys(errors).length : 0
  
  return (
    <form onSubmit={onSubmit} className={cn('space-y-4', className)}>
      {/* Validation summary */}
      {errorCount > 0 && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix {errorCount} error{errorCount > 1 ? 's' : ''} before submitting.
          </AlertDescription>
        </Alert>
      )}
      
      {children}
    </form>
  )
}

// Hook for form validation with React Hook Form and Zod
export function useValidatedForm<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  defaultValues?: T
) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onBlur', // Validate on blur for better UX
    reValidateMode: 'onChange' // Re-validate on change after first validation
  })
  
  const hasErrors = Object.keys(form.formState.errors).length > 0
  
  const submitHandler = (onSubmit: (data: T) => void | Promise<void>) => 
    form.handleSubmit(async (data) => {
      try {
        await onSubmit(data as T)
      } catch (error) {
        console.error('Form submission error:', error)
        // You can add toast notification here
      }
    })
  
  return {
    ...form,
    submitHandler,
    hasErrors
  }
}

// Real-time validation hook
export function useFieldValidation<T>(
  schema: z.ZodSchema<T>,
  value: T,
  debounceMs: number = 300
) {
  const [error, setError] = React.useState<string | null>(null)
  const [isValid, setIsValid] = React.useState(false)
  const [isValidating, setIsValidating] = React.useState(false)
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!value) {
        setError(null)
        setIsValid(false)
        setIsValidating(false)
        return
      }
      
      setIsValidating(true)
      
      try {
        schema.parse(value)
        setError(null)
        setIsValid(true)
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.errors[0]?.message || 'Invalid value')
        } else {
          setError('Validation failed')
        }
        setIsValid(false)
      } finally {
        setIsValidating(false)
      }
    }, debounceMs)
    
    return () => clearTimeout(timer)
  }, [value, schema, debounceMs])
  
  return { error, isValid, isValidating }
}

// Loading button for forms
interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean
  loadingText?: string
}

export function LoadingButton({ 
  isLoading, 
  loadingText = 'Loading...', 
  children, 
  disabled,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button 
      {...props} 
      disabled={disabled || isLoading}
      className="relative"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {isLoading ? loadingText : children}
      </span>
    </Button>
  )
}