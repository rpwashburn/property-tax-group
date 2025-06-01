"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, FileImage, RotateCcw } from "lucide-react"
import { fileUtils } from "@/lib/utils"

interface OverrideInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  file: File | null
  fileName?: string
  onFileChange: (file: File | null, fileName?: string) => void
  placeholder?: string
  description?: string
  originalValue?: string
  isChanged?: boolean
}

export function OverrideInput({
  label,
  value,
  onChange,
  file,
  fileName,
  onFileChange,
  placeholder,
  description,
  originalValue,
  isChanged = false
}: OverrideInputProps) {
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    setFileError(null)

    if (!selectedFile) {
      onFileChange(null)
      return
    }

    const validation = fileUtils.validateFile(selectedFile)
    if (!validation.isValid) {
      setFileError(validation.error!)
      return
    }

    onFileChange(selectedFile, selectedFile.name)
  }

  const handleRemoveFile = () => {
    onFileChange(null)
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleClearOverride = () => {
    onChange("")
    handleRemoveFile()
  }

  const formattedOriginalValue = originalValue 
    ? (label.includes("Square") && !isNaN(Number(originalValue))) 
      ? Number(originalValue).toLocaleString()
      : originalValue
    : "N/A"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`override-${label.toLowerCase().replace(/\s+/g, '-')}`}>
          {label}
        </Label>
        {isChanged && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearOverride}
            className="h-6 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Original Value Display */}
      <div className="text-sm">
        <span className="text-muted-foreground">Current Value: </span>
        <span className={`font-medium ${isChanged ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {formattedOriginalValue}
        </span>
        {isChanged && (
          <span className="ml-2 text-blue-600 font-medium">
            → {value ? (label.includes("Square") && !isNaN(Number(value)) ? Number(value).toLocaleString() : value) : ""}
          </span>
        )}
      </div>
      
      <div className="flex gap-2">
        <Input
          id={`override-${label.toLowerCase().replace(/\s+/g, '-')}`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `Override ${formattedOriginalValue}`}
          className={`flex-1 ${isChanged ? 'border-blue-500 bg-blue-50' : ''}`}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          className="shrink-0"
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File display */}
      {file && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <FileImage className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1">
            {fileUtils.getDisplayFileName(fileName || file.name)}
          </span>
          <span className="text-xs text-muted-foreground">
            {fileUtils.formatFileSize(file.size)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Error display */}
      {fileError && (
        <p className="text-sm text-destructive">{fileError}</p>
      )}
    </div>
  )
} 