"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FaFileAlt,
  FaRobot,
  FaSearch,
  FaShieldAlt,
  FaArchive,
  FaClock,
  FaExclamationTriangle,
  FaCopy,
  FaUsers,
  FaChartLine,
  FaHandshake,
  FaCheckCircle,
  FaDollarSign,
  FaUpload,
  FaLanguage,
  FaRoute,
  FaTachometerAlt,
  FaFileArchive,
  FaBolt,
  FaGlobe,
  FaEye,
  FaLightbulb,
  FaRocket,
  FaAward,
  FaPlay,
} from "react-icons/fa"
import { MdDashboard, MdSecurity, MdNotifications, MdTrendingUp, MdSpeed } from "react-icons/md"
import { IoDocumentText, IoTrainSharp, IoStatsChart } from "react-icons/io5"
import { HiSparkles } from "react-icons/hi"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Restructured Modern Navbar */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Logo & Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden border border-cyan-200">
                    <img
                      src="/logo.jpg"
                      alt="Logo"
                      className="object-contain w-10 h-10"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-900 tracking-tight">DocuStream</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Document AI</span>
                 
                </div>
              </div>
            </div>

            {/* Center: Navigation Links */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center bg-gradient-to-r from-slate-100 to-slate-50 rounded-full p-2 space-x-2 shadow-md border border-slate-200">
                <a
                  href="#features"
                  className="px-8 py-3 text-sm font-semibold text-slate-800 hover:text-cyan-600 hover:bg-white rounded-full transition-all duration-200 shadow-sm hover:shadow-lg transform hover:scale-105"
                >
                  Features
                </a>
                <a
                  href="#workflow"
                  className="px-8 py-3 text-sm font-semibold text-slate-800 hover:text-cyan-600 hover:bg-white rounded-full transition-all duration-200 shadow-sm hover:shadow-lg transform hover:scale-105"
                >
                  Workflow
                </a>
                <a
                  href="#dashboard"
                  className="px-8 py-3 text-sm font-semibold text-slate-800 hover:text-cyan-600 hover:bg-white rounded-full transition-all duration-200 shadow-sm hover:shadow-lg transform hover:scale-105"
                >
                  Dashboard
                </a>
              </div>
            </div>

            {/* Right: Actions & Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Link href="/signin">
                  <Button
                    size="lg"
                    style={{ backgroundColor: "#0891b2", color: "#ffffff" }}
                    className="!bg-cyan-600 !text-white hover:!bg-cyan-700 hover:!text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-cyan-600 hover:border-cyan-700"
                  >
                    Sign In
                  </Button>
                </Link>
               
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden px-6 pb-4">
            <div className="flex items-center justify-center space-x-6">
              <a
                href="#features"
                className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#workflow"
                className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors duration-200"
              >
                Workflow
              </a>
              <a
                href="#dashboard"
                className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors duration-200"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Enhanced with Cyan-500 Background */}
      <section className="bg-cyan-500 text-white py-12 lg:py-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Enhanced background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-cyan-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-white/20"></div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center min-h-[70vh] lg:min-h-[80vh]">
            <div className="space-y-6 lg:space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 lg:mb-8">
                <div className="bg-white text-slate-900 border border-slate-200 rounded-lg px-3 sm:px-4 py-2 inline-flex items-center text-sm font-medium shadow-lg">
                  <FaBolt className="mr-2 text-cyan-600" />
                  <span className="text-slate-900 font-semibold">AI-Powered Intelligence</span>
                </div>
                <Badge className="bg-amber-400/90 text-amber-900 border-amber-300 px-3 sm:px-4 py-2 hover:bg-amber-300 transition-all duration-300">
                  <FaAward className="mr-2" />
                  Enterprise Grade
                </Badge>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
                 Optimizing Organisational
                  <span className="block text-cyan-100"> Productivity</span>
                  Through Automated Document Handling
                </h1>
                <p className="text-lg sm:text-xl text-cyan-50 leading-relaxed max-w-2xl">
                  Enterprise AI platform that revolutionizes document processing with intelligent summarization,
                  automated routing, and comprehensive knowledge management for all organisations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/onboarding">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-cyan-600 hover:bg-cyan-50 font-semibold px-6 lg:px-8 py-3 lg:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <FaPlay className="mr-3" />
                    Start Free Trial
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-cyan-600 bg-transparent backdrop-blur-sm font-semibold px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-300"
                >
                  <FaEye className="mr-3" />
                  Watch Demo
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-6 lg:pt-8 border-t border-white/20">
                <div className="text-center group">
                  <div className="text-2xl sm:text-3xl font-bold text-white group-hover:text-cyan-100 transition-colors duration-300">
                    95%
                  </div>
                  <div className="text-cyan-100 text-xs sm:text-sm font-medium">Time Reduction</div>
                </div>
                <div className="text-center group">
                  <div className="text-2xl sm:text-3xl font-bold text-white group-hover:text-cyan-100 transition-colors duration-300">
                    8
                  </div>
                  <div className="text-cyan-100 text-xs sm:text-sm font-medium">Departments</div>
                </div>
                <div className="text-center group">
                  <div className="text-2xl sm:text-3xl font-bold text-white group-hover:text-cyan-100 transition-colors duration-300">
                    24/7
                  </div>
                  <div className="text-cyan-100 text-xs sm:text-sm font-medium">Operations</div>
                </div>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-8 lg:p-12 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-md aspect-square rounded-2xl bg-white/80 border-2 border-dashed border-cyan-300 flex items-center justify-center hover:border-cyan-400 transition-all duration-300 group">
                    <img
                      src="/logo.jpg"
                      alt="DocuStream Logo"
                      className="max-w-full max-h-full object-contain p-8 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-cyan-50/50 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-blue-200 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-200 mb-6 px-6 py-3 rounded-full shadow-lg">
              <IoStatsChart className="mr-2" />
              Live Performance Metrics
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Enterprise Intelligence Dashboard</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Real-time performance metrics across all organisations with enterprise-grade monitoring and analytics
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-white via-cyan-50/30 to-white group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-3xl p-5 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <FaExclamationTriangle className="text-3xl" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-cyan-600 mb-3 tracking-tight group-hover:text-cyan-700 transition-colors duration-300">
                  Actionable Insights / Alerts
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-4">Documents with high-priority content (compliance deadlines, approvals required, safety issues).</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-white via-green-50/30 to-white group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-3xl p-5 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <MdSpeed className="text-3xl" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-3 tracking-tight group-hover:text-green-700 transition-colors duration-300">
                  2.3s
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-4">Avg Processing Time</div>
                <div className="text-xs text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                  98.7% faster
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-white via-orange-50/30 to-white group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-3xl p-5 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <FaChartLine className="text-3xl" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-3 tracking-tight group-hover:text-orange-700 transition-colors duration-300">
                  Efficiency & Performance Metrics
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-2">Throughput: Documents processed per hour/day</div>
                <div className="text-xs text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200 inline-block mb-2">
                  8 departments
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-white via-purple-50/30 to-white group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl p-5 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <FaGlobe className="text-3xl" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-purple-600 mb-3 tracking-tight group-hover:text-purple-700 transition-colors duration-300">
                  50+
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-4">Languages Supported</div>
                <div className="text-xs text-slate-600 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                  EN, ML, HI
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem & Solution Snapshot - Enhanced */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 mb-6 px-4 py-2">
              <FaLightbulb className="mr-2" />
              Operational Transformation
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              From Operational Challenges to AI Excellence
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Discover how intelligent automation transforms traditional metro operations into a streamlined, efficient
              enterprise
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-red-50 to-red-100/50 group">
              <CardHeader className="pb-8">
                <CardTitle className="text-red-700 flex items-center gap-3 text-2xl">
                  <div className="bg-red-500 text-white p-3 rounded-xl shadow-lg">
                    <FaExclamationTriangle />
                  </div>
                  Current Operational Challenges
                </CardTitle>
                <CardDescription className="text-red-600 text-lg mt-4">
                  Critical operational bottlenecks impacting metro efficiency and safety protocols
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-red-100 hover:bg-white/80 transition-all duration-300">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <FaClock className="text-red-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 mb-2">Information Latency</h4>
                    <p className="text-red-700 text-sm mb-2">Critical updates delayed across departments</p>
                    <div className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block">
                      Impact: 4-6 hour delays
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-red-100 hover:bg-white/80 transition-all duration-300">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <FaUsers className="text-red-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 mb-2">Department Silos</h4>
                    <p className="text-red-700 text-sm mb-2">Isolated workflows creating inefficiencies</p>
                    <div className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block">
                      Impact: Duplicated efforts
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-red-100 hover:bg-white/80 transition-all duration-300">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <FaShieldAlt className="text-red-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 mb-2">Compliance Risks</h4>
                    <p className="text-red-700 text-sm mb-2">Manual tracking of regulatory requirements</p>
                    <div className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block">
                      Impact: Safety concerns
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-red-100 hover:bg-white/80 transition-all duration-300">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <FaCopy className="text-red-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 mb-2">Manual Processing</h4>
                    <p className="text-red-700 text-sm mb-2">Time-intensive document handling</p>
                    <div className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block">
                      Impact: 80% manual effort
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-cyan-50 to-cyan-100/50 group">
              <CardHeader className="pb-8">
                <CardTitle className="text-cyan-700 flex items-center gap-3 text-2xl">
                  <div className="bg-cyan-500 text-white p-3 rounded-xl shadow-lg">
                    <FaRocket />
                  </div>
                  AI-Powered Solutions
                </CardTitle>
                <CardDescription className="text-cyan-600 text-lg mt-4">
                  Intelligent automation transforming metro operations with enterprise-grade AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-cyan-100 hover:bg-white/80 transition-all duration-300">
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <FaRobot className="text-cyan-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-cyan-800 mb-2">AI Summarization</h4>
                    <p className="text-cyan-700 text-sm mb-2">Intelligent, role-based document processing</p>
                    <div className="text-xs text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full inline-block">
                      Result: 95% time reduction
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-cyan-100 hover:bg-white/80 transition-all duration-300">
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <FaRoute className="text-cyan-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-cyan-800 mb-2">Smart Routing</h4>
                    <p className="text-cyan-700 text-sm mb-2">Automated department distribution</p>
                    <div className="text-xs text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full inline-block">
                      Result: Real-time delivery
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-cyan-100 hover:bg-white/80 transition-all duration-300">
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <FaArchive className="text-cyan-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-cyan-800 mb-2">Knowledge Management</h4>
                    <p className="text-cyan-700 text-sm mb-2">Centralized, searchable repository</p>
                    <div className="text-xs text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full inline-block">
                      Result: Universal access
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-cyan-100 hover:bg-white/80 transition-all duration-300">
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <FaLanguage className="text-cyan-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-cyan-800 mb-2">Multilingual AI</h4>
                    <p className="text-cyan-700 text-sm mb-2">English, Malayalam, Hindi processing</p>
                    <div className="text-xs text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full inline-block">
                      Result: Inclusive operation
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 mb-6 px-4 py-2">
              <HiSparkles className="mr-2" />
              Enterprise Features
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Comprehensive AI-Powered Platform</h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Enterprise-grade document intelligence designed specifically for metro operations with military-grade
              security and scalable performance architecture
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group bg-gradient-to-br from-white to-cyan-50/30">
              <CardHeader className="p-8">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-xl transition-all duration-300 shadow-lg">
                  <FaFileAlt className="text-2xl text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-cyan-600 transition-colors mb-3">
                  Multi-Source Ingestion
                </CardTitle>
                <CardDescription className="text-slate-600 text-base leading-relaxed">
                  Seamless integration with emails, PDFs, scanned documents, and SharePoint with real-time
                  synchronization capabilities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group bg-gradient-to-br from-white to-green-50/30">
              <CardHeader className="p-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-xl transition-all duration-300 shadow-lg">
                  <FaRobot className="text-2xl text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors mb-3">
                  AI Summarization Engine
                </CardTitle>
                <CardDescription className="text-slate-600 text-base leading-relaxed">
                  Advanced role-based, multilingual document processing with 99.7% accuracy and contextual understanding
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="p-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-xl transition-all duration-300 shadow-lg">
                  <FaSearch className="text-2xl text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3">
                  Intelligent Search
                </CardTitle>
                <CardDescription className="text-slate-600 text-base leading-relaxed">
                  Elasticsearch-powered semantic search with advanced traceability and content discovery algorithms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group bg-gradient-to-br from-white to-orange-50/30">
              <CardHeader className="p-8">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-xl transition-all duration-300 shadow-lg">
                  <MdNotifications className="text-2xl text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors mb-3">
                  Compliance Monitoring
                </CardTitle>
                <CardDescription className="text-slate-600 text-base leading-relaxed">
                  Proactive safety notices and automated regulatory deadline management with intelligent alerting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group bg-gradient-to-br from-white to-purple-50/30">
              <CardHeader className="p-8">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-xl transition-all duration-300 shadow-lg">
                  <MdSecurity className="text-2xl text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-3">
                  Enterprise Security
                </CardTitle>
                <CardDescription className="text-slate-600 text-base leading-relaxed">
                  Military-grade role-based access control with comprehensive audit logging and end-to-end encryption
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group bg-gradient-to-br from-white to-indigo-50/30">
              <CardHeader className="p-8">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-xl transition-all duration-300 shadow-lg">
                  <FaFileArchive className="text-2xl text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3">
                  Knowledge Management
                </CardTitle>
                <CardDescription className="text-slate-600 text-base leading-relaxed">
                  Intelligent archival system with automated knowledge preservation and institutional memory retention
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-6 bg-gradient-to-br from-slate-50 to-cyan-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 mb-6 px-4 py-2">
              <FaRoute className="mr-2" />
              Intelligent Workflow
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Enterprise Automation Process</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Streamlined 5-stage intelligent workflow transforming operational chaos into strategic clarity
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto text-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <FaUpload />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-lg">Document Ingestion</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Automated multi-source document capture with intelligent preprocessing
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto text-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <FaRobot />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-lg">AI Processing</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Advanced NLP analysis with context-aware summarization
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto text-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <FaRoute />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-lg">Smart Distribution</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Intelligent routing to relevant departments with priority classification
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto text-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <FaTachometerAlt />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-lg">Executive Dashboard</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Real-time insights with comprehensive analytics and reporting
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto text-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <FaArchive />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">5</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-lg">Knowledge Archive</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Secure archival with compliance logging and audit trails
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-cyan-50 to-blue-50 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-slate-700">Average Processing Time</span>
                </div>
                <div className="text-4xl font-bold text-cyan-600 mb-2">2.3 seconds</div>
                <p className="text-slate-600">From upload to intelligent distribution</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Benefits Section - Enhanced */}
      <section className="py-20 px-6 bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-white/20 text-white border-white/30 mb-6 px-6 py-3 rounded-full backdrop-blur-sm">
              <FaRocket className="mr-2" />
              Operational Impact
            </Badge>
            <h2 className="text-5xl font-bold mb-6 tracking-tight">Transformative Impact for the modern organisations</h2>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
              Measurable improvements across all operational dimensions with enterprise-grade performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <FaClock className="text-3xl group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-cyan-100 transition-colors duration-300">
                Lightning-Fast Decisions
              </h3>
              <p className="text-cyan-100 text-lg leading-relaxed">
                Reduce operational downtime by 95% with instant AI-powered insights and real-time decision support
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <FaHandshake className="text-3xl group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-cyan-100 transition-colors duration-300">
                Unified Collaboration
              </h3>
              <p className="text-cyan-100 text-lg leading-relaxed">
                Break down departmental silos with seamless information sharing and cross-functional workflows
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <FaShieldAlt className="text-3xl group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-cyan-100 transition-colors duration-300">
                Regulatory Excellence
              </h3>
              <p className="text-cyan-100 text-lg leading-relaxed">
                Never miss critical compliance deadlines with automated monitoring and intelligent alerts
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <FaUsers className="text-3xl group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-cyan-100 transition-colors duration-300">
                Knowledge Preservation
              </h3>
              <p className="text-cyan-100 text-lg leading-relaxed">
                Accelerate onboarding and training with intelligent knowledge management and instant access
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <FaDollarSign className="text-3xl group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-cyan-100 transition-colors duration-300">
                Cost Optimization
              </h3>
              <p className="text-cyan-100 text-lg leading-relaxed">
                Eliminate redundant processes and achieve significant operational cost savings through automation
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <FaChartLine className="text-3xl group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-cyan-100 transition-colors duration-300">
                Operational Excellence
              </h3>
              <p className="text-cyan-100 text-lg leading-relaxed">
                Drive data-driven decision making with comprehensive analytics and performance insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full bg-slate-900 text-white py-8 px-4 flex flex-col items-center justify-center mt-16 border-t border-slate-800">
        <div className="w-full max-w-lg flex flex-col items-center gap-3">
          <div className="text-base font-medium tracking-wide">Prepared by <span className="font-bold text-cyan-300">Pragya Singh</span></div>
          <div className="text-sm text-slate-200">Organisational Document Management &bull; <span className="font-semibold text-cyan-200">DocuStream</span></div>
          <div className="text-sm text-slate-300">Contact: <a href="mailto:pragya220898@gmail.com" className="underline hover:text-cyan-300">pragya220898@gmail.com</a></div>
          <div className="w-16 border-b border-slate-700 my-2"></div>
          <div className="text-xs text-slate-400 tracking-wider">All rights reserved</div>
        </div>
      </footer>
    </div>
  )
}
