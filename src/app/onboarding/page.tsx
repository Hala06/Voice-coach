import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/login');
  }

  const onboardingComplete = user.publicMetadata?.onboardingComplete === true;
  if (onboardingComplete) {
    redirect('/app/dashboard');
  }

  const initialGoal = typeof user.publicMetadata?.goal === 'string' ? user.publicMetadata.goal : null;

  return <OnboardingClient initialGoal={initialGoal} userName={user.firstName} />;
}
