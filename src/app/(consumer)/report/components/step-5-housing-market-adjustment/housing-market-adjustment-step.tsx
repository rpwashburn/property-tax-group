"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, TrendingDown, Upload, FileImage, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { HousingMarketAdjustment } from "@/lib/property-analysis/types/housing-market-types";

interface HousingMarketAdjustmentStepProps {
  onBack: () => void;
  onNext: (adjustment: HousingMarketAdjustment | null) => void;
  initialAdjustment?: HousingMarketAdjustment | null;
}

export function HousingMarketAdjustmentStep({
  onBack,
  onNext,
  initialAdjustment
}: HousingMarketAdjustmentStepProps) {
  const [percentage, setPercentage] = useState<string>(
    initialAdjustment?.percentage?.toString() || ''
  );
  const [description, setDescription] = useState<string>(
    initialAdjustment?.description || ''
  );
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [existingEvidence, setExistingEvidence] = useState(
    initialAdjustment?.evidenceFile || null
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (percentage && (isNaN(Number(percentage)) || Number(percentage) < 0 || Number(percentage) > 100)) {
      newErrors.percentage = 'Percentage must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (images and PDFs)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, file: 'Please upload an image (JPEG, PNG, GIF) or PDF file' });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, file: 'File size must be less than 10MB' });
        return;
      }
      
      setEvidenceFile(file);
      setExistingEvidence(null);
      setErrors({ ...errors, file: '' });
    }
  };

  const handleNext = () => {
    if (!validateForm()) return;
    
    // If no percentage is entered, pass null (no adjustment)
    if (!percentage || Number(percentage) === 0) {
      onNext(null);
      return;
    }
    
    const adjustment: HousingMarketAdjustment = {
      percentage: Number(percentage),
      description: description.trim() || undefined,
      evidenceFile: evidenceFile ? {
        name: evidenceFile.name,
        type: evidenceFile.type,
        size: evidenceFile.size,
        url: URL.createObjectURL(evidenceFile)
      } : existingEvidence || undefined
    };
    
    onNext(adjustment);
  };

  const removeFile = () => {
    setEvidenceFile(null);
    setExistingEvidence(null);
    setErrors({ ...errors, file: '' });
  };

  const hasEvidence = evidenceFile || existingEvidence;
  const percentageValue = Number(percentage) || 0;

  return (
    <Card className="mb-8 shadow-lg border-gray-200 overflow-hidden rounded-xl">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
          <TrendingDown className="h-7 w-7 text-orange-600"/>
          Housing Market Adjustment
        </CardTitle>
        <CardDescription className="text-gray-600">
          If the housing market has declined in your area, you can apply a percentage reduction to your property value.
          Upload supporting documentation such as market reports or news articles as evidence.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This adjustment is optional. If you believe the housing market in your area has declined, 
            enter the percentage decrease and provide supporting evidence. This will reduce your proposed property value.
          </AlertDescription>
        </Alert>

        {/* Percentage Input */}
        <div className="space-y-2">
          <Label htmlFor="percentage" className="text-base font-medium">
            Market Decline Percentage (%)
          </Label>
          <div className="relative">
            <Input
              id="percentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g., 5.0"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className={`pr-8 ${errors.percentage ? 'border-red-500' : ''}`}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
          {errors.percentage && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.percentage}
            </p>
          )}
          {percentageValue > 0 && (
            <p className="text-sm text-gray-600">
              This will reduce your property value by {percentageValue}%
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-medium">
            Description (Optional)
          </Label>
          <Textarea
            id="description"
            placeholder="Describe the market conditions or provide context for this adjustment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label className="text-base font-medium">
            Supporting Evidence
          </Label>
          <p className="text-sm text-gray-600 mb-3">
            Upload market reports, news articles, or other documentation supporting the market decline.
          </p>
          
          {!hasEvidence ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="evidence-upload"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Images (JPEG, PNG, GIF) or PDF files up to 10MB
                </p>
              </label>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileImage className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">
                      {evidenceFile?.name || existingEvidence?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {evidenceFile ? 
                        `${(evidenceFile.size / 1024 / 1024).toFixed(2)} MB` : 
                        'Previously uploaded'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
          
          {errors.file && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.file}
            </p>
          )}
        </div>

        {/* Preview of Impact */}
        {percentageValue > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">Impact Preview</h4>
            <p className="text-sm text-orange-700">
              A {percentageValue}% market adjustment will be applied to reduce your final proposed property value.
              This adjustment will be clearly documented in your protest report.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between p-6 bg-gray-100 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext} className="gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
} 