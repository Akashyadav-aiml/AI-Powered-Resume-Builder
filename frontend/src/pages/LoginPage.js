import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success("Login successful!");
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
          <Link to="/register">
            <Button className="bg-swiss-blue text-white rounded-sm hover:bg-[#003399] font-medium px-6 py-2">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-8 py-16">
        <div className="mb-12">
          <h1 className="font-chivo text-4xl font-bold tracking-tight leading-none text-[#111111] mb-4">
            Welcome Back
          </h1>
          <p className="text-lg text-[#555555] font-manrope">
            Sign in to your account to continue optimizing your resume.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-swiss-blue text-white rounded-sm hover:bg-[#003399] font-medium py-3 mt-8"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#555555] font-manrope">
            Don't have an account?{" "}
            <Link to="/register" className="text-swiss-blue font-medium hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
