import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LoginScreen from './LoginScreen';

export default async function LoginPage() {
  const user = await currentUser();

  if (user) {
    const onboardingComplete = user.publicMetadata?.onboardingComplete === true;
    redirect(onboardingComplete ? '/app/dashboard' : '/onboarding');
  }

  return <LoginScreen />;
}
