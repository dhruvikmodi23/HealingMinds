"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../services/api"
import { Save, ArrowLeft, Plus, Trash2, AlertCircle, Loader2, CheckCircle, Info } from "lucide-react"

export default function AdminQuestionForm() {
  const { questionId } = useParams()
  const navigate = useNavigate()
  const isEditMode = questionId !== "new"

  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const [formData, setFormData] = useState({
    text: "",
    description: "",
    type: "radio",
    required: true,
    category: "general",
    options: [],
    minValue: 1,
    maxValue: 5,
    minLabel: "",
    maxLabel: "",
    ageRange: { min: 0, max: 120 },
    forGender: ["male", "female", "other", "prefer_not_to_say"],
    forProfessions: [],
    isInitial: false,
    isFinal: false,
    weight: 1,
    conditionMapping: {
      anxiety: 0,
      depression: 0,
      stress: 0,
      burnout: 0,
      insomnia: 0,
    },
  })

  useEffect(() => {
    if (isEditMode) {
      fetchQuestion()
    }
  }, [questionId])

  const fetchQuestion = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/assessments/questions/${questionId}`)

      // Convert conditionMapping from Map to object
      const conditionMapping = {}
      if (response.question.conditionMapping) {
        for (const [key, value] of Object.entries(response.question.conditionMapping)) {
          conditionMapping[key] = value
        }
      } else {
        conditionMapping.anxiety = 0
        conditionMapping.depression = 0
        conditionMapping.stress = 0
        conditionMapping.burnout = 0
        conditionMapping.insomnia = 0
      }

      setFormData({
        ...response.question,
        conditionMapping,
      })

      setError(null)
    } catch (err) {
      setError("Failed to load question. Please try again.")
      console.error("Error fetching question:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked })
    } else if (name === "ageRange.min" || name === "ageRange.max") {
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: Number.parseInt(value, 10),
        },
      })
    } else if (name.startsWith("conditionMapping.")) {
      const condition = name.split(".")[1]
      setFormData({
        ...formData,
        conditionMapping: {
          ...formData.conditionMapping,
          [condition]: Number.parseFloat(value),
        },
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleGenderChange = (gender) => {
    const currentGenders = [...formData.forGender]

    if (currentGenders.includes(gender)) {
      // Remove gender if already selected
      setFormData({
        ...formData,
        forGender: currentGenders.filter((g) => g !== gender),
      })
    } else {
      // Add gender if not selected
      setFormData({
        ...formData,
        forGender: [...currentGenders, gender],
      })
    }
  }

  const handleProfessionChange = (profession) => {
    const currentProfessions = [...formData.forProfessions]

    if (currentProfessions.includes(profession)) {
      // Remove profession if already selected
      setFormData({
        ...formData,
        forProfessions: currentProfessions.filter((p) => p !== profession),
      })
    } else {
      // Add profession if not selected
      setFormData({
        ...formData,
        forProfessions: [...currentProfessions, profession],
      })
    }
  }

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { label: "", value: "" }],
    })
  }

  const updateOption = (index, field, value) => {
    const updatedOptions = [...formData.options]
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    }

    setFormData({
      ...formData,
      options: updatedOptions,
    })
  }

  const removeOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      // Validate form data
      if (!formData.text) {
        setError("Question text is required")
        setSaving(false)
        return
      }

      if (
        (formData.type === "radio" || formData.type === "select" || formData.type === "checkbox") &&
        formData.options.length === 0
      ) {
        setError(`Options are required for ${formData.type} questions`)
        setSaving(false)
        return
      }

      // Convert conditionMapping from object to Map for API
      const apiFormData = {
        ...formData,
        conditionMapping: Object.entries(formData.conditionMapping).reduce((map, [key, value]) => {
          if (value > 0) {
            map[key] = value
          }
          return map
        }, {}),
      }

      if (isEditMode) {
        await api.put(`/assessments/questions/${questionId}`, apiFormData)
        setSuccessMessage("Question updated successfully")
      } else {
        await api.post("/assessments/questions", apiFormData)
        setSuccessMessage("Question created successfully")

        // Reset form if creating a new question
        if (!isEditMode) {
          setFormData({
            text: "",
            description: "",
            type: "radio",
            required: true,
            category: "general",
            options: [],
            minValue: 1,
            maxValue: 5,
            minLabel: "",
            maxLabel: "",
            ageRange: { min: 0, max: 120 },
            forGender: ["male", "female", "other", "prefer_not_to_say"],
            forProfessions: [],
            isInitial: false,
            isFinal: false,
            weight: 1,
            conditionMapping: {
              anxiety: 0,
              depression: 0,
              stress: 0,
              burnout: 0,
              insomnia: 0,
            },
          })
        }
      }

      setError(null)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      setError("Failed to save question. Please try again.")
      console.error("Error saving question:", err)
    } finally {
      setSaving(false)
    }
  }

  const categoryOptions = [
    { value: "demographic", label: "Demographic" },
    { value: "general", label: "General" },
    { value: "emotional", label: "Emotional" },
    { value: "behavioral", label: "Behavioral" },
    { value: "physical", label: "Physical" },
    { value: "social", label: "Social" },
    { value: "cognitive", label: "Cognitive" },
  ]

  const typeOptions = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "select", label: "Select" },
    { value: "radio", label: "Radio" },
    { value: "checkbox", label: "Checkbox" },
    { value: "scale", label: "Scale" },
  ]

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ]

  const professionOptions = [
    { value: "student", label: "Student" },
    { value: "healthcare", label: "Healthcare Professional" },
    { value: "business", label: "Business Professional" },
    { value: "education", label: "Education" },
    { value: "technology", label: "Technology" },
    { value: "service", label: "Service Industry" },
    { value: "retired", label: "Retired" },
    { value: "unemployed", label: "Unemployed" },
    { value: "other", label: "Other" },
  ]

  const conditionOptions = [
    { value: "anxiety", label: "Anxiety" },
    { value: "depression", label: "Depression" },
    { value: "stress", label: "Stress" },
    { value: "burnout", label: "Burnout" },
    { value: "insomnia", label: "Sleep Disorder" },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading question...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/assessment/questions")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Questions
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">{isEditMode ? "Edit Question" : "Create New Question"}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text*</label>
              <input
                type="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional description or instructions for this question"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type*</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {(formData.type === "radio" || formData.type === "select" || formData.type === "checkbox") && (
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Options*</label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                </div>

                {formData.options.length === 0 ? (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-md text-center">
                    <p className="text-gray-500">No options added yet. Click "Add Option" to create options.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => updateOption(index, "label", e.target.value)}
                          className="flex-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Option Label"
                        />
                        <input
                          type="text"
                          value={option.value}
                          onChange={(e) => updateOption(index, "value", e.target.value)}
                          className="flex-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Option Value"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formData.type === "scale" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Value</label>
                  <input
                    type="number"
                    name="minValue"
                    value={formData.minValue}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Value</label>
                  <input
                    type="number"
                    name="maxValue"
                    value={formData.maxValue}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Label</label>
                  <input
                    type="text"
                    name="minLabel"
                    value={formData.minLabel}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Not at all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Label</label>
                  <input
                    type="text"
                    name="maxLabel"
                    value={formData.maxLabel}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Extremely"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Demographic Targeting</label>
                <div className="flex items-center text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Leave defaults to target all demographics</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      name="ageRange.min"
                      value={formData.ageRange.min}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      name="ageRange.max"
                      value={formData.ageRange.max}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="space-y-2">
                    {genderOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.forGender.includes(option.value)}
                          onChange={() => handleGenderChange(option.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professions (Optional)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {professionOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.forProfessions.includes(option.value)}
                          onChange={() => handleProfessionChange(option.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Condition Mapping</label>
                <div className="flex items-center text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Set weights for how this question contributes to condition scores</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md">
                {conditionOptions.map((condition) => (
                  <div key={condition.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{condition.label}</label>
                    <input
                      type="number"
                      name={`conditionMapping.${condition.value}`}
                      value={formData.conditionMapping[condition.value]}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Additional Settings</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="required"
                      checked={formData.required}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required Question</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isInitial"
                      checked={formData.isInitial}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Initial Question</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFinal"
                      checked={formData.isFinal}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Final Question</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Weight</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0.1"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/assessment/questions")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
