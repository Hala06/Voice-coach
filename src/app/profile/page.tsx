import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Container, Card } from '@/components';
import { ProfileClient } from './ProfileClient';

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.publicMetadata?.onboardingComplete !== true) {
    redirect('/onboarding');
  }

  const initialSettings = {
    goal: typeof user.publicMetadata?.goal === 'string' ? user.publicMetadata.goal : 'language',
    bio: typeof user.publicMetadata?.bio === 'string' ? user.publicMetadata.bio : '',
    notificationsEmail:
      typeof user.publicMetadata?.notificationsEmail === 'boolean' ? user.publicMetadata.notificationsEmail : true,
    notificationsPush:
      typeof user.publicMetadata?.notificationsPush === 'boolean' ? user.publicMetadata.notificationsPush : false,
    theme: typeof user.publicMetadata?.theme === 'string' ? user.publicMetadata.theme : 'system',
    language: typeof user.publicMetadata?.language === 'string' ? user.publicMetadata.language : 'en',
  };

  const initialUser = {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.emailAddresses?.[0]?.emailAddress || '',
    imageUrl: user.imageUrl,
  };

  return (
    <Container gradient="hero" ambientVariant="both" className="min-h-screen py-16">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-blue-200 uppercase tracking-wide">Profile</p>
            <h1 className="text-3xl font-bold text-white">Your profile & settings</h1>
            <p className="text-gray-400">Manage how you show up and how we notify you.</p>
          </div>
          <Card glass className="px-4 py-3 text-sm text-gray-300">
            <p className="font-semibold text-white">Onboarding</p>
            <p>{initialSettings.goal ? 'Complete' : 'Incomplete'}</p>
          </Card>
        </div>

        <ProfileClient initialUser={initialUser} initialSettings={initialSettings} />
      </div>
    </Container>
  );
}
