"use client"

import { useState, useMemo } from "react"
import { 
  ArrowLeft, 
  ArrowRight, 
  Car, 
  Waves, 
  TreePine, 
  Home, 
  AlertTriangle,
  Upload,
  X,
  Info,
  Building,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { EnrichedPropertyData } from "@/lib/property-analysis/types/index"
import type { ExtraFeatureDispute, ExtraFeaturesDisputeSummary, ExtraFeature } from "@/lib/property-analysis/types/extra-features-types"

interface ExtraFeaturesStepProps {
  propertyData: EnrichedPropertyData
  onNext: (summary: ExtraFeaturesDisputeSummary) => void
  onBack: () => void
}

export function ExtraFeaturesStep({ propertyData, onNext, onBack }: ExtraFeaturesStepProps) {
  const [disputes, setDisputes] = useState<ExtraFeatureDispute[]>(
    propertyData.extraFeatures?.map((feature: ExtraFeature) => ({
      type: feature.type || "",
      description: feature.description || "",
      originalValue: feature.depreciatedValue || "0",
      disputedValue: feature.depreciatedValue || "0",
      disputed: false,
      reason: "",
      evidenceFiles: []
    })) || []
  )

  const currentExtraValue = Number(propertyData.xFeaturesVal || 0)

  // Calculate totals and adjustments
  const { totalOriginalValue, totalDisputedValue, totalValueReduction, adjustedExtraFeaturesValue } = useMemo(() => {
    const disputedFeatures = disputes.filter(d => d.disputed);
    
    const totalOriginal = disputes.reduce((sum, dispute) => sum + Number(dispute.originalValue), 0);
    const totalDisputed = disputedFeatures.reduce((sum, dispute) => sum + Number(dispute.disputedValue), 0);
    
    const totalReduction = disputedFeatures.reduce((sum, dispute) => {
      return sum + (Number(dispute.originalValue) - Number(dispute.disputedValue));
    }, 0);

    return {
      totalOriginalValue: totalOriginal,
      totalDisputedValue: totalDisputed,
      totalValueReduction: totalReduction,
      adjustedExtraFeaturesValue: Math.max(0, currentExtraValue - totalReduction)
    };
  }, [disputes, currentExtraValue]);

  const handleDisputeToggle = (index: number, disputed: boolean) => {
    setDisputes(prev => prev.map((dispute, i) => 
      i === index ? { ...dispute, disputed } : dispute
    ))
  }

  const handleDisputedValueChange = (index: number, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    setDisputes(prev => prev.map((dispute, i) => 
      i === index ? { ...dispute, disputedValue: numericValue } : dispute
    ))
  }

  const handleReasonChange = (index: number, reason: string) => {
    setDisputes(prev => prev.map((dispute, i) => 
      i === index ? { ...dispute, reason } : dispute
    ))
  }

  const handleFileUpload = (index: number, files: FileList | null) => {
    if (!files) return
    
    setDisputes(prev => prev.map((dispute, i) => 
      i === index ? { 
        ...dispute, 
        evidenceFiles: [...dispute.evidenceFiles, ...Array.from(files)]
      } : dispute
    ))
  }

  const removeFile = (disputeIndex: number, fileIndex: number) => {
    setDisputes(prev => prev.map((dispute, i) => 
      i === disputeIndex ? {
        ...dispute,
        evidenceFiles: dispute.evidenceFiles.filter((_, fi) => fi !== fileIndex)
      } : dispute
    ))
  }

  const getFeatureIcon = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('pool') || lowerType.includes('spa')) return <Waves className="h-4 w-4" />
    if (lowerType.includes('garage') || lowerType.includes('carport')) return <Car className="h-4 w-4" />
    if (lowerType.includes('deck') || lowerType.includes('patio')) return <Home className="h-4 w-4" />
    if (lowerType.includes('fence') || lowerType.includes('landscape')) return <TreePine className="h-4 w-4" />
    return <Building className="h-4 w-4" />
  }

  const disputedCount = disputes.filter(d => d.disputed).length
  const hasValidDisputes = disputes.every(d => !d.disputed || (d.reason.trim().length > 0 && Number(d.disputedValue) >= 0))

  const handleNext = () => {
    onNext({
      disputes,
      totalOriginalValue,
      totalDisputedValue,
      totalValueReduction,
      adjustedExtraFeaturesValue
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
              <Building className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Extra Features Review</CardTitle>
              <CardDescription>
                Review the extra features on your property and dispute any that are inaccurate, overvalued, or non-existent.
              </CardDescription>
            </div>
          </div>
          {disputedCount > 0 && (
            <Badge variant="destructive" className="w-fit">
              {disputedCount} feature{disputedCount !== 1 ? 's' : ''} disputed
            </Badge>
          )}
        </CardHeader>
      </Card>

      {/* Extra Features Value Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Extra Features Value</CardTitle>
          <CardDescription>
            The assessed and adjusted values of extra features on your property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-slate-50 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <p className="text-sm text-muted-foreground">Current Value</p>
              </div>
              <p className="text-3xl font-bold text-green-700">${currentExtraValue.toLocaleString()}</p>
              {currentExtraValue === 0 && (
                <p className="text-xs text-muted-foreground mt-1">No extra features value assessed</p>
              )}
            </div>

            {disputedCount > 0 && (
              <>
                <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-red-50 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-muted-foreground">Value Reduction</p>
                  </div>
                  <p className="text-3xl font-bold text-red-700">-${totalValueReduction.toLocaleString()}</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-blue-50 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-muted-foreground">Adjusted Value</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">${adjustedExtraFeaturesValue.toLocaleString()}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features List */}
      {disputes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Features</CardTitle>
            <CardDescription>
              Check the box next to any feature you want to dispute. Enter your estimated fair value and provide supporting evidence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {disputes.map((dispute, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={dispute.disputed}
                    onCheckedChange={(checked) => handleDisputeToggle(index, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getFeatureIcon(dispute.type)}
                      <h4 className="font-medium">{dispute.description}</h4>
                      <Badge variant="outline">Assessed Value: ${Number(dispute.originalValue).toLocaleString()}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Type: {dispute.type}</p>
                  </div>
                </div>

                {dispute.disputed && (
                  <div className="ml-6 space-y-3 border-l-2 border-purple-200 pl-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Assessed Value</Label>
                        <Input
                          value={`$${Number(dispute.originalValue).toLocaleString()}`}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`disputed-value-${index}`} className="text-sm font-medium">
                          Your Estimated Fair Value *
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            id={`disputed-value-${index}`}
                            type="text"
                            placeholder="0"
                            value={Number(dispute.disputedValue).toLocaleString()}
                            onChange={(e) => handleDisputedValueChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                            className="pl-6"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`reason-${index}`} className="text-sm font-medium">
                        Reason for dispute *
                      </Label>
                      <Textarea
                        id={`reason-${index}`}
                        placeholder="Explain why this feature is overvalued (e.g., poor condition, outdated, smaller than assessed, market analysis shows lower value)..."
                        value={dispute.reason}
                        onChange={(e) => handleReasonChange(index, e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Supporting Evidence</Label>
                      <div className="mt-2">
                        <Input
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(index, e.target.files)}
                          className="hidden"
                          id={`files-${index}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`files-${index}`)?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photos, Appraisals, or Market Data
                        </Button>
                      </div>

                      {dispute.evidenceFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {dispute.evidenceFiles.map((file, fileIndex) => (
                            <div key={fileIndex} className="flex items-center justify-between text-sm bg-slate-50 rounded px-2 py-1">
                              <span className="truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index, fileIndex)}
                                className="h-auto p-1"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">No Extra Features Found</h3>
            <p className="text-muted-foreground">
              This property doesn't have any recorded extra features like pools, garages, or decks.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How to Dispute Extra Features:</strong> If you believe an extra feature is overvalued, 
          enter what you think the fair market value should be and provide evidence such as photos showing 
          condition, contractor estimates, or comparable sales data. The difference will be subtracted from 
          your total property value.
        </AlertDescription>
      </Alert>

      {/* Validation Alert */}
      {disputedCount > 0 && !hasValidDisputes && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please provide a reason and fair value estimate for each disputed feature before proceeding.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <Card>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={handleNext} 
            className="gap-2"
            disabled={disputedCount > 0 && !hasValidDisputes}
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 