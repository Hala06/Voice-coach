import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import SignupScreen from './SignupScreen';

export default async function SignupPage() {
  const user = await currentUser();

  if (user) {
    const onboardingComplete = user.publicMetadata?.onboardingComplete === true;
    redirect(onboardingComplete ? '/app/dashboard' : '/onboarding');
  }

  return <SignupScreen />;
}
