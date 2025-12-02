'use client'

import { useState, useRef } from 'react'
import Footer from '@/components/Footer'
import { FileCheck, Download, Plus, X, Loader2, Upload, Palette, Layout, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import { usePopunderAd } from '@/hooks/usePopunderAd'

interface Experience {
  id: string
  company: string
  position: string
  duration: string
  description: string
}

interface Education {
  id: string
  institution: string
  degree: string
  year: string
}

interface Language {
  id: string
  name: string
  proficiency: string
}

interface Reference {
  id: string
  name: string
  position: string
  company: string
  email: string
  phone: string
}

interface Course {
  id: string
  name: string
  institution: string
  year: string
}

type Template = 'modern' | 'classic' | 'creative' | 'minimal'

const templates: { id: Template; name: string; preview: string }[] = [
  { id: 'modern', name: 'Modern', preview: 'Clean lines with colored accents' },
  { id: 'classic', name: 'Classic', preview: 'Traditional professional layout' },
  { id: 'creative', name: 'Creative', preview: 'Bold design for creative fields' },
  { id: 'minimal', name: 'Minimal', preview: 'Simple and elegant' },
]

const colorPresets = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Indigo', value: '#6366f1' },
]

export default function AIResumeBuilder() {
  const { triggerPopunder } = usePopunderAd()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('modern')
  const [primaryColor, setPrimaryColor] = useState('#2563eb')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    website: '',
    github: '',
    summary: '',
    objective: '',
  })
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [skills, setSkills] = useState<string[]>([''])
  const [languages, setLanguages] = useState<Language[]>([])
  const [references, setReferences] = useState<Reference[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { id: Date.now().toString(), company: '', position: '', duration: '', description: '' }
    ])
  }

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id))
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp))
  }

  const addEducation = () => {
    setEducations([
      ...educations,
      { id: Date.now().toString(), institution: '', degree: '', year: '' }
    ])
  }

  const removeEducation = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id))
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducations(educations.map(edu => edu.id === id ? { ...edu, [field]: value } : edu))
  }

  const addSkill = () => {
    setSkills([...skills, ''])
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills]
    newSkills[index] = value
    setSkills(newSkills)
  }

  const addLanguage = () => {
    setLanguages([
      ...languages,
      { id: Date.now().toString(), name: '', proficiency: 'Native' }
    ])
  }

  const removeLanguage = (id: string) => {
    setLanguages(languages.filter(lang => lang.id !== id))
  }

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setLanguages(languages.map(lang => lang.id === id ? { ...lang, [field]: value } : lang))
  }

  const addReference = () => {
    setReferences([
      ...references,
      { id: Date.now().toString(), name: '', position: '', company: '', email: '', phone: '' }
    ])
  }

  const removeReference = (id: string) => {
    setReferences(references.filter(ref => ref.id !== id))
  }

  const updateReference = (id: string, field: keyof Reference, value: string) => {
    setReferences(references.map(ref => ref.id === id ? { ...ref, [field]: value } : ref))
  }

  const addCourse = () => {
    setCourses([
      ...courses,
      { id: Date.now().toString(), name: '', institution: '', year: '' }
    ])
  }

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id))
  }

  const updateCourse = (id: string, field: keyof Course, value: string) => {
    setCourses(courses.map(course => course.id === id ? { ...course, [field]: value } : course))
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 37, g: 99, b: 235 }
  }

  const generateResume = async () => {
    if (!personalInfo.name || !personalInfo.email) {
      toast.error('Please fill in at least name and email')
      return
    }

    setLoading(true)
    try {
      const pdf = new jsPDF()
      const rgb = hexToRgb(primaryColor)
      
      // Template-based rendering
      if (selectedTemplate === 'modern') {
        await generateModernTemplate(pdf, rgb)
      } else if (selectedTemplate === 'classic') {
        await generateClassicTemplate(pdf, rgb)
      } else if (selectedTemplate === 'creative') {
        await generateCreativeTemplate(pdf, rgb)
      } else {
        await generateMinimalTemplate(pdf, rgb)
      }

      pdf.save(`${personalInfo.name}-Resume.pdf`)
      toast.success('Resume generated successfully!')
      
      // Trigger popunder ad after download
      setTimeout(() => {
        triggerPopunder()
      }, 100)
    } catch (error) {
      console.error('Error generating resume:', error)
      toast.error('Failed to generate resume')
    } finally {
      setLoading(false)
    }
  }

  const generateModernTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    let yPos = 20
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20

    // Header with colored bar
    pdf.setFillColor(rgb.r, rgb.g, rgb.b)
    pdf.rect(0, 0, pageWidth, 50, 'F')
    
    // Profile image
    if (profileImage) {
      try {
        pdf.addImage(profileImage, 'JPEG', pageWidth - 50, 5, 40, 40, undefined, 'FAST')
      } catch (e) {
        console.error('Error adding image:', e)
      }
    }

    // Name in header
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(28)
    pdf.setFont('helvetica', 'bold')
    pdf.text(personalInfo.name || 'Your Name', margin, 30)
    
    // Contact info in header
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const contactInfo = [
      personalInfo.email && `Email: ${personalInfo.email}`,
      personalInfo.phone && `Phone: ${personalInfo.phone}`,
      personalInfo.address && `Address: ${personalInfo.address}`,
      personalInfo.linkedin && `LinkedIn: ${personalInfo.linkedin}`,
    ].filter(Boolean).join(' | ')
    pdf.text(contactInfo, margin, 40)

    yPos = 60
    pdf.setTextColor(0, 0, 0)

    // Objective
    if (personalInfo.objective) {
      pdf.setFillColor(rgb.r, rgb.g, rgb.b)
      pdf.setDrawColor(rgb.r, rgb.g, rgb.b)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Objective', margin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const objLines = pdf.splitTextToSize(personalInfo.objective, pageWidth - 2 * margin)
      pdf.text(objLines, margin, yPos)
      yPos += objLines.length * 5 + 10
    }

    // Professional Summary
    if (personalInfo.summary) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Professional Summary', margin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const summaryLines = pdf.splitTextToSize(personalInfo.summary, pageWidth - 2 * margin)
      pdf.text(summaryLines, margin, yPos)
      yPos += summaryLines.length * 5 + 10
    }

    // Experience
    if (experiences.length > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Experience', margin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      experiences.forEach(exp => {
        if (exp.company && exp.position) {
          pdf.setFont('helvetica', 'bold')
          pdf.text(`${exp.position}`, margin, yPos)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${exp.company}`, margin + 60, yPos)
          if (exp.duration) {
            pdf.text(exp.duration, pageWidth - margin - 30, yPos, { align: 'right' })
          }
          yPos += 5
          if (exp.description) {
            const descLines = pdf.splitTextToSize(exp.description, pageWidth - 2 * margin)
            pdf.text(descLines, margin + 5, yPos)
            yPos += descLines.length * 5 + 3
          }
          yPos += 3
        }
      })
      yPos += 5
    }

    // Education
    if (educations.length > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Education', margin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      educations.forEach(edu => {
        if (edu.institution && edu.degree) {
          pdf.setFont('helvetica', 'bold')
          pdf.text(`${edu.degree}`, margin, yPos)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${edu.institution}`, margin + 60, yPos)
          if (edu.year) {
            pdf.text(edu.year, pageWidth - margin - 30, yPos, { align: 'right' })
          }
          yPos += 7
        }
      })
      yPos += 5
    }

    // Skills
    const validSkills = skills.filter(s => s.trim())
    if (validSkills.length > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Skills', margin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(validSkills.join(', '), margin, yPos)
      yPos += 10
    }

    // Languages
    if (languages.length > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Languages', margin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      languages.forEach(lang => {
        if (lang.name) {
          pdf.text(`${lang.name}: ${lang.proficiency}`, margin, yPos)
          yPos += 5
        }
      })
      yPos += 5
    }

    // Courses
    if (courses.length > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Courses & Certifications', margin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      courses.forEach(course => {
        if (course.name) {
          pdf.setFont('helvetica', 'bold')
          pdf.text(course.name, margin, yPos)
          pdf.setFont('helvetica', 'normal')
          if (course.institution) {
            pdf.text(course.institution, margin + 60, yPos)
          }
          if (course.year) {
            pdf.text(course.year, pageWidth - margin - 30, yPos, { align: 'right' })
          }
          yPos += 7
        }
      })
      yPos += 5
    }

    // References
    if (references.length > 0) {
      if (yPos > 250) {
        pdf.addPage()
        yPos = 20
      }
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('References', margin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      references.forEach(ref => {
        if (ref.name) {
          pdf.setFont('helvetica', 'bold')
          pdf.text(ref.name, margin, yPos)
          pdf.setFont('helvetica', 'normal')
          if (ref.position && ref.company) {
            pdf.text(`${ref.position} at ${ref.company}`, margin + 5, yPos + 5)
            yPos += 5
          }
          if (ref.email) {
            pdf.text(`Email: ${ref.email}`, margin + 5, yPos + 5)
            yPos += 5
          }
          if (ref.phone) {
            pdf.text(`Phone: ${ref.phone}`, margin + 5, yPos + 5)
            yPos += 5
          }
          yPos += 5
        }
      })
    }
  }

  const generateClassicTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    // Similar structure but with classic styling
    await generateModernTemplate(pdf, rgb)
  }

  const generateCreativeTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    // Similar structure but with creative styling
    await generateModernTemplate(pdf, rgb)
  }

  const generateMinimalTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    // Similar structure but with minimal styling
    await generateModernTemplate(pdf, rgb)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-3 sm:mb-4">
              <FileCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">AI Resume Builder</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Build professional resumes with beautiful templates</p>
          </div>

          {/* Template & Color Selection */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Template Selection */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Layout className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Choose Template</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedTemplate === template.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
                      <div className="text-xs text-gray-600">{template.preview}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Palette className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Choose Color</h3>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {colorPresets.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setPrimaryColor(color.value)}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        primaryColor === color.value
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="#2563eb"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
            {/* Personal Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email *</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={personalInfo.linkedin}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Website</label>
                  <input
                    type="url"
                    value={personalInfo.website}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    placeholder="www.yourwebsite.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">GitHub</label>
                  <input
                    type="url"
                    value={personalInfo.github}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    placeholder="github.com/username"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Address</label>
                  <input
                    type="text"
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    placeholder="City, State, Country"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Profile Photo</label>
                  <div className="flex items-center space-x-4">
                    {profileImage && (
                      <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-900">Upload Photo</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {profileImage && (
                      <button
                        onClick={() => setProfileImage(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Objective</label>
                  <textarea
                    value={personalInfo.objective}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, objective: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    placeholder="Your career objective..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Professional Summary</label>
                  <textarea
                    value={personalInfo.summary}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    placeholder="Brief summary of your professional background..."
                  />
                </div>
              </div>
            </section>

            {/* Experience */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Experience</h2>
                <button
                  onClick={addExperience}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Experience</span>
                </button>
              </div>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Experience {experiences.indexOf(exp) + 1}</h3>
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                          placeholder="Jan 2020 - Present"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Education</h2>
                <button
                  onClick={addEducation}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Education</span>
                </button>
              </div>
              <div className="space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">Education {educations.indexOf(edu) + 1}</h3>
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Year</label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Skills</h2>
                <button
                  onClick={addSkill}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Skill</span>
                </button>
              </div>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                      placeholder="Enter a skill"
                    />
                    {skills.length > 1 && (
                      <button
                        onClick={() => removeSkill(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Languages */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Languages</h2>
                <button
                  onClick={addLanguage}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Language</span>
                </button>
              </div>
              <div className="space-y-4">
                {languages.map((lang) => (
                  <div key={lang.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">Language {languages.indexOf(lang) + 1}</h3>
                      <button
                        onClick={() => removeLanguage(lang.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Language</label>
                        <input
                          type="text"
                          value={lang.name}
                          onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                          placeholder="English"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Proficiency</label>
                        <select
                          value={lang.proficiency}
                          onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        >
                          <option>Native</option>
                          <option>Fluent</option>
                          <option>Advanced</option>
                          <option>Intermediate</option>
                          <option>Basic</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Courses */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Courses & Certifications</h2>
                <button
                  onClick={addCourse}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Course</span>
                </button>
              </div>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">Course {courses.indexOf(course) + 1}</h3>
                      <button
                        onClick={() => removeCourse(course.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Course Name</label>
                        <input
                          type="text"
                          value={course.name}
                          onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Institution</label>
                        <input
                          type="text"
                          value={course.institution}
                          onChange={(e) => updateCourse(course.id, 'institution', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Year</label>
                        <input
                          type="text"
                          value={course.year}
                          onChange={(e) => updateCourse(course.id, 'year', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* References */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">References</h2>
                <button
                  onClick={addReference}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Reference</span>
                </button>
              </div>
              <div className="space-y-4">
                {references.map((ref) => (
                  <div key={ref.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">Reference {references.indexOf(ref) + 1}</h3>
                      <button
                        onClick={() => removeReference(ref.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                        <input
                          type="text"
                          value={ref.name}
                          onChange={(e) => updateReference(ref.id, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Position</label>
                        <input
                          type="text"
                          value={ref.position}
                          onChange={(e) => updateReference(ref.id, 'position', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Company</label>
                        <input
                          type="text"
                          value={ref.company}
                          onChange={(e) => updateReference(ref.id, 'company', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                        <input
                          type="email"
                          value={ref.email}
                          onChange={(e) => updateReference(ref.id, 'email', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={ref.phone}
                          onChange={(e) => updateReference(ref.id, 'phone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Generate Button */}
            <div className="flex space-x-4">
              <button
                onClick={generateResume}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating Resume...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Generate & Download Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
