import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, Download, Loader2, TrendingUp, FileText } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API } from "@/lib/api";

const DashboardPage = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [enhancedData, setEnhancedData] = useState(null);
  const [enhancedScore, setEnhancedScore] = useState(null);
  const [selectedEnhancement, setSelectedEnhancement] = useState("both");

  useEffect(() => {
    loadResumeData();
  }, [resumeId]);

  const loadResumeData = async () => {
    try {
      const response = await axios.get(`${API}/resume/${resumeId}`);
      setResumeData(response.data.resume);
      setAtsScore(response.data.ats_score);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load resume data");
    } finally {
      setLoading(false);
    }
  };

  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      const response = await axios.post(`${API}/resume/enhance`, {
        resume_id: resumeId,
        enhancement_type: selectedEnhancement
      });
      setEnhancedData(response.data);
      setEnhancedScore(response.data.new_ats_score);
      toast.success("Resume enhanced successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to enhance resume");
    } finally {
      setEnhancing(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      const targetId = enhancedData ? enhancedData.enhanced_resume_id : resumeId;
      const response = await axios.post(`${API}/resume/generate/${targetId}`, null, {
        params: { format }
      });
      
      const blob = new Blob([new Uint8Array(response.data.file_data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume.${format}`;
      a.click();
      toast.success(`Resume downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download resume");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-swiss-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-black/5">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="font-chivo text-2xl font-bold tracking-tight text-[#111111]">
            CareerArchitect
          </div>
          <Button
            data-testid="back-btn"
            onClick={() => navigate("/")}
            variant="outline"
            className="rounded-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="font-chivo text-4xl font-bold tracking-tight leading-none text-[#111111] mb-2">
            Resume Dashboard
          </h1>
          <p className="text-[#555555] font-manrope">
            Analyze your ATS score and enhance with AI
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white border border-gray-200 rounded-sm p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="uppercase tracking-[0.2em] text-[10px] text-[#888888]">
                Original ATS Score
              </div>
              <TrendingUp className="h-5 w-5 text-swiss-blue" />
            </div>
            <div data-testid="original-ats-score" className="font-mono text-6xl font-bold text-[#111111] mb-4">
              {atsScore?.overall_score || 0}
            </div>
            <Progress value={atsScore?.overall_score || 0} className="h-2 mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#555555]">Keywords:</span>
                <span className="font-mono font-medium">{atsScore?.keyword_score || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555555]">Formatting:</span>
                <span className="font-mono font-medium">{atsScore?.formatting_score || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555555]">Sections:</span>
                <span className="font-mono font-medium">{atsScore?.section_score || 0}%</span>
              </div>
            </div>
          </div>

          {enhancedScore && (
            <div className="bg-white border-2 border-[#10B981] rounded-sm p-8 relative">
              <div className="absolute -top-3 -right-3 bg-[#10B981] text-white text-xs px-3 py-1 rounded-sm font-medium">
                ENHANCED
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="uppercase tracking-[0.2em] text-[10px] text-[#888888]">
                  Enhanced ATS Score
                </div>
                <Sparkles className="h-5 w-5 text-[#10B981]" />
              </div>
              <div data-testid="enhanced-ats-score" className="font-mono text-6xl font-bold text-[#10B981] mb-4">
                {enhancedScore.overall_score}
              </div>
              <Progress value={enhancedScore.overall_score} className="h-2 mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#555555]">Keywords:</span>
                  <span className="font-mono font-medium text-[#10B981]">{enhancedScore.keyword_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555555]">Formatting:</span>
                  <span className="font-mono font-medium text-[#10B981]">{enhancedScore.formatting_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555555]">Sections:</span>
                  <span className="font-mono font-medium text-[#10B981]">{enhancedScore.section_score}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-swiss-blue text-white rounded-sm p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-chivo text-xl font-bold mb-3">AI Enhancement</h3>
              <p className="text-white/90 text-sm mb-6">
                Optimize your resume with dual AI analysis using OpenAI GPT-4o and Gemini.
              </p>
              
              <div className="space-y-2 mb-6">
                <button
                  data-testid="enhance-type-openai"
                  onClick={() => setSelectedEnhancement("openai")}
                  className={`w-full text-left px-4 py-2 rounded-sm border transition-colors ${
                    selectedEnhancement === "openai"
                      ? "bg-white text-swiss-blue border-white"
                      : "bg-transparent border-white/30 hover:border-white"
                  }`}
                >
                  <div className="font-medium">OpenAI GPT-4o</div>
                  <div className="text-xs opacity-80">Professional optimization</div>
                </button>
                <button
                  data-testid="enhance-type-gemini"
                  onClick={() => setSelectedEnhancement("gemini")}
                  className={`w-full text-left px-4 py-2 rounded-sm border transition-colors ${
                    selectedEnhancement === "gemini"
                      ? "bg-white text-swiss-blue border-white"
                      : "bg-transparent border-white/30 hover:border-white"
                  }`}
                >
                  <div className="font-medium">Gemini 3 Flash</div>
                  <div className="text-xs opacity-80">Industry keywords</div>
                </button>
                <button
                  data-testid="enhance-type-both"
                  onClick={() => setSelectedEnhancement("both")}
                  className={`w-full text-left px-4 py-2 rounded-sm border transition-colors ${
                    selectedEnhancement === "both"
                      ? "bg-white text-swiss-blue border-white"
                      : "bg-transparent border-white/30 hover:border-white"
                  }`}
                >
                  <div className="font-medium">Both (Recommended)</div>
                  <div className="text-xs opacity-80">Maximum optimization</div>
                </button>
              </div>
            </div>

            <Button
              data-testid="enhance-resume-btn"
              onClick={handleEnhance}
              disabled={enhancing}
              className="w-full bg-white text-swiss-blue hover:bg-gray-100 rounded-sm font-medium py-3"
            >
              {enhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enhance Resume
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="original" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger data-testid="original-tab" value="original">
              <FileText className="mr-2 h-4 w-4" /> Original Resume
            </TabsTrigger>
            {enhancedData && (
              <TabsTrigger data-testid="enhanced-tab" value="enhanced">
                <Sparkles className="mr-2 h-4 w-4" /> Enhanced Resume
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="original">
            <div className="bg-white border border-gray-200 rounded-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-chivo text-2xl font-bold text-[#111111]">Original Content</h2>
                <div className="flex gap-2">
                  <Button
                    data-testid="download-original-pdf-btn"
                    onClick={() => handleDownload("pdf")}
                    variant="outline"
                    className="rounded-sm"
                  >
                    <Download className="mr-2 h-4 w-4" /> PDF
                  </Button>
                  <Button
                    data-testid="download-original-docx-btn"
                    onClick={() => handleDownload("docx")}
                    variant="outline"
                    className="rounded-sm"
                  >
                    <Download className="mr-2 h-4 w-4" /> DOCX
                  </Button>
                </div>
              </div>
              <div className="space-y-6">
                {resumeData?.sections?.map((section, index) => (
                  <div key={index} className="border-l-4 border-swiss-blue pl-4">
                    <h3 className="font-chivo text-lg font-bold text-[#111111] mb-2">
                      {section.section_name}
                    </h3>
                    <p className="text-[#555555] whitespace-pre-wrap font-manrope">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {enhancedData && (
            <TabsContent value="enhanced">
              <div className="bg-white border-2 border-[#10B981] rounded-sm p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="font-chivo text-2xl font-bold text-[#111111]">Enhanced Content</h2>
                    <p className="text-sm text-[#555555]">
                      Optimized with {selectedEnhancement === "both" ? "OpenAI + Gemini" : selectedEnhancement}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-testid="download-enhanced-pdf-btn"
                      onClick={() => handleDownload("pdf")}
                      className="bg-[#10B981] hover:bg-[#0D9668] text-white rounded-sm"
                    >
                      <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>
                    <Button
                      data-testid="download-enhanced-docx-btn"
                      onClick={() => handleDownload("docx")}
                      className="bg-[#10B981] hover:bg-[#0D9668] text-white rounded-sm"
                    >
                      <Download className="mr-2 h-4 w-4" /> DOCX
                    </Button>
                  </div>
                </div>
                <div className="space-y-6">
                  {enhancedData.enhanced_sections?.map((section, index) => (
                    <div key={index} className="border-l-4 border-[#10B981] pl-4">
                      <h3 className="font-chivo text-lg font-bold text-[#111111] mb-2">
                        {section.section_name}
                      </h3>
                      <p className="text-[#555555] whitespace-pre-wrap font-manrope">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;
