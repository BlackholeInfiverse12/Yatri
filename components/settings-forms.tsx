"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Bell, 
  Palette, 
  Train, 
  MessageSquare, 
  Save, 
  Check,
  AlertCircle,
  Info
} from "lucide-react"
import { 
  profileSettingsSchema, 
  notificationSettingsSchema, 
  appearanceSettingsSchema, 
  journeyPreferencesSchema,
  feedbackSchema,
  ProfileSettings,
  NotificationSettings,
  AppearanceSettings,
  JourneyPreferences,
  FeedbackData
} from "@/lib/validation-schemas"
import { cn } from "@/lib/utils"

interface ValidationMessageProps {
  error?: string
  success?: boolean
  description?: string
}

function ValidationMessage({ error, success, description }: ValidationMessageProps) {
  if (error) {
    return (
      <p className="text-xs text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )
  }
  
  if (success) {
    return (
      <p className="text-xs text-green-600 flex items-center gap-1 animate-in slide-in-from-top-1">
        <Check className="h-3 w-3" />
        Valid
      </p>
    )
  }
  
  if (description) {
    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Info className="h-3 w-3" />
        {description}
      </p>
    )
  }
  
  return null
}

// Profile Settings Form
export function ProfileSettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileSettings>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
      defaultLocation: "",
      workLocation: "",
      homeLocation: ""
    },
    mode: 'onBlur'
  })

  const onSubmit = async (data: ProfileSettings) => {
    setIsSubmitting(true)
    setSubmitSuccess(false)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Profile settings saved:', data)
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {hasErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} before saving.
              </AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Profile settings saved successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className={cn(
              "text-sm font-medium",
              errors.displayName ? "text-destructive" : ""
            )}>
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="displayName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter your display name"
                  className={cn(
                    errors.displayName && "border-destructive focus:ring-destructive"
                  )}
                />
              )}
            />
            <ValidationMessage 
              error={errors.displayName?.message}
              success={!errors.displayName && !!control._formValues.displayName}
            />
          </div>

          <div className="space-y-2">
            <Label className={cn(
              "text-sm font-medium",
              errors.email ? "text-destructive" : ""
            )}>
              Email (Optional)
            </Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="your.email@example.com"
                  className={cn(
                    errors.email && "border-destructive focus:ring-destructive"
                  )}
                />
              )}
            />
            <ValidationMessage 
              error={errors.email?.message}
              description="For notifications and updates"
            />
          </div>

          <div className="space-y-2">
            <Label className={cn(
              "text-sm font-medium",
              errors.phoneNumber ? "text-destructive" : ""
            )}>
              Phone Number (Optional)
            </Label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="9876543210"
                  className={cn(
                    errors.phoneNumber && "border-destructive focus:ring-destructive"
                  )}
                />
              )}
            />
            <ValidationMessage 
              error={errors.phoneNumber?.message}
              description="For SMS notifications and alerts"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Default Location</Label>
              <Controller
                name="defaultLocation"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g., Andheri Station"
                  />
                )}
              />
              <ValidationMessage description="Your usual starting location" />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={hasErrors || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Notification Settings Form
export function NotificationSettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    watch
  } = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      delays: true,
      crowdUpdates: false,
      newRoutes: true,
      maintenance: true,
      pushNotifications: false,
      emailNotifications: false,
      smsNotifications: false
    }
  })

  const pushEnabled = watch('pushNotifications')
  const emailEnabled = watch('emailNotifications')

  const onSubmit = async (data: NotificationSettings) => {
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      console.log('Notification settings saved:', data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Alert Types</h4>
            
            {[
              { name: 'delays' as const, label: 'Service Delays', description: 'Get notified about train delays and cancellations' },
              { name: 'crowdUpdates' as const, label: 'Crowd Updates', description: 'Real-time crowd information for stations' },
              { name: 'newRoutes' as const, label: 'New Routes', description: 'Updates about new route options' },
              { name: 'maintenance' as const, label: 'Maintenance Alerts', description: 'Planned maintenance and service changes' }
            ].map((item) => (
              <div key={item.name} className="flex items-start space-x-3">
                <Controller
                  name={item.name}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-4">Delivery Methods</h4>
            
            {[
              { name: 'pushNotifications' as const, label: 'Push Notifications', description: 'Browser push notifications' },
              { name: 'emailNotifications' as const, label: 'Email Notifications', description: 'Email alerts and summaries' },
              { name: 'smsNotifications' as const, label: 'SMS Notifications', description: 'Text message alerts' }
            ].map((item) => (
              <div key={item.name} className="flex items-start space-x-3 mb-4">
                <Controller
                  name={item.name}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Feedback Form
export function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FeedbackData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "general",
      title: "",
      description: "",
      urgency: "medium",
      contactBack: false
    },
    mode: 'onBlur'
  })

  const onSubmit = async (data: FeedbackData) => {
    setIsSubmitting(true)
    setSubmitSuccess(false)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      console.log('Feedback submitted:', data)
      setSubmitSuccess(true)
      reset()
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Send Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {hasErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} before submitting.
              </AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Thank you! Your feedback has been submitted successfully.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Feedback Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">🐛 Bug Report</SelectItem>
                    <SelectItem value="feature">✨ Feature Request</SelectItem>
                    <SelectItem value="general">💬 General Feedback</SelectItem>
                    <SelectItem value="accessibility">♿ Accessibility Issue</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className={errors.title ? "text-destructive" : ""}>
              Title <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Brief summary of your feedback"
                  className={cn(
                    errors.title && "border-destructive focus:ring-destructive"
                  )}
                />
              )}
            />
            <ValidationMessage error={errors.title?.message} />
          </div>

          <div className="space-y-2">
            <Label className={errors.description ? "text-destructive" : ""}>
              Description <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Please provide more details about your feedback..."
                  rows={4}
                  className={cn(
                    errors.description && "border-destructive focus:ring-destructive"
                  )}
                />
              )}
            />
            <ValidationMessage error={errors.description?.message} />
          </div>

          <div className="space-y-2">
            <Label>Urgency Level</Label>
            <Controller
              name="urgency"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low Priority</SelectItem>
                    <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                    <SelectItem value="high">🔴 High Priority</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="contactBack"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label className="text-sm">
              I'd like to be contacted about this feedback
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={hasErrors || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}