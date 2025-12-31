'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { Button, Card, ErrorBoundary } from '@/components';

const goals = [
  { id: 'language', label: 'Learn a New Language' },
  { id: 'pronunciation', label: 'Improve Pronunciation' },
  { id: 'presentation', label: 'Practice Presentations' },
  { id: 'conversation', label: 'Casual Conversation' },
];

interface ProfileClientProps {
  initialUser: {
    firstName: string;
    lastName: string;
    email: string;
    imageUrl?: string;
  };
  initialSettings: {
    goal: string;
    bio: string;
    notificationsEmail: boolean;
    notificationsPush: boolean;
    theme: string;
    language: string;
  };
}

export function ProfileClient({ initialUser, initialSettings }: ProfileClientProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [firstName, setFirstName] = useState(initialUser.firstName);
  const [lastName, setLastName] = useState(initialUser.lastName);
  const [bio, setBio] = useState(initialSettings.bio);
  const [goal, setGoal] = useState(initialSettings.goal);
  const [notificationsEmail, setNotificationsEmail] = useState(initialSettings.notificationsEmail);
  const [notificationsPush, setNotificationsPush] = useState(initialSettings.notificationsPush);
  const [theme, setTheme] = useState(initialSettings.theme);
  const [language, setLanguage] = useState(initialSettings.language);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(() => {
    const first = firstName?.trim();
    const last = lastName?.trim();
    if (first && last) return `${first} ${last}`;
    return first || last || 'Your profile';
  }, [firstName, lastName]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          bio,
          goal,
          notifications: { email: notificationsEmail, push: notificationsPush },
          theme,
          language,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to save changes');
      }

      setMessage('Profile updated');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      <div className="flex items-center gap-4">
        {initialUser.imageUrl ? (
          <Image
            src={initialUser.imageUrl}
            alt="Avatar"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full border border-white/20 object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-xl font-semibold">
            {displayName.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm text-gray-400">Signed in as</p>
          <p className="text-white font-semibold">{initialUser.email}</p>
        </div>
      </div>

      <Card glass className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Profile</h2>
            <p className="text-sm text-gray-400">Update your public info and goals</p>
          </div>
          <Button size="sm" onClick={handleSave} isLoading={isSaving}>
            Save changes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="First name"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Tell us about your goals"
          />
        </div>
      </Card>

      <Card glass className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Settings</h2>
            <p className="text-sm text-gray-400">Notifications and appearance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-300">Notifications</p>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="text-white font-medium">Email</p>
                <p className="text-xs text-gray-400">Receive summaries and reminders</p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEmail((v) => !v)}
                className={`relative w-14 h-8 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  notificationsEmail ? 'bg-blue-500 border-blue-400' : 'bg-white/10 border-white/20'
                }`}
                aria-label="Toggle email notifications"
              >
                <span
                  className={`block w-6 h-6 bg-white rounded-full shadow transform transition-transform absolute top-0.5 ${
                    notificationsEmail ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="text-white font-medium">Push</p>
                <p className="text-xs text-gray-400">Get alerts while practicing</p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsPush((v) => !v)}
                className={`relative w-14 h-8 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  notificationsPush ? 'bg-blue-500 border-blue-400' : 'bg-white/10 border-white/20'
                }`}
                aria-label="Toggle push notifications"
              >
                <span
                  className={`block w-6 h-6 bg-white rounded-full shadow transform transition-transform absolute top-0.5 ${
                    notificationsPush ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="system" className="bg-slate-900 text-white">System</option>
                <option value="light" className="bg-slate-900 text-white">Light</option>
                <option value="dark" className="bg-slate-900 text-white">Dark</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="en" className="bg-slate-900 text-white">English</option>
                <option value="es" className="bg-slate-900 text-white">Spanish</option>
                <option value="fr" className="bg-slate-900 text-white">French</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => window.location.reload()} disabled={isSaving}>
            Reset
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Save settings
          </Button>
        </div>

        {message && <p className="text-sm text-green-400">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </Card>

      <Card glass className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Sign out</h2>
          <p className="text-sm text-gray-400">End your session on this device.</p>
        </div>
        <div className="flex">
          <Button
            variant="secondary"
            onClick={handleSignOut}
            className="ml-auto flex items-center gap-2 text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
    </ErrorBoundary>
  );
}
