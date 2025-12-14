import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [blogName, setBlogName] = useState("");
  const [email, setEmail] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blogName || !email || !month || !day || !year) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate blog name (username)
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(blogName)) {
      toast.error("Blog name must be 3-30 characters and contain only letters, numbers, and underscores");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service");
      return;
    }

    setIsLoading(true);
    
    try {
      await signup(blogName, email, "default-password");
      toast.success("Account created! Welcome to Trendle!");
      navigate("/onboarding");
    } catch (error) {
      toast.error("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <Link to="/" className="text-3xl font-black text-primary italic hover:opacity-80 transition-opacity">
          trendle
        </Link>
        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="hero">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline">
              Sign up
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-10">
        <h1 className="text-6xl font-black text-foreground italic mb-12">trendle</h1>

        <form onSubmit={handleSignup} className="w-full max-w-md space-y-6">
          {/* Blog Name */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-center">What we should call you?</h2>
            <p className="text-center text-muted-foreground text-sm">
              This will be how you appear to others on Trendle, and your URL. Don't worry, you can change this later.
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                type="text"
                placeholder="blog name"
                value={blogName}
                onChange={(e) => setBlogName(e.target.value)}
                className="pl-10 h-14"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-center">Your email address</h2>
            <p className="text-center text-muted-foreground text-sm">
              We'll use this to help you log in and send updates.
            </p>
            <Input
              type="email"
              placeholder="your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14"
            />
          </div>

          {/* Birthday */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-center">When's your birthday?</h2>
            <p className="text-center text-muted-foreground text-sm">
              We'll never share this with other users. We're just making sure you're old enough to use Trendle.
            </p>
            <div className="flex gap-3">
              <Select onValueChange={setMonth}>
                <SelectTrigger className="flex-1 h-14 rounded-full">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setDay}>
                <SelectTrigger className="w-24 h-14 rounded-full">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setYear}>
                <SelectTrigger className="w-28 h-14 rounded-full">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              You agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {" "}and have read our{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </label>
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            size="xl" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Next"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">I already have an account.</Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Signup;
