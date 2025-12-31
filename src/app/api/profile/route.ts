import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const defaultSettings = {
  goal: 'language',
  bio: '',
  notificationsEmail: true,
  notificationsPush: false,
  theme: 'system',
  language: 'en',
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const meta = user.publicMetadata || {};

    return NextResponse.json({
      user: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      },
      settings: {
        goal: typeof meta.goal === 'string' ? meta.goal : defaultSettings.goal,
        bio: typeof meta.bio === 'string' ? meta.bio : defaultSettings.bio,
        notificationsEmail:
          typeof meta.notificationsEmail === 'boolean' ? meta.notificationsEmail : defaultSettings.notificationsEmail,
        notificationsPush:
          typeof meta.notificationsPush === 'boolean' ? meta.notificationsPush : defaultSettings.notificationsPush,
        theme: typeof meta.theme === 'string' ? meta.theme : defaultSettings.theme,
        language: typeof meta.language === 'string' ? meta.language : defaultSettings.language,
      },
    });
  } catch (error) {
    console.error('Profile GET error', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const clerk = await clerkClient();

    const firstName = typeof body?.firstName === 'string' && body.firstName.trim() ? body.firstName.trim() : undefined;
    const lastName = typeof body?.lastName === 'string' && body.lastName.trim() ? body.lastName.trim() : undefined;
    const bio = typeof body?.bio === 'string' ? body.bio : defaultSettings.bio;
    const goal = typeof body?.goal === 'string' ? body.goal : defaultSettings.goal;

    const notifications = body?.notifications || {};
    const notificationsEmail =
      typeof notifications.email === 'boolean' ? notifications.email : defaultSettings.notificationsEmail;
    const notificationsPush =
      typeof notifications.push === 'boolean' ? notifications.push : defaultSettings.notificationsPush;

    const theme = typeof body?.theme === 'string' ? body.theme : defaultSettings.theme;
    const language = typeof body?.language === 'string' ? body.language : defaultSettings.language;

    if (firstName || lastName) {
      await clerk.users.updateUser(userId, {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
      });
    }

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        bio,
        goal,
        notificationsEmail,
        notificationsPush,
        theme,
        language,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Profile POST error', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
