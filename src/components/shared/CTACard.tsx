import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

interface CTACardProps {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  button: {
    text: string
    href?: string
    onClick?: () => void
    variant?: "default" | "green" | "blue"
    icon?: React.ReactNode
  }
  secondaryButton?: {
    text: string
    href?: string
    onClick?: () => void
    icon?: React.ReactNode
  }
  price?: {
    amount: string
    subtitle: string
  }
  badge?: {
    text: string
    variant?: "default" | "secondary" | "blue"
  }
  borderColor?: string
  className?: string
}

export function CTACard({ 
  title, 
  description, 
  icon, 
  features, 
  button,
  secondaryButton,
  price,
  badge,
  borderColor = "border-primary/30",
  className = "" 
}: CTACardProps) {
  const getButtonClasses = (variant?: string) => {
    switch (variant) {
      case "green":
        return "w-full bg-green-600 hover:bg-green-700"
      case "blue":
        return "w-full bg-blue-600 hover:bg-blue-700"
      default:
        return "w-full"
    }
  }

  const getBadgeClasses = (variant?: string) => {
    switch (variant) {
      case "blue":
        return "bg-blue-600 text-white"
      case "secondary":
        return ""
      default:
        return ""
    }
  }

  const renderButton = (buttonConfig: typeof button, isPrimary = true) => {
    const buttonClasses = getButtonClasses(buttonConfig.variant)
    const size = isPrimary ? "lg" : "sm"
    const variant = isPrimary ? undefined : "outline"
    
    if (buttonConfig.href) {
      return (
        <Button className={buttonClasses} size={size} variant={variant} asChild>
          <Link href={buttonConfig.href}>
            {buttonConfig.icon}
            {buttonConfig.text}
            {!buttonConfig.icon && <ArrowRight className="h-4 w-4 ml-2" />}
          </Link>
        </Button>
      )
    }
    
    return (
      <Button 
        className={buttonClasses} 
        size={size} 
        variant={variant} 
        onClick={buttonConfig.onClick}
        disabled={buttonConfig.onClick === undefined}
      >
        {buttonConfig.icon}
        {buttonConfig.text}
        {!buttonConfig.icon && <ArrowRight className="h-4 w-4 ml-2" />}
      </Button>
    )
  }

  return (
    <Card className={`border-2 ${borderColor} bg-white h-full flex flex-col ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {badge && (
            <Badge className={getBadgeClasses(badge.variant)} variant={badge.variant === "blue" ? undefined : badge.variant}>
              {badge.text}
            </Badge>
          )}
        </div>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        {price && (
          <div className="text-center mb-6">
            <div className={`text-3xl font-bold ${button.variant === "blue" ? "text-blue-600" : "text-green-600"}`}>
              {price.amount}
            </div>
            <div className="text-sm text-muted-foreground">{price.subtitle}</div>
          </div>
        )}
        
        <ul className="space-y-3 text-sm mb-6 flex-grow">
          {features.map((feature, index) => (
            <li key={`feature-${index}-${feature.split(' ')[0]}`} className="flex items-center gap-3">
              <CheckCircle className={`h-4 w-4 ${button.variant === "blue" ? "text-blue-600" : "text-green-600"} mt-0.5 flex-shrink-0`} />
              <span dangerouslySetInnerHTML={{ __html: feature }} />
            </li>
          ))}
        </ul>
        
        <div className="mt-auto space-y-4">
          {renderButton(button, true)}
          
          {secondaryButton && renderButton(secondaryButton, false)}
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              ✓ 30-day money-back guarantee{price?.amount === "$99"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 