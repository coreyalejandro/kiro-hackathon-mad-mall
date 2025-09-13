import React from 'react';
import Link from 'next/link';

export default function MeetingGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  📚 MADMall Live Agent Meeting Guide
                </h1>
                <p className="text-purple-100 mt-2 text-lg">
                  Complete guide to using the world's first real-time multi-agent healthcare AI collaboration system
                </p>
              </div>
              <Link 
                href="/meeting"
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🚀 Start Meeting
              </Link>
            </div>
          </div>

          <div className="p-8">
            {/* Quick Start */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ⚡ Quick Start (30 seconds)
              </h2>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">1</div>
                    <div className="font-semibold text-gray-800">Visit Meeting Page</div>
                    <div className="text-sm text-gray-600 mt-1">Go to /meeting</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">2</div>
                    <div className="font-semibold text-gray-800">Click "Claude + Kiro"</div>
                    <div className="text-sm text-gray-600 mt-1">Start focused meeting</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">3</div>
                    <div className="font-semibold text-gray-800">Ask a Question</div>
                    <div className="text-sm text-gray-600 mt-1">Type and send message</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">4</div>
                    <div className="font-semibold text-gray-800">Watch Collaboration</div>
                    <div className="text-sm text-gray-600 mt-1">Agents respond in real-time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meet Your AI Team */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                🤖 Meet Your AI Collaboration Team
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl">🤖</div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-800">Claude</h3>
                      <p className="text-blue-600 font-medium">System Architect & Coordinator</p>
                    </div>
                  </div>
                  <div className="text-blue-700">
                    <p className="mb-3">Your technical architecture specialist who handles:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Platform architecture and system design</li>
                      <li>• Implementation strategies and technical planning</li>
                      <li>• Integration challenges and solutions</li>
                      <li>• User experience and accessibility considerations</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl">💜</div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-800">Kiro</h3>
                      <p className="text-purple-600 font-medium">Wellness Domain Expert & Advocate</p>
                    </div>
                  </div>
                  <div className="text-purple-700">
                    <p className="mb-3">Your cultural competency and wellness advocate who ensures:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Cultural appropriateness and sensitivity</li>
                      <li>• Community-centered approach to wellness</li>
                      <li>• Black women's health advocacy and support</li>
                      <li>• Holistic care coordination and patient-centered design</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-2xl">📊</div>
                    <div>
                      <h3 className="text-xl font-bold text-green-800">Gemini</h3>
                      <p className="text-green-600 font-medium">Research & Data Analytics Lead</p>
                    </div>
                  </div>
                  <div className="text-green-700">
                    <p className="mb-3">Your research and data specialist who provides:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Statistical analysis and experimental design</li>
                      <li>• CoT self-instruct and synthetic data generation</li>
                      <li>• Performance optimization and algorithmic improvement</li>
                      <li>• Evidence-based validation and research methodology</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl">💼</div>
                    <div>
                      <h3 className="text-xl font-bold text-orange-800">Amazon Q</h3>
                      <p className="text-orange-600 font-medium">Business Intelligence & Operations</p>
                    </div>
                  </div>
                  <div className="text-orange-700">
                    <p className="mb-3">Your business strategy and operations expert who analyzes:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Business process optimization and cost efficiency</li>
                      <li>• AWS infrastructure and cloud scalability</li>
                      <li>• Enterprise integration and compliance</li>
                      <li>• Market analysis and competitive positioning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Use Features */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                🎯 How to Use Key Features
              </h2>
              
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    🎯 Agent Targeting
                  </h3>
                  <p className="text-gray-700 mb-3">Direct your questions to specific agents for targeted expertise:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 mb-2">How to Target Agents:</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        <li>1. Select agent buttons before sending message</li>
                        <li>2. Type your question</li>
                        <li>3. Click Send - only selected agents respond</li>
                        <li>4. Or use "Ask [Agent Name]" quick buttons</li>
                      </ol>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 mb-2">Example Targeting:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Technical questions:</strong> Select Claude</div>
                        <div><strong>Cultural concerns:</strong> Select Kiro</div>
                        <div><strong>Data analysis:</strong> Select Gemini</div>
                        <div><strong>Business strategy:</strong> Select Amazon Q</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    📊 Consensus Tracking
                  </h3>
                  <p className="text-gray-700 mb-3">Watch real-time agreement levels as agents collaborate:</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center bg-white p-4 rounded-lg border">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mx-auto mb-2">
                        <div className="w-4 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <div className="font-semibold text-red-700">0-40%</div>
                      <div className="text-sm text-gray-600">Disagreement</div>
                    </div>
                    <div className="text-center bg-white p-4 rounded-lg border">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mx-auto mb-2">
                        <div className="w-10 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <div className="font-semibold text-yellow-700">40-80%</div>
                      <div className="text-sm text-gray-600">Building</div>
                    </div>
                    <div className="text-center bg-white p-4 rounded-lg border">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mx-auto mb-2">
                        <div className="w-full h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="font-semibold text-green-700">80-100%</div>
                      <div className="text-sm text-gray-600">Achieved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Questions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                💡 Sample Questions to Try
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">🚀 Strategy & Business</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• "What are our biggest competitive advantages?"</li>
                    <li>• "How should we approach Y Combinator?"</li>
                    <li>• "What's our go-to-market strategy?"</li>
                    <li>• "How do we scale to 1 million users?"</li>
                    <li>• "What are the key business risks we face?"</li>
                  </ul>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">🛠️ Technical & Implementation</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• "How do we ensure cultural competency in our AI?"</li>
                    <li>• "What's our technical architecture roadmap?"</li>
                    <li>• "How do we validate our algorithms?"</li>
                    <li>• "What are our infrastructure requirements?"</li>
                    <li>• "How do we maintain 99.9% uptime?"</li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">💜 Cultural & Community</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• "How do we serve Black women authentically?"</li>
                    <li>• "What makes our cultural approach unique?"</li>
                    <li>• "How do we build trust in community spaces?"</li>
                    <li>• "What are the key cultural considerations?"</li>
                    <li>• "How do we ensure community ownership?"</li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Research & Data</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• "How do we measure cultural competency?"</li>
                    <li>• "What data validates our approach?"</li>
                    <li>• "How do we design experiments for validation?"</li>
                    <li>• "What are our key performance metrics?"</li>
                    <li>• "How do we ensure statistical significance?"</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Meeting Types */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                🎭 Meeting Types & When to Use
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🤖💜</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Claude + Kiro</h3>
                      <p className="text-gray-600">Focused Collaboration</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">Best For:</h4>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• Strategic planning and decision-making</li>
                        <li>• Technical architecture with cultural validation</li>
                        <li>• Feature design and user experience planning</li>
                        <li>• Rapid prototyping and iteration discussions</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Advantages:</h4>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• Faster consensus and decision-making</li>
                        <li>• Deep technical + cultural collaboration</li>
                        <li>• Less noise, more focused discussion</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🤖💜📊💼</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">All Agents</h3>
                      <p className="text-gray-600">Complete Analysis</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">Best For:</h4>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• Complex problem analysis from all angles</li>
                        <li>• Major feature or platform decisions</li>
                        <li>• Business strategy and market analysis</li>
                        <li>• Research validation and experimental design</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Advantages:</h4>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• Comprehensive perspective coverage</li>
                        <li>• All expertise areas represented</li>
                        <li>• Thorough analysis and validation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                🏆 Pro Tips for Effective Collaboration
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-green-600 text-xl mb-2">✅</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Be Specific</h4>
                  <p className="text-sm text-gray-600">Ask detailed questions to get more actionable responses from agents.</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-blue-600 text-xl mb-2">🎯</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Use Targeting</h4>
                  <p className="text-sm text-gray-600">Select specific agents for specialized expertise on focused topics.</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-purple-600 text-xl mb-2">🔄</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Build on Responses</h4>
                  <p className="text-sm text-gray-600">Ask follow-up questions to dive deeper into agent recommendations.</p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-yellow-600 text-xl mb-2">📊</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Watch Consensus</h4>
                  <p className="text-sm text-gray-600">Monitor agreement levels to see when agents align on solutions.</p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-orange-600 text-xl mb-2">🎭</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Use Context</h4>
                  <p className="text-sm text-gray-600">Reference previous messages to maintain conversation continuity.</p>
                </div>
                
                <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <div className="text-pink-600 text-xl mb-2">⚡</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Stay Engaged</h4>
                  <p className="text-sm text-gray-600">Actively participate in the conversation for best results.</p>
                </div>
              </div>
            </div>

            {/* Get Started */}
            <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Collaborating?</h2>
              <p className="text-purple-100 mb-6 text-lg">
                Experience the world's first real-time multi-agent healthcare AI collaboration system
              </p>
              <Link 
                href="/meeting"
                className="inline-block bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors transform hover:scale-105"
              >
                🚀 Start Your First Meeting
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}