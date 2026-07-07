import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wrench } from "lucide-react";
import { toast } from "sonner";
import PageHead from "@/components/PageHead";
import { friendlyError } from "@/lib/errors";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(friendlyError(error.message)); return; }
    toast.success("Password updated! You're now signed in.");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <PageHead title="Set New Password" description="Choose a new password for your WIBO account." />
      <div className="glass rounded-2xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-3xl font-extrabold text-primary">WIBO</span>
          </div>
          <p className="text-muted-foreground text-sm">Choose a new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground font-display"
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground font-display"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full font-display font-semibold bg-primary text-primary-foreground hover:brightness-110"
          >
            {loading ? "Updating..." : "Set New Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
