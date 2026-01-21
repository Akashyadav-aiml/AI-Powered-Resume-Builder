import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UploadPage = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [manualData, setManualData] = useState({
    full_name: "",
    email: "",
    phone: "",
    summary: "",
    experience: "",
    education: "",
    skills: ""
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Resume uploaded successfully!");
      navigate(`/dashboard/${response.data.resume_id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualData.full_name || !manualData.email) {
      toast.error("Please fill in at least name and email");
      return;
    }

    setUploading(true);
    try {
      const response = await axios.post(`${API}/resume/manual`, manualData);
      toast.success("Resume created successfully!");
      navigate(`/dashboard/${response.data.resume_id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create resume");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-black/5">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="font-chivo text-2xl font-bold tracking-tight text-[#111111]">
            CareerArchitect
          </div>
          <Button
            data-testid="back-home-btn"
            onClick={() => navigate("/")}
            variant="outline"
            className="rounded-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h1 className="font-chivo text-5xl font-bold tracking-tight leading-none text-[#111111] mb-4">
            Upload Your Resume
          </h1>
          <p className="text-lg text-[#555555] font-manrope">
            Choose to upload an existing resume or build one from scratch.
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger data-testid="upload-tab" value="upload">
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </TabsTrigger>
            <TabsTrigger data-testid="manual-tab" value="manual">
              <FileText className="mr-2 h-4 w-4" /> Build Manually
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div
              data-testid="upload-dropzone"
              className={`border-2 border-dashed rounded-sm p-20 text-center transition-colors ${
                dragActive
                  ? "border-swiss-blue bg-blue-50/50"
                  : "border-gray-300 hover:border-swiss-blue hover:bg-blue-50/20"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 text-swiss-blue animate-spin mb-4" />
                  <p className="text-[#555555] font-manrope">Processing your resume...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="font-chivo text-xl font-bold text-[#111111] mb-2">
                    Drop your resume here
                  </h3>
                  <p className="text-[#888888] mb-6 font-manrope">or click to browse</p>
                  <input
                    data-testid="file-input"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      data-testid="browse-files-btn"
                      type="button"
                      className="bg-swiss-blue text-white rounded-sm hover:bg-[#003399] font-medium px-8 py-3"
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      Browse Files
                    </Button>
                  </label>
                  <p className="text-xs text-[#888888] mt-4">Supports PDF and DOCX files</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual">
            <div className="bg-white border border-gray-200 rounded-sm p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name" className="text-[#111111] font-medium mb-2 block">
                    Full Name *
                  </Label>
                  <Input
                    data-testid="manual-full-name"
                    id="full_name"
                    value={manualData.full_name}
                    onChange={(e) => setManualData({...manualData, full_name: e.target.value})}
                    className="bg-gray-50 border-b-2 border-transparent focus:border-swiss-blue focus:bg-white transition-colors rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-[#111111] font-medium mb-2 block">
                    Email *
                  </Label>
                  <Input
                    data-testid="manual-email"
                    id="email"
                    type="email"
                    value={manualData.email}
                    onChange={(e) => setManualData({...manualData, email: e.target.value})}
                    className="bg-gray-50 border-b-2 border-transparent focus:border-swiss-blue focus:bg-white transition-colors rounded-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-[#111111] font-medium mb-2 block">
                  Phone
                </Label>
                <Input
                  data-testid="manual-phone"
                  id="phone"
                  value={manualData.phone}
                  onChange={(e) => setManualData({...manualData, phone: e.target.value})}
                  className="bg-gray-50 border-b-2 border-transparent focus:border-swiss-blue focus:bg-white transition-colors rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="summary" className="text-[#111111] font-medium mb-2 block">
                  Professional Summary
                </Label>
                <Textarea
                  data-testid="manual-summary"
                  id="summary"
                  value={manualData.summary}
                  onChange={(e) => setManualData({...manualData, summary: e.target.value})}
                  rows={3}
                  className="bg-gray-50 border-b-2 border-transparent focus:border-swiss-blue focus:bg-white transition-colors rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="experience" className="text-[#111111] font-medium mb-2 block">
                  Work Experience
                </Label>
                <Textarea
                  data-testid="manual-experience"
                  id="experience"
                  value={manualData.experience}
                  onChange={(e) => setManualData({...manualData, experience: e.target.value})}
                  rows={5}
                  className="bg-gray-50 border-b-2 border-transparent focus:border-swiss-blue focus:bg-white transition-colors rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="education" className="text-[#111111] font-medium mb-2 block">
                  Education
                </Label>
                <Textarea
                  data-testid="manual-education"
                  id="education"
                  value={manualData.education}
                  onChange={(e) => setManualData({...manualData, education: e.target.value})}
                  rows={3}
                  className="bg-gray-50 border-b-2 border-transparent focus:border-swiss-blue focus:bg-white transition-colors rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="skills" className="text-[#111111] font-medium mb-2 block">
                  Skills
                </Label>
                <Textarea
                  data-testid="manual-skills"
                  id="skills"
                  value={manualData.skills}
                  onChange={(e) => setManualData({...manualData, skills: e.target.value})}
                  rows={3}
                  className="bg-gray-50 border-b-2 border-transparent focus:border-swiss-blue focus:bg-white transition-colors rounded-none"
                />
              </div>

              <Button
                data-testid="manual-submit-btn"
                onClick={handleManualSubmit}
                disabled={uploading}
                className="w-full bg-swiss-blue text-white rounded-sm hover:bg-[#003399] font-medium px-8 py-4 text-lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Resume...
                  </>
                ) : (
                  "Create Resume"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UploadPage;