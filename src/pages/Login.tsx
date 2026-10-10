import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Sparkles, Sun, Moon, Lock, Mail, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid business email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'chetan@smartledger.ai',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      await login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-base flex flex-col justify-between p-4 md:p-8">
      {/* Top Bar with brand and theme toggle */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-white dark:text-[#111722] shadow-sm">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <span className="text-headline-sm font-semibold text-text-primary tracking-tight">
            SmartLedger
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-warning" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <Card className="shadow-modal">
          <div className="text-left mb-6">
            <h1 className="text-headline-md font-semibold text-text-primary">
              Accountant Sign In
            </h1>
            <p className="text-body-sm text-text-secondary mt-1">
              Access the intelligent voucher classification workspace and review queue.
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded bg-error/10 border border-error/20 flex items-start gap-2.5 text-error text-body-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Work Email"
              htmlFor="email"
              error={errors.email?.message}
              required
            >
              <Input
                id="email"
                type="email"
                leftElement={<Mail className="w-4 h-4" />}
                placeholder="name@company.com"
                hasError={!!errors.email}
                {...register('email')}
              />
            </FormField>

            <FormField
              label="Password"
              htmlFor="password"
              error={errors.password?.message}
              required
            >
              <Input
                id="password"
                type="password"
                leftElement={<Lock className="w-4 h-4" />}
                placeholder="••••••••"
                hasError={!!errors.password}
                {...register('password')}
              />
            </FormField>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting}
              >
                Sign In to Workspace
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-body-sm text-text-secondary">
              Demo credentials pre-filled. Uses stateful mock engine or live FastAPI backend.
            </p>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-label-sm text-text-secondary py-4">
        SmartLedger — Open-Source AI Hackathon Qualifier • Powered by Qwen 2.5-3B
      </div>
    </div>
  );
};
