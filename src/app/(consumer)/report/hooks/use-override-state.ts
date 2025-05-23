"use client"

import { useState } from "react"
import type { OverrideState } from "@/lib/property-analysis/types/override-types"
import type { SubjectProperty } from "@/lib/property-analysis/types"

export interface UseOverrideStateReturn {
  overrideState: OverrideState
  originalValues: {
    yearBuilt: string
    buildingSqFt: string
  }
  updateYearBuilt: (value: string) => void
  updateBuildingSqFt: (value: string) => void
  setYearBuiltFile: (file: File | null, fileName?: string) => void
  setBuildingSqFtFile: (file: File | null, fileName?: string) => void
  resetOverrides: () => void
  hasOverrides: boolean
  isYearBuiltChanged: boolean
  isBuildingSqFtChanged: boolean
}

function createInitialOverrideState(): OverrideState {
  return {
    yearBuilt: {
      value: "",
      file: null,
      fileName: undefined,
    },
    buildingSqFt: {
      value: "",
      file: null,
      fileName: undefined,
    },
  }
}

export function useOverrideState(subjectProperty?: SubjectProperty): UseOverrideStateReturn {
  const originalValues = {
    yearBuilt: subjectProperty?.yrImpr || "",
    buildingSqFt: subjectProperty?.bldAr || "",
  }

  const [overrideState, setOverrideState] = useState<OverrideState>(() => 
    createInitialOverrideState()
  )

  const updateYearBuilt = (value: string) => {
    setOverrideState(prev => ({
      ...prev,
      yearBuilt: { ...prev.yearBuilt, value }
    }))
  }

  const updateBuildingSqFt = (value: string) => {
    setOverrideState(prev => ({
      ...prev,
      buildingSqFt: { ...prev.buildingSqFt, value }
    }))
  }

  const setYearBuiltFile = (file: File | null, fileName?: string) => {
    setOverrideState(prev => ({
      ...prev,
      yearBuilt: { ...prev.yearBuilt, file, fileName }
    }))
  }

  const setBuildingSqFtFile = (file: File | null, fileName?: string) => {
    setOverrideState(prev => ({
      ...prev,
      buildingSqFt: { ...prev.buildingSqFt, file, fileName }
    }))
  }

  const resetOverrides = () => {
    setOverrideState(createInitialOverrideState())
  }

  const isYearBuiltChanged = Boolean(
    overrideState.yearBuilt.value && 
    overrideState.yearBuilt.value !== originalValues.yearBuilt
  )

  const isBuildingSqFtChanged = Boolean(
    overrideState.buildingSqFt.value && 
    overrideState.buildingSqFt.value !== originalValues.buildingSqFt
  )

  const hasOverrides = Boolean(
    isYearBuiltChanged || 
    isBuildingSqFtChanged ||
    overrideState.yearBuilt.file ||
    overrideState.buildingSqFt.file
  )

  return {
    overrideState,
    originalValues,
    updateYearBuilt,
    updateBuildingSqFt,
    setYearBuiltFile,
    setBuildingSqFtFile,
    resetOverrides,
    hasOverrides,
    isYearBuiltChanged,
    isBuildingSqFtChanged,
  }
} 