'use client'

import { useState, useRef } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { FileCheck, Download, Plus, X, Loader2, Upload, Palette, Layout, Eye, User, Briefcase, GraduationCap, Code, Globe, Award, Users, BookOpen } from 'lucide-react'
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

type Template = 'modern' | 'classic' | 'creative' | 'minimal' | 'executive' | 'academic' | 'tech' | 'designer'

const templates: { id: Template; name: string; preview: string; color: string }[] = [
  { id: 'modern', name: 'Modern', preview: 'Clean lines with colored accents', color: '#2563eb' },
  { id: 'classic', name: 'Classic', preview: 'Traditional professional layout', color: '#1f2937' },
  { id: 'creative', name: 'Creative', preview: 'Bold design for creative fields', color: '#ec4899' },
  { id: 'minimal', name: 'Minimal', preview: 'Simple and elegant', color: '#6b7280' },
  { id: 'executive', name: 'Executive', preview: 'Professional corporate style', color: '#1e40af' },
  { id: 'academic', name: 'Academic', preview: 'Scholarly and formal layout', color: '#7c3aed' },
  { id: 'tech', name: 'Tech', preview: 'Modern tech industry focused', color: '#059669' },
  { id: 'designer', name: 'Designer', preview: 'Creative portfolio style', color: '#f59e0b' },
]

// Template Preview Components - Enhanced with realistic resume layouts
const TemplatePreview = ({ templateId, color }: { templateId: Template; color: string }) => {
  const rgb = color.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [37, 99, 235]
  
  if (templateId === 'modern') {
    return (
      <div className="w-full h-32 sm:h-40 md:h-48 bg-white border-2 border-gray-200 rounded-lg overflow-hidden relative shadow-sm">
        {/* Header */}
        <div className="h-10" style={{ backgroundColor: color }}></div>
        {/* Two Column Layout */}
        <div className="flex h-38">
          {/* Left Sidebar */}
          <div className="w-1/3 p-2" style={{ backgroundColor: `${color}15` }}>
            <div className="w-12 h-12 rounded-full bg-gray-300 mx-auto mb-2"></div>
            <div className="h-1.5 bg-gray-400 rounded w-full mb-1"></div>
            <div className="h-1 bg-gray-300 rounded w-4/5 mx-auto mb-2"></div>
            <div className="h-1 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
          {/* Main Content */}
          <div className="flex-1 p-2 space-y-1.5">
            <div className="h-2 bg-gray-400 rounded w-2/3"></div>
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1.5 bg-gray-300 rounded w-5/6"></div>
            <div className="h-1 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'classic') {
    return (
      <div className="w-full h-48 bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-2 border-b-2 border-gray-300">
          <div className="h-2.5 bg-gray-800 rounded w-1/2"></div>
          <div className="h-1 bg-gray-400 rounded w-3/4 mt-1"></div>
        </div>
        {/* Content */}
        <div className="p-2 space-y-2">
          <div className="h-2 bg-gray-600 rounded w-1/3"></div>
          <div className="h-1 bg-gray-300 rounded w-full"></div>
          <div className="h-1.5 bg-gray-300 rounded w-5/6"></div>
          <div className="h-2 bg-gray-600 rounded w-1/4"></div>
          <div className="h-1 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'creative') {
    return (
      <div className="w-full h-32 sm:h-40 md:h-48 bg-white border-2 border-gray-200 rounded-lg overflow-hidden relative shadow-sm">
        {/* Colored Sidebar */}
        <div className="absolute left-0 top-0 bottom-0 w-3" style={{ backgroundColor: color }}></div>
        {/* Header with accent */}
        <div className="h-8 pl-5 flex items-center">
          <div className="h-3 rounded" style={{ backgroundColor: color, width: '45%' }}></div>
        </div>
        {/* Two Column Layout */}
        <div className="flex h-40 pl-5">
          <div className="w-1/3 p-2 space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1 bg-gray-200 rounded w-4/5"></div>
          </div>
          <div className="flex-1 p-2 space-y-1.5">
            <div className="h-2 bg-gray-400 rounded w-2/3"></div>
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1.5 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'minimal') {
    return (
      <div className="w-full h-48 bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="p-3 space-y-3">
          <div className="h-2.5 bg-gray-500 rounded w-1/2"></div>
          <div className="h-0.5 bg-gray-200 rounded w-full"></div>
          <div className="h-1.5 bg-gray-300 rounded w-full"></div>
          <div className="h-1 bg-gray-200 rounded w-4/5"></div>
          <div className="h-0.5 bg-gray-200 rounded w-full"></div>
          <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'executive') {
    return (
      <div className="w-full h-48 bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
        {/* Dark Header */}
        <div className="h-10 bg-gray-900 flex items-center px-3">
          <div className="h-2.5 bg-white rounded w-1/3"></div>
        </div>
        {/* Two Column Layout */}
        <div className="flex h-38">
          <div className="w-1/3 p-2 bg-gray-100 space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-gray-400"></div>
            <div className="h-1 bg-gray-400 rounded w-full"></div>
            <div className="h-1 bg-gray-300 rounded w-4/5"></div>
          </div>
          <div className="flex-1 p-2 space-y-1.5">
            <div className="h-2 bg-gray-700 rounded w-1/2"></div>
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1.5 bg-gray-300 rounded w-5/6"></div>
            <div className="h-1 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'academic') {
    return (
      <div className="w-full h-48 bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-2 border-b border-gray-300">
          <div className="h-2 bg-gray-700 rounded w-1/3"></div>
          <div className="h-1 bg-gray-400 rounded w-1/2 mt-1"></div>
        </div>
        {/* Structured Content */}
        <div className="p-2 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500"></div>
            <div className="h-1.5 bg-gray-400 rounded flex-1"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500"></div>
            <div className="h-1.5 bg-gray-400 rounded flex-1"></div>
          </div>
          <div className="h-1.5 bg-gray-600 rounded w-1/4"></div>
          <div className="h-1 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'tech') {
    return (
      <div className="w-full h-32 sm:h-40 md:h-48 bg-white border-2 border-gray-200 rounded-lg overflow-hidden relative shadow-sm">
        {/* Gradient Header */}
        <div className="h-8" style={{ background: `linear-gradient(90deg, ${color}, ${color}dd)` }}>
          <div className="h-full flex items-center px-3">
            <div className="h-2 bg-white rounded w-1/3 opacity-90"></div>
          </div>
        </div>
        {/* Modern Layout */}
        <div className="flex h-40">
          <div className="w-1/3 p-2 space-y-1.5" style={{ backgroundColor: `${color}08` }}>
            <div className="w-10 h-10 rounded-lg bg-gray-300"></div>
            <div className="h-1 bg-gray-400 rounded w-full"></div>
            <div className="h-1 bg-gray-300 rounded w-4/5"></div>
          </div>
          <div className="flex-1 p-2 space-y-1.5">
            <div className="h-2 rounded" style={{ backgroundColor: color, width: '40%', opacity: 0.7 }}></div>
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1.5 bg-gray-300 rounded w-5/6"></div>
            <div className="h-1 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'designer') {
    return (
      <div className="w-full h-32 sm:h-40 md:h-48 bg-white border-2 border-gray-200 rounded-lg overflow-hidden relative shadow-sm">
        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={{ backgroundColor: color, opacity: 0.15 }}></div>
        {/* Header */}
        <div className="h-10 pl-3 flex items-center">
          <div className="h-3 rounded" style={{ backgroundColor: color, width: '50%' }}></div>
        </div>
        {/* Asymmetric Layout */}
        <div className="flex h-38 pl-3">
          <div className="w-2/5 p-2 space-y-1.5">
            <div className="w-12 h-12 rounded-full bg-gray-300"></div>
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1 bg-gray-200 rounded w-4/5"></div>
          </div>
          <div className="flex-1 p-2 space-y-1.5">
            <div className="h-2.5 rounded" style={{ backgroundColor: color, width: '45%', opacity: 0.8 }}></div>
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1.5 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}

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
      switch (selectedTemplate) {
        case 'modern':
          await generateModernTemplate(pdf, rgb)
          break
        case 'classic':
          await generateClassicTemplate(pdf, rgb)
          break
        case 'creative':
          await generateCreativeTemplate(pdf, rgb)
          break
        case 'minimal':
          await generateMinimalTemplate(pdf, rgb)
          break
        case 'executive':
          await generateExecutiveTemplate(pdf, rgb)
          break
        case 'academic':
          await generateAcademicTemplate(pdf, rgb)
          break
        case 'tech':
          await generateTechTemplate(pdf, rgb)
          break
        case 'designer':
          await generateDesignerTemplate(pdf, rgb)
          break
        default:
          await generateModernTemplate(pdf, rgb)
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

  // Helper function to add profile image with shape
  const addProfileImage = (pdf: jsPDF, x: number, y: number, size: number, shape: 'circle' | 'square' | 'rounded') => {
    if (!profileImage) return
    
    try {
      // Add image first
      pdf.addImage(profileImage, 'JPEG', x, y, size, size, undefined, 'FAST')
      
      // Draw border based on shape
      if (shape === 'circle') {
        // Draw circular border
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(1)
        pdf.circle(x + size/2, y + size/2, size/2, 'D')
      } else if (shape === 'rounded') {
        // Draw rounded square border
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(1)
        // jsPDF doesn't have roundedRect, so we'll use regular rect with rounded corners approximation
        pdf.rect(x, y, size, size, 'D')
      } else {
        // Square border
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(1)
        pdf.rect(x, y, size, size, 'D')
      }
    } catch (e) {
      console.error('Error adding image:', e)
      // Try with PNG if JPEG fails
      try {
        pdf.addImage(profileImage, 'PNG', x, y, size, size, undefined, 'FAST')
        if (shape === 'circle') {
          pdf.setDrawColor(200, 200, 200)
          pdf.setLineWidth(1)
          pdf.circle(x + size/2, y + size/2, size/2, 'D')
        } else {
          pdf.setDrawColor(200, 200, 200)
          pdf.setLineWidth(1)
          pdf.rect(x, y, size, size, 'D')
        }
      } catch (e2) {
        console.error('Error adding image as PNG:', e2)
      }
    }
  }

  // Helper function to render common sections
  const renderCommonSections = (pdf: jsPDF, startY: number, leftMargin: number, rightMargin: number, pageWidth: number, rgb: { r: number; g: number; b: number }) => {
    let yPos = startY
    pdf.setTextColor(0, 0, 0)

    // Objective
    if (personalInfo.objective) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Objective', leftMargin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const objLines = pdf.splitTextToSize(personalInfo.objective, pageWidth - leftMargin - rightMargin)
      pdf.text(objLines, leftMargin, yPos)
      yPos += objLines.length * 5 + 10
    }

    // Professional Summary
    if (personalInfo.summary) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Professional Summary', leftMargin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const summaryLines = pdf.splitTextToSize(personalInfo.summary, pageWidth - leftMargin - rightMargin)
      pdf.text(summaryLines, leftMargin, yPos)
      yPos += summaryLines.length * 5 + 10
    }

    // Experience
    if (experiences.length > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Experience', leftMargin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      experiences.forEach(exp => {
        if (exp.company && exp.position) {
          if (yPos > 270) {
            pdf.addPage()
            yPos = 20
          }
          pdf.setFont('helvetica', 'bold')
          pdf.text(`${exp.position}`, leftMargin, yPos)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${exp.company}`, leftMargin + 60, yPos)
          if (exp.duration) {
            pdf.text(exp.duration, pageWidth - rightMargin - 30, yPos, { align: 'right' })
          }
          yPos += 5
          if (exp.description) {
            const descLines = pdf.splitTextToSize(exp.description, pageWidth - leftMargin - rightMargin)
            pdf.text(descLines, leftMargin + 5, yPos)
            yPos += descLines.length * 5 + 3
          }
          yPos += 3
        }
      })
      yPos += 5
    }

    // Education
    if (educations.length > 0) {
      if (yPos > 270) {
        pdf.addPage()
        yPos = 20
      }
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Education', leftMargin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      educations.forEach(edu => {
        if (edu.institution && edu.degree) {
          pdf.setFont('helvetica', 'bold')
          pdf.text(`${edu.degree}`, leftMargin, yPos)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${edu.institution}`, leftMargin + 60, yPos)
          if (edu.year) {
            pdf.text(edu.year, pageWidth - rightMargin - 30, yPos, { align: 'right' })
          }
          yPos += 7
        }
      })
      yPos += 5
    }

    // Skills
    const validSkills = skills.filter(s => s.trim())
    if (validSkills.length > 0) {
      if (yPos > 270) {
        pdf.addPage()
        yPos = 20
      }
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Skills', leftMargin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(validSkills.join(', '), leftMargin, yPos)
      yPos += 10
    }

    // Languages
    if (languages.length > 0) {
      if (yPos > 270) {
        pdf.addPage()
        yPos = 20
      }
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Languages', leftMargin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      languages.forEach(lang => {
        if (lang.name) {
          pdf.text(`${lang.name}: ${lang.proficiency}`, leftMargin, yPos)
          yPos += 5
        }
      })
      yPos += 5
    }

    // Courses
    if (courses.length > 0) {
      if (yPos > 270) {
        pdf.addPage()
        yPos = 20
      }
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Courses & Certifications', leftMargin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      courses.forEach(course => {
        if (course.name) {
          pdf.setFont('helvetica', 'bold')
          pdf.text(course.name, leftMargin, yPos)
          pdf.setFont('helvetica', 'normal')
          if (course.institution) {
            pdf.text(course.institution, leftMargin + 60, yPos)
          }
          if (course.year) {
            pdf.text(course.year, pageWidth - rightMargin - 30, yPos, { align: 'right' })
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
      pdf.text('References', leftMargin, yPos)
      yPos += 7
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      references.forEach(ref => {
        if (ref.name) {
          pdf.setFont('helvetica', 'bold')
          pdf.text(ref.name, leftMargin, yPos)
          pdf.setFont('helvetica', 'normal')
          if (ref.position && ref.company) {
            pdf.text(`${ref.position} at ${ref.company}`, leftMargin + 5, yPos + 5)
            yPos += 5
          }
          if (ref.email) {
            pdf.text(`Email: ${ref.email}`, leftMargin + 5, yPos + 5)
            yPos += 5
          }
          if (ref.phone) {
            pdf.text(`Phone: ${ref.phone}`, leftMargin + 5, yPos + 5)
            yPos += 5
          }
          yPos += 5
        }
      })
    }
  }

  const generateModernTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const sidebarWidth = 60

    // Header with colored bar
    pdf.setFillColor(rgb.r, rgb.g, rgb.b)
    pdf.rect(0, 0, pageWidth, 50, 'F')
    
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

    // Left sidebar with colored background
    pdf.setFillColor(rgb.r, rgb.g, rgb.b)
    pdf.setGState(pdf.GState({opacity: 0.1}))
    pdf.rect(0, 50, sidebarWidth, pageHeight - 50, 'F')
    pdf.setGState(pdf.GState({opacity: 1}))
    
    // Profile image in left sidebar (circular)
    if (profileImage) {
      addProfileImage(pdf, margin, 60, 40, 'circle')
    }

    // Render content sections in main area
    renderCommonSections(pdf, 60, margin + sidebarWidth + 10, margin, pageWidth, rgb)

  }

  const generateClassicTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    let yPos = 20

    // Header border
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b)
    pdf.setLineWidth(2)
    pdf.line(0, yPos, pageWidth, yPos)
    yPos += 10

    // Name
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text(personalInfo.name || 'Your Name', margin, yPos)
    yPos += 8

    // Profile image at top center (circular)
    if (profileImage) {
      const imgSize = 35
      const imgX = (pageWidth - imgSize) / 2
      addProfileImage(pdf, imgX, yPos, imgSize, 'circle')
      yPos += imgSize + 10
    }

    // Contact info
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const contactInfo = [
      personalInfo.email && `Email: ${personalInfo.email}`,
      personalInfo.phone && `Phone: ${personalInfo.phone}`,
      personalInfo.address && `Address: ${personalInfo.address}`,
      personalInfo.linkedin && `LinkedIn: ${personalInfo.linkedin}`,
    ].filter(Boolean).join(' | ')
    pdf.text(contactInfo, margin, yPos)
    yPos += 10

    // Bottom border
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b)
    pdf.setLineWidth(1)
    pdf.line(0, yPos, pageWidth, yPos)
    yPos += 10

    renderCommonSections(pdf, yPos, margin, margin, pageWidth, rgb)
  }

  const generateCreativeTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const sidebarWidth = 15

    // Colored sidebar
    pdf.setFillColor(rgb.r, rgb.g, rgb.b)
    pdf.rect(0, 0, sidebarWidth, pageHeight, 'F')

    // Header with accent
    pdf.setFillColor(rgb.r, rgb.g, rgb.b)
    pdf.setGState(pdf.GState({opacity: 0.3}))
    pdf.rect(sidebarWidth, 0, pageWidth * 0.45, 30, 'F')
    pdf.setGState(pdf.GState({opacity: 1}))

    // Name
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(26)
    pdf.setFont('helvetica', 'bold')
    pdf.text(personalInfo.name || 'Your Name', sidebarWidth + margin, 20)

    // Contact info
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    const contactInfo = [
      personalInfo.email && personalInfo.email,
      personalInfo.phone && personalInfo.phone,
      personalInfo.linkedin && personalInfo.linkedin,
    ].filter(Boolean).join(' | ')
    pdf.text(contactInfo, sidebarWidth + margin, 30)

    // Profile image in left sidebar area (circular)
    if (profileImage) {
      addProfileImage(pdf, sidebarWidth + margin, 40, 35, 'circle')
    }

    renderCommonSections(pdf, 40, sidebarWidth + margin + 10, margin, pageWidth, rgb)
  }

  const generateMinimalTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    let yPos = 20

    // Minimal header - just name
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    pdf.text(personalInfo.name || 'Your Name', margin, yPos)
    yPos += 8

    // Thin divider
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 8

    // Profile image at top (circular)
    if (profileImage) {
      addProfileImage(pdf, margin, yPos, 30, 'circle')
      yPos += 35
    }

    // Contact info - minimal
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    const contactInfo = [
      personalInfo.email && personalInfo.email,
      personalInfo.phone && personalInfo.phone,
    ].filter(Boolean).join(' • ')
    pdf.text(contactInfo, margin, yPos)
    yPos += 10

    // Thin divider
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 10

    renderCommonSections(pdf, yPos, margin, margin, pageWidth, rgb)
  }

  const generateExecutiveTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const sidebarWidth = 55

    // Dark header
    pdf.setFillColor(30, 30, 30)
    pdf.rect(0, 0, pageWidth, 45, 'F')

    // Name in header
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(26)
    pdf.setFont('helvetica', 'bold')
    pdf.text(personalInfo.name || 'Your Name', margin, 30)

    // Contact info in header
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    const contactInfo = [
      personalInfo.email && personalInfo.email,
      personalInfo.phone && personalInfo.phone,
      personalInfo.linkedin && personalInfo.linkedin,
    ].filter(Boolean).join(' | ')
    pdf.text(contactInfo, margin, 40)

    // Left sidebar with light background
    pdf.setFillColor(240, 240, 240)
    pdf.rect(0, 45, sidebarWidth, pageHeight - 45, 'F')

    // Profile image in sidebar (circular)
    if (profileImage) {
      addProfileImage(pdf, margin, 55, 35, 'circle')
    }

    renderCommonSections(pdf, 55, sidebarWidth + margin + 10, margin, pageWidth, rgb)
  }

  const generateAcademicTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    let yPos = 20

    // Header with border
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b)
    pdf.setLineWidth(1.5)
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 60, 'D')
    yPos += 10

    // Name
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text(personalInfo.name || 'Your Name', margin + 5, yPos)
    yPos += 8

    // Profile image at top center (circular)
    if (profileImage) {
      const imgSize = 32
      const imgX = (pageWidth - imgSize) / 2
      addProfileImage(pdf, imgX, yPos, imgSize, 'circle')
      yPos += imgSize + 8
    }

    // Contact info
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    const contactInfo = [
      personalInfo.email && `Email: ${personalInfo.email}`,
      personalInfo.phone && `Phone: ${personalInfo.phone}`,
      personalInfo.address && `Address: ${personalInfo.address}`,
    ].filter(Boolean).join(' | ')
    pdf.text(contactInfo, margin + 5, yPos)
    yPos += 15

    renderCommonSections(pdf, yPos, margin, margin, pageWidth, rgb)
  }

  const generateTechTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const sidebarWidth = 60

    // Gradient header effect
    pdf.setFillColor(rgb.r, rgb.g, rgb.b)
    pdf.rect(0, 0, pageWidth, 40, 'F')
    pdf.setFillColor(rgb.r * 0.85, rgb.g * 0.85, rgb.b * 0.85)
    pdf.rect(0, 0, pageWidth, 35, 'F')

    // Name in header
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(26)
    pdf.setFont('helvetica', 'bold')
    pdf.text(personalInfo.name || 'Your Name', margin, 28)

    // Contact info
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    const contactInfo = [
      personalInfo.email && personalInfo.email,
      personalInfo.phone && personalInfo.phone,
      personalInfo.linkedin && personalInfo.linkedin,
    ].filter(Boolean).join(' | ')
    pdf.text(contactInfo, margin, 38)

    // Left sidebar with subtle color
    pdf.setFillColor(rgb.r, rgb.g, rgb.b)
    pdf.setGState(pdf.GState({opacity: 0.08}))
    pdf.rect(0, 40, sidebarWidth, pageHeight - 40, 'F')
    pdf.setGState(pdf.GState({opacity: 1}))

    // Profile image in sidebar (rounded square)
    if (profileImage) {
      addProfileImage(pdf, margin, 50, 40, 'rounded')
    }

    renderCommonSections(pdf, 50, sidebarWidth + margin + 10, margin, pageWidth, rgb)
  }

  const generateDesignerTemplate = async (pdf: jsPDF, rgb: { r: number; g: number; b: number }) => {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const sidebarWidth = 70

    // Decorative corner
    pdf.setFillColor(rgb.r, rgb.g, rgb.b)
    pdf.setGState(pdf.GState({opacity: 0.15}))
    pdf.circle(pageWidth, 0, 80, 'F')
    pdf.setGState(pdf.GState({opacity: 1}))

    // Header with accent bar
    pdf.setFillColor(rgb.r, rgb.g, rgb.b)
    pdf.setGState(pdf.GState({opacity: 0.5}))
    pdf.rect(0, 0, pageWidth * 0.5, 35, 'F')
    pdf.setGState(pdf.GState({opacity: 1}))

    // Name
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(28)
    pdf.setFont('helvetica', 'bold')
    pdf.text(personalInfo.name || 'Your Name', margin, 25)

    // Contact info
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    const contactInfo = [
      personalInfo.email && personalInfo.email,
      personalInfo.phone && personalInfo.phone,
      personalInfo.linkedin && personalInfo.linkedin,
    ].filter(Boolean).join(' • ')
    pdf.text(contactInfo, margin, 35)

    // Left sidebar
    pdf.setFillColor(rgb.r, rgb.g, rgb.b)
    pdf.setGState(pdf.GState({opacity: 0.1}))
    pdf.rect(0, 40, sidebarWidth, pageHeight - 40, 'F')
    pdf.setGState(pdf.GState({opacity: 1}))

    // Profile image in sidebar (circular)
    if (profileImage) {
      addProfileImage(pdf, margin, 50, 45, 'circle')
    }

    renderCommonSections(pdf, 50, sidebarWidth + margin + 10, margin, pageWidth, rgb)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <FileCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">AI Resume Builder</h1>
            <p className="text-gray-900">Create stunning, professional resumes with customizable templates and beautiful designs</p>
          </div>

          {/* Template & Color Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Template Selection */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Layout className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Choose Template</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all transform hover:scale-[1.02] hover:shadow-lg ${
                        selectedTemplate === template.id
                          ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl shadow-blue-500/30 ring-1 sm:ring-2 ring-blue-500 ring-offset-1 sm:ring-offset-2'
                          : 'border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="mb-2 transform hover:scale-[1.02] transition-transform">
                        <TemplatePreview templateId={template.id} color={template.color} />
                      </div>
                      <div className="font-bold text-gray-900 mb-0.5 text-center text-xs sm:text-sm">{template.name}</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 text-center leading-tight px-0.5">{template.preview}</div>
                      {selectedTemplate === template.id && (
                        <div className="mt-1.5 h-0.5 sm:h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="lg:max-w-2xl">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-pink-500 to-pink-400 shadow-md">
                    <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Choose Color</h3>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-3">
                  {colorPresets.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setPrimaryColor(color.value)}
                      className={`h-10 sm:h-12 rounded-lg border-2 transition-all transform hover:scale-110 shadow-md ${
                        primaryColor === color.value
                          ? 'border-gray-900 scale-110 ring-2 sm:ring-4 ring-offset-1 sm:ring-offset-2 ring-gray-300'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-8 sm:h-10 w-12 sm:w-16 rounded-lg border-2 border-gray-300 cursor-pointer shadow-md"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">Custom Color</label>
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono text-xs sm:text-sm"
                      placeholder="#2563eb"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <section className="relative">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b-2 border-gray-100">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Email *</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Phone</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={personalInfo.linkedin}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Website</label>
                  <input
                    type="url"
                    value={personalInfo.website}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                    placeholder="www.yourwebsite.com"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">GitHub</label>
                  <input
                    type="url"
                    value={personalInfo.github}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                    placeholder="github.com/username"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Address</label>
                  <input
                    type="text"
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                    placeholder="City, State, Country"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Profile Photo</label>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {profileImage ? (
                        <div className="relative">
                          <img src={profileImage} alt="Profile" className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg ring-2 ring-gray-200" />
                          <button
                            onClick={() => setProfileImage(null)}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-dashed border-gray-300 flex items-center justify-center">
                          <User className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <Upload className="h-5 w-5" />
                      <span className="font-medium">Upload Photo</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Objective</label>
                  <textarea
                    value={personalInfo.objective}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, objective: e.target.value })}
                    rows={3}
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                    placeholder="Your career objective..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Professional Summary</label>
                  <textarea
                    value={personalInfo.summary}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                    rows={4}
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                    placeholder="Brief summary of your professional background..."
                  />
                </div>
              </div>
            </section>

            {/* Experience */}
            <section className="relative">
              <div className="flex justify-between items-center mb-3 sm:mb-4 pb-2 sm:pb-3 border-b-2 border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Experience</h2>
                </div>
                <button
                  onClick={addExperience}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium text-xs sm:text-sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Add Experience</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
              <div className="space-y-5">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-2 border-gray-200 rounded-xl p-6 space-y-4 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{experiences.indexOf(exp) + 1}</span>
                        </div>
                        <h3 className="font-bold text-gray-900">Experience {experiences.indexOf(exp) + 1}</h3>
                      </div>
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                          placeholder="Jan 2020 - Present"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="relative">
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Education</h2>
                </div>
                <button
                  onClick={addEducation}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-medium text-xs sm:text-sm"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Education</span>
                </button>
              </div>
              <div className="space-y-5">
                {educations.map((edu) => (
                  <div key={edu.id} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{educations.indexOf(edu) + 1}</span>
                        </div>
                        <h3 className="font-bold text-gray-900">Education {educations.indexOf(edu) + 1}</h3>
                      </div>
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Year</label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section className="relative">
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Skills</h2>
                </div>
                <button
                  onClick={addSkill}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium text-xs sm:text-sm"
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
            <section className="relative">
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Languages</h2>
                </div>
                <button
                  onClick={addLanguage}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium text-xs sm:text-sm"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Language</span>
                </button>
              </div>
              <div className="space-y-4">
                {languages.map((lang) => (
                  <div key={lang.id} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg transition-all">
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
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Language</label>
                        <input
                          type="text"
                          value={lang.name}
                          onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                          placeholder="English"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Proficiency</label>
                        <select
                          value={lang.proficiency}
                          onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
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
            <section className="relative">
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Courses & Certifications</h2>
                </div>
                <button
                  onClick={addCourse}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium text-xs sm:text-sm"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Course</span>
                </button>
              </div>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg transition-all">
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
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Course Name</label>
                        <input
                          type="text"
                          value={course.name}
                          onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Institution</label>
                        <input
                          type="text"
                          value={course.institution}
                          onChange={(e) => updateCourse(course.id, 'institution', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Year</label>
                        <input
                          type="text"
                          value={course.year}
                          onChange={(e) => updateCourse(course.id, 'year', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* References */}
            <section className="relative">
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">References</h2>
                </div>
                <button
                  onClick={addReference}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-medium text-xs sm:text-sm"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Reference</span>
                </button>
              </div>
              <div className="space-y-4">
                {references.map((ref) => (
                  <div key={ref.id} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg transition-all">
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
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Name</label>
                        <input
                          type="text"
                          value={ref.name}
                          onChange={(e) => updateReference(ref.id, 'name', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Position</label>
                        <input
                          type="text"
                          value={ref.position}
                          onChange={(e) => updateReference(ref.id, 'position', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Company</label>
                        <input
                          type="text"
                          value={ref.company}
                          onChange={(e) => updateReference(ref.id, 'company', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Email</label>
                        <input
                          type="email"
                          value={ref.email}
                          onChange={(e) => updateReference(ref.id, 'email', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Phone</label>
                        <input
                          type="tel"
                          value={ref.phone}
                          onChange={(e) => updateReference(ref.id, 'phone', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Generate Button */}
            <div className="pt-4 sm:pt-6 border-t-2 border-gray-100">
              <button
                onClick={generateResume}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span>Generating Resume...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm">Generate & Download Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}
