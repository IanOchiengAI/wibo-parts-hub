import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wrench, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import PageHead from "@/components/PageHead";
import { friendlyError } from "@/lib/errors";

type Mode = "login" | "signup" | "reset";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pageTitle = mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password";
  const pageDesc = mode === "reset"
    ? "We'll send a password reset link to your email."
    : mode === "login" ? "Sign in to your account" : "Create your account";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) { toast.error(friendlyError(error.message)); return; }
      toast.success("Check your email for the reset link.");
      setMode("login");
      return;
    }

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error(friendlyError(error.message)); return; }
      navigate("/");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone } },
      });
      setLoading(false);
      if (error) { toast.error(friendlyError(error.message)); return; }
      toast.success("Account created! Check your email to confirm.");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <PageHead title={pageTitle} description={pageDesc} />
      <div className="glass rounded-2xl p-8 w-full max-w-sm">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 font-display">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-3xl font-extrabold text-primary">WIBO</span>
          </div>
          <p className="text-muted-foreground text-sm text-center">{pageDesc}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground font-display"
              />
              <Input
                type="tel"
                placeholder="WhatsApp number (e.g. 0712 345 678)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground font-display"
              />
            </>
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground font-display"
          />
          {mode !== "reset" && (
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground font-display"
            />
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full font-display font-semibold bg-primary text-primary-foreground hover:brightness-110"
          >
            {loading
              ? "Please wait..."
              : mode === "login" ? "Sign In"
              : mode === "signup" ? "Create Account"
              : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === "login" && (
            <>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:brightness-110 font-display font-semibold">
                  Sign up
                </button>
              </p>
              <p className="text-sm text-muted-foreground">
                <button onClick={() => setMode("reset")} className="text-primary/70 hover:text-primary font-display text-xs">
                  Forgot password?
                </button>
              </p>
            </>
          )}
          {mode === "signup" && (
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-primary hover:brightness-110 font-display font-semibold">
                Sign in
              </button>
            </p>
          )}
          {mode === "reset" && (
            <p className="text-sm text-muted-foreground">
              <button onClick={() => setMode("login")} className="text-primary hover:brightness-110 font-display font-semibold">
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
