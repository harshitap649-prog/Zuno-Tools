'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FileCheck, Download, Plus, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'

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

export default function AIResumeBuilder() {
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    summary: '',
  })
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [skills, setSkills] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)

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

  const generateResume = async () => {
    if (!personalInfo.name || !personalInfo.email) {
      toast.error('Please fill in at least name and email')
      return
    }

    setLoading(true)
    try {
      const pdf = new jsPDF()
      let yPos = 20

      // Header
      pdf.setFontSize(24)
      pdf.text(personalInfo.name, 20, yPos)
      yPos += 10

      pdf.setFontSize(10)
      pdf.text(`Email: ${personalInfo.email}`, 20, yPos)
      yPos += 5
      if (personalInfo.phone) {
        pdf.text(`Phone: ${personalInfo.phone}`, 20, yPos)
        yPos += 5
      }
      if (personalInfo.address) {
        pdf.text(`Address: ${personalInfo.address}`, 20, yPos)
        yPos += 5
      }
      if (personalInfo.linkedin) {
        pdf.text(`LinkedIn: ${personalInfo.linkedin}`, 20, yPos)
        yPos += 5
      }
      yPos += 5

      // Summary
      if (personalInfo.summary) {
        pdf.setFontSize(14)
        pdf.text('Professional Summary', 20, yPos)
        yPos += 7
        pdf.setFontSize(10)
        const summaryLines = pdf.splitTextToSize(personalInfo.summary, 170)
        pdf.text(summaryLines, 20, yPos)
        yPos += summaryLines.length * 5 + 5
      }

      // Experience
      if (experiences.length > 0) {
        pdf.setFontSize(14)
        pdf.text('Experience', 20, yPos)
        yPos += 7
        pdf.setFontSize(10)
        experiences.forEach(exp => {
          if (exp.company && exp.position) {
            pdf.setFont('helvetica', 'bold')
            pdf.text(`${exp.position} - ${exp.company}`, 20, yPos)
            yPos += 5
            pdf.setFont('helvetica', 'normal')
            if (exp.duration) {
              pdf.text(exp.duration, 20, yPos)
              yPos += 5
            }
            if (exp.description) {
              const descLines = pdf.splitTextToSize(exp.description, 170)
              pdf.text(descLines, 20, yPos)
              yPos += descLines.length * 5 + 3
            }
          }
        })
        yPos += 5
      }

      // Education
      if (educations.length > 0) {
        pdf.setFontSize(14)
        pdf.text('Education', 20, yPos)
        yPos += 7
        pdf.setFontSize(10)
        educations.forEach(edu => {
          if (edu.institution && edu.degree) {
            pdf.setFont('helvetica', 'bold')
            pdf.text(`${edu.degree} - ${edu.institution}`, 20, yPos)
            yPos += 5
            pdf.setFont('helvetica', 'normal')
            if (edu.year) {
              pdf.text(edu.year, 20, yPos)
              yPos += 5
            }
          }
        })
        yPos += 5
      }

      // Skills
      const validSkills = skills.filter(s => s.trim())
      if (validSkills.length > 0) {
        pdf.setFontSize(14)
        pdf.text('Skills', 20, yPos)
        yPos += 7
        pdf.setFontSize(10)
        pdf.text(validSkills.join(', '), 20, yPos)
      }

      pdf.save(`${personalInfo.name}-Resume.pdf`)
      toast.success('Resume generated successfully!')
    } catch (error) {
      toast.error('Failed to generate resume')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-3 sm:mb-4">
              <FileCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">AI Resume Builder</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Build professional resumes with AI assistance</p>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email *</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={personalInfo.linkedin}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Address</label>
                  <input
                    type="text"
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="City, State, Country"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Professional Summary</label>
                  <textarea
                    value={personalInfo.summary}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Year</label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

            {/* Generate Button */}
            <button
              onClick={generateResume}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
      </main>

      <Footer />
    </div>
  )
}

