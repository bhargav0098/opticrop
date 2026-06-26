import { Link } from 'react-router-dom'

const features = [
  { icon: '🧠', title: 'AI-Powered Recommendations', desc: 'Random Forest ML model with 91%+ accuracy analyzes your soil and climate data instantly.' },
  { icon: '🌱', title: 'Smart Crop Selection', desc: 'Input 7 key parameters and get the perfect crop recommendation with confidence scores.' },
  { icon: '📊', title: 'Suitability Analysis', desc: 'Detailed compatibility checks across temperature, pH, rainfall, and nutrient levels.' },
  { icon: '📋', title: 'Prediction History', desc: 'Track all your past recommendations and monitor seasonal patterns.' },
  { icon: '🌍', title: '22 Crop Database', desc: 'Covers rice, wheat, maize, fruits, legumes, and cash crops with expert farming tips.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication keeps your farm data private and safe.' },
]

const steps = [
  { n: '01', title: 'Create Account', desc: 'Register and log in to your secure farmer dashboard.' },
  { n: '02', title: 'Enter Parameters', desc: 'Input N, P, K, temperature, humidity, pH, and rainfall values.' },
  { n: '03', title: 'AI Analyzes', desc: 'Our trained ML model processes your soil and climate data.' },
  { n: '04', title: 'Get Results', desc: 'Receive crop recommendation with confidence score and farming tips.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-bold text-xl text-gray-900">OptiCrop</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2">Login</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
            <span>🚀</span> Powered by Machine Learning — 91%+ Accuracy
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Smarter Farming<br />Starts with <span className="text-green-300">AI Insights</span>
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            OptiCrop analyzes your soil composition and environmental conditions to recommend the most productive crop for your land — backed by science.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-green-700 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl text-center">
              Start Free Analysis
            </Link>
            <Link to="/login" className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-200 text-center">
              Sign In
            </Link>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[['91%+', 'Model Accuracy'], ['22', 'Crop Types'], ['7', 'Input Parameters'], ['Real-time', 'Predictions']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-white">{val}</div>
                <div className="text-green-300 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Farm Smarter</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">A complete AI-powered platform built for modern agriculture.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="card hover:shadow-md transition-shadow duration-200">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How OptiCrop Works</h2>
            <p className="text-gray-500 text-lg">Four simple steps to AI-powered crop recommendations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="text-center relative">
                {i < steps.length - 1 && <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-full h-px bg-green-200 z-0"></div>}
                <div className="relative z-10 w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md">
                  {s.n}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 hero-gradient text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Harvest?</h2>
          <p className="text-green-100 mb-8 text-lg">Join farmers using AI to make better planting decisions.</p>
          <Link to="/register" className="bg-white text-green-700 font-bold px-10 py-4 rounded-xl hover:bg-green-50 transition-all duration-200 shadow-lg inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">© 2024 OptiCrop — Smart Agricultural Production Optimization Engine</p>
      </footer>
    </div>
  )
}
