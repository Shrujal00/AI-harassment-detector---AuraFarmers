import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, ArrowRight, Github, Twitter, Mail, Brain, Upload, BarChart3, Server } from 'lucide-react'
import { TextAnalysisDemo } from '@/components/TextAnalysisDemo'
import { FileUploadDemo } from '@/components/FileUploadDemo'
import { ApiStatusDemo } from '@/components/ApiStatusDemo'
import { ParticlesBackground } from './components/ParticlesBackground'
import { ScrollIndicator } from './components/ScrollIndicator'
import { initScrollAnimations } from './utils/scroll-animations.ts'
import { HarassmentDetectionDemo } from './components/HarassmentDetectionDemo'

function App() {
  useEffect(() => {
    // Initialize scroll animations when the component mounts
    const cleanup = initScrollAnimations();
    
    return () => {
      // Clean up event listeners when the component unmounts
      if (cleanup) cleanup();
    };
  }, []);
  
  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <ParticlesBackground />
      <ScrollIndicator />
      {/* Futuristic 3D Liquid Navbar */}
      <header className="fixed-top clean-navbar">
        <div className="navbar-backdrop"></div>
        
        <div className="glass-nav-container">
          <div className="container py-3">
            <div className="d-flex justify-content-between align-items-center">
              {/* Simple Brand Text - No Logo */}
              <a href="#home" className="d-flex align-items-center text-decoration-none">
                <span className="fw-bold fs-4 brand-text">HumanI</span>
                <span className="tagline-text ms-2">Next-Gen Protection</span>
              </a>
              
              {/* Clean Nav Links */}
              <div className="d-none d-lg-block">
                <ul className="list-unstyled d-flex align-items-center mb-0">
                  <li className="me-4">
                    <a href="#home" className="nav-link clean-nav-link">Home</a>
                  </li>
                  <li className="me-4">
                    <a href="#features" className="nav-link clean-nav-link">Features</a>
                  </li>
                  <li className="me-4">
                    <a href="#demo" className="nav-link clean-nav-link">Demo</a>
                  </li>
                  <li>
                    <a href="#about" className="nav-link clean-nav-link">About</a>
                  </li>
                </ul>
              </div>
              
              {/* Simple CTA Button */}
              <button className="btn clean-cta-button">
                <span>Get Started</span>
              </button>
              
              {/* Simple Mobile Menu Button */}
              <div className="d-lg-none mobile-menu-button">
                <div className="menu-icon">
                  <span className="menu-line"></span>
                  <span className="menu-line"></span>
                  <span className="menu-line"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Clean Hero Section */}
      <section className="hero-section pt-7 pt-md-9 pb-5 pb-md-7">
        <div className="container text-center position-relative">
          <div className="hero-content mt-5">
            <div className="title-wrapper mb-4">
              <h1 className="hero-title fw-bold">
                <span className="text-primary">Harassment Detection</span>
                <br />
                <span className="text-white">Made Simple</span>
              </h1>
            </div>
            
            <p className="fs-4 text-secondary mb-5 mx-auto hero-description" style={{ maxWidth: "800px" }}>
              Powered by advanced AI, HumanI detects harassment and toxic content 
              in real-time, creating safer digital spaces for everyone.
            </p>
            
            <div className="button-group d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center">
              <button
                className="btn btn-primary hero-button d-flex align-items-center px-4 py-2"
                onClick={scrollToDemo}
              >
                <span className="me-2">Try Demo</span>
                <ArrowRight style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
              
              <button
                className="btn btn-outline-secondary hero-button-secondary px-4 py-2"
                onClick={scrollToFeatures}
              >
                Learn More
              </button>
            </div>
          </div>
          
          {/* Hero Demo Display */}
          <div className="mt-5 mt-lg-6 position-relative hero-demo">
            <div className="glass-terminal p-4 p-md-5 mx-auto" style={{ maxWidth: "800px" }}>
              
              
              <div className="position-relative">
                <div className="d-flex align-items-center mb-4">
                  <div className="terminal-button bg-danger"></div>
                  <div className="terminal-button bg-warning"></div>
                  <div className="terminal-button bg-success"></div>
                </div>

                <div className="terminal-content">
                  <div className="terminal-line d-flex align-items-center mb-3">
                    <div className="status-dot pulse success"></div>
                    <motion.span 
                      className="terminal-text"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      transition={{ delay: 1.5, duration: 0.8 }}
                    >
                      Analyzing content...
                    </motion.span>
                  </div>

                  <div className="progress-container mb-3">
                    <motion.div
                      className="progress-bar-animated"
                      initial={{ width: "5%" }}
                      animate={{ width: "85%" }}
                      transition={{ delay: 1.8, duration: 2 }}
                    />
                    <motion.div 
                      className="progress-glow"
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </div>

                  <motion.div 
                    className="terminal-result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3.8, duration: 0.5 }}
                  >
                    <motion.div 
                      className="check-icon-container"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 3.9, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="check-icon" />
                    </motion.div>
                    <span className="result-text">No harassment detected</span>
                  </motion.div>

                  <motion.div
                    className="code-lines"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 4.2, duration: 0.5 }}
                  >
                    {[1, 2, 3].map(i => (
                      <motion.div 
                        key={i} 
                        className="code-line"
                        initial={{ width: "0%" }}
                        animate={{ width: ["30%", "80%", "60%"][i-1] }}
                        transition={{ delay: 4.2 + (i * 0.2), duration: 0.5 }}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="particle-container">
              {[...Array(20)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="particle"
                  initial={{ 
                    x: Math.random() * 800 - 400,
                    y: Math.random() * 400 - 200,
                    opacity: 0
                  }}
                  animate={{ 
                    y: [0, -20 - Math.random() * 50],
                    x: [0, (Math.random() - 0.5) * 30],
                    opacity: [0, 0.7, 0]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3 + Math.random() * 5,
                    delay: Math.random() * 3,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with 3D Scroll Animation */}
      <section id="features" className="py-5 py-md-6 scroll-reveal-section animated-bg">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1, 
              type: "spring",
              stiffness: 50
            }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="display-5 fw-bold mb-3">
              <span className="animated-gradient-text">Powerful Features</span> for Digital Safety
            </h2>
            <motion.p 
              className="fs-4 text-secondary mx-auto" 
              style={{ maxWidth: "700px" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Experience our comprehensive suite of AI-powered harassment detection tools
            </motion.p>
          </motion.div>
          
          {/* Floating 3D Feature Cards */}
          <div className="scroll-stagger-container">
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-5">
              {[
                {
                  icon: <Brain style={{ width: "2rem", height: "2rem" }} />,
                  title: "AI Text Analysis",
                  description: "Real-time harassment detection with advanced NLP models",
                  delay: 0.1,
                  glowColor: "rgba(10, 132, 255, 0.8)"
                },
                {
                  icon: <BarChart3 style={{ width: "2rem", height: "2rem" }} />,
                  title: "Batch Processing",
                  description: "Analyze multiple texts simultaneously for bulk moderation",
                  delay: 0.2,
                  glowColor: "rgba(94, 92, 230, 0.8)"
                },
                {
                  icon: <Upload style={{ width: "2rem", height: "2rem" }} />,
                  title: "File Upload",
                  description: "Process CSV and text files for large-scale content review",
                  delay: 0.3,
                  glowColor: "rgba(100, 210, 255, 0.8)"
                },
                {
                  icon: <Server style={{ width: "2rem", height: "2rem" }} />,
                  title: "API Integration",
                  description: "Easy-to-use REST API for seamless platform integration",
                  delay: 0.4,
                  glowColor: "rgba(48, 209, 88, 0.8)"
                }
              ].map((feature, index) => (
                <motion.div 
                  className="col stagger-item"
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: 10 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    rotateX: 0
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: feature.delay,
                    type: "spring",
                    stiffness: 50
                  }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <div className="card-3d-effect h-100">
                    <div className="card-3d-content p-4">
                      <motion.div 
                        className="feature-icon-container"
                        whileHover={{ 
                          scale: 1.1, 
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          rotate: { 
                            duration: 1.5,
                            ease: "easeInOut" 
                          }
                        }}
                      >
                        <div className="feature-icon">
                          {feature.icon}
                        </div>
                        <motion.div 
                          className="feature-icon-glow"
                          style={{ background: `radial-gradient(circle, ${feature.glowColor} 0%, rgba(0,0,0,0) 70%)` }}
                          animate={{ 
                            opacity: [0.5, 1, 0.5],
                            scale: [0.8, 1.2, 0.8]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 3 + index
                          }}
                        />
                      </motion.div>
                      
                      <h3 className="fs-5 fw-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-secondary mb-0">{feature.description}</p>
                      
                      <motion.div 
                        className="mt-3 d-flex align-items-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: feature.delay + 0.3 }}
                        viewport={{ once: true }}
                      >
                        <span className="small text-primary me-2">Learn more</span>
                        <ArrowRight size={14} className="text-primary" />
                      </motion.div>
                    </div>
                    <div className="card-3d-shine" />
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Interactive 3D Feature Animation */}
            <motion.div 
              className="text-center mt-5 pt-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button 
                className="btn future-cta-button btn-lg px-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="btn-text">Explore All Features</span>
                <motion.div 
                  className="btn-liquid-fill"
                  initial={{ height: '0%' }}
                  whileHover={{ height: '100%' }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div 
                  className="btn-glow"
                  animate={{ 
                    opacity: [0.7, 1, 0.7],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }}
                />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* API Status Demo */}
      <section className="py-5 py-md-6 animated-bg">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1,
              type: "spring",
              stiffness: 50
            }}
            viewport={{ once: true }}
          >
            <ApiStatusDemo />
          </motion.div>
        </div>
      </section>

      {/* Demo Section with 3D Parallax */}
      <section id="demo" className="py-5 py-md-6 parallax-section">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1,
              type: "spring",
              stiffness: 50
            }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="display-5 fw-bold mb-3"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="animated-gradient-text">Try Our AI</span> Detection Live
            </motion.h2>
            
            <motion.p 
              className="fs-4 text-secondary mx-auto" 
              style={{ maxWidth: "700px" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Experience real-time harassment and misogyny detection in action
            </motion.p>
          </motion.div>
          
          <div className="parallax-element" data-speed="0.05">
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: 5 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ 
                duration: 1,
                type: "spring",
                stiffness: 50,
                delay: 0.2
              }}
              viewport={{ once: true, margin: "-100px" }}
              className="card-3d-effect"
            >
              <div className="card-3d-content">
                <TextAnalysisDemo />
              </div>
              <div className="card-3d-shine" />
              
              {/* Floating particles around the demo */}
              {[...Array(10)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="particle"
                  style={{
                    position: 'absolute',
                    width: 6 + Math.random() * 8,
                    height: 6 + Math.random() * 8,
                    borderRadius: '50%',
                    background: `rgba(${[
                      Math.floor(Math.random() * 100 + 155),
                      Math.floor(Math.random() * 100 + 155),
                      255
                    ].join(', ')}, ${0.4 + Math.random() * 0.6})`,
                    filter: 'blur(1px)',
                    boxShadow: '0 0 10px rgba(100, 210, 255, 0.8)',
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    zIndex: 1
                  }}
                  animate={{
                    x: [
                      Math.random() * 30 - 15,
                      Math.random() * 30 - 15,
                      Math.random() * 30 - 15
                    ],
                    y: [
                      Math.random() * 30 - 15,
                      Math.random() * 30 - 15,
                      Math.random() * 30 - 15
                    ],
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 5 + Math.random() * 10,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Model Training Section */}
      <section className="py-5 py-md-6">
        <div className="container">
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="display-6 fw-bold text-white mb-3">
              Model Training
            </h2>
            <p className="fs-5 text-secondary">
              Train our machine learning models on your dataset to improve detection accuracy
            </p>
            
            <div className="d-flex justify-content-center mt-4">
              <button 
                onClick={() => {
                  fetch('http://localhost:5000/api/train', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  .then(response => response.json())
                  .then(data => {
                    alert('Model training initiated successfully');
                    console.log(data);
                  })
                  .catch(err => {
                    alert('Failed to initiate model training');
                    console.error(err);
                  });
                }} 
                className="btn btn-lg btn-primary px-5 py-3 d-flex align-items-center"
              >
                <Brain className="me-2" size={24} />
                Train ML Models
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Harassment Detection Demo */}
      <section className="py-5 py-md-6 gradient-bg-section">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="display-6 fw-bold text-white mb-3">
              Cross-Platform Harassment Detection
            </h2>
            <p className="fs-5 text-secondary">
              Test our AI across different social media platforms
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mx-auto"
            style={{ maxWidth: "880px" }}
          >
            <HarassmentDetectionDemo />
          </motion.div>
        </div>
      </section>

      {/* File Upload Demo */}
      <section className="py-5 py-md-6">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="display-6 fw-bold text-white mb-3">
              File Upload & Processing
            </h2>
            <p className="fs-5 text-secondary">
              Upload CSV or text files for large-scale harassment detection
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="shadow-sm rounded"
          >
            <FileUploadDemo />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="metrics-section py-5 py-md-6 position-relative overflow-hidden">
        <div className="metrics-gradient-bg"></div>
        <div className="container position-relative">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="display-6 fw-bold text-white mb-3">
              Proven Performance Metrics
            </h2>
            <p className="fs-5 text-white opacity-90">
              Our AI models deliver industry-leading accuracy and speed
            </p>
          </motion.div>
          
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 text-center">
            {[
              { number: "95.3%", label: "Harassment Detection Accuracy", colorClass: "metric-blue", bgClass: "metric-bg-blue" },
              { number: "93.1%", label: "Misogyny Detection Accuracy", colorClass: "metric-orange", bgClass: "metric-bg-orange" },
              { number: "< 200ms", label: "Average Response Time", colorClass: "metric-green", bgClass: "metric-bg-green" },
              { number: "99.9%", label: "API Uptime", colorClass: "metric-white", bgClass: "metric-bg-white" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="col"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className={`metric-card ${stat.bgClass} p-4 rounded-3 h-100`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className={`metric-number display-4 fw-bold mb-2 ${stat.colorClass}`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="metric-label text-white opacity-90 fw-medium">{stat.label}</div>
                  <div className="metric-glow"></div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-5 py-md-6">
        <div className="container">
          <div className="row g-5 align-items-center">
            <motion.div
              className="col-lg-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="display-5 fw-bold text-white mb-4">
                Advanced AI for Safer Communities
              </h2>
              <p className="fs-5 text-secondary mb-4">
                Our harassment detection system uses state-of-the-art RoBERTa models trained specifically 
                for identifying toxic content, harassment, and misogynistic language in real-time.
              </p>
              <p className="fs-5 text-secondary mb-4">
                Built with privacy in mind, our API processes content without storing personal data, 
                making it perfect for platforms that prioritize user safety and data protection.
              </p>
              <div className="mb-4">
                {[
                  "Dual-model architecture for comprehensive detection",
                  "Real-time analysis with sub-200ms response times",
                  "Privacy-first design with no data retention",
                  "Easy integration with RESTful API"
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="d-flex align-items-center mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="text-success flex-shrink-0 me-3" style={{ width: "1.25rem", height: "1.25rem" }} />
                    <span className="text-white">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="col-lg-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="card border-0 bg-primary text-white shadow">
                <div className="card-body p-4 p-lg-5">
                  <h3 className="card-title h4 fw-bold mb-4">Technology Stack</h3>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span>RoBERTa Base Models</span>
                      <div className="progress bg-white bg-opacity-25" style={{ height: "8px", width: "100px" }}>
                        <div className="progress-bar bg-white" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span>Flask API Framework</span>
                      <div className="progress bg-white bg-opacity-25" style={{ height: "8px", width: "100px" }}>
                        <div className="progress-bar bg-white" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span>PyTorch Backend</span>
                      <div className="progress bg-white bg-opacity-25" style={{ height: "8px", width: "100px" }}>
                        <div className="progress-bar bg-white" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Transformers Library</span>
                      <div className="progress bg-white bg-opacity-25" style={{ height: "8px", width: "100px" }}>
                        <div className="progress-bar bg-white" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 py-md-6 bg-dark">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="display-5 fw-bold text-white mb-4">
                  Ready to Create Safer Spaces?
                </h2>
                <p className="fs-5 text-white-50 mb-5">
                  Join thousands of organizations using HumanI to protect their communities
                </p>
                <motion.button
                  className="btn btn-primary btn-lg px-5 py-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Free Trial
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 mt-5">
        <div className="container">
          <div className="ios-section mb-4">
            <div className="row align-items-center">
              <div className="col-md-6 mb-4 mb-md-0 text-center text-md-start">
                <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                  <Shield className="text-primary me-2" style={{ width: "1.5rem", height: "1.5rem" }} />
                  <span className="fs-5 fw-semibold">HumanI</span>
                </div>
              </div>
              
              <div className="col-md-6 text-center text-md-end">
                <div className="d-flex justify-content-center justify-content-md-end gap-4">
                  {[
                    { icon: <Github style={{ width: "1.25rem", height: "1.25rem" }} />, href: "#" },
                    { icon: <Twitter style={{ width: "1.25rem", height: "1.25rem" }} />, href: "#" },
                    { icon: <Mail style={{ width: "1.25rem", height: "1.25rem" }} />, href: "#" }
                  ].map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      className="text-white-50"
                      whileHover={{ scale: 1.1, y: -2 }}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="ios-divider"></div>
            <p className="text-white-50 mb-0 text-center">&copy; 2025 HumanI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
