import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, TrendingUp } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-black/5">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="font-chivo text-2xl font-bold tracking-tight text-[#111111]">
            CareerArchitect
          </div>
          <Button
            data-testid="nav-get-started-btn"
            onClick={() => navigate("/upload")}
            className="bg-swiss-blue text-white rounded-sm hover:bg-[#003399] font-medium px-6 py-2"
          >
            Get Started
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 py-20">
          <div className="flex flex-col justify-center">
            <div className="uppercase tracking-[0.2em] text-xs text-[#888888] mb-6">
              AI-Powered Resume Optimization
            </div>
            <h1 className="font-chivo text-6xl lg:text-7xl font-bold tracking-tight leading-none text-[#111111] mb-6">
              Beat the ATS.
              <br />
              <span className="text-swiss-blue">Land the Job.</span>
            </h1>
            <p className="text-lg text-[#555555] mb-8 text-pretty font-manrope">
              Transform your resume with AI-powered optimization using OpenAI GPT-4o and Gemini. Get instant ATS scoring, professional enhancements, and downloadable formats.
            </p>
            <div className="flex gap-4">
              <Button
                data-testid="hero-upload-resume-btn"
                onClick={() => navigate("/upload")}
                className="bg-swiss-blue text-white rounded-sm hover:bg-[#003399] font-medium px-8 py-4 text-lg shadow-hard shadow-hard-hover"
              >
                Upload Resume <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="bg-paper border border-gray-200 rounded-sm p-8 resume-paper">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mt-6"></div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-4/5"></div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#10B981] text-white font-mono text-sm px-4 py-2 rounded-sm shadow-lg">
                ATS: 89%
              </div>
            </div>
          </div>
        </div>

        <div className="py-20 border-t border-black/5">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-sm p-8 hover:border-swiss-blue transition-colors">
              <div className="bg-swiss-blue/10 w-12 h-12 rounded-sm flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-swiss-blue" />
              </div>
              <h3 className="font-chivo text-xl font-bold mb-3 text-[#111111]">AI Enhancement</h3>
              <p className="text-[#555555] font-manrope">
                Dual AI optimization using OpenAI GPT-4o and Gemini for maximum ATS compatibility and professional quality.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm p-8 hover:border-swiss-blue transition-colors">
              <div className="bg-[#10B981]/10 w-12 h-12 rounded-sm flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-[#10B981]" />
              </div>
              <h3 className="font-chivo text-xl font-bold mb-3 text-[#111111]">Instant ATS Scoring</h3>
              <p className="text-[#555555] font-manrope">
                Get real-time ATS scores based on keyword optimization, formatting, and section structure analysis.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm p-8 hover:border-swiss-blue transition-colors">
              <div className="bg-swiss-red/10 w-12 h-12 rounded-sm flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-swiss-red" />
              </div>
              <h3 className="font-chivo text-xl font-bold mb-3 text-[#111111]">Professional Output</h3>
              <p className="text-[#555555] font-manrope">
                Download your optimized resume in PDF or DOCX format with ATS-friendly templates.
              </p>
            </div>
          </div>
        </div>

        <div className="py-20 border-t border-black/5 text-center">
          <h2 className="font-chivo text-4xl font-bold tracking-tight leading-none text-[#111111] mb-6">
            Ready to Optimize Your Resume?
          </h2>
          <p className="text-lg text-[#555555] mb-8 font-manrope max-w-2xl mx-auto">
            Upload your existing resume or build from scratch. Our AI will handle the rest.
          </p>
          <Button
            data-testid="cta-upload-btn"
            onClick={() => navigate("/upload")}
            className="bg-swiss-blue text-white rounded-sm hover:bg-[#003399] font-medium px-8 py-4 text-lg shadow-hard shadow-hard-hover"
          >
            Start Optimizing
          </Button>
        </div>
      </div>

      <footer className="border-t border-black/5 mt-20">
        <div className="max-w-7xl mx-auto px-8 py-8 text-center text-[#888888] text-sm font-manrope">
          <p>© 2025 CareerArchitect. AI-Powered Resume Optimization.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;