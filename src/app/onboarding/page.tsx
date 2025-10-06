'use client';
import React, { useState, useEffect, use } from 'react';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const steps = [
    {
      id: 1,
      title: "Sign In to Your Account",
      description: "Access your secure DocuFlow AI dashboard with enterprise-grade authentication and role-based permissions.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      buttonText: "Sign In Now",
      features: ["Single Sign-On (SSO)", "Multi-factor Authentication", "Role-based Access Control"]
    },
    {
      id: 2,
      title: "Upload Sample Document",
      description: "Upload a representative document from your organization to train our AI models for optimal accuracy and relevance.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      buttonText: "Upload Document",
      features: ["PDF, DOC, DOCX Support", "Multi-language Processing", "Secure File Handling"]
    },
    {
      id: 3,
      title: "Get AI-Powered Summary",
      description: "Receive an intelligent summary with key insights, action items, and stakeholder notifications tailored to your role.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      buttonText: "Generate Summary",
      features: ["Executive Summaries", "Action Item Extraction", "Department Routing"]
    }
  ];

  const handleStepClick = (stepId: React.SetStateAction<number>) => {
    setCurrentStep(stepId);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <a href="/" className="text-xl font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                DocuFlow AI
              </a>
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              <a 
                href="/signin" 
                className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all font-medium"
              >
                Sign In
              </a>
              <a 
                href="/onboarding" 
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
              >
                Onboarding Process
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Get Started with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">DocuFlow AI</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transform your document workflow in three simple steps. From authentication to intelligent summaries, we'll guide you through the entire process.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-center items-center space-x-8 mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(step.id)}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-110'
                      : 'bg-white text-slate-400 border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {step.id}
                  {currentStep >= step.id && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse opacity-30"></div>
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-4 rounded-full transition-all duration-500 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Step Labels */}
          <div className="flex justify-center items-center space-x-32">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <p className={`text-sm font-medium transition-colors ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  Step {step.id}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Cards */}
        <div className="relative">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`absolute inset-0 transition-all duration-700 transform ${
                currentStep === step.id
                  ? 'opacity-100 translate-x-0 scale-100'
                  : currentStep > step.id
                  ? 'opacity-0 -translate-x-8 scale-95'
                  : 'opacity-0 translate-x-8 scale-95'
              }`}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 lg:p-12 border border-slate-200/50 hover:border-blue-200/50 group">
                <div className="text-center">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Features */}
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {step.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-center space-x-2 text-slate-600">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Button */}
                  <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 group-hover:shadow-blue-200">
                    {step.buttonText}
                    <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Placeholder for proper height */}
          <div className="opacity-0 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-12 border border-slate-200/50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-6"></div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Placeholder Title</h2>
                <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Placeholder description text that spans multiple lines to ensure proper height calculation.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-center space-x-2 text-slate-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Feature</span>
                    </div>
                  ))}
                </div>
                <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl">
                  Button Text
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            ← Previous Step
          </button>
          
          <div className="text-center">
            <p className="text-slate-500">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          
          <button
            onClick={handleNextStep}
            disabled={currentStep === steps.length}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === steps.length
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Next Step →
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">Need Assistance?</h3>
            <p className="text-slate-600 mb-6">
              Our support team is available 24/7 to help you get started with DocuFlow AI. 
              Contact us for personalized onboarding assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/support"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors font-medium"
              >
                Contact Support
              </a>
              <a 
                href="/docs"
                className="px-6 py-3 text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}