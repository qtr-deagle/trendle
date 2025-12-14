import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed. Please try again.");
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
        <Link to="/signup">
          <Button variant="hero">
            Sign up
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
        <h1 className="text-6xl font-black text-foreground italic mb-12">trendle</h1>

        <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14"
          />

          <p className="text-center text-sm text-muted-foreground">
            By clicking log in, you agree to Trendle's{" "}
            <a href="#" className="text-primary hover:underline">Term of Service</a>
          </p>

          <Button 
            type="submit" 
            variant="hero" 
            size="xl" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New to Trendle?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Login;
