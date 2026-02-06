import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    password_confirm: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.full_name || !formData.password || !formData.password_confirm) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.password_confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const result = await register(formData.email, formData.full_name, formData.password);
    
    if (result.success) {
      toast.success("Account created successfully!");
      navigate("/upload");
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-black/5">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <Link to="/" className="font-chivo text-2xl font-bold tracking-tight text-[#111111]">
            CareerArchitect
          </Link>
          <Link to="/login">
            <Button className="bg-swiss-blue text-white rounded-sm hover:bg-[#003399] font-medium px-6 py-2">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-8 py-16">
        <div className="mb-12">
          <h1 className="font-chivo text-4xl font-bold tracking-tight leading-none text-[#111111] mb-4">
            Create Account
          </h1>
          <p className="text-lg text-[#555555] font-manrope">
            Join CareerArchitect to start optimizing your resume with AI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="full_name" className="text-[#111111] font-medium mb-2 block">
              Full Name
            </Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              className="bg-gray-50 border-b-2 border-transparent focus:border-swiss-blue focus:bg-white transition-colors rounded-none"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-[#111111] font-medium mb-2 block">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="bg-gray-50 border-b-2 border-transparent focus:border-swiss-blue focus:bg-white transition-colors rounded-none"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-[#111111] font-medium mb-2 block">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="bg-gray-50 border-b-2 border-transparent focus:border-swiss-blue focus:bg-white transition-colors rounded-none"
              disabled={loading}
            />
            <p className="text-xs text-[#888888] mt-1">At least 6 characters</p>
          </div>

          <div>
            <Label htmlFor="password_confirm" className="text-[#111111] font-medium mb-2 block">
              Confirm Password
            </Label>
            <Input
              id="password_confirm"
              name="password_confirm"
              type="password"
              value={formData.password_confirm}
              onChange={handleChange}
              placeholder="••••••••"
              className="bg-gray-50 border-b-2 border-transparent focus:border-swiss-blue focus:bg-white transition-colors rounded-none"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-swiss-blue text-white rounded-sm hover:bg-[#003399] font-medium py-3 mt-8"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#555555] font-manrope">
            Already have an account?{" "}
            <Link to="/login" className="text-swiss-blue font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
