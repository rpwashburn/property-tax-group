"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Home, Upload, FileText, Image, PenToolIcon as Tool, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { SubjectProperty } from "@/lib/comparables/server"

type Evidence = {
  propertyMeasurement: File | null
  conditionPhotos: File | null
  repairQuotes: File | null
  inspectionReports: File | null
}

// Define specific state for overrides and their documents
type OverrideState = {
  yearBuilt: {
    value: string;
    file: File | null;
  };
  buildingSqFt: {
    value: string;
    file: File | null;
  };
};

interface SupportingEvidenceStepProps {
  onBack: () => void
  subjectProperty: SubjectProperty
}

export function SupportingEvidenceStep({ onBack, subjectProperty }: SupportingEvidenceStepProps) {
  // State for additional evidence
  const [additionalEvidence, setAdditionalEvidence] = useState<Evidence>({
    propertyMeasurement: null,
    conditionPhotos: null,
    repairQuotes: null,
    inspectionReports: null,
  })

  // State for overrides
  const [overrides, setOverrides] = useState<OverrideState>({
    yearBuilt: { value: subjectProperty.yrImpr || '', file: null },
    buildingSqFt: { value: subjectProperty.bldAr || '', file: null },
  });

  const handleAdditionalEvidenceUpload = (type: keyof Evidence, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAdditionalEvidence((prev) => ({ ...prev, [type]: file }))
  }

  const handleOverrideValueChange = (
    type: keyof OverrideState,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setOverrides((prev) => ({
      ...prev,
      [type]: { ...prev[type], value },
    }));
  };

  const handleOverrideFileUpload = (
    type: keyof OverrideState,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    // Allow clearing the file by selecting none
    setOverrides((prev) => ({
      ...prev,
      [type]: { ...prev[type], file: file || null },
    }));
  };

  const getCompletionStatus = () => {
    // You might want to adjust completion logic based on overrides later
    const totalItems = Object.keys(additionalEvidence).length
    const completedItems = Object.values(additionalEvidence).filter((item) => item !== null).length
    return {
      completedItems,
      totalItems,
      percentage: Math.round((completedItems / totalItems) * 100),
    }
  }

  const status = getCompletionStatus()

  return (
    <Card className="mb-8 shadow-md border-slate-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
        <div className="flex items-center gap-2 text-primary mb-1">
          <Home className="h-5 w-5" />
          <Badge variant="outline" className="text-xs font-normal">
            Step 3 of 3
          </Badge>
        </div>
        <CardTitle className="text-2xl">Supporting Evidence</CardTitle>
        <CardDescription>Upload documents to support your case for a lower assessment</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Upload Progress</h3>
              <Badge variant={status.percentage === 100 ? "default" : "outline"} className="px-3">
                {status.completedItems}/{status.totalItems} Complete
              </Badge>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${status.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Upload all required documents to strengthen your case</p>
          </div>

          {/* --- Property Detail Overrides Section --- */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-2 text-blue-800">Property Detail Overrides</h3>
            <p className="text-sm text-blue-700 mb-6">If your evidence supports different values for Year Built or Building SqFt, enter the correct value and upload the supporting document below. <strong className="font-medium">Overrides require documentation.</strong></p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <Label htmlFor="overrideYearBuiltValue" className="font-medium">Override Year Built</Label>
                  <Input
                    id="overrideYearBuiltValue"
                    type="number"
                    placeholder="YYYY (e.g., 1995)"
                    value={overrides.yearBuilt.value}
                    onChange={(e) => handleOverrideValueChange("yearBuilt", e)}
                    min={1800}
                    max={new Date().getFullYear()}
                    className="mb-2"
                  />
                  <p className="text-xs text-muted-foreground">Original Value: {subjectProperty.yrImpr || 'N/A'}</p>
                </div>
                <EvidenceUploader
                  id="overrideYearBuiltDoc"
                  label="Year Built Document"
                  description="Required if overriding year"
                  file={overrides.yearBuilt.file}
                  onChange={(e) => handleOverrideFileUpload("yearBuilt", e)}
                  icon={<FileText className="h-5 w-5" />}
                  required={overrides.yearBuilt.value !== (subjectProperty.yrImpr || '')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <Label htmlFor="overrideBuildingSqFtValue" className="font-medium">Override Building SqFt</Label>
                  <Input
                    id="overrideBuildingSqFtValue"
                    type="number"
                    placeholder="Total SqFt (e.g., 2500)"
                    value={overrides.buildingSqFt.value}
                    onChange={(e) => handleOverrideValueChange("buildingSqFt", e)}
                    min={100}
                    className="mb-2"
                  />
                  <p className="text-xs text-muted-foreground">Original Value: {subjectProperty.bldAr ? parseInt(subjectProperty.bldAr, 10).toLocaleString() : 'N/A'}</p>
                </div>
                <EvidenceUploader
                  id="overrideBuildingSqFtDoc"
                  label="Building SqFt Document"
                  description="Required if overriding SqFt"
                  file={overrides.buildingSqFt.file}
                  onChange={(e) => handleOverrideFileUpload("buildingSqFt", e)}
                  icon={<FileText className="h-5 w-5" />}
                  required={overrides.buildingSqFt.value !== (subjectProperty.bldAr || '')}
                />
              </div>
            </div>
          </div>

          {/* --- Additional Supporting Evidence Section --- */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold mb-4">Additional Supporting Evidence (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EvidenceUploader
                id="propertyMeasurement"
                label="Property Measurement Report"
                description="Upload a professional measurement report"
                file={additionalEvidence.propertyMeasurement}
                onChange={(e) => handleAdditionalEvidenceUpload("propertyMeasurement", e)}
                icon={<FileText className="h-5 w-5" />}
              />
              <EvidenceUploader
                id="conditionPhotos"
                label="Property Condition Photos"
                description="Upload photos showing current condition"
                file={additionalEvidence.conditionPhotos}
                onChange={(e) => handleAdditionalEvidenceUpload("conditionPhotos", e)}
                icon={<Image className="h-5 w-5" aria-label="Upload photos icon" />}
                multiple
              />
              <EvidenceUploader
                id="repairQuotes"
                label="Major Repair Quotes"
                description="Upload contractor quotes for repairs"
                file={additionalEvidence.repairQuotes}
                onChange={(e) => handleAdditionalEvidenceUpload("repairQuotes", e)}
                icon={<Tool className="h-5 w-5" />}
                accept=".pdf"
                multiple
              />
              <EvidenceUploader
                id="inspectionReports"
                label="Inspection Reports"
                description="Upload professional inspection reports"
                file={additionalEvidence.inspectionReports}
                onChange={(e) => handleAdditionalEvidenceUpload("inspectionReports", e)}
                icon={<ClipboardCheck className="h-5 w-5" />}
                accept=".pdf"
                multiple
              />
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h3 className="font-medium text-primary mb-2">Why Evidence Matters</h3>
            <p className="text-sm text-muted-foreground">
              Strong supporting evidence significantly increases your chances of a successful property tax appeal. The
              appraisal district relies on documentation to justify any reduction in assessed value.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-slate-50 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {(() => {
          const targetPath = `/report/${subjectProperty.acct}`
          const queryParams = new URLSearchParams()
          let canProceed = true; // Assume true, set to false if validation fails

          // Check Year Built Override
          if (overrides.yearBuilt.value && overrides.yearBuilt.value !== (subjectProperty.yrImpr || '')) {
            if (overrides.yearBuilt.file) {
              queryParams.set('overrideYrImpr', overrides.yearBuilt.value);
            } else {
              canProceed = false; // Year override needs file
            }
          }

          // Check Building SqFt Override
          if (overrides.buildingSqFt.value && overrides.buildingSqFt.value !== (subjectProperty.bldAr || '')) {
            if (overrides.buildingSqFt.file) {
              queryParams.set('overrideBldAr', overrides.buildingSqFt.value);
            } else {
              canProceed = false; // SqFt override needs file
            }
          }

          const queryString = queryParams.toString()
          const finalHref = queryString ? `${targetPath}?${queryString}` : targetPath

          return (
            <Link 
              href={canProceed ? finalHref : "#"} 
              passHref 
              aria-disabled={!canProceed} 
              onClick={(e) => !canProceed && e.preventDefault()}
              className={!canProceed ? 'pointer-events-none' : ''} // Prevent navigation when disabled
            >
              <Button 
                className="gap-2 px-6" 
                disabled={!canProceed} 
                title={!canProceed ? "Please upload required supporting document(s) for overrides." : "Generate Analysis Report"}
              >
                Generate Report <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )
        })()}
      </CardFooter>
    </Card>
  )
}

interface EvidenceUploaderProps {
  id: string
  label: string
  description: string
  file: File | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon: React.ReactNode
  accept?: string
  multiple?: boolean
  required?: boolean
}

function EvidenceUploader({
  id,
  label,
  description,
  file,
  onChange,
  icon,
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = false,
  required = false,
}: EvidenceUploaderProps) {
  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to trigger the hidden input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`p-5 rounded-lg border-2 border-dashed transition-all relative ${
        file ? "bg-primary/5 border-primary/30" : "bg-slate-50 border-slate-200 hover:border-primary/30"
      }`}
    >
      {required && !file && (
        <Badge variant="destructive" className="absolute top-2 right-2">Required</Badge>
      )}
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 rounded-full mb-3 ${file ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-500"}`}>
          {file ? <FileText className="h-6 w-6" /> : icon}
        </div>

        <Label htmlFor={id} className="font-medium mb-1">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        {/* Hidden File Input with ref */}
        <Input
          id={id}
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onChange}
          accept={accept} // Keep accept for now based on user feedback?
          multiple={multiple}
        />

        {/* Visible Button triggers the hidden input */}
        <Button
          type="button" // Important: Prevent form submission if nested
          variant={file ? "outline" : "default"}
          className={`w-full ${file ? "border-primary/30" : ""}`}
          onClick={handleButtonClick} // Call the click handler
        >
          <Upload className="h-4 w-4 mr-2" />
          {file ? "Replace File" : "Upload File"}
        </Button>

        {file && <div className="mt-3 text-sm text-primary font-medium">{file.name}</div>}
      </div>
    </div>
  )
}

