"use client"

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, UploadCloud, FileText, Trash2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SupportingEvidenceStepProps {
  onBack: () => void;
  onNext: (files: File[], testimonial: string) => void;
  initialFiles: File[];
  initialTestimonial: string;
}

export function SupportingEvidenceStep({ 
  onBack, 
  onNext,
  initialFiles,
  initialTestimonial 
}: SupportingEvidenceStepProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(initialFiles);
  const [testimonial, setTestimonial] = useState<string>(initialTestimonial);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const currentTotalSize = uploadedFiles.reduce((acc, file) => acc + file.size, 0);
      const newFilesSize = newFiles.reduce((acc, file) => acc + file.size, 0);
      
      if (currentTotalSize + newFilesSize > 25 * 1024 * 1024) { // 25MB limit
        setFileError("Total file size cannot exceed 25MB.");
        return;
      }
      if (uploadedFiles.length + newFiles.length > 10) {
        setFileError("You can upload a maximum of 10 files.");
        return;
      }
      // Check for duplicate file names
      const existingFileNames = new Set(uploadedFiles.map(f => f.name));
      const uniqueNewFiles = newFiles.filter(nf => !existingFileNames.has(nf.name));
      
      setUploadedFiles(prevFiles => [...prevFiles, ...uniqueNewFiles]);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleNextClick = () => {
    // Add any validation for testimonial if needed
    onNext(uploadedFiles, testimonial);
  };

  return (
    <Card className="mb-8 shadow-md border-slate-200 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <UploadCloud className="h-6 w-6 text-primary" />
            Supporting Evidence
        </CardTitle>
        <CardDescription>
          Upload any documents that support your protest (e.g., repair estimates, photos of damage, sales data for similar properties).
          You can also provide a written testimonial.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Upload Documents (Max 10 files, 25MB total)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload-input"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-ring"
                >
                  <span>Upload files</span>
                  <Input 
                    id="file-upload-input" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only" 
                    multiple 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" // Example file types
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG, XLS, XLSX up to 25MB total</p>
            </div>
          </div>
          {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Uploaded files:</h4>
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {uploadedFiles.map(file => (
                  <li key={file.name} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <FileText className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button type="button" onClick={() => handleRemoveFile(file.name)} className="font-medium text-red-600 hover:text-red-500">
                        <Trash2 className="h-4 w-4"/>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="testimonial" className="block text-sm font-medium text-gray-700">
            Testimonial / Additional Notes
          </Label>
          <Textarea
            id="testimonial"
            value={testimonial}
            onChange={(e) => setTestimonial(e.target.value)}
            placeholder="Provide any additional written details, explanations, or arguments for your protest..."
            className="mt-1 min-h-[150px]"
          />
           <p className="mt-2 text-xs text-gray-500">
            This information will be included in your generated report.
          </p>
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>What kind of evidence is helpful?</AlertTitle>
          <AlertDescription className="text-xs">
            - Recent sales of comparable properties that sold for less than your appraised value.
            - Photos of your property showing condition issues (e.g., foundation problems, roof damage).
            - Repair estimates from contractors for significant issues.
            - If your property is unique, explain how its features differ from others and affect its value.
          </AlertDescription>
        </Alert>

      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-slate-50 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNextClick} className="gap-2">
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
} 