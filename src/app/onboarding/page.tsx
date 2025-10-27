'use client'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart3, Shield, BookOpen, Users, CheckCircle, Zap, FileText, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const features = [
    {
      icon: Shield,
      title: "Admin Dashboard",
      description:
        "A centralized control system that allows administrators to assign departmental access, set deadlines, and monitor task compliance. Ensures smooth coordination and visibility across departments.",
    },
    {
      icon: BarChart3,
      title: "Progress Tracker",
      description:
        "Real-time progress monitoring that displays project milestones, completion percentages, and upcoming deadlines—helping teams stay aligned and accountable.",
    },
    {
      icon: BookOpen,
      title: "Knowledge Hub",
      description:
        "A secure, centralized repository for all official documents and project reports. Files are stored at the admin level, ensuring data is not lost even if an employee leaves.",
    },
    {
      icon: Users,
      title: "Cross-Department Transparency",
      description:
        "A unified view of activities and updates across all departments, promoting openness, collaboration, and informed decision-making.",
    },
    {
      icon: CheckCircle,
      title: "Compliance Control",
      description:
        "Track adherence to regulatory requirements, internal protocols, and project guidelines to maintain accountability and governance.",
    },
    {
      icon: Zap,
      title: "Summarization & Smart Routing",
      description:
        "AI-powered module that automatically summarizes lengthy reports, identifies key points, and routes them to the right departments or individuals.",
    },
    {
      icon: FileText,
      title: "Automatic Action Point Extraction",
      description:
        "Extracts actionable tasks from documents, meeting notes, or reports so teams can act immediately without reading through lengthy content.",
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-cyan-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600">
                <span className="text-lg font-bold text-white">K</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Automated Document Handling</h1>
            </div>
            <nav className="hidden gap-8 md:flex">
           
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-cyan-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Turning Document Chaos into Instant Clarity
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            Streamline operations across your organization with intelligent document management, real-time
            collaboration, and automated compliance tracking.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="bg-cyan-600 text-white hover:bg-cyan-700" id="cta">
              Let's Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-cyan-200 text-cyan-600 hover:bg-cyan-50 bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900">Powerful Features</h3>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to manage documents, track progress, and ensure compliance
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="border border-cyan-100 bg-white p-8 transition-all hover:border-cyan-300 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100">
                    <Icon className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h4 className="mb-3 text-xl font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-cyan-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h3 className="text-center text-3xl font-bold text-gray-900">How It Works</h3>
          <div className="mt-16 space-y-8">
            {[
              {
                step: 1,
                title: "Sign Up & Onboarding",
                description:
                  "Start by signing up to the platform—seamless, secure, and role-based. Each user gets access to tools tailored to their responsibilities.",
              },
              {
                step: 2,
                title: "Admin Control Center",
                description:
                  "Admins get a powerful overview and control of the entire document ecosystem with category management, compliance tracking, and progress monitoring.",
              },
              {
                step: 3,
                title: "Document Upload & Action Extraction",
                description:
                  "Upload documents in any format with automated action point extraction. Documents are automatically routed to relevant departments with multilingual support.",
              },
              {
                step: 4,
                title: "Shared Awareness & Knowledge Hub",
                description:
                  "Get notified when documents affect multiple departments. All documents are centrally stored to prevent knowledge loss and maintain transparency.",
              },
              {
                step: 5,
                title: "Summarization & Preview",
                description:
                  "Instant document summaries give users a quick snapshot of content, while the original file remains accessible for deep dives.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 text-white font-bold">
                    {item.step}
                  </div>
                  {item.step < 5 && <div className="mt-2 h-12 w-1 bg-cyan-200" />}
                </div>
                <div className="pb-8">
                  <h4 className="text-xl font-semibold text-gray-900">{item.title}</h4>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h3 className="text-center text-3xl font-bold text-gray-900">Why This Solution Matters</h3>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              "Cut down decision-making delays",
              "Eliminate silos and duplicated efforts",
              "Strengthen compliance and audit readiness",
              "Preserve institutional knowledge",
              "Enhance transparency across departments",
              "Empower teams to focus on core operations",
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <CheckCircle className="h-6 w-6 flex-shrink-0 text-cyan-600" />
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold text-white">
            Streamline Operations. Strengthen Transparency. Simplify Decisions.
          </h3>
          <p className="mt-6 text-lg text-cyan-100">
            Transform how your organization manages documents and collaborates across departments.
          </p>
          <Button size="lg" className="mt-8 bg-white text-cyan-600 hover:bg-cyan-50">
            Let's Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-100 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
        
        </div>
      </footer>
    </main>
  )
}
